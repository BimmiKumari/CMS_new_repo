using CMS.Application.EMR.DTOs;
using CMS.Application.EMR.Interfaces;
using CMS.Data;
using CMS.Domain.Appointments.Entities;
using CMS.Domain.Appointments.Enums;
using CMS.Domain.Clinic.Entities;
using CMS.Domain.Clinic.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace CMS.Application.EMR.Services
{
    public class PatientQueueService : IPatientQueueService
    {
        private readonly IPatientQueueRepository _queueRepository;
        private readonly CmsDbContext _context;
        private readonly ILogger<PatientQueueService> _logger;

        public PatientQueueService(
            IPatientQueueRepository queueRepository,
            CmsDbContext context,
            ILogger<PatientQueueService> logger)
        {
            _queueRepository = queueRepository;
            _context = context;
            _logger = logger;
        }

        public async Task<DoctorQueueResponseDto> GetDoctorQueueAsync(Guid doctorId, DateTime date)
        {
            var queues = await _queueRepository.GetQueueByDoctorAsync(doctorId, date);

            var response = new DoctorQueueResponseDto();

            foreach (var queue in queues)
            {
                var patient = await _context.Patients.FirstOrDefaultAsync(p => p.patient_id == queue.PatientID);
                
                if (patient == null) 
                {
                    Console.WriteLine($"[DEBUG] Skipping queue entry - Patient not found for ID: {queue.PatientID}");
                    continue;
                }
                
                // Get user name through appointment -> user relationship
                var appointment = await _context.Appointments.FirstOrDefaultAsync(a => a.AppointmentID == queue.AppointmentID);
                var user = appointment != null && appointment.user_id.HasValue 
                    ? await _context.Users.FirstOrDefaultAsync(u => u.UserID == appointment.user_id.Value) 
                    : null;
                var patientName = user?.Name ?? $"Patient {queue.PatientID.ToString().Substring(0, 8)}";
                
                Console.WriteLine($"[DEBUG] Found patient: {patientName}");

                // Use AppointmentType from Appointment table if available, else fallback to QueueZone
                var appointmentType = queue.Appointment?.AppointmentType ?? queue.QueueZone;

                // Get previous encounter for follow-up patients
                Guid? previousEncounterId = null;
                if (appointmentType == AppointmentType.FollowUp)
                {
                    var previousEncounter = await _context.PatientEncounters
                        .Where(e => e.PatientID == queue.PatientID && !e.IsDeleted)
                        .OrderByDescending(e => e.EncounterDate)
                        .FirstOrDefaultAsync();
                    
                    previousEncounterId = previousEncounter?.EncounterID;
                }

                var queuePatient = new QueuePatientDto
                {
                    QueueID = queue.QueueID,
                    AppointmentID = queue.AppointmentID,
                    PatientID = queue.PatientID,
                    PatientName = patientName,
                    Age = CalculateAge(patient.date_of_birth),
                    Sex = patient.sex,
                    BloodGroup = patient.blood_group,
                    Allergies = patient.allergies,
                    ChiefComplaint = patient.chief_medical_complaints,
                    QueueZone = queue.QueueZone,
                    QueuePosition = queue.QueuePosition,
                    QueueStatus = queue.QueueStatus,
                    AppointmentTimeSlot = queue.AppointmentTimeSlot,
                    AppointmentDate = queue.AppointmentDate,
                    CheckedInAt = queue.CheckedInAt,
                    IsFollowUp = appointmentType == AppointmentType.FollowUp,
                    PreviousEncounterID = previousEncounterId,
                    user_id = user?.UserID,
                    ProfileImagePath = patient.profile_image_path,
                    PhoneNumber = user?.PhoneNumber
                };

                // Categorize by queue zone
                if (appointmentType == AppointmentType.FollowUp)
                {
                    response.FollowUpPatients.Add(queuePatient);
                }
                else if (appointmentType == AppointmentType.Emergency)
                {
                    response.EmergencyCases.Add(queuePatient);
                }
                else
                {
                    response.RegularPatients.Add(queuePatient);
                }

                // Count by status
                switch (queue.QueueStatus)
                {
                    case QueueStatusType.Waiting:
                        response.TotalWaiting++;
                        break;
                    case QueueStatusType.InProgress:
                        response.TotalInProgress++;
                        break;
                    case QueueStatusType.Completed:
                        response.TotalCompleted++;
                        break;
                }
            }

            return response;
        }

        public async Task<QueuePatientDto> AddToQueueAsync(Guid appointmentId)
        {
            var appointment = await _context.Appointments
                .FirstOrDefaultAsync(a => a.AppointmentID == appointmentId);

            if (appointment == null)
                throw new Exception("Appointment not found");

            // Check if already in queue
            var existingQueue = await _context.PatientQueues
                .FirstOrDefaultAsync(q => q.AppointmentID == appointmentId && !q.IsDeleted);

            if (existingQueue != null)
                throw new Exception("Appointment already in queue");

            var patient = await _context.Patients.FindAsync(appointment.PatientID);
            if (patient == null)
                throw new Exception("Patient not found");

            // Determine queue zone based on appointment type or patient follow-up status
            var queueZone = appointment.AppointmentType;
            var isFollowUp = patient.seeking_followup || appointment.AppointmentType == AppointmentType.FollowUp;

            // Use appointment date from the appointment record
            var appointmentDate = appointment.AppointmentDate;

            // Get next queue position
            var queuePosition = await _queueRepository.GetNextQueuePositionAsync(
                appointment.DoctorID, 
                appointmentDate, 
                isFollowUp);

            var queue = new PatientQueue
            {
                QueueID = Guid.NewGuid(),
                AppointmentID = appointmentId,
                PatientID = appointment.PatientID,
                DoctorID = appointment.DoctorID,
                QueueZone = queueZone,
                QueuePosition = queuePosition,
                QueueStatus = QueueStatusType.Waiting,
                user_id = appointment.user_id,
                AppointmentTimeSlot = appointment.StartTime,
                AppointmentDate = appointmentDate,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            await _queueRepository.CreateAsync(queue);

            var user = appointment.user_id.HasValue 
                ? await _context.Users.FirstOrDefaultAsync(u => u.UserID == appointment.user_id.Value) 
                : null;

            return new QueuePatientDto
            {
                QueueID = queue.QueueID,
                AppointmentID = queue.AppointmentID,
                PatientID = queue.PatientID,
                PatientName = user?.Name ?? "Unknown",
                Age = CalculateAge(patient.date_of_birth),
                Sex = patient.sex,
                BloodGroup = patient.blood_group,
                Allergies = patient.allergies,
                ChiefComplaint = patient.chief_medical_complaints,
                QueueZone = queue.QueueZone,
                QueuePosition = queue.QueuePosition,
                QueueStatus = queue.QueueStatus,
                AppointmentTimeSlot = queue.AppointmentTimeSlot,
                AppointmentDate = queue.AppointmentDate,
                IsFollowUp = isFollowUp,
                user_id = user?.UserID,
                ProfileImagePath = patient.profile_image_path
            };
        }

        public async Task<QueuePatientDto> UpdateQueueStatusAsync(UpdateQueueStatusDto dto, Guid updatedBy)
        {
            var queue = await _queueRepository.GetByIdAsync(dto.QueueID);
            if (queue == null)
                throw new Exception("Queue entry not found");

            queue.QueueStatus = dto.NewStatus;
            queue.UpdatedAt = DateTime.UtcNow;

            // Set timestamps based on status
            switch (dto.NewStatus)
            {
                case QueueStatusType.InProgress:
                    queue.StartedAt = DateTime.UtcNow;
                    break;
                case QueueStatusType.Completed:
                    queue.CompletedAt = DateTime.UtcNow;
                    break;
            }

            await _queueRepository.UpdateAsync(queue);

            var patient = await _context.Patients.FindAsync(queue.PatientID);
            var appointment = await _context.Appointments.FirstOrDefaultAsync(a => a.AppointmentID == queue.AppointmentID);
            var user = appointment != null && appointment.user_id.HasValue 
                ? await _context.Users.FirstOrDefaultAsync(u => u.UserID == appointment.user_id.Value) 
                : null;

            return new QueuePatientDto
            {
                QueueID = queue.QueueID,
                AppointmentID = queue.AppointmentID,
                PatientID = queue.PatientID,
                PatientName = user?.Name ?? "Unknown",
                Age = patient != null ? CalculateAge(patient.date_of_birth) : 0,
                Sex = patient?.sex ?? 'U',
                BloodGroup = patient?.blood_group ?? "Unknown",
                QueueZone = queue.QueueZone,
                QueuePosition = queue.QueuePosition,
                QueueStatus = queue.QueueStatus,
                AppointmentTimeSlot = queue.AppointmentTimeSlot,
                AppointmentDate = queue.AppointmentDate,
                CheckedInAt = queue.CheckedInAt,
                user_id = user?.UserID
            };
        }

        public async Task<bool> RemoveFromQueueAsync(Guid queueId)
        {
            return await _queueRepository.DeleteAsync(queueId);
        }



        private int CalculateAge(DateOnly dateOfBirth)
        {
            var today = DateOnly.FromDateTime(DateTime.UtcNow);
            var age = today.Year - dateOfBirth.Year;
            if (dateOfBirth > today.AddYears(-age)) age--;
            return age;
        }
    }
}
