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
    public class HomeController : ControllerBase
    {
        private readonly IHomeService _homeService;

        public HomeController(IHomeService homeService)
        {
            _homeService = homeService;
        }

        [HttpGet]
        public async Task<ActionResult<HomeData>> Get()
        {
            try
            {
                var data = await _homeService.GetHomeDataAsync();
                return Ok(data);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Błąd przy pobieraniu strony głównej: {ex.Message}");
            }
        }

        [HttpPost]
        [Authorize]
        public async Task<IActionResult> Save([FromBody] HomeData newData)
        {
            if (newData == null) return BadRequest("Dane nie mogą być puste.");

            try
            {
                await _homeService.UpdateHomeDataAsync(newData);
                return Ok(new { 
                    status = "success", 
                    message = "Zaktualizowano stronę główną Sunfire." 
                });
            }
            catch (Exception)
            {
                return StatusCode(500, "Błąd zapisu do bazy MongoDB.");
            }
        }
    }
}