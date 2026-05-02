using Microsoft.AspNetCore.Mvc;
using Server.Models;
using Server.Services;
using Microsoft.AspNetCore.RateLimiting;
using System.Threading.Tasks;
using System;

namespace Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ContactController : ControllerBase
    {
        private readonly IContactService _contactService;

        public ContactController(IContactService contactService)
        {
            _contactService = contactService;
        }

        [HttpPost]
        [EnableRateLimiting("ContactSpamProtection")]
        public async Task<IActionResult> SendEmail([FromBody] ContactMessage contact)
        {
            try 
            {
                await _contactService.SendEmailAsync(contact);
                return Ok(new { message = "Wysłano!" });
            }
            catch (Exception ex)
            {
                if (ex.Message.Contains("konfiguracją poczty"))
                {
                    return StatusCode(500, ex.Message);
                }
                return StatusCode(500, "Wystąpił problem podczas wysyłania wiadomości. Spróbuj ponownie później.");
            }
        }
    }
}