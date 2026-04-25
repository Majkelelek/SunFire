using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using MongoDB.Driver;
using System.Text;
using DotNetEnv;

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
builder.Services.AddCors(options => {
    options.AddPolicy("SunfirePolicy", p => 
        p.WithOrigins("http://localhost:5173")
         .AllowAnyMethod()
         .AllowAnyHeader()
         .AllowCredentials());
});

var app = builder.Build();

// 5. Middleware (KOLEJNOŚĆ!)
app.UseCors("SunfirePolicy");
app.UseStaticFiles();
app.Use(async (context, next) =>
{
    if (context.Request.Method == "OPTIONS")
    {
        context.Response.Headers.Append("Access-Control-Allow-Origin", "http://localhost:5173");
        context.Response.Headers.Append("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
        context.Response.Headers.Append("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        context.Response.Headers.Append("Access-Control-Allow-Credentials", "true");
        context.Response.StatusCode = 200;
        await context.Response.CompleteAsync();
        return;
    }
    await next();
});
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();