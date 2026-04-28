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
using System.Security.Authentication; // *** DODANE: Do obsługi TLS 1.2

var builder = WebApplication.CreateBuilder(args);

// 1. Ładowanie ENV
Env.TraversePath().Load();
var jwtKey = Environment.GetEnvironmentVariable("SUNFIRE_JWT_KEY") 
    ?? throw new Exception("Brak SUNFIRE_JWT_KEY w konfiguracji");
var mongoUri = Environment.GetEnvironmentVariable("SUNFIRE_MONGO_URI") 
    ?? throw new Exception("Brak SUNFIRE_MONGO_URI w konfiguracji");

var frontendUrl = Environment.GetEnvironmentVariable("FRONTEND_URL") 
    ?? "http://localhost:5173"; 

// 2. KONFIGURACJA MONGODB (Naprawia błąd "Local Security Authority")
var mongoSettings = MongoClientSettings.FromConnectionString(mongoUri);
mongoSettings.SslSettings = new SslSettings 
{ 
    EnabledSslProtocols = SslProtocols.Tls12 // Wymuszenie TLS 1.2 dla Azure Windows
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

// KOLEJNOŚĆ MIDDLEWARE (Krytyczna dla Azure Windows)
app.UseForwardedHeaders();

app.UseCors("SunfirePolicy");

app.UseDefaultFiles(); // Pozwala na serwowanie index.html jako strony głównej
app.UseStaticFiles();

app.UseRouting(); // *** DODANE: Jawne włączenie routingu

app.UseRateLimiter();
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers(); // Najpierw szukaj ścieżek API
app.MapFallbackToFile("index.html"); // Wszystko inne kieruj do Reacta

app.Run();