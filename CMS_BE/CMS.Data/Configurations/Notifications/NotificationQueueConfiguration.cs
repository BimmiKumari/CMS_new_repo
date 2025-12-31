using CMS.Domain.NotificationModels;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CMS.Data.Configurations.Notifications
{
    public class NotificationQueueConfiguration : IEntityTypeConfiguration<NotificationQueue>
    {
        public void Configure(EntityTypeBuilder<NotificationQueue> builder)
        {
            builder.HasKey(e => e.Id);

            builder.Property(e => e.NotificationId)
                .IsRequired();

            builder.Property(e => e.Priority)
                .IsRequired()
                .HasConversion<int>();

            builder.Property(e => e.ScheduledFor)
                .IsRequired();

            builder.Property(e => e.CreatedAt)
                .IsRequired()
                .HasDefaultValueSql("GETUTCDATE()");

            builder.Property(e => e.ProcessedAt);

            builder.Property(e => e.AttemptCount)
                .IsRequired()
                .HasDefaultValue(0);

            builder.Property(e => e.MaxAttempts)
                .IsRequired()
                .HasDefaultValue(3);

            builder.Property(e => e.ErrorMessage)
                .HasMaxLength(1000);

            builder.Property(e => e.Status)
                .IsRequired()
                .HasConversion<int>();

            builder.Property(e => e.ProcessingNode)
                .HasMaxLength(100);

            builder.HasIndex(e => e.NotificationId);
            builder.HasIndex(e => e.ScheduledFor);
            builder.HasIndex(e => e.Status);
            builder.HasIndex(e => e.Priority);

            // Relationship
            builder.HasOne(q => q.Notification)
                .WithMany()
                .HasForeignKey(q => q.NotificationId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}