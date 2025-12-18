using System.ComponentModel.DataAnnotations;
using CMS.Domain.Appointments.Entities;
using CMS.Domain.Clinic.Entities;

namespace CMS.Domain.EMR.Entities
{
    /// <summary>
    /// Main EMR record that aggregates all medical information for a patient
    /// </summary>
    public class EMRRecord
    {
        [Key]
        public Guid EMRRecordID { get; set; }
        
        [Required]
        public Guid PatientID { get; set; }
        
        public string? MedicalRecordNumber { get; set; } // Unique MRN for the patient
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
        
        public bool IsDeleted { get; set; } = false;
        public DateTime? DeletedAt { get; set; }
        
        // Navigation properties
        public Patient? Patient { get; set; }
        public ICollection<PatientEncounter>? Encounters { get; set; }
    }
}
