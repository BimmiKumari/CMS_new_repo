using CMS.Domain.Appointments.Enums;
using CMS.Domain.Clinic.Enums;

namespace CMS.Application.EMR.DTOs
{
    public class QueuePatientDto
    {
        public Guid QueueID { get; set; }
        public Guid AppointmentID { get; set; }
        public Guid PatientID { get; set; }
        public string PatientName { get; set; } = string.Empty;
        public int Age { get; set; }
        public char Sex { get; set; }
        public string BloodGroup { get; set; } = string.Empty;
        public string? Allergies { get; set; }
        public string? ChiefComplaint { get; set; }
        public AppointmentType QueueZone { get; set; } // Regular or FollowUp
        public int QueuePosition { get; set; }
        public QueueStatusType QueueStatus { get; set; }
        public TimeSpan AppointmentTimeSlot { get; set; }
        public DateTime AppointmentDate { get; set; }
        public DateTime? CheckedInAt { get; set; }
        public bool IsFollowUp { get; set; }
        public Guid? PreviousEncounterID { get; set; }
        public string? ProfileImagePath { get; set; }
    }

    public class DoctorQueueResponseDto
    {
        public List<QueuePatientDto> RegularPatients { get; set; } = new();
        public List<QueuePatientDto> FollowUpPatients { get; set; } = new();
        public List<QueuePatientDto> EmergencyCases { get; set; } = new();
        public int TotalWaiting { get; set; }
        public int TotalInProgress { get; set; }
        public int TotalCompleted { get; set; }
    }

    public class UpdateQueueStatusDto
    {
        public Guid QueueID { get; set; }
        public QueueStatusType NewStatus { get; set; }
    }
}
