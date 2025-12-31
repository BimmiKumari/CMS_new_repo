using System;

namespace CMS.Domain.Auth.Entities
{
    public class VerificationCode
    {
        public Guid VerificationCodeID { get; set; }
        public Guid UserID { get; set; }
        public string Code { get; set; }
        public string Purpose { get; set; }
        public DateTime ExpiresAt { get; set; }
        public bool IsUsed { get; set; }
        public DateTime CreatedAt { get; set; }
        public bool IsDeleted { get; set; }
        public DateTime? DeletedAt { get; set; }
    }
}
