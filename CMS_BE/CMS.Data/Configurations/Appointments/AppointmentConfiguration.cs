using CMS.Domain.Appointments.Entities;
using CMS.Domain.Auth.Entities;
using CMS.Domain.EMR.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CMS.Data.Configurations.Appointments
{
    public class AppointmentConfiguration : IEntityTypeConfiguration<Appointment>
    {
        public void Configure(EntityTypeBuilder<Appointment> builder)
        {
            builder.HasKey(a => a.AppointmentID);

            builder.Property(a => a.AppointmentID)
                .HasDefaultValueSql("NEWID()");

            builder.Property(a => a.PatientID)
                .IsRequired();

            builder.Property(a => a.DoctorID)
                .IsRequired();

            builder.Property(a => a.AppointmentDate)
                .IsRequired();

            builder.Property(a => a.StartTime)
                .IsRequired();

            builder.Property(a => a.EndTime)
                .IsRequired();

            builder.Property(a => a.Status)
                .IsRequired()
                .HasConversion<int>();

            builder.Property(a => a.AppointmentType)
                .IsRequired()
                .HasConversion<int>();

            builder.Property(a => a.GoogleCalendarEventID)
                .HasMaxLength(255);

            builder.Property(a => a.ReasonForVisit)
                .IsRequired()
                .HasMaxLength(1000);

            builder.Property(a => a.ConsultedBefore)
                .IsRequired()
                .HasDefaultValue(false);

            builder.Property(a => a.SeekingFollowup)
                .IsRequired()
                .HasDefaultValue(false);

            builder.Property(a => a.CreatedAt)
                .IsRequired()
                .HasDefaultValueSql("GETUTCDATE()");

            builder.Property(a => a.UpdatedAt)
                .IsRequired()
                .HasDefaultValueSql("GETUTCDATE()");

            builder.Property(a => a.CreatedBy);

            builder.Property(a => a.IsDeleted)
                .IsRequired()
                .HasDefaultValue(false);

            builder.Property(a => a.DeletedAt);

            // FK relationships
            builder.HasOne<Patient>()
                .WithMany()
                .HasForeignKey(a => a.PatientID)
                .OnDelete(DeleteBehavior.NoAction);

            builder.HasOne<User>()
                .WithMany()
                .HasForeignKey(a => a.DoctorID)
                .OnDelete(DeleteBehavior.NoAction);

            builder.HasOne<User>()
                .WithMany()
                .HasForeignKey(a => a.CreatedBy)
                .OnDelete(DeleteBehavior.NoAction);

            // Indexes
            builder.HasIndex(a => a.PatientID);
            builder.HasIndex(a => a.DoctorID);
            builder.HasIndex(a => a.AppointmentDate);

            // Soft Delete Query Filter
            builder.HasQueryFilter(a => !a.IsDeleted);
        }
    }
}