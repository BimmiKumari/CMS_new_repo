---
description: EMR System and Patient Queue Implementation Plan
---

# EMR System and Patient Queue Implementation Plan

## Overview
Implement Electronic Medical Record (EMR) system with patient queues based on appointment time slots. The system will:
- Create separate queues for regular and follow-up patients
- Auto-create EMR encounters when appointments are booked and paid
- Allow patients to view their EMR
- Allow doctors and staff to edit EMR records
- Fetch existing EMR data for follow-up patients

## Phase 1: Domain Layer - Entities and Enums

### 1.1 Update Existing Entities
- ✅ PatientQueue - Already exists, needs minor updates
- ✅ PatientEncounter - Already exists, needs updates for EMR
- ✅ Observation - Already exists
- ✅ MedicalReport - Already exists
- ✅ Prescription - Already exists

### 1.2 Create New Entities
- **EMRRecord** - Main EMR container linking all medical data
- **VitalSigns** - Store patient vitals (BP, temperature, pulse, etc.)
- **Diagnosis** - Store diagnosis information
- **LabTest** - Store lab test orders and results
- **TreatmentPlan** - Store treatment plans

### 1.3 Update Enums
- Add EMR-specific enums (EncounterType, DiagnosisStatus, etc.)

## Phase 2: Data Layer - Configurations and DbContext

### 2.1 Create EF Core Configurations
- PatientQueueConfiguration
- PatientEncounterConfiguration
- ObservationConfiguration
- MedicalReportConfiguration
- PrescriptionConfiguration
- EMRRecordConfiguration
- VitalSignsConfiguration
- DiagnosisConfiguration
- LabTestConfiguration
- TreatmentPlanConfiguration

### 2.2 Update CmsDbContext
- Add DbSets for all EMR entities
- Apply configurations in OnModelCreating

## Phase 3: Application Layer - DTOs, Interfaces, and Services

### 3.1 Create DTOs
- EMR DTOs (Request/Response)
- Queue DTOs
- Encounter DTOs
- Observation DTOs
- Prescription DTOs
- Medical Report DTOs

### 3.2 Create Interfaces
- IEMRRepository
- IEMRService
- IPatientQueueRepository
- IPatientQueueService
- IEncounterRepository
- IEncounterService

### 3.3 Create Services
- EMRService - Core EMR operations
- PatientQueueService - Queue management
- EncounterService - Encounter management

## Phase 4: Infrastructure Layer - Repositories

### 4.1 Create Repositories
- EMRRepository
- PatientQueueRepository
- EncounterRepository
- ObservationRepository
- PrescriptionRepository
- MedicalReportRepository

## Phase 5: API Layer - Controllers

### 5.1 Create Controllers
- EMRController - EMR CRUD operations
- PatientQueueController - Queue management
- EncounterController - Encounter operations

### 5.2 Implement Authorization
- Patient: View-only access to their own EMR
- Doctor: Full access to EMR for their patients
- Staff: Full access to EMR

## Phase 6: Integration Points

### 6.1 Update Appointment Booking Flow
- After successful payment, auto-create:
  - PatientQueue entry
  - PatientEncounter entry
  - EMRRecord (if new patient) or link to existing EMR (if follow-up)

### 6.2 Queue Management
- Fetch queues by doctor ID
- Separate regular and follow-up queues
- Sort by appointment time slot
- Update queue status (Waiting, InProgress, Completed, etc.)

## Phase 7: Database Migration

### 7.1 Create Migration
- Generate EF Core migration for all new entities
- Review and apply migration

## Implementation Order

1. Domain entities and enums
2. Data configurations and DbContext updates
3. Infrastructure repositories
4. Application DTOs and interfaces
5. Application services
6. API controllers
7. Integration with appointment booking
8. Database migration
9. Testing

## Key Features

### Queue System
- Automatic queue creation on appointment booking
- Time-slot based ordering
- Separate queues for regular vs follow-up patients
- Real-time queue status updates

### EMR System
- Comprehensive medical record storage
- Encounter-based organization
- Support for observations, prescriptions, reports
- Historical data tracking for follow-up patients
- Role-based access control

### Follow-up Patient Handling
- Detect follow-up patients via `seeking_followup` field
- Fetch existing EMR data
- Link new encounter to previous encounters
- Display medical history in queue view
