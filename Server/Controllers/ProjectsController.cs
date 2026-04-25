using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using MongoDB.Driver;
using Server.Models;

namespace Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")] // To zamieni się na api/projects
    public class ProjectsController : ControllerBase
    {
        private readonly IMongoCollection<Project> _projects;

        public ProjectsController(IMongoClient client)
        {
            var database = client.GetDatabase("SunfireDB");
            _projects = database.GetCollection<Project>("Projects");
        }

        // To naprawi błąd GET 404
        [HttpGet]
        public async Task<List<Project>> Get() 
        {
            return await _projects.Find(_ => true).ToListAsync();
        }

        // To naprawi błąd POST 404
        [HttpPost]
        [Authorize]
        public async Task<IActionResult> Create([FromBody] Project project)
        {
            await _projects.InsertOneAsync(project);
            return Ok(project);
        }

        [HttpDelete("{id}")]
        [Authorize]
        public async Task<IActionResult> Delete(string id)
        {
            await _projects.DeleteOneAsync(p => p.Id == id);
            return Ok();
        }
        [HttpPut("{id}")]
        [Authorize]
        public async Task<IActionResult> Update(string id, [FromBody] Project updated)
        {
            await _projects.ReplaceOneAsync(p => p.Id == id, updated);
            return Ok(updated);
        }
    }
}