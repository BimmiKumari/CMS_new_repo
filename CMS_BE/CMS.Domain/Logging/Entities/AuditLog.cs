using CMS.Domain.Logging;

namespace CMS.Domain.Logging.Entities
{
    public class AuditLog
    {
        public Guid AuditID { get; private set; }
        public Guid UserID { get; private set; }
        public ActionType Action { get; private set; }
        public Guid RecordID { get; private set; }
        public bool IsSuccess { get; private set; }
        public string? ErrorMessage { get; private set; }
        public string? CorrelationId { get; private set; }
        public string? IPAddress { get; private set; }
        public DateTime ActionTimestamp { get; private set; }
    }
}