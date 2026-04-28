using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using MongoDB.Driver;
using System.Text;
using DotNetEnv;
using Microsoft.AspNetCore.RateLimiting;
using System.Threading.RateLimiting;
using System.IdentityModel.Tokens.Jwt;
using Server.Models; 
using System.Security.Claims;
using Microsoft.AspNetCore.HttpOverrides; // *** DODANE: Potrzebne do proxy na Azure

var builder = WebApplication.CreateBuilder(args);

// 1. Ładowanie ENV (Na Azure pliku .env nie będzie, ale Load() po prostu to zignoruje i pobierze zmienne z portalu)
Env.TraversePath().Load();
var jwtKey = Environment.GetEnvironmentVariable("SUNFIRE_JWT_KEY") 
    ?? throw new Exception("Brak JWT_KEY w .env");
var mongoUri = Environment.GetEnvironmentVariable("SUNFIRE_MONGO_URI") 
    ?? throw new Exception("Brak MONGO_URI w .env");

// ZABEZPIECZENIE CORS: Pobieranie adresu frontendu
var frontendUrl = Environment.GetEnvironmentVariable("FRONTEND_URL") 
    ?? "https://twoja-aplikacja.azurewebsites.net"; // Zmień domyślny fallback na https w razie czego

// *** DODANE: Konfiguracja dla Reverse Proxy (Azure) aby Rate Limiter widział prawdziwe IP
builder.Services.Configure<ForwardedHeadersOptions>(options =>
{
    options.ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto;
});

// 2. Usługi
builder.Services.AddSingleton<IMongoClient>(new MongoClient(mongoUri));

// Wstrzykiwanie bazy danych do DI
builder.Services.AddSingleton<IMongoDatabase>(sp => 
    sp.GetRequiredService<IMongoClient>().GetDatabase("SunfireDB"));

builder.Services.AddControllers();

// 3. Rate Limiter (Ochrona przed spamem)
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
                QueueLimit = 0,
                Window = TimeSpan.FromMinutes(15) 
            }));
});

// 4. Autentykacja JWT z kuloodporną weryfikacją sesji
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
                // Wyciąganie tokena z ciasteczka
                context.Token = context.Request.Cookies["sunfire_auth"];
                return Task.CompletedTask;
            },
            OnTokenValidated = async context => {
                var db = context.HttpContext.RequestServices.GetRequiredService<IMongoDatabase>();
                var users = db.GetCollection<User>("Users");
                
                // Wyciągamy tożsamość użytkownika
                var username = context.Principal?.Identity?.Name 
                               ?? context.Principal?.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Name)?.Value;
                
                // Pobieramy surowy token bezpośrednio z ciasteczka (naprawia błędy rzutowania JwtSecurityToken)
                var rawToken = context.Request.Cookies["sunfire_auth"];
                
                if (string.IsNullOrEmpty(username) || string.IsNullOrEmpty(rawToken)) {
                    Console.WriteLine("❌ BŁĄD JWT: Brak username lub surowego tokenu.");
                    context.Fail("Unauthorized");
                    return;
                }

                var user = await users.Find(u => u.Username == username).FirstOrDefaultAsync();
                
                if (user == null) {
                    Console.WriteLine($"❌ BŁĄD JWT: Nie znaleziono usera {username} w bazie.");
                    context.Fail("User not found");
                    return;
                }

                // Weryfikacja: Czy token w ciasteczku jest tym samym, który zapisał AuthController podczas logowania?
                if (user.CurrentToken != rawToken) {
                    Console.WriteLine("❌ BŁĄD JWT: Token unieważniony (niezgodność z bazą).");
                    context.Fail("Session invalidated");
                    return;
                }
                
                Console.WriteLine($"✅ SUKCES JWT: Zalogowano {username}");
            }
        };
    });

// 5. CORS
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

// *** DODANE: Middleware do odczytu nagłówków proxy z Azure
app.UseForwardedHeaders();

// 6. Middleware (Kolejność krytyczna!)
app.UseCors("SunfirePolicy");

app.UseDefaultFiles(); // *** DODANE: Dzięki temu wejście na '/' wczyta 'index.html'
app.UseStaticFiles();

app.UseRateLimiter();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.MapFallbackToFile("index.html"); // To pozwala na odświeżanie strony w React
app.Run();