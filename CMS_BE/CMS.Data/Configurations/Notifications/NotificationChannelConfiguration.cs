using CMS.Domain.NotificationModels;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CMS.Data.Configurations.Notifications
{
    public class NotificationChannelConfiguration : IEntityTypeConfiguration<NotificationChannel>
    {
        public void Configure(EntityTypeBuilder<NotificationChannel> builder)
        {
            builder.HasKey(e => e.Id);

            builder.Property(e => e.NotificationId)
                .IsRequired();

            builder.Property(e => e.ChannelType)
                .IsRequired()
                .HasConversion<int>();

            builder.Property(e => e.Status)
                .IsRequired()
                .HasConversion<int>();

            builder.Property(e => e.ExternalId)
                .HasMaxLength(100);

            builder.Property(e => e.SentAt);

            builder.Property(e => e.DeliveredAt);

            builder.Property(e => e.FailedAt);

            builder.Property(e => e.ErrorMessage)
                .HasMaxLength(1000);

            builder.Property(e => e.RetryCount)
                .IsRequired()
                .HasDefaultValue(0);

            builder.Property(e => e.DeliveryReceipt)
                .HasMaxLength(1000);

            var options = new System.Text.Json.JsonSerializerOptions();
            builder.Property(e => e.ProviderMetadata)
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

            builder.HasIndex(e => e.NotificationId);
            builder.HasIndex(e => e.ChannelType);
            builder.HasIndex(e => e.Status);
            builder.HasIndex(e => e.SentAt);
        }
    }
}