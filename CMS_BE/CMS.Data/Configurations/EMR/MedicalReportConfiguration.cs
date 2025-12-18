using CMS.Domain.EMR.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CMS.Data.Configurations.EMR
{
    public class MedicalReportConfiguration : IEntityTypeConfiguration<MedicalReport>
    {
        public void Configure(EntityTypeBuilder<MedicalReport> builder)
        {
            builder.ToTable("MedicalReports");
            
            builder.HasKey(e => e.ReportID);
            
            builder.Property(e => e.FileUrl)
                .IsRequired()
                .HasMaxLength(500);
            
            builder.Property(e => e.ReportType)
                .IsRequired()
                .HasConversion<int>();
            
            builder.Property(e => e.Findings)
                .IsRequired()
                .HasMaxLength(2000);
            
            builder.HasIndex(e => e.EncounterID);
            builder.HasIndex(e => e.ReportType);
            builder.HasIndex(e => e.DateUploaded);
            
            builder.Property(e => e.CreatedAt)
                .IsRequired()
                .HasDefaultValueSql("GETUTCDATE()");

            // Soft Delete Query Filter
            builder.HasQueryFilter(e => !e.IsDeleted);
        }
    }
}
