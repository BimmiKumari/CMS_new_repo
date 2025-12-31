using CMS.Domain.EMR.Enums;
using CMS.Domain.EMR.Entities;

namespace CMS.Domain.Clinic.Entities
{
    public class PatientEncounter
    {
        public Guid EncounterID { get; set; }
        public Guid PatientID { get; set; }
        public Guid EMRRecordID { get; set; }
        public Guid DoctorID { get; set; }
        public Guid AppointmentID { get; set; }
        public EncounterType EncounterType { get; set; }
        public Guid? ParentEncounterID { get; set; }
        public string? ChiefComplaint { get; set; }
        public string? PresentIllnessHistory { get; set; }
        public string? ClinicalNotes { get; set; }
        public string? PhysicalExamination { get; set; }
        public string? AssessmentAndPlan { get; set; }
        public DateTime EncounterDate { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public bool IsDeleted { get; set; }
        public DateTime? DeletedAt { get; set; }

        // Navigation Properties
        public EMRRecord? EMRRecord { get; set; }
    }
}