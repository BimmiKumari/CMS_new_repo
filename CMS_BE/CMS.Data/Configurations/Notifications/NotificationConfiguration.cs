using CMS.Domain.NotificationModels;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CMS.Data.Configurations.Notifications
{
    public class NotificationConfiguration : IEntityTypeConfiguration<Notification>
    {
        public void Configure(EntityTypeBuilder<Notification> builder)
        {
            builder.HasKey(e => e.Id);

            builder.Property(e => e.Title)
                .HasMaxLength(200)
                .IsRequired();

            builder.Property(e => e.Message)
                .IsRequired();

            builder.Property(e => e.Type)
                .IsRequired()
                .HasConversion<int>();

            builder.Property(e => e.Priority)
                .IsRequired()
                .HasConversion<int>();

            builder.Property(e => e.Status)
                .IsRequired()
                .HasConversion<int>();

            builder.Property(e => e.RecipientId)
                .IsRequired();

            builder.Property(e => e.RecipientEmail)
                .HasMaxLength(100);

            builder.Property(e => e.RecipientPhone)
                .HasMaxLength(20);

            builder.Property(e => e.SenderId);

            builder.Property(e => e.AppointmentId);

            builder.Property(e => e.PatientId);

            builder.Property(e => e.DoctorId);

            builder.Property(e => e.CreatedAt)
                .IsRequired()
                .HasDefaultValueSql("GETUTCDATE()");

            builder.Property(e => e.ScheduledFor);

            builder.Property(e => e.SentAt);

            builder.Property(e => e.ReadAt);

            builder.Property(e => e.RetryCount)
                .IsRequired()
                .HasDefaultValue(0);

            builder.Property(e => e.MaxRetries)
                .IsRequired()
                .HasDefaultValue(3);

            builder.Property(e => e.ErrorMessage)
                .HasMaxLength(1000);

            builder.Property(e => e.TemplateId);

            var options = new System.Text.Json.JsonSerializerOptions();
            builder.Property(e => e.Metadata)
                .HasConversion(
                    v => v == null ? null : System.Text.Json.JsonSerializer.Serialize(v, options),
                    v => v == null ? null : System.Text.Json.JsonSerializer.Deserialize<Dictionary<string, object>>(v, options)
                )
                .Metadata.SetValueComparer(
                    new Microsoft.EntityFrameworkCore.ChangeTracking.ValueComparer<Dictionary<string, object>?>(
                        (c1, c2) => (c1 == null && c2 == null) || (c1 != null && c2 != null && 
                            System.Text.Json.JsonSerializer.Serialize(c1, options) == 
                            System.Text.Json.JsonSerializer.Serialize(c2, options)),
                        c => c == null ? 0 : System.Text.Json.JsonSerializer.Serialize(c, options).GetHashCode(),
                        c => c == null ? null : 
                            System.Text.Json.JsonSerializer.Deserialize<Dictionary<string, object>>(
                                System.Text.Json.JsonSerializer.Serialize(c, options), 
                                options)
                    ));

            builder.HasIndex(e => e.RecipientId);
            builder.HasIndex(e => e.Type);
            builder.HasIndex(e => e.Status);
            builder.HasIndex(e => e.CreatedAt);
            builder.HasIndex(e => e.ScheduledFor);

            // Relationships
            builder.HasMany(n => n.Channels)
                .WithOne(c => c.Notification)
                .HasForeignKey(c => c.NotificationId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(n => n.Template)
                .WithMany()
                .HasForeignKey(n => n.TemplateId)
                .OnDelete(DeleteBehavior.SetNull);
        }
    }
}