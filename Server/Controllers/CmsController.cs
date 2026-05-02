using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Server.Models;
using Server.Services;
using Microsoft.AspNetCore.Http;
using System;
using System.Threading.Tasks;

namespace Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CmsController : ControllerBase
    {
        private readonly ICmsService _cmsService;

        public CmsController(ICmsService cmsService)
        {
            _cmsService = cmsService;
        }

        [HttpGet]
        public async Task<IActionResult> Get()
        {
            var settings = await _cmsService.GetConfigAsync();
            return Ok(settings);
        }

        [HttpPost]
        [Authorize]
        public async Task<IActionResult> Save([FromBody] SiteConfig newData)
        {
            await _cmsService.SaveConfigAsync(newData);
            return Ok(new { message = "Zapisano kolory w MongoDB!" });
        }

        [HttpPost("upload-bg")]
        [Authorize]
        public async Task<IActionResult> UploadBackground(IFormFile file)
        {
            try
            {
                var url = await _cmsService.UploadImageAsync(file, "sunfire_backgrounds");
                return Ok(new { imageUrl = url });
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpDelete("remove-bg")]
        [Authorize]
        public async Task<IActionResult> RemoveBackground()
        {
            try
            {
                await _cmsService.RemoveBackgroundAsync();
                return Ok(new { message = "Zdjęcie tła zostało usunięte" });
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPost("upload-image")]
        [Authorize]
        public async Task<IActionResult> UploadImage(IFormFile file)
        {
            try
            {
                var url = await _cmsService.UploadImageAsync(file, "portfolio_projects");
                return Ok(new { url = url });
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }
}