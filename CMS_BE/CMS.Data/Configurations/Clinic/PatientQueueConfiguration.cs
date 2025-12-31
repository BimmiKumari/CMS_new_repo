using CMS.Domain.Clinic.Entities;
using CMS.Domain.Appointments.Entities;
using CMS.Domain.EMR.Entities;
using CMS.Domain.Auth.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
namespace CMS.Data.Configurations.Clinic
{
    public class PatientQueueConfiguration : IEntityTypeConfiguration<PatientQueue>
    {
        public void Configure(EntityTypeBuilder<PatientQueue> builder)
        {
            builder.HasKey(e => e.QueueID);
            builder.Property(e => e.QueueID)
                .HasDefaultValueSql("NEWID()");

            builder.Property(e => e.AppointmentID)
                .IsRequired();

            builder.Property(e => e.PatientID)
                .IsRequired();

            builder.Property(e => e.DoctorID)
                .IsRequired();

            builder.Property(e => e.QueueZone)
                .IsRequired()
                .HasConversion<int>();

            builder.Property(e => e.QueuePosition)
                .IsRequired();

            builder.Property(e => e.QueueStatus)
                .IsRequired()
                .HasConversion<int>()
                .HasDefaultValue(0);

            builder.Property(e => e.CreatedAt)
                .IsRequired()
                .HasDefaultValueSql("GETUTCDATE()");

            builder.Property(e => e.UpdatedAt)
                .IsRequired()
                .HasDefaultValueSql("GETUTCDATE()");

            builder.Property(e => e.IsDeleted)
                .IsRequired()
                .HasDefaultValue(false);

            // Foreign Key Relationships
            builder.HasOne<Appointment>()
                .WithMany()
                .HasForeignKey(e => e.AppointmentID)
                .OnDelete(DeleteBehavior.NoAction);

            builder.HasOne<Patient>()
                .WithMany()
                .HasForeignKey(e => e.PatientID)
                .OnDelete(DeleteBehavior.NoAction);

            builder.HasOne<User>()
                .WithMany()
                .HasForeignKey(e => e.DoctorID)
                .OnDelete(DeleteBehavior.NoAction);

            // Indexes
            builder.HasIndex(e => e.AppointmentID);
            builder.HasIndex(e => e.PatientID);
            builder.HasIndex(e => e.DoctorID);
            builder.HasIndex(e => e.QueueStatus);
            builder.HasIndex(e => new { e.DoctorID, e.QueueStatus });
            builder.HasIndex(e => new { e.QueueZone, e.QueuePosition });

            // Soft Delete Query Filter
            builder.HasQueryFilter(e => !e.IsDeleted);
        }
    }
}
