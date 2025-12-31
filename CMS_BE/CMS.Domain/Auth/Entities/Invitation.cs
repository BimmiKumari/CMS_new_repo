using System.ComponentModel.DataAnnotations;
using CMS.Domain.Auth.Enums;

namespace CMS.Domain.Auth.Entities
{
    public class Invitation
    {
        public Guid InvitationID { get; set; }
        public Guid UserID { get; set; }
        public string Email { get; set; }
        public RoleType Role { get; set; }
        public string Token { get; set; }
        public DateTime ExpiresAt { get; set; }
        public bool IsAccepted { get; set; }
        public Guid InvitedBy { get; set; }
        public DateTime CreatedAt { get; set; }
        public bool IsDeleted { get; set; }
        public DateTime? DeletedAt { get; set; }
    }
}
