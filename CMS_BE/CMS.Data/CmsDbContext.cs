using CMS.Data.Configurations.Appointments;
using CMS.Data.Configurations.Auth;
using CMS.Data.Configurations.Billing;
using CMS.Data.Configurations.Clinic;
using CMS.Data.Configurations.EMR;
using CMS.Data.Configurations.Logging;
using CMS.Data.Configurations.Notifications;
using CMS.Domain.Appointments.Entities;
using CMS.Domain.Auth.Entities;
using CMS.Domain.Billing.Entities;
using CMS.Domain.Clinic.Entities;
using CMS.Domain.EMR.Entities;
using CMS.Domain.Logging.Entities;
using CMS.Domain.NotificationModels;
using Microsoft.EntityFrameworkCore;

namespace CMS.Data
{
    public class CmsDbContext : DbContext
    {
        // Auth entities
        public DbSet<User> Users { get; set; }
        public DbSet<Token> Tokens { get; set; }
        public DbSet<VerificationCode> VerificationCodes { get; set; }
        public DbSet<Invitation> Invitations { get; set; }
        
        // Logging entities
        public DbSet<UserSession> UserSessions { get; set; }
        public DbSet<AuditLog> AuditLogs { get; set; }
        
        // Clinic entities
        public DbSet<Doctor> Doctors { get; set; }
        public DbSet<Leave> Leaves { get; set; }
        public DbSet<PatientEncounter> PatientEncounters { get; set; }
        public DbSet<PatientQueue> PatientQueues { get; set; }
        
        // EMR entities
        public DbSet<Patient> Patients { get; set; }
        public DbSet<EMRRecord> EMRRecords { get; set; }
        public DbSet<Observation> Observations { get; set; }
        public DbSet<MedicalReport> MedicalReports { get; set; }
        public DbSet<Prescription> Prescriptions { get; set; }
        public DbSet<VitalSigns> VitalSigns { get; set; }
        public DbSet<Diagnosis> Diagnoses { get; set; }
        public DbSet<LabTest> LabTests { get; set; }
        public DbSet<TreatmentPlan> TreatmentPlans { get; set; }
        
        // Billing entities
        public DbSet<Invoice> Invoices { get; set; }
        public DbSet<Payment> Payments { get; set; }
        
        // Appointment entities
        public DbSet<Appointment> Appointments { get; set; }
        public DbSet<TimeSlot> TimeSlots { get; set; }
        
        // Notification entities
        public DbSet<Notification> Notifications { get; set; }
        public DbSet<NotificationTemplate> NotificationTemplates { get; set; }
        public DbSet<NotificationChannel> NotificationChannels { get; set; }
        public DbSet<NotificationPreference> NotificationPreferences { get; set; }
        public DbSet<NotificationQueue> NotificationQueues { get; set; }

        public CmsDbContext(DbContextOptions<CmsDbContext> options) : base(options) { }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Auth configurations
            modelBuilder.ApplyConfiguration(new AuthConfiguration());
            modelBuilder.ApplyConfiguration(new TokenConfiguration());
            modelBuilder.ApplyConfiguration(new VerificationCodeConfiguration());
            modelBuilder.ApplyConfiguration(new InvitationConfiguration());
            
            // Logging configurations
            modelBuilder.ApplyConfiguration(new UserSessionConfiguration());
            modelBuilder.ApplyConfiguration(new AuditLogConfiguration());
            
            // Clinic configurations
            modelBuilder.ApplyConfiguration(new DoctorConfiguration());
            modelBuilder.ApplyConfiguration(new LeaveConfiguration());
            modelBuilder.ApplyConfiguration(new PatientEncounterConfiguration());
            modelBuilder.ApplyConfiguration(new PatientQueueConfiguration());
            
            // EMR configurations
            modelBuilder.ApplyConfiguration(new PatientConfiguration());
            modelBuilder.ApplyConfiguration(new EMRRecordConfiguration());
            modelBuilder.ApplyConfiguration(new ObservationConfiguration());
            modelBuilder.ApplyConfiguration(new MedicalReportConfiguration());
            modelBuilder.ApplyConfiguration(new PrescriptionConfiguration());
            modelBuilder.ApplyConfiguration(new VitalSignsConfiguration());
            modelBuilder.ApplyConfiguration(new DiagnosisConfiguration());
            modelBuilder.ApplyConfiguration(new LabTestConfiguration());
            modelBuilder.ApplyConfiguration(new TreatmentPlanConfiguration());
            
            // Billing configurations
            modelBuilder.ApplyConfiguration(new InvoiceConfiguration());
            modelBuilder.ApplyConfiguration(new PaymentConfiguration());
            
            // Appointment configurations
            modelBuilder.ApplyConfiguration(new AppointmentConfiguration());
            modelBuilder.ApplyConfiguration(new TimeSlotConfiguration());
            
            // Notification configurations
            modelBuilder.ApplyConfiguration(new NotificationConfiguration());
            modelBuilder.ApplyConfiguration(new NotificationTemplateConfiguration());
            modelBuilder.ApplyConfiguration(new NotificationChannelConfiguration());
            modelBuilder.ApplyConfiguration(new NotificationPreferenceConfiguration());
            modelBuilder.ApplyConfiguration(new NotificationQueueConfiguration());
        }
    }
}