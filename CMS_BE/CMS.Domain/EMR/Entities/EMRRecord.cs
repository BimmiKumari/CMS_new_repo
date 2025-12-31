using CMS.Domain.Clinic.Entities;

namespace CMS.Domain.EMR.Entities
{
    public class EMRRecord
    {
        public Guid EMRRecordID { get; set; }
        public Guid PatientID { get; set; }
        public string? MedicalRecordNumber { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public bool IsDeleted { get; set; }
        public DateTime? DeletedAt { get; set; }
        
        // Navigation Properties
        public Patient? Patient { get; set; }
        public ICollection<PatientEncounter> Encounters { get; set; } = new List<PatientEncounter>();
        public ICollection<Diagnosis> Diagnoses { get; set; } = new List<Diagnosis>();
        public ICollection<LabTest> LabTests { get; set; } = new List<LabTest>();
        public ICollection<MedicalReport> MedicalReports { get; set; } = new List<MedicalReport>();
        public ICollection<Observation> Observations { get; set; } = new List<Observation>();
        public ICollection<Prescription> Prescriptions { get; set; } = new List<Prescription>();
        public ICollection<TreatmentPlan> TreatmentPlans { get; set; } = new List<TreatmentPlan>();
        public ICollection<VitalSigns> VitalSigns { get; set; } = new List<VitalSigns>();
    }
}
