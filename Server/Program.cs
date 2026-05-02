using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using MongoDB.Driver;
using System.Text;
using DotNetEnv;
using Microsoft.AspNetCore.RateLimiting;
using System.Threading.RateLimiting;
using Server.Models; 
using System.Security.Claims;
using Microsoft.AspNetCore.HttpOverrides;
using System.Security.Authentication;
using Server.Extensions;

var builder = WebApplication.CreateBuilder(args);

// *** DODANE: Ukrywanie informacji o serwerze (Naprawia "Server Leaks Version Information")
builder.WebHost.ConfigureKestrel(options =>
{
    options.AddServerHeader = false;
});

// 1. Ładowanie ENV
Env.TraversePath().Load();
var jwtKey = Environment.GetEnvironmentVariable("SUNFIRE_JWT_KEY") 
    ?? throw new Exception("Brak SUNFIRE_JWT_KEY w konfiguracji");
var mongoUri = Environment.GetEnvironmentVariable("SUNFIRE_MONGO_URI") 
    ?? throw new Exception("Brak SUNFIRE_MONGO_URI w konfiguracji");

var frontendUrl = Environment.GetEnvironmentVariable("FRONTEND_URL") 
    ?? "http://localhost:5173"; 

// 2. KONFIGURACJA MONGODB
var mongoSettings = MongoClientSettings.FromConnectionString(mongoUri);
mongoSettings.SslSettings = new SslSettings 
{ 
    EnabledSslProtocols = SslProtocols.Tls12 
};
builder.Services.AddSingleton<IMongoClient>(new MongoClient(mongoSettings));

builder.Services.AddSingleton<IMongoDatabase>(sp => 
    sp.GetRequiredService<IMongoClient>().GetDatabase("SunfireDB"));

// 3. Konfiguracja dla Azure Proxy
builder.Services.Configure<ForwardedHeadersOptions>(options =>
{
    options.ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto;
    options.KnownNetworks.Clear(); 
    options.KnownProxies.Clear();
});

// Zarejestruj własne serwisy i repozytoria
builder.Services.AddApplicationServices();

builder.Services.AddControllers();

// 4. Rate Limiter
builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
    options.AddPolicy("ContactSpamProtection", httpContext =>
        RateLimitPartition.GetFixedWindowLimiter(
            partitionKey: httpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown",
            factory: partition => new FixedWindowRateLimiterOptions
            {
                AutoReplenishment = true,
                PermitLimit = 3, 
                Window = TimeSpan.FromMinutes(15) 
            }));
});

// 5. Autentykacja JWT
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options => {
        options.TokenValidationParameters = new TokenValidationParameters {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),
            ValidateIssuer = false,
            ValidateAudience = false,
            ClockSkew = TimeSpan.Zero
        };
        options.Events = new JwtBearerEvents {
            OnMessageReceived = context => {
                context.Token = context.Request.Cookies["sunfire_auth"];
                return Task.CompletedTask;
            },
            OnTokenValidated = async context => {
                var db = context.HttpContext.RequestServices.GetRequiredService<IMongoDatabase>();
                var users = db.GetCollection<User>("Users");
                var username = context.Principal?.Identity?.Name 
                               ?? context.Principal?.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Name)?.Value;
                var rawToken = context.Request.Cookies["sunfire_auth"];
                
                if (string.IsNullOrEmpty(username) || string.IsNullOrEmpty(rawToken)) {
                    context.Fail("Unauthorized");
                    return;
                }

                var user = await users.Find(u => u.Username == username).FirstOrDefaultAsync();
                if (user == null || user.CurrentToken != rawToken) {
                    context.Fail("Session invalidated");
                }
            }
        };
    });

// 6. CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("SunfirePolicy", corsBuilder =>
    {
        corsBuilder.WithOrigins(frontendUrl)
               .AllowAnyHeader()
               .AllowAnyMethod()
               .AllowCredentials(); 
    });
});

var app = builder.Build();

// KOLEJNOŚĆ MIDDLEWARE (Krytyczna)
app.UseForwardedHeaders();

// *** DODANE: Globalne nagłówki bezpieczeństwa (Naprawia większość ostrzeżeń z ZAP)
app.Use(async (context, next) =>
{
    // Ochrona przed MIME-sniffingiem
    context.Response.Headers.Append("X-Content-Type-Options", "nosniff");
    
    // Ochrona przed Clickjackingiem (ramki)
    context.Response.Headers.Append("X-Frame-Options", "DENY");
    
    // Wymuszenie HTTPS (HSTS) - 1 rok
    context.Response.Headers.Append("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
    
    // Ochrona przed atakami XSS (starsze przeglądarki)
    context.Response.Headers.Append("X-XSS-Protection", "1; mode=block");
    
    // Content Security Policy (CSP)
    // UWAGA: Skonfigurowana w sposób przyjazny dla Reacta. Pozwala na ładowanie obrazków i stylów z zewnętrznych źródeł (np. Google Fonts).
    context.Response.Headers.Append("Content-Security-Policy", "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: https:; connect-src 'self' https:;");

    await next();
});

app.UseCors("SunfirePolicy");

app.UseDefaultFiles(); 
app.UseStaticFiles();

app.UseRouting();

app.UseRateLimiter();
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers(); 
app.MapFallbackToFile("index.html"); 

app.Run();