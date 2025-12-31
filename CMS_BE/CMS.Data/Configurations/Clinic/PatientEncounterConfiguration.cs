using CMS.Domain.Clinic.Entities;
using CMS.Domain.EMR.Entities;
using CMS.Domain.Appointments.Entities;
using CMS.Domain.Auth.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using CMS.Domain.EMR.Enums;

namespace CMS.Data.Configurations.Clinic
{
    public class PatientEncounterConfiguration : IEntityTypeConfiguration<PatientEncounter>
    {
        public void Configure(EntityTypeBuilder<PatientEncounter> builder)
        {
            builder.HasKey(e => e.EncounterID);

            builder.Property(e => e.EncounterID)
                .HasDefaultValueSql("NEWID()");

            builder.Property(e => e.EMRRecordID)
                .IsRequired();

            builder.Property(e => e.PatientID)
                .IsRequired();

            builder.Property(e => e.DoctorID)
                .IsRequired();

            builder.Property(e => e.AppointmentID)
                .IsRequired();

            builder.Property(e => e.EncounterType)
                .IsRequired()
                .HasConversion<int>()
                .HasDefaultValue(EncounterType.InitialConsultation);

            builder.Property(e => e.ParentEncounterID);

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

            builder.Property(e => e.EncounterDate)
                .IsRequired()
                .HasDefaultValueSql("GETUTCDATE()");

            builder.Property(e => e.CreatedAt)
                .IsRequired()
                .HasDefaultValueSql("GETUTCDATE()");

            builder.Property(e => e.UpdatedAt)
                .IsRequired()
                .HasDefaultValueSql("GETUTCDATE()");

            builder.Property(e => e.IsDeleted)
                .IsRequired()
                .HasDefaultValue(false);

            builder.Property(e => e.DeletedAt);

            // FK Relationships
            builder.HasOne(e => e.EMRRecord)
                .WithMany(emr => emr.Encounters)
                .HasForeignKey(e => e.EMRRecordID)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne<Patient>()
                .WithMany()
                .HasForeignKey(e => e.PatientID)
                .OnDelete(DeleteBehavior.NoAction);

            builder.HasOne<User>()
                .WithMany()
                .HasForeignKey(e => e.DoctorID)
                .OnDelete(DeleteBehavior.NoAction);

            builder.HasOne<Appointment>()
                .WithMany()
                .HasForeignKey(e => e.AppointmentID)
                .OnDelete(DeleteBehavior.NoAction);

            // Self-referential FK for follow-up encounters
            builder.HasOne<PatientEncounter>()
                .WithMany()
                .HasForeignKey(e => e.ParentEncounterID)
                .OnDelete(DeleteBehavior.NoAction);

            // Indexes
            builder.HasIndex(e => e.PatientID);
            builder.HasIndex(e => e.DoctorID);
            builder.HasIndex(e => e.AppointmentID);
            builder.HasIndex(e => e.ParentEncounterID);
            builder.HasIndex(e => e.EncounterDate);
            builder.HasIndex(e => e.EncounterType);

            // Soft Delete Query Filter
            builder.HasQueryFilter(e => !e.IsDeleted);
        }
    }
}