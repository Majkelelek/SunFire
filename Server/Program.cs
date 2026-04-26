using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using MongoDB.Driver;
using System.Text;
using DotNetEnv;
using Microsoft.AspNetCore.RateLimiting;
using System.Threading.RateLimiting;

var builder = WebApplication.CreateBuilder(args);

// 1. Ładowanie ENV
Env.TraversePath().Load();
var jwtKey = Environment.GetEnvironmentVariable("SUNFIRE_JWT_KEY") 
    ?? throw new Exception("Brak JWT_KEY w .env");
var mongoUri = Environment.GetEnvironmentVariable("SUNFIRE_MONGO_URI") 
    ?? throw new Exception("Brak MONGO_URI w .env");

// 2. Usługi
builder.Services.AddSingleton<IMongoClient>(new MongoClient(mongoUri));
builder.Services.AddControllers();
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

// 3. Autentykacja JWT z obsługą ciasteczek
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
            }
        };
    });

// 4. CORS - musi zezwalać na Credentials dla ciasteczek
builder.Services.AddCors(options =>
{
    options.AddPolicy("SunfirePolicy", builder =>
    {
        builder.WithOrigins("http://localhost:5173") // W produkcji zmień to na docelową domenę!
               .AllowAnyHeader()
               .AllowAnyMethod()
               .AllowCredentials(); // Pozwala na przesyłanie ciasteczek
    });
});

var app = builder.Build();

// 5. Middleware (KOLEJNOŚĆ!)
app.UseCors("SunfirePolicy");
app.UseStaticFiles();

app.UseRateLimiter();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();