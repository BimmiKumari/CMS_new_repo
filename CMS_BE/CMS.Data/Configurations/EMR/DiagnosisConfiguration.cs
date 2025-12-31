using CMS.Domain.EMR.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CMS.Data.Configurations.EMR
{
    public class DiagnosisConfiguration : IEntityTypeConfiguration<Diagnosis>
    {
        public void Configure(EntityTypeBuilder<Diagnosis> builder)
        {
            builder.ToTable("Diagnoses");
            
            builder.HasKey(e => e.DiagnosisID);
            
            builder.Property(e => e.DiagnosisCode)
                .IsRequired()
                .HasMaxLength(20);
            
            builder.Property(e => e.DiagnosisName)
                .IsRequired()
                .HasMaxLength(200);
            
            builder.Property(e => e.Description)
                .HasMaxLength(1000);
            
            builder.Property(e => e.Status)
                .IsRequired()
                .HasConversion<int>();
            
            builder.HasIndex(e => e.EncounterID);
            builder.HasIndex(e => e.EMRRecordID);
            builder.HasIndex(e => e.DiagnosisCode);
            builder.HasIndex(e => e.DiagnosedAt);
            
            // FK Relationships
            builder.HasOne(d => d.EMRRecord)
                .WithMany(emr => emr.Diagnoses)
                .HasForeignKey(d => d.EMRRecordID)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(d => d.Encounter)
                .WithMany()
                .HasForeignKey(d => d.EncounterID)
                .OnDelete(DeleteBehavior.Restrict);
            
            builder.Property(e => e.CreatedAt)
                .IsRequired()
                .HasDefaultValueSql("GETUTCDATE()");
            
            builder.Property(e => e.UpdatedAt)
                .IsRequired()
                .HasDefaultValueSql("GETUTCDATE()");

            // Soft Delete Query Filter
            builder.HasQueryFilter(e => !e.IsDeleted);
        }
    }
}
