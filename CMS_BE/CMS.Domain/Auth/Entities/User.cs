using System.ComponentModel.DataAnnotations;
using CMS.Domain.Auth.Enums;

namespace CMS.Domain.Auth.Entities
{
    public class User
    {
        public Guid UserID { get; set; }
        public string? GoogleID { get; set; }
        public string Name { get; set; }
        [EmailAddress]
        public string Email { get; set; }
        [Phone]
        public string PhoneNumber { get; set; }
        public string PasswordHash { get; set; }
        [Url]
        public string? ProfilePictureURL { get; set; }
        public RoleType Role { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public bool IsDeleted { get; set; }
        public DateTime? DeletedAt { get; set; }
    }
}