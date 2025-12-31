using CMS.Domain.Appointments.Enums;
using CMS.Domain.Clinic.Enums;
using System;

namespace CMS.Domain.Clinic.Entities
{
    public class PatientQueue
    {
        public Guid QueueID { get; set; }
        public Guid AppointmentID { get; set; }
        public Guid PatientID { get; set; }
        public Guid DoctorID { get; set; }
        public AppointmentType QueueZone { get; set; }
        public int QueuePosition { get; set; }
        public QueueStatusType QueueStatus { get; set; }
        public DateTime? CheckedInAt { get; set; }
        public DateTime? StartedAt { get; set; }
        public DateTime? CompletedAt { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public bool IsDeleted { get; set; }
        public DateTime? DeletedAt { get; set; }
    }
}

