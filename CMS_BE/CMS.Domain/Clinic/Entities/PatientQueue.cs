using CMS.Domain.Appointments.Entities;
using CMS.Domain.Appointments.Enums;
using CMS.Domain.Clinic.Enums;
using System;
using System.ComponentModel.DataAnnotations;

namespace CMS.Domain.Clinic.Entities
{
    public class PatientQueue
    {
        [Key]
        public Guid QueueID { get; set; }
        
        [Required]
        public Guid AppointmentID { get; set; }
        
        [Required]
        public Guid PatientID { get; set; }
        
        public Guid? user_id { get; set; } // Direct link to user
        
        [Required]
        public Guid DoctorID { get; set; }
        
        [Required]
        public AppointmentType QueueZone { get; set; } // Regular or FollowUp
        
        public int QueuePosition { get; set; }
        
        [Required]
        public QueueStatusType QueueStatus { get; set; } = QueueStatusType.Waiting;
        
        public TimeSpan AppointmentTimeSlot { get; set; } // Time slot from appointment
        
        public DateTime AppointmentDate { get; set; } // Date of appointment
        
        public DateTime? CheckedInAt { get; set; }
        
        public DateTime? StartedAt { get; set; } // When doctor started consultation
        
        public DateTime? CompletedAt { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
        
        public bool IsDeleted { get; set; } = false;
        public DateTime? DeletedAt { get; set; }

        // Navigation properties
        public Appointment? Appointment { get; set; }
        public Patient? Patient { get; set; }
        public Doctor? Doctor { get; set; }
    }
}

