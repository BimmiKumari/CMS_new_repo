using CMS.Domain.EMR.Entities;
using CMS.Domain.Auth.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CMS.Data.Configurations.EMR
{
    public class EMRRecordConfiguration : IEntityTypeConfiguration<EMRRecord>
    {
        public void Configure(EntityTypeBuilder<EMRRecord> builder)
        {
            builder.ToTable("EMRRecords");
            
            builder.HasKey(e => e.EMRRecordID);
            
            builder.Property(e => e.MedicalRecordNumber)
                .HasMaxLength(50);
            
            builder.HasIndex(e => e.MedicalRecordNumber)
                .IsUnique()
                .HasFilter("[MedicalRecordNumber] IS NOT NULL");
            
            builder.HasIndex(e => e.PatientID);
            
            builder.Property(e => e.CreatedAt)
                .IsRequired()
                .HasDefaultValueSql("GETUTCDATE()");
            
            builder.Property(e => e.UpdatedAt)
                .IsRequired()
                .HasDefaultValueSql("GETUTCDATE()");
            
            // Relationships
            // User relationship - one EMR per user (unique constraint)
            builder.HasOne(e => e.User)
                .WithMany()
                .HasForeignKey(e => e.user_id)
                .OnDelete(DeleteBehavior.Restrict);
            
            // Add unique index on user_id to ensure one EMR per user
            builder.HasIndex(e => e.user_id)
                .IsUnique()
                .HasFilter("[user_id] IS NOT NULL");
            
            // Patient relationship (backward compatibility, nullable)
            builder.HasOne(e => e.Patient)
                .WithOne(p => p.EMRRecord)
                .HasForeignKey<EMRRecord>(e => e.PatientID)
                .OnDelete(DeleteBehavior.Restrict);
            
            builder.HasMany(e => e.Encounters)
                .WithOne(enc => enc.EMRRecord)
                .HasForeignKey(enc => enc.EMRRecordID)
                .OnDelete(DeleteBehavior.Restrict);

            // Soft Delete Query Filter
            builder.HasQueryFilter(e => !e.IsDeleted);
        }
    }
}
