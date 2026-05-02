using Server.Models;
using Server.Repositories;
using System.Threading.Tasks;
using System.Collections.Generic;

namespace Server.Services
{
    public class AboutService : IAboutService
    {
        private readonly IMongoRepository<AboutData> _repository;
        private const string AboutConfigId = "about_me_main";

        public AboutService(IMongoRepository<AboutData> repository)
        {
            _repository = repository;
        }

        public async Task<AboutData> GetAboutDataAsync()
        {
            var data = await _repository.GetByIdAsync(AboutConfigId);
            return data ?? new AboutData();
        }

        public async Task UpdateAboutDataAsync(AboutData newData)
        {
            newData.Id = AboutConfigId;

            if (newData.Sections == null)
            {
                newData.Sections = new List<AboutSection>();
            }

            await _repository.ReplaceOneAsync(AboutConfigId, newData, isUpsert: true);
        }
    }
}
