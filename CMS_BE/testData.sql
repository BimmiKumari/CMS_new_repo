-- use master;
-- ALTER DATABASE CMSDB SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
-- DROP DATABASE CMSDB;

use CMSDB;
select * from Users;
Delete from Users where UserID='26bb1aca-09e5-4fad-8b36-b74711a958a1';
select * from Doctors;
select * from Patients;
select * from Leaves;
select * from TimeSlots;
select * from VerificationCodes;
select * from Appointments; 

-- Doctor 1: Tom (Cardiologist)
INSERT INTO Users (UserID, Name, Email, PhoneNumber, PasswordHash, Role, IsActive, CreatedAt, UpdatedAt, IsDeleted)
VALUES 
('11111111-1111-1111-1111-111111111111', 'Tom', 'tom@cms.com', 5551234567, 'hashed_password_tom', 3, 1, GETUTCDATE(), GETUTCDATE(), 0);

-- Doctor 2: Dick (ENT)
INSERT INTO Users (UserID, Name, Email, PhoneNumber, PasswordHash, Role, IsActive, CreatedAt, UpdatedAt, IsDeleted)
VALUES 
('22222222-2222-2222-2222-222222222222', 'Dick', 'dick@cms.com', 5552345678, 'hashed_password_dick', 3, 1, GETUTCDATE(), GETUTCDATE(), 0);

-- Doctor 3: Harry (Dermatologist)
INSERT INTO Users (UserID, Name, Email, PhoneNumber, PasswordHash, Role, IsActive, CreatedAt, UpdatedAt, IsDeleted)
VALUES 
('33333333-3333-3333-3333-333333333333', 'Harry', 'harry@cms.com', 5553456789, 'hashed_password_harry', 3, 1, GETUTCDATE(), GETUTCDATE(), 0);

-- Insert Doctor Details
-- Doctor 1: Tom - Cardiologist (Mon-Fri, 07:00-16:00, 45min slots, break 12:00-13:00)
INSERT INTO Doctors (DoctorID, Specialization, Qualification, YearOfExperience, WorkingDays, StartTime, EndTime, SlotDuration, BreakStartTime, BreakEndTime, IsDeleted)
VALUES 
('11111111-1111-1111-1111-111111111111', 'Cardiology', 'MBBS, MD Cardiology', 10, 'Monday,Tuesday,Wednesday,Thursday,Friday', '07:00:00', '16:00:00', 45, '12:00:00', '13:00:00', 0);

-- Doctor 2: Dick - ENT (Mon, Wed, Fri, 10:00-18:00, 20min slots, break 13:30-14:30)
INSERT INTO Doctors (DoctorID, Specialization, Qualification, YearOfExperience, WorkingDays, StartTime, EndTime, SlotDuration, BreakStartTime, BreakEndTime, IsDeleted)
VALUES 
('22222222-2222-2222-2222-222222222222', 'ENT', 'MBBS, MS ENT', 8, 'Monday,Wednesday,Friday', '10:00:00', '18:00:00', 20, '13:30:00', '14:30:00', 0);

-- Doctor 3: Harry - Dermatologist (Tue, Thu, 11:00-15:00, 60min slots, break 13:30-14:00)
INSERT INTO Doctors (DoctorID, Specialization, Qualification, YearOfExperience, WorkingDays, StartTime, EndTime, SlotDuration, BreakStartTime, BreakEndTime, IsDeleted)
VALUES 
('33333333-3333-3333-3333-333333333333', 'Dermatology', 'MBBS, MD Dermatology', 12, 'Tuesday,Thursday', '11:00:00', '15:00:00', 60, '13:30:00', '14:00:00', 0);

-- Insert Leave Applications
-- Tom's full day leave on Friday, 26th Dec 2025
INSERT INTO Leaves (LeaveID, UserID, StartDate, EndDate, Reason, Status, LeaveApplied, IsFullDay, IsDeleted)
VALUES 
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 
 '2025-12-26', '2025-12-26', 
 'Personal Work', 1, GETUTCDATE(), 1, 0);

-- Dick's partial leave on Tuesday, 24th Dec 2025 from 14:30 to 16:30
INSERT INTO Leaves (LeaveID, UserID, StartDate, EndDate, Reason, Status, LeaveApplied, IsFullDay, IsDeleted)
VALUES 
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '22222222-2222-2222-2222-222222222222', 
 '2025-12-24 14:30:00', '2025-12-24 16:30:00', 
 'Medical Appointment', 1, GETUTCDATE(), 0, 0);


-- Insert booked time slots for Dr. Harry (11:00-12:00 slot is booked)
INSERT INTO TimeSlots (SlotID, DoctorID, SlotDate, StartTime, EndTime, IsAvailable, CreatedAt, IsDeleted)
VALUES 
('cccccccc-cccc-cccc-cccc-cccccccccccc', '33333333-3333-3333-3333-333333333333', 
 DATEADD(day, 1, CAST(GETDATE() AS DATE)), '11:00:00', '12:00:00', 0, GETUTCDATE(), 0);
