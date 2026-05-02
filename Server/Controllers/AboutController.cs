using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Server.Models;
using Server.Services;
using System;
using System.Threading.Tasks;

namespace Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AboutController : ControllerBase
    {
        private readonly IAboutService _aboutService;

        public AboutController(IAboutService aboutService)
        {
            _aboutService = aboutService;
        }

        [HttpGet]
        public async Task<ActionResult<AboutData>> Get()
        {
            try
            {
                var data = await _aboutService.GetAboutDataAsync();
                return Ok(data);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Błąd serwera przy pobieraniu: {ex.Message}");
            }
        }

        [HttpPost]
        [Authorize]
        public async Task<IActionResult> Save([FromBody] AboutData newData)
        {
            if (newData == null)
            {
                return BadRequest("Dane nie mogą być puste.");
            }

            try
            {
                await _aboutService.UpdateAboutDataAsync(newData);
                return Ok(new { 
                    status = "success", 
                    message = "Zawartość strony O mnie została zapisana.",
                    isUpdate = true 
                });
            }
            catch (Exception)
            {
                return StatusCode(500, $"Błąd bazy danych");
            }
        }
    }
}