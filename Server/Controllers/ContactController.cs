using Microsoft.AspNetCore.Mvc;
using System.Net;
using System.Net.Mail;
using Server.Models;

namespace Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ContactController : ControllerBase
    {
        [HttpPost]
        public async Task<IActionResult> SendEmail([FromBody] ContactMessage contact)
        {
            // Pobieramy "bezużyteczne" wcześniej zmienne z pliku .env
            var senderEmail = Environment.GetEnvironmentVariable("EMAIL_SENDER_EMAIL");
            var senderPassword = Environment.GetEnvironmentVariable("EMAIL_SENDER_PASSWORD");

            if (string.IsNullOrEmpty(senderEmail) || string.IsNullOrEmpty(senderPassword))
            {
                return StatusCode(500, "Serwer nie skonfigurował poprawnie zmiennych środowiskowych.");
            }

            using var client = new SmtpClient("smtp.gmail.com", 587)
            {
                Credentials = new NetworkCredential(senderEmail, senderPassword),
                EnableSsl = true
            };

            var mailMessage = new MailMessage
            {
                From = new MailAddress(senderEmail),
                Subject = $"Kontakt: {contact.Subject}",
                Body = $"Wiadomość od: {contact.Name} ({contact.Email})\n\n{contact.Message}",
                IsBodyHtml = false
            };
            mailMessage.To.Add(senderEmail); // Wysyłka do samego siebie

            await client.SendMailAsync(mailMessage);
            return Ok(new { message = "Wysłano!" });
        }
    }
}