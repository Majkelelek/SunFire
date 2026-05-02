using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Server.Models;
using Server.Services;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProjectsController : ControllerBase
    {
        private readonly IProjectService _projectService;

        public ProjectsController(IProjectService projectService)
        {
            _projectService = projectService;
        }

        [HttpGet]
        public async Task<IEnumerable<Project>> Get() 
        {
            return await _projectService.GetAllProjectsAsync();
        }

        [HttpPost]
        [Authorize]
        public async Task<IActionResult> Create([FromBody] Project project)
        {
            await _projectService.CreateProjectAsync(project);
            return Ok(project);
        }

        [HttpDelete("{id}")]
        [Authorize]
        public async Task<IActionResult> Delete(string id)
        {
            await _projectService.DeleteProjectAsync(id);
            return Ok();
        }

        [HttpPut("{id}")]
        [Authorize]
        public async Task<IActionResult> Update(string id, [FromBody] Project updated)
        {
            await _projectService.UpdateProjectAsync(id, updated);
            return Ok(updated);
        }
    }
}