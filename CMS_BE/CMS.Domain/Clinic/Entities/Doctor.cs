using CMS.Domain.Clinic.Enums;

namespace CMS.Domain.Clinic.Entities
{
    public class Doctor
    {
        public Guid DoctorID { get; set; }
        public string Specialization { get; set; }
        public string Qualification { get; set; }
        public int YearOfExperience { get; set; }
        public WorkingDays[] WorkingDays { get; set; }
        public TimeSpan StartTime { get; set; }
        public TimeSpan EndTime { get; set; }
        public int SlotDuration { get; set; }
        public TimeSpan? BreakStartTime { get; set; }
        public TimeSpan? BreakEndTime { get; set; }
        public bool IsDeleted { get; set; }
        public DateTime? DeletedAt { get; set; }
    }
}