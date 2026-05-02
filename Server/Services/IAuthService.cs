using Server.DTOs;
using System.Threading.Tasks;

namespace Server.Services
{
    public interface IAuthService
    {
        Task<(bool IsSuccess, string Message, int RemainingAttempts, string? Token)> LoginAsync(string username, string password);
        Task LogoutAsync(string token);
        Task<(bool IsSuccess, string Message)> RegisterAsync(string username, string password);
        Task<(bool IsValid, string? Username)> CheckSessionAsync(string token);
    }
}
