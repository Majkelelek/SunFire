using Microsoft.Extensions.DependencyInjection;
using Server.Repositories;
using Server.Services;
using Server.Models;

namespace Server.Extensions
{
    public static class ServiceExtensions
    {
        public static void AddApplicationServices(this IServiceCollection services)
        {
            // Rejestracja Repozytoriów
            services.AddSingleton<IMongoRepository<User>>(sp => new MongoRepository<User>(sp.GetRequiredService<MongoDB.Driver.IMongoClient>(), "Users"));
            services.AddSingleton<IMongoRepository<HomeData>>(sp => new MongoRepository<HomeData>(sp.GetRequiredService<MongoDB.Driver.IMongoClient>(), "HomeData"));
            services.AddSingleton<IMongoRepository<AboutData>>(sp => new MongoRepository<AboutData>(sp.GetRequiredService<MongoDB.Driver.IMongoClient>(), "AboutData"));
            services.AddSingleton<IMongoRepository<SiteConfig>>(sp => new MongoRepository<SiteConfig>(sp.GetRequiredService<MongoDB.Driver.IMongoClient>(), "Settings"));
            services.AddSingleton<IMongoRepository<Project>>(sp => new MongoRepository<Project>(sp.GetRequiredService<MongoDB.Driver.IMongoClient>(), "Projects"));

            // Rejestracja Serwisów Biznesowych
            services.AddScoped<IAuthService, AuthService>();
            services.AddScoped<IHomeService, HomeService>();
            services.AddScoped<IAboutService, AboutService>();
            services.AddScoped<ICmsService, CmsService>();
            services.AddScoped<IProjectService, ProjectService>();
            services.AddScoped<IContactService, ContactService>();
        }
    }
}
