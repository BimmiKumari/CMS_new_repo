using CMS.Domain.Appointments.Enums;
using CMS.Domain.Auth.Entities;
using CMS.Domain.Clinic.Entities;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CMS.Domain.Appointments.Entities
{
    public class Appointment
    {
        public Guid AppointmentID { get; set; }
        public Guid PatientID { get; set; }
        public Guid? user_id { get; set; } // Direct link to user for easier querying
        public Guid DoctorID { get; set; }
        public DateTime AppointmentDate { get; set; } // Date of the appointment
        public TimeSpan StartTime { get; set; }
        public TimeSpan EndTime { get; set; }
        [Required]
        public AppointmentStatus Status { get; set; }
        [Required]
        public AppointmentType AppointmentType { get; set; }
        public string GoogleCalendarEventID { get; set; } = string.Empty;
        [Required]
        public string ReasonForVisit { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public Guid? CreatedBy { get; set; }
        public bool IsDeleted { get; set; }
        public DateTime? DeletedAt { get; set; }


        //public Patient Patient { get; set; }
        //public Doctor Doctor { get; set; }
        //public Time_Slots Slot { get; set; }
        //public User CreatedUser { get; set; }
    }
}
