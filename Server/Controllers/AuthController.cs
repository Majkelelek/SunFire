using Microsoft.AspNetCore.Mvc;
using Server.DTOs;
using Server.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using System;
using System.Threading.Tasks;

namespace Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;
        private const string CookieName = "sunfire_auth";

        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest req)
        {
            var result = await _authService.LoginAsync(req.Username, req.Password);
            
            if (!result.IsSuccess)
            {
                if (result.RemainingAttempts > 0)
                {
                    return Unauthorized(new { message = result.Message, remainingAttempts = result.RemainingAttempts });
                }
                return BadRequest(result.Message);
            }

            var isProd = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") != "Development";

            Response.Cookies.Append(CookieName, result.Token!, new CookieOptions {
                HttpOnly = true,
                Secure = true, 
                SameSite = SameSiteMode.None, 
                Path = "/",
                Expires = DateTime.UtcNow.AddHours(4)
            });

            return Ok(new { message = result.Message });
        }

        [HttpPost("logout")]
        public async Task<IActionResult> Logout()
        {
            var tokenFromCookie = Request.Cookies[CookieName];

            if (!string.IsNullOrEmpty(tokenFromCookie))
            {
                await _authService.LogoutAsync(tokenFromCookie);
            }

            Response.Cookies.Delete(CookieName, new CookieOptions
            {
                HttpOnly = true,
                Secure = true, 
                SameSite = SameSiteMode.None,
                Path = "/"
            });

            return Ok(new { message = "Wylogowano pomyślnie" });
        }

        [HttpPost("register")]
        [Authorize] 
        public async Task<IActionResult> Register([FromBody] LoginRequest request)
        {
            var result = await _authService.RegisterAsync(request.Username, request.Password);
            if (!result.IsSuccess)
            {
                return BadRequest(result.Message);
            }

            return Ok(new { message = result.Message });
        }

        [HttpGet("check")]
        public async Task<IActionResult> Check()
        {
            var tokenFromCookie = Request.Cookies[CookieName];

            var result = await _authService.CheckSessionAsync(tokenFromCookie);
            
            if (!result.IsValid)
            {
                Response.Cookies.Delete(CookieName);
                return Ok(new { isAuthenticated = false });
            }

            return Ok(new { 
                isAuthenticated = true,
                username = result.Username 
            });
        }
    }
}