using CMS.Domain.Appointments.Entities;
using CMS.Domain.EMR.Entities;
using CMS.Domain.EMR.Enums;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace CMS.Domain.Clinic.Entities
{
    public class PatientEncounter
    {
        [Key]
        public Guid EncounterID { get; set; }
        
        [Required]
        public Guid PatientID { get; set; }
        
        [Required]
        public Guid DoctorID { get; set; }
        
        [Required]
        public Guid AppointmentID { get; set; }
        
        public Guid? EMRRecordID { get; set; } // Link to main EMR record
        
        [Required]
        public EncounterType EncounterType { get; set; } = EncounterType.InitialConsultation;
        
        public Guid? ParentEncounterID { get; set; } // For follow-up encounters
        
        public string? ChiefComplaint { get; set; }
        
        public string? PresentIllnessHistory { get; set; }
        
        public string? ClinicalNotes { get; set; }
        
        public string? PhysicalExamination { get; set; }
        
        public string? AssessmentAndPlan { get; set; }
        
        public DateTime EncounterDate { get; set; } = DateTime.UtcNow;
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
        
        public bool IsDeleted { get; set; } = false;
        public DateTime? DeletedAt { get; set; }

        // Navigation properties
        public Patient? Patient { get; set; }
        public Doctor? Doctor { get; set; }
        public Appointment? Appointment { get; set; }
        public EMRRecord? EMRRecord { get; set; }
        public PatientEncounter? ParentEncounter { get; set; }
        
        // EMR Components
        public ICollection<Observation>? Observations { get; set; }
        public ICollection<MedicalReport>? MedicalReports { get; set; }
        public ICollection<Prescription>? Prescriptions { get; set; }
        public ICollection<VitalSigns>? VitalSigns { get; set; }
        public ICollection<Diagnosis>? Diagnoses { get; set; }
        public ICollection<LabTest>? LabTests { get; set; }
        public ICollection<TreatmentPlan>? TreatmentPlans { get; set; }
    }
}
