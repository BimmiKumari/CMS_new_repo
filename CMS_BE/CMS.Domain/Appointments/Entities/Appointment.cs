using CMS.Domain.Appointments.Enums;

namespace CMS.Domain.Appointments.Entities
{
    public class Appointment
    {
        public Guid AppointmentID { get; set; }
        public Guid PatientID { get; set; }
        public Guid DoctorID { get; set; }
        public DateOnly AppointmentDate { get; set; }
        public TimeSpan StartTime { get; set; }
        public TimeSpan EndTime { get; set; }
        public AppointmentStatus Status { get; set; }
        public AppointmentType AppointmentType { get; set; }
        public string GoogleCalendarEventID { get; set; }
        public string ReasonForVisit { get; set; }
        public bool ConsultedBefore { get; set; } = false;
        public bool SeekingFollowup { get; set; } = false;
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public Guid? CreatedBy { get; set; }
        public bool IsDeleted { get; set; }
        public DateTime? DeletedAt { get; set; }
    }
}