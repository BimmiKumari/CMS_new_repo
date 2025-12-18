-- Add AppointmentDate column to Appointments table
-- Run this if you cannot create/apply EF migrations while dotnet watch is running

-- Check if column exists
IF NOT EXISTS (
    SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_NAME = 'Appointments' 
    AND COLUMN_NAME = 'AppointmentDate'
)
BEGIN
    -- Add the column with a default value
    ALTER TABLE Appointments
    ADD AppointmentDate DATETIME2 NOT NULL DEFAULT GETUTCDATE();
    
    PRINT 'AppointmentDate column added successfully';
END
ELSE
BEGIN
    PRINT 'AppointmentDate column already exists';
END
GO

-- Verify the column was added
SELECT 
    COLUMN_NAME,
    DATA_TYPE,
    IS_NULLABLE,
    COLUMN_DEFAULT
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'Appointments'
ORDER BY ORDINAL_POSITION;
GO
