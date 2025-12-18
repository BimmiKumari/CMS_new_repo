using CMS.Domain.EMR.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CMS.Data.Configurations.EMR
{
    public class TreatmentPlanConfiguration : IEntityTypeConfiguration<TreatmentPlan>
    {
        public void Configure(EntityTypeBuilder<TreatmentPlan> builder)
        {
            builder.ToTable("TreatmentPlans");
            
            builder.HasKey(e => e.TreatmentPlanID);
            
            builder.Property(e => e.PlanDescription)
                .IsRequired()
                .HasMaxLength(2000);
            
            builder.Property(e => e.Goals)
                .HasMaxLength(1000);
            
            builder.Property(e => e.Instructions)
                .HasMaxLength(2000);
            
            builder.Property(e => e.Precautions)
                .HasMaxLength(1000);
            
            builder.Property(e => e.DietaryAdvice)
                .HasMaxLength(1000);
            
            builder.Property(e => e.LifestyleModifications)
                .HasMaxLength(1000);
            
            builder.Property(e => e.FollowUpInstructions)
                .HasMaxLength(1000);
            
            builder.HasIndex(e => e.EncounterID);
            builder.HasIndex(e => e.FollowUpDate);
            
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
