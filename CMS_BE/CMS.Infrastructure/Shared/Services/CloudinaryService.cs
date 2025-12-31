using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using Microsoft.Extensions.Configuration;
using CMS.Application.Shared.Interfaces;

namespace CMS.Infrastructure.Shared.Services
{
    public class CloudinaryService : ICloudinaryService
    {
        private readonly Cloudinary _cloudinary;

        public CloudinaryService(IConfiguration configuration)
        {
            var cloudName = Environment.GetEnvironmentVariable("CLOUD_NAME") ?? configuration["Cloudinary:CloudName"];
            var apiKey = Environment.GetEnvironmentVariable("API_KEY") ?? configuration["Cloudinary:ApiKey"];
            var apiSecret = Environment.GetEnvironmentVariable("API_SECRET") ?? configuration["Cloudinary:ApiSecret"];
            
            var account = new Account(cloudName, apiKey, apiSecret);
            _cloudinary = new Cloudinary(account);
        }

        public async Task<string> UploadImageAsync(Stream imageStream, string fileName)
        {
            try
            {
                var uploadParams = new ImageUploadParams()
                {
                    File = new FileDescription(fileName, imageStream),
                    Folder = "profile_photos",
                    Transformation = new Transformation().Width(300).Height(300).Crop("fill")
                };

                var uploadResult = await _cloudinary.UploadAsync(uploadParams);
                
                if (uploadResult.Error != null)
                {
                    throw new Exception($"Cloudinary upload error: {uploadResult.Error.Message}");
                }
                
                return uploadResult.SecureUrl?.ToString() ?? throw new Exception("Upload failed - no URL returned");
            }
            catch (Exception ex)
            {
                throw new Exception($"Cloudinary upload failed: {ex.Message}", ex);
            }
        }
    }
}