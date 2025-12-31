using CMS.Domain.EMR.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CMS.Data.Configurations.EMR
{
    public class VitalSignsConfiguration : IEntityTypeConfiguration<VitalSigns>
    {
        public void Configure(EntityTypeBuilder<VitalSigns> builder)
        {
            builder.ToTable("VitalSigns");
            
            builder.HasKey(e => e.VitalSignsID);
            
            builder.Property(e => e.Temperature)
                .HasPrecision(5, 2);
            
            builder.Property(e => e.TemperatureUnit)
                .HasMaxLength(1);
            
            builder.Property(e => e.Height)
                .HasPrecision(5, 2);
            
            builder.Property(e => e.Weight)
                .HasPrecision(5, 2);
            
            builder.Property(e => e.BMI)
                .HasPrecision(5, 2);
            
            builder.Property(e => e.OxygenSaturation)
                .HasPrecision(5, 2);
            
            builder.Property(e => e.Notes)
                .HasMaxLength(1000);
            
            builder.HasIndex(e => e.EncounterID);
            builder.HasIndex(e => e.EMRRecordID);
            builder.HasIndex(e => e.RecordedAt);
            
            // FK Relationships
            builder.HasOne(v => v.EMRRecord)
                .WithMany(emr => emr.VitalSigns)
                .HasForeignKey(v => v.EMRRecordID)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(v => v.Encounter)
                .WithMany()
                .HasForeignKey(v => v.EncounterID)
                .OnDelete(DeleteBehavior.Restrict);
            
            builder.Property(e => e.CreatedAt)
                .IsRequired()
                .HasDefaultValueSql("GETUTCDATE()");

            // Soft Delete Query Filter
            builder.HasQueryFilter(e => !e.IsDeleted);
        }
    }
}
