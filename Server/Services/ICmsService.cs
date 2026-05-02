using Microsoft.AspNetCore.Http;
using Server.Models;
using System.Threading.Tasks;

namespace Server.Services
{
    public interface ICmsService
    {
        Task<SiteConfig> GetConfigAsync();
        Task SaveConfigAsync(SiteConfig config);
        Task<string> UploadImageAsync(IFormFile file, string folder);
        Task RemoveBackgroundAsync();
    }
}
