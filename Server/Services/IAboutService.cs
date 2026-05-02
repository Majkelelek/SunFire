using Server.Models;
using System.Threading.Tasks;

namespace Server.Services
{
    public interface IAboutService
    {
        Task<AboutData> GetAboutDataAsync();
        Task UpdateAboutDataAsync(AboutData newData);
    }
}
