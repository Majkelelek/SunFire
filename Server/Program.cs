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


builder.WebHost.ConfigureKestrel(options =>
{
    options.AddServerHeader = false;
});


Env.TraversePath().Load();
var jwtKey = Environment.GetEnvironmentVariable("SUNFIRE_JWT_KEY") 
    ?? throw new Exception("Brak SUNFIRE_JWT_KEY w konfiguracji");
var mongoUri = Environment.GetEnvironmentVariable("SUNFIRE_MONGO_URI") 
    ?? throw new Exception("Brak SUNFIRE_MONGO_URI w konfiguracji");

var frontendUrl = Environment.GetEnvironmentVariable("FRONTEND_URL") 
    ?? "http://localhost:5173"; 


var mongoSettings = MongoClientSettings.FromConnectionString(mongoUri);
mongoSettings.SslSettings = new SslSettings 
{ 
    EnabledSslProtocols = SslProtocols.Tls12 
};
builder.Services.AddSingleton<IMongoClient>(new MongoClient(mongoSettings));

builder.Services.AddSingleton<IMongoDatabase>(sp => 
    sp.GetRequiredService<IMongoClient>().GetDatabase("SunfireDB"));


builder.Services.Configure<ForwardedHeadersOptions>(options =>
{
    options.ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto;
    options.KnownNetworks.Clear(); 
    options.KnownProxies.Clear();
});


builder.Services.AddApplicationServices();

builder.Services.AddControllers();


builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
    

    options.GlobalLimiter = PartitionedRateLimiter.Create<HttpContext, string>(httpContext =>
        RateLimitPartition.GetFixedWindowLimiter(
            partitionKey: httpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown",
            factory: partition => new FixedWindowRateLimiterOptions
            {
                AutoReplenishment = true,
                PermitLimit = 100,
                Window = TimeSpan.FromMinutes(1)
            }));


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


app.UseForwardedHeaders();
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler(errorApp =>
    {
        errorApp.Run(async context =>
        {
            context.Response.StatusCode = 500;
            context.Response.ContentType = "application/json";
            await context.Response.WriteAsync("{\"error\": \"Wystąpił nieoczekiwany błąd serwera.\"}");
        });
    });
}


app.Use(async (context, next) =>
{

    var method = context.Request.Method;
    if ((method == "POST" || method == "PUT" || method == "PATCH") && 
        !context.Request.ContentType?.Contains("application/json") == true &&
        !context.Request.Path.Value?.Contains("/api/projects") == true)
    {
        context.Response.StatusCode = 415;
        return;
    }


    if (context.Request.Path.StartsWithSegments("/api"))
    {
        context.Response.Headers.Append("Cache-Control", "no-store, no-cache, must-revalidate");
        context.Response.Headers.Append("Pragma", "no-cache");
    }

    await next();
});


app.Use(async (context, next) =>
{
    var path = context.Request.Path.Value ?? "";
    var isApi = path.StartsWith("/api", StringComparison.OrdinalIgnoreCase);
    var isGet = context.Request.Method == HttpMethods.Get;
    


    var isNav = context.Request.Headers["sec-fetch-mode"] == "navigate";
    var wantsHtml = context.Request.Headers["Accept"].ToString().Contains("text/html");

    if (isApi && isGet && (isNav || wantsHtml))
    {
        context.Response.Redirect("/");
        return;
    }
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
