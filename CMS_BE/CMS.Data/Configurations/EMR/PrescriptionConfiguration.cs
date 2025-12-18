using CMS.Domain.EMR.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CMS.Data.Configurations.EMR
{
    public class PrescriptionConfiguration : IEntityTypeConfiguration<Prescription>
    {
        public void Configure(EntityTypeBuilder<Prescription> builder)
        {
            builder.ToTable("Prescriptions");
            
            builder.HasKey(e => e.PrescriptionID);
            
            builder.Property(e => e.MedicationName)
                .IsRequired()
                .HasMaxLength(200);
            
            builder.Property(e => e.Unit)
                .HasMaxLength(50);
            
            builder.Property(e => e.Frequency)
                .IsRequired()
                .HasConversion<int>();
            
            builder.Property(e => e.Duration)
                .IsRequired()
                .HasMaxLength(100);
            
            builder.Property(e => e.Notes)
                .HasMaxLength(1000);
            
            builder.HasIndex(e => e.EncounterID);
            builder.HasIndex(e => e.DoctorID);
            
            builder.Property(e => e.CreatedAt)
                .IsRequired()
                .HasDefaultValueSql("GETUTCDATE()");

            // Soft Delete Query Filter
            builder.HasQueryFilter(e => !e.IsDeleted);
        }
    }
}
