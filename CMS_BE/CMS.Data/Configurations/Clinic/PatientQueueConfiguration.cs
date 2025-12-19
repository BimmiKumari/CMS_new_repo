using CMS.Domain.Clinic.Entities;
using CMS.Domain.Auth.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CMS.Data.Configurations.Clinic
{
    public class PatientQueueConfiguration : IEntityTypeConfiguration<PatientQueue>
    {
        public void Configure(EntityTypeBuilder<PatientQueue> builder)
        {
            builder.ToTable("PatientQueues");
            
            builder.HasKey(e => e.QueueID);
            
            builder.Property(e => e.QueueZone)
                .IsRequired()
                .HasConversion<int>();
            
            builder.Property(e => e.QueueStatus)
                .IsRequired()
                .HasConversion<int>();
            
            builder.HasIndex(e => e.AppointmentID);
            builder.HasIndex(e => e.PatientID);
            builder.HasIndex(e => e.DoctorID);
            builder.HasIndex(e => new { e.DoctorID, e.AppointmentDate, e.QueueZone });
            builder.HasIndex(e => e.QueueStatus);
            
            builder.Property(e => e.CreatedAt)
                .IsRequired()
                .HasDefaultValueSql("GETUTCDATE()");
            
            builder.Property(e => e.UpdatedAt)
                .IsRequired()
                .HasDefaultValueSql("GETUTCDATE()");
            
            // Relationships
            builder.HasOne(e => e.Appointment)
                .WithMany()
                .HasForeignKey(e => e.AppointmentID)
                .OnDelete(DeleteBehavior.Restrict);
            
            builder.HasOne(e => e.Patient)
                .WithMany()
                .HasForeignKey(e => e.PatientID)
                .OnDelete(DeleteBehavior.Restrict);
            
            builder.HasOne(e => e.Doctor)
                .WithMany()
                .HasForeignKey(e => e.DoctorID)
                .OnDelete(DeleteBehavior.Restrict);
            
            // User ID foreign key (patient user)
            builder.HasOne<User>()
                .WithMany()
                .HasForeignKey(e => e.user_id)
                .OnDelete(DeleteBehavior.Restrict);
            
            // Add index on user_id for performance
            builder.HasIndex(e => e.user_id);

            // Soft Delete Query Filter
            builder.HasQueryFilter(e => !e.IsDeleted);
        }
    }
}
