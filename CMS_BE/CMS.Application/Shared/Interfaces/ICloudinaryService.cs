namespace CMS.Application.Shared.Interfaces
{
    public interface ICloudinaryService
    {
        Task<string> UploadImageAsync(Stream imageStream, string fileName);
    }
}