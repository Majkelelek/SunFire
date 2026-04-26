using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using MongoDB.Driver;
using System.Text;
using DotNetEnv;
using Microsoft.AspNetCore.RateLimiting;
using System.Threading.RateLimiting;
using System.IdentityModel.Tokens.Jwt; // Wymagane do odczytania tokena
using Server.Models; // Wymagane do pobrania modelu User

var builder = WebApplication.CreateBuilder(args);

// 1. Ładowanie ENV
Env.TraversePath().Load();
var jwtKey = Environment.GetEnvironmentVariable("SUNFIRE_JWT_KEY") 
    ?? throw new Exception("Brak JWT_KEY w .env");
var mongoUri = Environment.GetEnvironmentVariable("SUNFIRE_MONGO_URI") 
    ?? throw new Exception("Brak MONGO_URI w .env");

// ZABEZPIECZENIE CORS: Pobieranie adresu frontendu ze zmiennych środowiskowych (domyślnie localhost dla deweloperki)
var frontendUrl = Environment.GetEnvironmentVariable("FRONTEND_URL") 
    ?? "http://localhost:5173"; 

// 2. Usługi
builder.Services.AddSingleton<IMongoClient>(new MongoClient(mongoUri));

// Wstrzykiwanie gotowej bazy danych od razu, by odchudzić konstruktory w Controllerach
builder.Services.AddSingleton<IMongoDatabase>(sp => 
    sp.GetRequiredService<IMongoClient>().GetDatabase("SunfireDB"));

builder.Services.AddControllers();

// 3. Rate Limiter (Ochrona przed spamem)
builder.Services.AddRateLimiter(options =>
{
    // Jeśli limit zostanie przekroczony, zwracamy błąd 429 (Too Many Requests)
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;

    options.AddPolicy("ContactSpamProtection", httpContext =>
        RateLimitPartition.GetFixedWindowLimiter(
            // Grupujemy żądania po adresie IP użytkownika
            partitionKey: httpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown",
            factory: partition => new FixedWindowRateLimiterOptions
            {
                AutoReplenishment = true,
                PermitLimit = 3, // Maksymalnie 3 wiadomości
                QueueLimit = 0,
                Window = TimeSpan.FromMinutes(15) // W oknie czasowym 15 minut
            }));
});

// 4. Autentykacja JWT z obsługą ciasteczek i WERYFIKACJĄ SESJI
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
                // To wyciąga token z ciasteczka przy każdym zapytaniu
                context.Token = context.Request.Cookies["sunfire_auth"];
                return Task.CompletedTask;
            },
            // NOWOŚĆ: Sprawdzamy, czy token zgadza się z tym w bazie danych!
            OnTokenValidated = async context => {
                var db = context.HttpContext.RequestServices.GetRequiredService<IMongoDatabase>();
                var users = db.GetCollection<User>("Users");
                
                var username = context.Principal?.Identity?.Name;
                var token = context.SecurityToken as JwtSecurityToken;
                
                if (username == null || token == null) {
                    context.Fail("Brak wymaganych danych w tokenie.");
                    return;
                }

                var user = await users.Find(u => u.Username == username).FirstOrDefaultAsync();
                
                // ZABEZPIECZENIE: Jeśli user nie istnieje lub token z ciasteczka jest inny niż zapisany przy logowaniu w bazie -> Odrzuć!
                if (user == null || user.CurrentToken != token.RawData) {
                    context.Fail("Token został unieważniony. Zaloguj się ponownie.");
                }
            }
        };
    });

// 5. CORS - musi zezwalać na Credentials dla ciasteczek
builder.Services.AddCors(options =>
{
    options.AddPolicy("SunfirePolicy", corsBuilder =>
    {
        corsBuilder.WithOrigins(frontendUrl) // Używa zmiennej
               .AllowAnyHeader()
               .AllowAnyMethod()
               .AllowCredentials(); // Pozwala na przesyłanie ciasteczek
    });
});

var app = builder.Build();

// 6. Middleware (KOLEJNOŚĆ JEST WAŻNA!)
app.UseCors("SunfirePolicy");
app.UseStaticFiles();

app.UseRateLimiter();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();