using Server.Models;
using System.Threading.Tasks;

namespace Server.Services
{
    public interface IHomeService
    {
        Task<HomeData> GetHomeDataAsync();
        Task UpdateHomeDataAsync(HomeData newData);
    }
}
