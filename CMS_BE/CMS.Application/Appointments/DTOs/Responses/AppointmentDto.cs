using CMS.Domain.Appointments.Enums;

namespace CMS.Application.Appointments.DTOs.Responses
{
    public class AppointmentDto
    {
        public Guid AppointmentID { get; set; }
        public Guid PatientID { get; set; }
        public string PatientName { get; set; } = string.Empty;
        public string PatientEmail { get; set; } = string.Empty;
        public string PatientPhone { get; set; } = string.Empty;
        public Guid DoctorID { get; set; }
        public string DoctorName { get; set; } = string.Empty;
        public DateTime AppointmentDate { get; set; }
        public string StartTime { get; set; } = string.Empty; // Changed to string for frontend compatibility
        public string EndTime { get; set; } = string.Empty; // Changed to string for frontend compatibility
        public AppointmentStatus Status { get; set; }
        public AppointmentType AppointmentType { get; set; }
        public string ReasonForVisit { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
    }
}
