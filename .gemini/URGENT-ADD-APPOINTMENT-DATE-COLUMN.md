# URGENT: Database Migration Required

## The Problem
Appointments are not being saved because the `AppointmentDate` column is missing from the `Appointments` table in the database.

## The Solution
Run this SQL command in your database:

```sql
-- Add AppointmentDate column to Appointments table
ALTER TABLE Appointments
ADD AppointmentDate DATETIME2 NOT NULL DEFAULT GETUTCDATE();
```

## How to Run It

### Option 1: Using SQL Server Management Studio (SSMS)
1. Open SQL Server Management Studio
2. Connect to your database server
3. Select the `CMS_DB_Intigration` database
4. Click "New Query"
5. Paste the SQL command above
6. Click "Execute" (or press F5)

### Option 2: Using Azure Data Studio
1. Open Azure Data Studio
2. Connect to your database server
3. Select the `CMS_DB_Intigration` database
4. Click "New Query"
5. Paste the SQL command above
6. Click "Run" (or press F5)

### Option 3: Using Command Line (sqlcmd)
```bash
sqlcmd -S localhost -d CMS_DB_Intigration -Q "ALTER TABLE Appointments ADD AppointmentDate DATETIME2 NOT NULL DEFAULT GETUTCDATE();" -E
```

## After Running the SQL

1. The `dotnet watch run` process should automatically detect the change and recompile
2. Test the payment flow again
3. You should see appointments being created successfully

## What to Look For

After running the SQL and testing:

### Backend Console Logs:
```
✅ Appointment date parsed: 2025-12-21
✅ CreateAppointmentDto created - DoctorID: ..., Date: 2025-12-21, StartTime: 10:00:00
📝 Calling AppointmentService.CreateAppointmentAsync...
✅ Appointment created successfully: <guid>
✅ Appointment status updated to Scheduled
✅ Queue entry created: <guid>
✅ Encounter created: <guid>
✅ Transaction committed successfully
```

### Database Check:
```sql
-- Verify the column was added
SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'Appointments' 
ORDER BY ORDINAL_POSITION;

-- Check if appointments are being created
SELECT TOP 5 
    AppointmentID,
    PatientID,
    DoctorID,
    AppointmentDate,
    StartTime,
    EndTime,
    Status,
    CreatedAt
FROM Appointments
ORDER BY CreatedAt DESC;
```

## Why This Happened

The code was updated to include `AppointmentDate` in the Appointment entity, but the database migration couldn't be run because:
1. The `dotnet watch run` process has the files locked
2. EF migrations require a build, which can't happen while the app is running

## Alternative: Stop and Run Migration

If you prefer to use EF migrations instead of running SQL directly:

1. Stop the `dotnet watch run` process (Ctrl+C)
2. Run:
   ```bash
   cd c:\Users\simmy\Desktop\CMS\CMS_BE
   dotnet ef migrations add AddAppointmentDateToAppointments --project CMS.Data --startup-project CMS.Api
   dotnet ef database update --project CMS.Data --startup-project CMS.Api
   ```
3. Restart:
   ```bash
   cd CMS.Api
   dotnet watch run
   ```

---

**TLDR: Run this SQL command in your database:**
```sql
ALTER TABLE Appointments ADD AppointmentDate DATETIME2 NOT NULL DEFAULT GETUTCDATE();
```

Then test the payment flow again! 🚀
