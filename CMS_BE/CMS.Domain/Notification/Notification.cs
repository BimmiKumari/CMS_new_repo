using CMS.Domain.NotificationModels.Enums;

namespace CMS.Domain.NotificationModels
{
    public class Notification
    {
        public Guid Id { get; set; }
        public string Title { get; set; }
        public string Message { get; set; }
        public NotificationType Type { get; set; }
        public NotificationPriority Priority { get; set; }
        public NotificationStatus Status { get; set; }
        public Guid RecipientId { get; set; }
        public string? RecipientEmail { get; set; }
        public string? RecipientPhone { get; set; }
        public Guid? SenderId { get; set; }
        public Guid? AppointmentId { get; set; }
        public Guid? PatientId { get; set; }
        public Guid? DoctorId { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? ScheduledFor { get; set; }
        public DateTime? SentAt { get; set; }
        public DateTime? ReadAt { get; set; }
        public int RetryCount { get; set; }
        public int MaxRetries { get; set; }
        public string? ErrorMessage { get; set; }
        public Dictionary<string, object>? Metadata { get; set; }
        public List<NotificationChannel> Channels { get; set; } = new();
        public Guid? TemplateId { get; set; }
        public NotificationTemplate? Template { get; set; }
    }
}