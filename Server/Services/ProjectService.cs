using Server.Models;
using Server.Repositories;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Server.Services
{
    public class ProjectService : IProjectService
    {
        private readonly IMongoRepository<Project> _repository;

        public ProjectService(IMongoRepository<Project> repository)
        {
            _repository = repository;
        }

        public async Task<IEnumerable<Project>> GetAllProjectsAsync()
        {
            return await _repository.GetAllAsync();
        }

        public async Task CreateProjectAsync(Project project)
        {
            await _repository.InsertAsync(project);
        }

        public async Task UpdateProjectAsync(string id, Project project)
        {
            await _repository.ReplaceOneAsync(id, project);
        }

        public async Task DeleteProjectAsync(string id)
        {
            await _repository.DeleteAsync(id);
        }
    }
}
