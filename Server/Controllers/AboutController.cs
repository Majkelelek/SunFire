using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using Server.Models;
using System;
using System.Threading.Tasks;

namespace Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")] // Automatycznie ustawi trasę na api/about
    public class AboutController : ControllerBase
    {
        private readonly IMongoCollection<AboutData> _aboutCollection;

        public AboutController(IMongoClient client)
        {
            // Upewnij się, że nazwa bazy "SunfireDB" zgadza się z Twoją konfiguracją
            var database = client.GetDatabase("SunfireDB");
            _aboutCollection = database.GetCollection<AboutData>("AboutData");
        }

        // GET: api/cms/about
        [HttpGet]
        public async Task<ActionResult<AboutData>> Get()
        {
            try
            {
                var data = await _aboutCollection.Find(a => a.Id == "about_me_main").FirstOrDefaultAsync();
                
                if (data == null)
                {
                    // Zwracamy obiekt domyślny, jeśli baza jest pusta
                    return Ok(new AboutData());
                }
                
                return Ok(data);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Błąd serwera przy pobieraniu: {ex.Message}");
            }
        }

        // POST: api/cms/about
        [HttpPost]
        [Authorize] // Wymaga zalogowania (JWT/Ciasteczko)
        public async Task<IActionResult> Save([FromBody] AboutData newData)
        {
            if (newData == null)
            {
                return BadRequest("Dane nie mogą być puste.");
            }

            try
            {
                // Wymuszamy stałe ID dokumentu
                newData.Id = "about_me_main";

                // Jeśli lista sekcji przyszła pusta (null), zamieniamy na pustą listę
                if (newData.Sections == null)
                {
                    newData.Sections = new System.Collections.Generic.List<AboutSection>();
                }

                // UPSERT: Jeśli dokument istnieje - zamień go. Jeśli nie - stwórz.
                var result = await _aboutCollection.ReplaceOneAsync(
                    filter: a => a.Id == "about_me_main",
                    replacement: newData,
                    options: new ReplaceOptions { IsUpsert = true }
                );

                return Ok(new { 
                    status = "success", 
                    message = "Zawartość strony O mnie została zapisana.",
                    isUpdate = result.IsAcknowledged 
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Błąd bazy danych przy zapisie: {ex.Message}");
            }
        }
    }
}