using CMS.Domain.Clinic.Enums;

namespace CMS.Domain.Clinic.Entities
{
    public class Leave
    {
        public Guid LeaveID { get; set; }
        public Guid UserID { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public string Reason { get; set; }
        public LeaveStatus Status { get; set; }
        public DateTime LeaveApplied { get; set; }
        public bool IsFullDay { get; set; } = true;
        public bool IsDeleted { get; set; }
        public DateTime? DeletedAt { get; set; }
    }
}