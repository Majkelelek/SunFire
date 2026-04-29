using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using Server.Models;
using System;
using System.Threading.Tasks;

namespace Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class HomeController : ControllerBase
    {
        private readonly IMongoCollection<HomeData> _homeCollection;

        public HomeController(IMongoClient client)
        {
            // Korzystamy z tej samej bazy co AboutController
            var database = client.GetDatabase("SunfireDB");
            _homeCollection = database.GetCollection<HomeData>("HomeData");
        }

        // GET: api/home
        [HttpGet]
        public async Task<ActionResult<HomeData>> Get()
        {
            try
            {
                // Szukamy dokumentu o stałym ID
                var data = await _homeCollection.Find(h => h.Id == "home_main_config").FirstOrDefaultAsync();
                
                return Ok(data ?? new HomeData()); // Jeśli brak danych, zwracamy domyślny model
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Błąd przy pobieraniu strony głównej: {ex.Message}");
            }
        }

        // POST: api/home
        [HttpPost]
        [Authorize] // Zabezpieczenie dla admina
        public async Task<IActionResult> Save([FromBody] HomeData newData)
        {
            if (newData == null) return BadRequest("Dane nie mogą być puste.");

            try
            {
                // Wymuszamy stałe ID, aby zawsze nadpisywać ten sam dokument
                newData.Id = "home_main_config";

                if (newData.FocusItems == null)
                {
                    newData.FocusItems = new System.Collections.Generic.List<FocusItemData>();
                }

                // UPSERT: Jeśli istnieje - zamień. Jeśli nie - stwórz nowy[cite: 5].
                var result = await _homeCollection.ReplaceOneAsync(
                    filter: h => h.Id == "home_main_config",
                    replacement: newData,
                    options: new ReplaceOptions { IsUpsert = true }
                );

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