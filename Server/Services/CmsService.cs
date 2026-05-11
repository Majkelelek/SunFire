using Microsoft.AspNetCore.Http;
using Server.Models;
using Server.Repositories;
using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using System;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

namespace Server.Services
{
    public class CmsService : ICmsService
    {
        private readonly IMongoRepository<SiteConfig> _repository;
        private readonly Cloudinary _cloudinary;

        public CmsService(IMongoRepository<SiteConfig> repository)
        {
            _repository = repository;
            
            var cloudName = Environment.GetEnvironmentVariable("CLOUDINARY_CLOUD_NAME");
            var apiKey = Environment.GetEnvironmentVariable("CLOUDINARY_API_KEY");
            var apiSecret = Environment.GetEnvironmentVariable("CLOUDINARY_API_SECRET");

            if (!string.IsNullOrEmpty(cloudName) && !string.IsNullOrEmpty(apiKey) && !string.IsNullOrEmpty(apiSecret))
            {
                var account = new Account(cloudName, apiKey, apiSecret);
                _cloudinary = new Cloudinary(account);
            }
        }

        public async Task<SiteConfig> GetConfigAsync()
        {
            var config = await _repository.GetAllAsync();
            return config.FirstOrDefault() ?? new SiteConfig();
        }

        public async Task SaveConfigAsync(SiteConfig newData)
        {
            var configList = await _repository.GetAllAsync();
            var existing = configList.FirstOrDefault();

            if (existing == null)
            {
                newData.Id = null;
                await _repository.InsertAsync(newData);
            }
            else
            {
                existing.PrimaryColor = newData.PrimaryColor;
                existing.BackgroundColor = newData.BackgroundColor;
                await _repository.ReplaceOneAsync(existing.Id!, existing);
            }
        }

        public async Task<string> UploadImageAsync(IFormFile file, string folder)
        {
            if (_cloudinary == null) throw new Exception("Cloudinary nie jest skonfigurowane.");
            if (file == null || file.Length == 0) throw new Exception("Nie wybrano pliku");

            var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".webp", ".gif" };
            var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
            if (string.IsNullOrEmpty(extension) || !allowedExtensions.Contains(extension))
                throw new Exception("Niedozwolony typ pliku.");

            if (file.Length > 10 * 1024 * 1024)
                throw new Exception("Plik przekracza limit 10MB.");

            if (folder == "sunfire_backgrounds")
            {
                var existing = (await _repository.GetAllAsync()).FirstOrDefault();
                if (existing != null && !string.IsNullOrEmpty(existing.BackgroundImageUrl))
                {
                    await DeleteFromCloudinaryAsync(existing.BackgroundImageUrl);
                }
            }

            var uploadResult = new ImageUploadResult();
            using (var stream = file.OpenReadStream())
            {
                var uploadParams = new ImageUploadParams()
                {
                    File = new FileDescription(file.FileName, stream),
                    Folder = folder,
                    Transformation = new Transformation().Quality("auto").FetchFormat("auto") 
                };
                uploadResult = await _cloudinary.UploadAsync(uploadParams);
            }

            if (uploadResult.Error != null) 
                throw new Exception(uploadResult.Error.Message);

            var url = uploadResult.SecureUrl.ToString();
            
            if (folder == "sunfire_backgrounds")
            {
                var existing = (await _repository.GetAllAsync()).FirstOrDefault();
                if (existing == null) 
                {
                    await _repository.InsertAsync(new SiteConfig { BackgroundImageUrl = url });
                } 
                else 
                {
                    existing.BackgroundImageUrl = url;
                    await _repository.ReplaceOneAsync(existing.Id!, existing);
                }
            }

            return url;
        }

        public async Task RemoveBackgroundAsync()
        {
            var configList = await _repository.GetAllAsync();
            var existing = configList.FirstOrDefault();
            
            if (existing == null || string.IsNullOrEmpty(existing.BackgroundImageUrl))
                throw new Exception("Brak zdjęcia do usunięcia");

            if (_cloudinary != null)
            {
                await DeleteFromCloudinaryAsync(existing.BackgroundImageUrl);
            }

            existing.BackgroundImageUrl = null;
            await _repository.ReplaceOneAsync(existing.Id!, existing);
        }

        private async Task DeleteFromCloudinaryAsync(string fileUrl)
        {
            try
            {
                var uri = new Uri(fileUrl);
                var segments = uri.Segments;
                var uploadIndex = Array.FindIndex(segments, s => s == "upload/");
                if(uploadIndex > -1 && segments.Length > uploadIndex + 2)
                {
                    var publicIdWithExt = string.Join("", segments.Skip(uploadIndex + 2)); 
                    var publicId = Path.ChangeExtension(publicIdWithExt, null); 
                    
                    await _cloudinary.DestroyAsync(new DeletionParams(publicId));
                }
            }
            catch
            {
            }
        }
    }
}
