using CMS.Domain.EMR.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CMS.Data.Configurations.EMR
{
    public class ObservationConfiguration : IEntityTypeConfiguration<Observation>
    {
        public void Configure(EntityTypeBuilder<Observation> builder)
        {
            builder.ToTable("Observations");
            
            builder.HasKey(e => e.ObservationID);
            
            builder.Property(e => e.ObservationName)
                .IsRequired()
                .HasMaxLength(200);
            
            builder.Property(e => e.ReferenceRange)
                .HasMaxLength(100);
            
            builder.Property(e => e.Value)
                .IsRequired()
                .HasMaxLength(500);
            
            builder.Property(e => e.Unit)
                .HasMaxLength(50);
            
            builder.HasIndex(e => e.EncounterID);
            builder.HasIndex(e => e.EMRRecordID);
            builder.HasIndex(e => e.DateRecorded);
            
            // FK Relationships
            builder.HasOne(o => o.EMRRecord)
                .WithMany(emr => emr.Observations)
                .HasForeignKey(o => o.EMRRecordID)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(o => o.Encounter)
                .WithMany()
                .HasForeignKey(o => o.EncounterID)
                .OnDelete(DeleteBehavior.Restrict);
            
            builder.Property(e => e.CreatedAt)
                .IsRequired()
                .HasDefaultValueSql("GETUTCDATE()");

            // Soft Delete Query Filter
            builder.HasQueryFilter(e => !e.IsDeleted);
        }
    }
}
