using Server.Models;
using Server.Repositories;
using System.Threading.Tasks;
using System.Collections.Generic;

namespace Server.Services
{
    public class HomeService : IHomeService
    {
        private readonly IMongoRepository<HomeData> _repository;
        private const string HomeConfigId = "home_main_config";

        public HomeService(IMongoRepository<HomeData> repository)
        {
            _repository = repository;
        }

        public async Task<HomeData> GetHomeDataAsync()
        {
            var data = await _repository.GetByIdAsync(HomeConfigId);
            return data ?? new HomeData();
        }

        public async Task UpdateHomeDataAsync(HomeData newData)
        {
            newData.Id = HomeConfigId;

            if (newData.FocusItems == null)
            {
                newData.FocusItems = new List<FocusItemData>();
            }

            await _repository.ReplaceOneAsync(HomeConfigId, newData, isUpsert: true);
        }
    }
}
