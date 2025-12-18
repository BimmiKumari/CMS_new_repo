using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Razorpay.Api;
using CMS.Models;
using CMS.Data;
using CMS.Domain;
using CMS.Domain.Appointments.Entities;
using CMS.Services;
using CMS.Application.EMR.Interfaces;
using CMS.Application.EMR.DTOs;
using CMS.Domain.Appointments.Enums;
using CMS.Domain.EMR.Enums;
using System.Security.Cryptography;
using System.Text;
using CMS.Application.Appointments.Interfaces;
using CMS.Application.Appointments.DTOs.Requests;
using System.Linq;


namespace CMS.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PaymentController : ControllerBase
    {
        private readonly IConfiguration _configuration;
        private readonly CmsDbContext _context;
        private readonly BillPdfService _billPdfService;
        private readonly IPatientQueueService _queueService;
        private readonly IEncounterService _encounterService;
        private readonly IEMRService _emrService;
        private readonly ILogger<PaymentController> _logger;
        private readonly IAppointmentService _appointmentService;
        private readonly string _keyId;
        private readonly string _keySecret;
        private static readonly Dictionary<string, PaymentRequest> _paymentData = new();

        public PaymentController(
            IConfiguration configuration, 
            CmsDbContext context, 
            BillPdfService billPdfService,
            IPatientQueueService queueService,
            IEncounterService encounterService,
            IEMRService emrService,
            ILogger<PaymentController> logger,
            IAppointmentService appointmentService)
        {
            _configuration = configuration;
            _context = context;
            _billPdfService = billPdfService;
            _queueService = queueService;
            _encounterService = encounterService;
            _emrService = emrService;
            _logger = logger;
            _appointmentService = appointmentService;
            _keyId = _configuration["Razorpay:KeyId"] ?? "";
            _keySecret = _configuration["Razorpay:KeySecret"] ?? "";
        }

        [HttpPost("create-order")]
        public IActionResult CreateOrder([FromBody] PaymentRequest request)
        {
            Console.WriteLine($"=== CREATE ORDER ENDPOINT HIT ===");
            Console.WriteLine($"Request received with IsFollowup: {request?.IsFollowup}");
            Console.WriteLine($"Raw request - PatientId: {request?.PatientId}, DoctorId: {request?.DoctorId}");
            Console.WriteLine($"=================================");
            
            if (request == null) return BadRequest("Invalid request");
            if (string.IsNullOrEmpty(request.PatientId))
            {
                Console.WriteLine($"❌ ERROR: PatientId is null or empty!");
                return BadRequest("PatientId is required");
            }
            
            try
            {
                Console.WriteLine($"Creating order - Amount: {request.Amount}, Original: {request.OriginalAmount}, Discount: {request.DiscountAmount}, IsFollowup: {request.IsFollowup}");
                Console.WriteLine($"Appointment Details - DoctorId: {request.DoctorId}, PatientId: {request.PatientId}");
                Console.WriteLine($"Appointment Details - StartTime: {request.StartTime}, EndTime: {request.EndTime}, Date: {request.AppointmentDate}");
                Console.WriteLine($"Appointment Details - ReasonForVisit: {request.ReasonForVisit}");
                
                RazorpayClient client = new RazorpayClient(_keyId, _keySecret);
                
                Dictionary<string, object> options = new Dictionary<string, object>
                {
                    {"amount", request.Amount * 100}, // Amount in paise
                    {"currency", request.Currency},
                    {"receipt", $"receipt_{DateTime.Now.Ticks}"},
                    {"payment_capture", 1}
                };

                Order order = client.Order.Create(options);
                string orderId = order["id"].ToString();
                
                // Store payment details in static dictionary
                _paymentData[orderId] = request;
                
                Console.WriteLine($"=== SESSION STORAGE ===");
                Console.WriteLine($"Storing PaymentAmount_{orderId} = {request.Amount}");
                Console.WriteLine($"Storing OriginalAmount_{orderId} = {request.OriginalAmount}");
                Console.WriteLine($"Storing DiscountAmount_{orderId} = {request.DiscountAmount}");
                Console.WriteLine($"Storing IsFollowup_{orderId} = {request.IsFollowup.ToString().ToLower()}");
                Console.WriteLine($"Storing DoctorId_{orderId} = {request.DoctorId}");
                Console.WriteLine($"Storing PatientId_{orderId} = {request.PatientId}");
                Console.WriteLine($"Storing StartTime_{orderId} = {request.StartTime}");
                Console.WriteLine($"========================");
                
                var response = new PaymentResponse
                {
                    OrderId = orderId,
                    Key = _keyId,
                    Amount = request.Amount,
                    Currency = request.Currency,
                    Description = request.Description
                };

                return Ok(response);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error creating order: {ex.Message}");
                return BadRequest(new { error = ex.Message });
            }
        }

        [HttpPost("verify-payment")]
        public async Task<IActionResult> VerifyPayment([FromBody] PaymentVerification verification)
        {
            Console.WriteLine($"=== VERIFY PAYMENT ENDPOINT HIT ===");
            Console.WriteLine($"Verification object: {verification?.razorpayOrderId}");
            Console.WriteLine($"===================================");
            
            try
            {
                Console.WriteLine($"Received payment verification request");
                Console.WriteLine($"OrderId: {verification?.razorpayOrderId}");
                
                // Get payment details from session using order ID
                var orderId = verification?.razorpayOrderId ?? "";
                
                // Get payment data from static dictionary
                var paymentData = _paymentData.GetValueOrDefault(orderId);
                
                // FALLBACK: If static data is lost (restart), use data provided in verification request
                if (paymentData == null && !string.IsNullOrEmpty(verification.PatientId))
                {
                    Console.WriteLine("⚠️ Static payment data lost (likely due to restart), reconstructing from verification request");
                    paymentData = new PaymentRequest
                    {
                        PatientId = verification.PatientId,
                        DoctorId = verification.DoctorId,
                        AppointmentDate = verification.AppointmentDate,
                        StartTime = verification.StartTime,
                        EndTime = verification.EndTime,
                        ReasonForVisit = verification.ReasonForVisit,
                        IsFollowup = verification.IsFollowup,
                        Amount = 500, // Default fallback
                        OriginalAmount = 500,
                        DiscountAmount = 0
                    };
                }
                
                Console.WriteLine($"=== DATA RETRIEVAL ===");
                Console.WriteLine($"Retrieved payment data: {paymentData != null}");
                
                var paymentAmount = paymentData?.Amount ?? 500m;
                var originalAmount = paymentData?.OriginalAmount ?? 500m;
                var discountAmount = paymentData?.DiscountAmount ?? 0m;
                var isFollowup = paymentData?.IsFollowup ?? false;
                
                Console.WriteLine($"Retrieved Amount: {paymentAmount}");
                Console.WriteLine($"Retrieved Original: {originalAmount}");
                Console.WriteLine($"Retrieved Discount: {discountAmount}");
                Console.WriteLine($"Retrieved IsFollowup: {isFollowup}");
                
                Console.WriteLine($"=== FINAL VALUES ===");
                Console.WriteLine($"Amount: {paymentAmount}, Original: {originalAmount}, Discount: {discountAmount}, IsFollowup: {isFollowup}");
                Console.WriteLine($"===================");
                
                // Get patient ID from payment data
                Guid? patientIdGuid = null;
                if (!string.IsNullOrEmpty(paymentData?.PatientId))
                {
                    if (Guid.TryParse(paymentData.PatientId, out var parsedPatientId))
                    {
                        patientIdGuid = parsedPatientId;
                        Console.WriteLine($"✅ Successfully parsed patient_id: {patientIdGuid}");
                    }
                    else
                    {
                        Console.WriteLine($"❌ Failed to parse patient_id: {paymentData.PatientId}");
                    }
                }
                else
                {
                    Console.WriteLine($"⚠️ No patient_id in payment data");
                }

                var payment = new CMS.Domain.Appointments.Entities.Payment
                {
                    razorpay_order_id = verification?.razorpayOrderId ?? "test_order",
                    razorpay_payment_id = verification?.razorpayPaymentId ?? "test_payment",
                    razorpay_signature = verification?.razorpaySignature ?? "test_signature",
                    amount = paymentAmount,
                    original_amount = originalAmount,
                    discount_amount = discountAmount,
                    is_followup = isFollowup,
                    patient_id = patientIdGuid, // Use the patient_id from payment request
                    currency = "INR",
                    description = "Consultation Fee",
                    status = "success",
                    created_at = DateTime.UtcNow,
                    updated_at = DateTime.UtcNow
                };

                Console.WriteLine($"=== BEFORE DATABASE SAVE ===");
                Console.WriteLine($"payment.patient_id = {payment.patient_id}");
                Console.WriteLine($"payment.amount = {payment.amount}");
                Console.WriteLine($"payment.original_amount = {payment.original_amount}");
                Console.WriteLine($"payment.discount_amount = {payment.discount_amount}");
                Console.WriteLine($"payment.is_followup = {payment.is_followup}");
                Console.WriteLine($"=============================");

                _context.Payments.Add(payment);
                try
                {
                    await _context.SaveChangesAsync();
                }
                catch (Exception saveEx)
                {
                    Console.WriteLine($"❌ Error saving payment: {saveEx.Message}");
                    Console.WriteLine($"Inner exception: {saveEx.InnerException?.Message}");
                    throw;
                }
                
                Console.WriteLine($"=== AFTER DATABASE SAVE ===");
                Console.WriteLine($"Saved payment ID: {payment.payment_id}");
                Console.WriteLine($"============================");

                // Generate PDF bill
                Console.WriteLine($"Generating PDF with - Amount: {payment.amount}, Original: {payment.original_amount}, Discount: {payment.discount_amount}, IsFollowup: {payment.is_followup}");
                var pdfBytes = _billPdfService.GenerateBill(payment);
                var fileName = $"bill_{payment.payment_id}.pdf";
                var filePath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "bills", fileName);
                Console.WriteLine($"Saving PDF to: {filePath}");
                
                Directory.CreateDirectory(Path.GetDirectoryName(filePath)!);
                await System.IO.File.WriteAllBytesAsync(filePath, pdfBytes);
                
                payment.bill_pdf_path = $"/bills/{fileName}";
                await _context.SaveChangesAsync();

                // ===== CREATE APPOINTMENT AFTER SUCCESSFUL PAYMENT =====
                try
                {
                    Console.WriteLine($"=== APPOINTMENT CREATION CHECK ===");
                    Console.WriteLine($"PaymentData exists: {paymentData != null}");
                    Console.WriteLine($"DoctorId (string): {paymentData?.DoctorId}");
                    Console.WriteLine($"DoctorIdGuid: {paymentData?.DoctorIdGuid}");
                    Console.WriteLine($"PatientId: {paymentData?.PatientId}");
                    Console.WriteLine($"StartTime: {paymentData?.StartTime}");
                    Console.WriteLine($"EndTime: {paymentData?.EndTime}");
                    Console.WriteLine($"AppointmentDate: {paymentData?.AppointmentDate}");
                    Console.WriteLine($"ReasonForVisit: {paymentData?.ReasonForVisit}");
                    Console.WriteLine($"================================");
                    
                    // Check if we have appointment booking details
                    if (paymentData?.DoctorIdGuid != null && !string.IsNullOrEmpty(paymentData.PatientId))
                    {
                        _logger.LogInformation("Creating appointment after successful payment");
                        Console.WriteLine("✅ Appointment booking details found, proceeding with creation...");
                        
                        // Parse patient ID
                        if (!Guid.TryParse(paymentData.PatientId, out var patientId))
                        {
                            _logger.LogWarning($"Invalid patient ID: {paymentData.PatientId}");
                            Console.WriteLine($"❌ Invalid patient ID: {paymentData.PatientId}");
                            return Ok(new { success = true, message = "Payment verified successfully but invalid patient ID", billPath = payment.bill_pdf_path });
                        }

                        Console.WriteLine($"✅ Patient ID parsed: {patientId}");

                        // Parse appointment date
                        DateTime appointmentDate = DateTime.UtcNow.Date;
                        if (!string.IsNullOrEmpty(paymentData.AppointmentDate))
                        {
                            if (DateTime.TryParse(paymentData.AppointmentDate, out var parsedDate))
                            {
                                appointmentDate = parsedDate.Date;
                                Console.WriteLine($"✅ Appointment date parsed: {appointmentDate:yyyy-MM-dd}");
                            }
                            else
                            {
                                Console.WriteLine($"⚠️ Failed to parse appointment date: {paymentData.AppointmentDate}");
                            }
                        }

                        // Parse time strings to TimeSpan
                        TimeSpan startTime = ParseTimeString(paymentData.StartTime ?? "09:00 AM");
                        TimeSpan endTime = ParseTimeString(paymentData.EndTime ?? "09:30 AM");

                        Console.WriteLine($"✅ Times parsed - Start: {startTime}, End: {endTime}");

                        // Validate required data
                        if (paymentData.DoctorIdGuid == null || paymentData.DoctorIdGuid == Guid.Empty)
                        {
                            Console.WriteLine($"❌ Invalid DoctorId - DoctorId: {paymentData.DoctorId}");
                            Console.WriteLine($"❌ Parsed GUID - DoctorIdGuid: {paymentData.DoctorIdGuid}");
                            return Ok(new { success = true, message = "Payment verified successfully but invalid appointment data", billPath = payment.bill_pdf_path });
                        }

                        // Create appointment request
                        var createAppointmentDto = new CreateAppointmentRequestDto
                        {
                            PatientID = patientId,
                            DoctorID = paymentData.DoctorIdGuid.Value,
                            AppointmentDate = appointmentDate,
                            StartTime = startTime,
                            EndTime = endTime,
                            AppointmentType = isFollowup ? AppointmentType.FollowUp : AppointmentType.Consultation,
                            ReasonForVisit = paymentData.ReasonForVisit ?? "General Consultation"
                        };

                        Console.WriteLine($"✅ CreateAppointmentDto created - DoctorID: {createAppointmentDto.DoctorID}, Date: {createAppointmentDto.AppointmentDate:yyyy-MM-dd}, StartTime: {createAppointmentDto.StartTime}");

                        // Use a transaction to ensure all operations succeed together
                        using var transaction = await _context.Database.BeginTransactionAsync();
                        try
                        {
                            // Create the appointment
                            Console.WriteLine("📝 Calling AppointmentService.CreateAppointmentAsync...");
                            var appointmentDto = await _appointmentService.CreateAppointmentAsync(createAppointmentDto);
                            var appointmentId = appointmentDto.AppointmentID;
                            
                            Console.WriteLine($"✅ Appointment created successfully: {appointmentId}");
                            _logger.LogInformation($"Appointment created successfully: {appointmentId}");

                            // Verify appointment was actually saved to database
                            var appointmentCount = await _context.Appointments.CountAsync();
                            Console.WriteLine($"📊 Total appointments in database: {appointmentCount}");
                            
                            // Update appointment status to Scheduled
                            var appointment = await _context.Appointments.FindAsync(appointmentId);
                            if (appointment == null)
                            {
                                throw new Exception($"Appointment {appointmentId} not found after creation");
                            }
                            
                            Console.WriteLine($"✅ Found appointment in database, updating status to Scheduled");
                            appointment.Status = AppointmentStatus.Scheduled;
                            appointment.UpdatedAt = DateTime.UtcNow;
                            
                            // Save the status update
                            await _context.SaveChangesAsync();
                            Console.WriteLine($"✅ Appointment status updated to Scheduled");
                            
                            // 1. Create or get EMR record for patient
                            var existingEmr = await _emrService.GetEMRByPatientIdAsync(patientId);
                            if (existingEmr == null)
                            {
                                _logger.LogInformation($"Creating new EMR record for patient {patientId}");
                                Console.WriteLine($"📋 Creating new EMR record for patient {patientId}");
                                await _emrService.CreateEMRRecordAsync(new CreateEMRRecordDto 
                                { 
                                    PatientID = patientId 
                                });
                                Console.WriteLine($"✅ EMR record created");
                            }
                            else
                            {
                                Console.WriteLine($"✅ EMR record already exists for patient {patientId}");
                            }

                            // 2. Add patient to queue
                            _logger.LogInformation($"Adding patient to queue for appointment {appointmentId}");
                            Console.WriteLine($"🏥 Adding patient to queue for appointment {appointmentId}");
                            var queueEntry = await _queueService.AddToQueueAsync(appointmentId);
                            _logger.LogInformation($"Queue entry created: {queueEntry.QueueID}");
                            Console.WriteLine($"✅ Queue entry created: {queueEntry.QueueID}");

                            // 3. Create encounter
                            _logger.LogInformation($"Creating encounter for appointment {appointmentId}");
                            Console.WriteLine($"👨‍⚕️ Creating encounter for appointment {appointmentId}");
                            
                            // Determine if this is a follow-up
                            var patient = await _context.Patients.FindAsync(patientId);
                            var isFollowUp = patient?.seeking_followup ?? isFollowup;
                            
                            // Get previous encounter if follow-up
                            Guid? previousEncounterId = null;
                            if (isFollowUp)
                            {
                                var previousEncounter = await _context.PatientEncounters
                                    .Where(e => e.PatientID == patientId && !e.IsDeleted)
                                    .OrderByDescending(e => e.EncounterDate)
                                    .FirstOrDefaultAsync();
                                previousEncounterId = previousEncounter?.EncounterID;
                                Console.WriteLine($"📋 Previous encounter ID: {previousEncounterId}");
                            }

                            var encounterDto = new CreateEncounterDto
                            {
                                PatientID = patientId,
                                DoctorID = paymentData.DoctorIdGuid.Value,
                                AppointmentID = appointmentId,
                                EncounterType = isFollowUp ? EncounterType.FollowUp : EncounterType.InitialConsultation,
                                ChiefComplaint = patient?.chief_medical_complaints,
                                IsFollowUp = isFollowUp,
                                PreviousEncounterID = previousEncounterId
                            };

                            var encounter = await _encounterService.CreateEncounterAsync(encounterDto);
                            _logger.LogInformation($"Encounter created: {encounter.EncounterID}");
                            Console.WriteLine($"✅ Encounter created: {encounter.EncounterID}");
                            
                            // Commit the transaction
                            await transaction.CommitAsync();
                            Console.WriteLine($"✅ Transaction committed successfully");

                            return Ok(new 
                            { 
                                success = true, 
                                message = "Payment verified and appointment created successfully", 
                                billPath = payment.bill_pdf_path,
                                appointmentId = appointmentId,
                                queueId = queueEntry.QueueID,
                                encounterId = encounter.EncounterID,
                                appointmentCreated = true,
                                emrCreated = true
                            });
                        }
                        catch (Exception transactionEx)
                        {
                            await transaction.RollbackAsync();
                            Console.WriteLine($"❌ Transaction rolled back due to error: {transactionEx.Message}");
                            throw; // Re-throw to be caught by outer catch
                        }
                    }
                    else
                    {
                        _logger.LogWarning("No appointment booking details found in payment data");
                        Console.WriteLine($"❌ Missing appointment booking details - DoctorId: {paymentData?.DoctorId}, SlotId: {paymentData?.SlotId}, PatientId: {paymentData?.PatientId}");
                        return Ok(new { success = true, message = "Payment verified successfully but no appointment data found", billPath = payment.bill_pdf_path });
                    }
                }
                catch (Exception emrEx)
                {
                    _logger.LogError(emrEx, "Error creating appointment/EMR/Queue/Encounter, but payment was successful. Details: {ErrorMessage}", emrEx.Message);
                    Console.WriteLine($"❌ Error in appointment creation: {emrEx.Message}");
                    Console.WriteLine($"❌ Stack trace: {emrEx.StackTrace}");
                    
                    // Return error details for debugging while payment was successful
                    return Ok(new 
                    { 
                        success = true, 
                        message = "Payment verified successfully but appointment creation failed", 
                        billPath = payment.bill_pdf_path,
                        appointmentError = emrEx.Message,
                        appointmentCreated = false,
                        stackTrace = emrEx.StackTrace
                    });
                }

                return Ok(new { success = true, message = "Payment verified successfully", billPath = payment.bill_pdf_path });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in VerifyPayment: {ex.Message}");
                return BadRequest(new { error = ex.Message, details = ex.StackTrace });
            }
        }

        [HttpGet("download-bill/{fileName}")]
        public IActionResult DownloadBill(string fileName)
        {
            try
            {
                Console.WriteLine($"Downloading file: {fileName}");
                var filePath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "bills", fileName);
                Console.WriteLine($"Looking for file at: {filePath}");
                
                if (!System.IO.File.Exists(filePath))
                {
                    Console.WriteLine($"File not found at: {filePath}");
                    return NotFound($"Bill not found at {filePath}");
                }

                var fileBytes = System.IO.File.ReadAllBytes(filePath);
                Console.WriteLine($"File found, size: {fileBytes.Length} bytes");
                return File(fileBytes, "application/pdf", fileName);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error downloading bill: {ex.Message}");
                return BadRequest(new { error = ex.Message });
            }
        }

        [HttpGet("view-bill/{fileName}")]
        public IActionResult ViewBill(string fileName)
        {
            try
            {
                Console.WriteLine($"Viewing file: {fileName}");
                var filePath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "bills", fileName);
                
                if (!System.IO.File.Exists(filePath))
                {
                    return NotFound($"Bill not found");
                }

                var fileBytes = System.IO.File.ReadAllBytes(filePath);
                return File(fileBytes, "application/pdf"); // No filename = inline display
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error viewing bill: {ex.Message}");
                return BadRequest(new { error = ex.Message });
            }
        }

        private TimeSpan ParseTimeString(string timeString)
        {
            try
            {
                // Parse time string like "09:00 AM" to TimeSpan
                if (DateTime.TryParse(timeString, out var dateTime))
                {
                    return dateTime.TimeOfDay;
                }
                
                // Default to 9 AM if parsing fails
                return new TimeSpan(9, 0, 0);
            }
            catch
            {
                return new TimeSpan(9, 0, 0);
            }
        }

        [HttpGet("test-appointments")]
        public async Task<IActionResult> TestAppointments()
        {
            try
            {
                var appointmentCount = await _context.Appointments.CountAsync();
                var appointments = await _context.Appointments
                    .OrderByDescending(a => a.CreatedAt)
                    .Take(10)
                    .Select(a => new {
                        a.AppointmentID,
                        a.PatientID,
                        a.DoctorID,
                        a.Status,
                        a.AppointmentType,
                        a.ReasonForVisit,
                        a.CreatedAt
                    })
                    .ToListAsync();
                    
                return Ok(new {
                    totalAppointments = appointmentCount,
                    recentAppointments = appointments
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message, stackTrace = ex.StackTrace });
            }
        }

        [HttpGet("debug-payment-data/{orderId}")]
        public IActionResult DebugPaymentData(string orderId)
        {
            try
            {
                var paymentData = _paymentData.GetValueOrDefault(orderId);
                if (paymentData == null)
                {
                    return NotFound(new { message = "Payment data not found for order ID", orderId });
                }
                
                return Ok(new {
                    orderId,
                    paymentData = new {
                        paymentData.Amount,
                        paymentData.OriginalAmount,
                        paymentData.DiscountAmount,
                        paymentData.IsFollowup,
                        paymentData.PatientId,
                        paymentData.DoctorId,
                        paymentData.SlotId,
                        paymentData.StartTime,
                        paymentData.EndTime,
                        paymentData.AppointmentDate,
                        paymentData.ReasonForVisit
                    },
                    allStoredOrderIds = _paymentData.Keys.ToList()
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message, stackTrace = ex.StackTrace });
            }
        }

        private string ComputeHMACSHA256(string data, string key)
        {
            using (var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(key)))
            {
                byte[] hashBytes = hmac.ComputeHash(Encoding.UTF8.GetBytes(data));
                return BitConverter.ToString(hashBytes).Replace("-", "").ToLower();
            }
        }
    }
}