namespace CMS.Application.Auth.DTOs.Requests
{
    public class UpdateProfileRequest
    {
        public string Name { get; set; } = string.Empty;
        public string PhoneNumber { get; set; } = string.Empty;
        public string? ProfilePictureURL { get; set; }
    }
}