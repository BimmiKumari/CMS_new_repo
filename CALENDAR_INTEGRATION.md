# Calendar Component Integration with Authentication System

## Overview
This document outlines the integration of the calendar component with the current authentication system, using the User table with role-based filtering instead of a separate Doctor table.

## Backend Changes

### 1. User Entity Updates (`CMS.Domain/Auth/Entities/User.cs`)
- **Resolved merge conflicts** and unified the User entity
- **Added doctor-specific properties** to the User table:
  - `Specialization` (string, nullable)
  - `Qualification` (string, nullable)
  - `YearOfExperience` (int, nullable)
  - `WorkingDaysJson` (string, nullable) - Stores working days as JSON
  - `StartTime` (TimeSpan, nullable)
  - `EndTime` (TimeSpan, nullable)
  - `SlotDuration` (int, nullable)
  - `BreakStartTime` (TimeSpan, nullable)
  - `BreakEndTime` (TimeSpan, nullable)
- **Role enum** uses `UserRole` with values: Admin=1, Doctor=2, Staff=3, Patient=4

### 2. Database Context Updates (`CMS.Data/CmsDbContext.cs`)
- **Removed duplicate DbSet declarations**
- **Removed `DbSet<Doctor>` Doctors** - No longer using separate Doctor table
- **Removed `DoctorConfiguration`** from model building
- **Organized DbSets** by feature area (Auth, Clinic, EMR, Billing, Appointments, Notifications)

### 3. DoctorService Updates (`CMS.Application/Clinic/Services/DoctorService.cs`)
- **Changed to query Users table** with `Role == UserRole.Doctor` filter
- **Removed dependency** on `IDoctorRepository`
- **Direct DbContext access** for querying doctor users
- **Filters**: Active users only (`IsActive && !IsDeleted`)

### 4. DoctorDto Updates (`CMS.Application/Clinic/DTOs/Responses/DoctorDto.cs`)
- **Extended with all necessary fields**:
  - Contact info (Email, PhoneNumber)
  - Schedule info (StartTime, EndTime, SlotDuration)
  - Break times (BreakStartTime, BreakEndTime)
  - Profile info (ProfilePictureURL, Qualification)

## Frontend Changes

### 1. Calendar Service (`calendar.service.ts`)
**New service created** with the following capabilities:
- `getAllDoctors()` - Get all active doctors
- `getAvailableSlots(doctorId, date)` - Get available time slots
- `bookAppointment(appointment)` - Book an appointment
- `getDoctorAppointments(doctorId, startDate, endDate)` - Get doctor's appointments
- `getMyAppointments(startDate, endDate)` - Get current user's appointments
- `cancelAppointment(appointmentId, reason)` - Cancel an appointment
- `rescheduleAppointment(appointmentId, newDate, newStartTime)` - Reschedule

**Integrated with existing auth system**:
- Uses `ApiService` from core services
- Returns `ApiResponse<T>` format matching auth endpoints
- Automatically includes auth tokens via ApiService

### 2. Doctor Calendar Component (`doctor-calendar.component.ts`)
**Features**:
- **Role-based views**:
  - **Patients**: Select doctor, view slots, book appointments
  - **Doctors**: View their own appointments, manage schedule
- **Auto-detection** of current user role
- **Auto-selection** of doctor if current user is a doctor
- **Date filtering** (weekends disabled by default)
- **Real-time loading states**
- **Error handling** with user-friendly messages

### 3. Auth Models Updates (`auth.models.ts`)
- **Updated RoleType enum** to match backend:
  - Admin = 1
  - Doctor = 2
  - Staff = 3
  - Patient = 4
  - User = 4 (alias for backward compatibility)

## Database Migration Required

### Migration Script
You need to run a migration to add the new columns to the Users table:

```sql
-- Add doctor-specific columns to Users table
ALTER TABLE Users ADD Specialization NVARCHAR(100) NULL;
ALTER TABLE Users ADD Qualification NVARCHAR(200) NULL;
ALTER TABLE Users ADD YearOfExperience INT NULL;
ALTER TABLE Users ADD WorkingDaysJson NVARCHAR(MAX) NULL;
ALTER TABLE Users ADD StartTime TIME NULL;
ALTER TABLE Users ADD EndTime TIME NULL;
ALTER TABLE Users ADD SlotDuration INT NULL;
ALTER TABLE Users ADD BreakStartTime TIME NULL;
ALTER TABLE Users ADD BreakEndTime TIME NULL;

-- Optional: Migrate existing Doctor data to Users table
-- INSERT INTO Users (UserID, Name, Email, PhoneNumber, Role, Specialization, Qualification, YearOfExperience, ...)
-- SELECT DoctorID, Name, Email, PhoneNumber, 2 as Role, Specialization, Qualification, YearOfExperience, ...
-- FROM Doctors;

-- After migration, you can drop the Doctors table
-- DROP TABLE Doctors;
```

### Entity Framework Migration
Alternatively, use EF Core migrations:

```bash
cd CMS_BE/CMS.Data
dotnet ef migrations add AddDoctorPropertiesToUser
dotnet ef database update
```

## Usage Examples

### Patient Booking an Appointment
```typescript
// Component automatically loads doctors
// User selects doctor from dropdown
// User selects date from calendar
// Available slots are loaded
// User clicks on a slot to book
```

### Doctor Viewing Appointments
```typescript
// Component detects user is a doctor
// Automatically loads their appointments
// Shows calendar with booked slots
// Can cancel appointments
```

## API Endpoints Expected

The calendar service expects these endpoints to exist:

- `GET /api/doctors` - Get all active doctors
- `GET /api/timeslots/doctor/{doctorId}?date={date}` - Get available slots
- `POST /api/appointments` - Create appointment
- `GET /api/appointments/doctor/{doctorId}?startDate={}&endDate={}` - Get doctor appointments
- `GET /api/appointments/my?startDate={}&endDate={}` - Get user's appointments
- `PUT /api/appointments/{id}/cancel` - Cancel appointment
- `PUT /api/appointments/{id}/reschedule` - Reschedule appointment

## Next Steps

1. **Run database migration** to add doctor properties to Users table
2. **Update existing doctor records** to use the User table
3. **Implement appointment endpoints** in the backend API
4. **Implement time slot generation** logic
5. **Add calendar component to routing** in `app.routes.ts`
6. **Test the integration** with different user roles
7. **Add authorization guards** to protect routes based on roles

## Benefits of This Approach

✅ **Single source of truth** - All users in one table
✅ **Simplified authentication** - No need to join Doctor and User tables
✅ **Role-based access control** - Easy to implement with existing auth
✅ **Flexible** - Easy to add properties for other roles (Staff, Admin)
✅ **Maintainable** - Less complex data model
✅ **Scalable** - Can easily extend with more user types

## Files Modified/Created

### Backend
- ✏️ `CMS.Domain/Auth/Entities/User.cs` - Added doctor properties
- ✏️ `CMS.Data/CmsDbContext.cs` - Removed Doctor table, cleaned up
- ✏️ `CMS.Application/Clinic/Services/DoctorService.cs` - Use User table
- ✏️ `CMS.Application/Clinic/DTOs/Responses/DoctorDto.cs` - Extended fields

### Frontend
- ✏️ `shared/models/auth.models.ts` - Updated RoleType enum
- ➕ `features/calendar/services/calendar.service.ts` - New service
- ➕ `features/calendar/components/doctor-calendar/doctor-calendar.component.ts` - New component
- ➕ `features/calendar/components/doctor-calendar/doctor-calendar.component.html` - New template
- ➕ `features/calendar/components/doctor-calendar/doctor-calendar.component.css` - New styles

## Testing Checklist

- [ ] Database migration runs successfully
- [ ] Existing users can log in
- [ ] Doctor users have their properties populated
- [ ] Patients can view list of doctors
- [ ] Patients can select a doctor and view available slots
- [ ] Patients can book an appointment
- [ ] Doctors can view their appointments
- [ ] Doctors can cancel appointments
- [ ] Role-based access works correctly
- [ ] Error handling displays proper messages
- [ ] Loading states work correctly
