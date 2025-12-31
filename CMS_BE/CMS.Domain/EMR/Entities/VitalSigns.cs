using System.ComponentModel.DataAnnotations;
using CMS.Domain.Clinic.Entities;

namespace CMS.Domain.EMR.Entities
{
    /// <summary>
    /// Stores patient vital signs recorded during an encounter
    /// </summary>
    public class VitalSigns
    {
        [Key]
        public Guid VitalSignsID { get; set; }
        
        [Required]
        public Guid EMRRecordID { get; set; }
        
        [Required]
        public Guid EncounterID { get; set; }
        
        // Vital measurements
        public decimal? Temperature { get; set; } // in Celsius
        public string? TemperatureUnit { get; set; } = "C";
        
        public int? SystolicBP { get; set; } // Systolic Blood Pressure
        public int? DiastolicBP { get; set; } // Diastolic Blood Pressure
        
        public int? HeartRate { get; set; } // Beats per minute
        public int? RespiratoryRate { get; set; } // Breaths per minute
        
        public decimal? OxygenSaturation { get; set; } // SpO2 percentage
        
        public decimal? Height { get; set; } // in cm
        public decimal? Weight { get; set; } // in kg
        public decimal? BMI { get; set; } // Body Mass Index
        
        public string? Notes { get; set; }
        
        [Required]
        public Guid RecordedBy { get; set; } // Staff/Doctor who recorded
        
        public DateTime RecordedAt { get; set; } = DateTime.UtcNow;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        public bool IsDeleted { get; set; } = false;
        public DateTime? DeletedAt { get; set; }
        
        // Navigation properties
        public EMRRecord? EMRRecord { get; set; }
        public PatientEncounter? Encounter { get; set; }
    }
}
