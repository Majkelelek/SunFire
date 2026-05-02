using Server.Models;
using System;
using System.Net;
using System.Net.Mail;
using System.Threading.Tasks;

namespace Server.Services
{
    public class ContactService : IContactService
    {
        public async Task SendEmailAsync(ContactMessage contact)
        {
            var senderEmail = Environment.GetEnvironmentVariable("EMAIL_SENDER_EMAIL");
            var senderPassword = Environment.GetEnvironmentVariable("EMAIL_SENDER_PASSWORD");

            if (string.IsNullOrEmpty(senderEmail) || string.IsNullOrEmpty(senderPassword))
            {
                throw new Exception("Wystąpił problem z konfiguracją poczty na serwerze.");
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
            mailMessage.To.Add(senderEmail);

            await client.SendMailAsync(mailMessage);
        }
    }
}
