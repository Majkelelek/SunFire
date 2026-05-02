using Server.Models;
using System.Threading.Tasks;

namespace Server.Services
{
    public interface IContactService
    {
        Task SendEmailAsync(ContactMessage contact);
    }
}
