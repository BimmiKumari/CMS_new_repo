using CMS.Domain.EMR.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CMS.Data.Configurations.EMR
{
    public class LabTestConfiguration : IEntityTypeConfiguration<LabTest>
    {
        public void Configure(EntityTypeBuilder<LabTest> builder)
        {
            builder.ToTable("LabTests");
            
            builder.HasKey(e => e.LabTestID);
            
            builder.Property(e => e.TestName)
                .IsRequired()
                .HasMaxLength(200);
            
            builder.Property(e => e.TestCode)
                .HasMaxLength(50);
            
            builder.Property(e => e.TestCategory)
                .HasMaxLength(100);
            
            builder.Property(e => e.Status)
                .IsRequired()
                .HasConversion<int>();
            
            builder.Property(e => e.Instructions)
                .HasMaxLength(1000);
            
            builder.Property(e => e.Results)
                .HasMaxLength(4000);
            
            builder.Property(e => e.ResultsFileUrl)
                .HasMaxLength(500);
            
            builder.Property(e => e.Interpretation)
                .HasMaxLength(2000);
            
            builder.HasIndex(e => e.EncounterID);
            builder.HasIndex(e => e.Status);
            builder.HasIndex(e => e.OrderedAt);
            
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
