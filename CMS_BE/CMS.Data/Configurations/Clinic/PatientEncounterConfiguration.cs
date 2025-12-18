using CMS.Domain.Clinic.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CMS.Data.Configurations.Clinic
{
    public class PatientEncounterConfiguration : IEntityTypeConfiguration<PatientEncounter>
    {
        public void Configure(EntityTypeBuilder<PatientEncounter> builder)
        {
            builder.ToTable("PatientEncounters");
            
            builder.HasKey(e => e.EncounterID);
            
            builder.Property(e => e.EncounterType)
                .IsRequired()
                .HasConversion<int>();
            
            builder.Property(e => e.ChiefComplaint)
                .HasMaxLength(500);
            
            builder.Property(e => e.PresentIllnessHistory)
                .HasMaxLength(2000);
            
            builder.Property(e => e.ClinicalNotes)
                .HasMaxLength(4000);
            
            builder.Property(e => e.PhysicalExamination)
                .HasMaxLength(2000);
            
            builder.Property(e => e.AssessmentAndPlan)
                .HasMaxLength(2000);
            
            builder.HasIndex(e => e.PatientID);
            builder.HasIndex(e => e.DoctorID);
            builder.HasIndex(e => e.AppointmentID);
            builder.HasIndex(e => e.EMRRecordID);
            builder.HasIndex(e => e.EncounterDate);
            
            builder.Property(e => e.CreatedAt)
                .IsRequired()
                .HasDefaultValueSql("GETUTCDATE()");
            
            builder.Property(e => e.UpdatedAt)
                .IsRequired()
                .HasDefaultValueSql("GETUTCDATE()");
            
            // Relationships
            builder.HasOne(e => e.Patient)
                .WithMany()
                .HasForeignKey(e => e.PatientID)
                .OnDelete(DeleteBehavior.Restrict);
            
            builder.HasOne(e => e.Doctor)
                .WithMany()
                .HasForeignKey(e => e.DoctorID)
                .OnDelete(DeleteBehavior.Restrict);
            
            builder.HasOne(e => e.Appointment)
                .WithMany()
                .HasForeignKey(e => e.AppointmentID)
                .OnDelete(DeleteBehavior.Restrict);
            
            builder.HasOne(e => e.ParentEncounter)
                .WithMany()
                .HasForeignKey(e => e.ParentEncounterID)
                .OnDelete(DeleteBehavior.Restrict);
            
            // EMR Components
            builder.HasMany(e => e.Observations)
                .WithOne(o => o.Encounter)
                .HasForeignKey(o => o.EncounterID)
                .OnDelete(DeleteBehavior.Cascade);
            
            builder.HasMany(e => e.MedicalReports)
                .WithOne(mr => mr.Encounter)
                .HasForeignKey(mr => mr.EncounterID)
                .OnDelete(DeleteBehavior.Cascade);
            
            builder.HasMany(e => e.Prescriptions)
                .WithOne(p => p.Encounter)
                .HasForeignKey(p => p.EncounterID)
                .OnDelete(DeleteBehavior.Cascade);
            
            builder.HasMany(e => e.VitalSigns)
                .WithOne(v => v.Encounter)
                .HasForeignKey(v => v.EncounterID)
                .OnDelete(DeleteBehavior.Cascade);
            
            builder.HasMany(e => e.Diagnoses)
                .WithOne(d => d.Encounter)
                .HasForeignKey(d => d.EncounterID)
                .OnDelete(DeleteBehavior.Cascade);
            
            builder.HasMany(e => e.LabTests)
                .WithOne(lt => lt.Encounter)
                .HasForeignKey(lt => lt.EncounterID)
                .OnDelete(DeleteBehavior.Cascade);
            
            builder.HasMany(e => e.TreatmentPlans)
                .WithOne(tp => tp.Encounter)
                .HasForeignKey(tp => tp.EncounterID)
                .OnDelete(DeleteBehavior.Cascade);

            // Soft Delete Query Filter
            builder.HasQueryFilter(e => !e.IsDeleted);
        }
    }
}
