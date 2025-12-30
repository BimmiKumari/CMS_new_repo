export enum QueueStatusType {
    Waiting = 0,
    InProgress = 1,
    Completed = 2,
    Cancelled = 3,
    Delayed = 4
}

export enum EncounterType {
    InitialConsultation = 0,
    FollowUp = 1,
    Emergency = 2,
    RoutineCheckup = 3
}

export interface QueuePatient {
    queueID: string;
    appointmentID: string;
    patientID: string;
    patientName: string;
    age: number;
    sex: string;
    bloodGroup: string;
    allergies?: string;
    chiefComplaint?: string;
    queueZone: number;
    queuePosition: number;
    queueStatus: QueueStatusType;
    appointmentTimeSlot: string;
    appointmentDate: string;
    checkedInAt?: string;
    isFollowUp: boolean;
    previousEncounterID?: string;
    user_id?: string;
    profileImagePath?: string;
    phoneNumber?: string;
    hasPrescription?: boolean;
}

export interface DoctorQueueResponse {
    regularPatients: QueuePatient[];
    followUpPatients: QueuePatient[];
    emergencyCases: QueuePatient[];
    totalWaiting: number;
    totalInProgress: number;
    totalCompleted: number;
}

export interface UpdateQueueStatusDto {
    queueID: string;
    newStatus: QueueStatusType;
}

export interface VitalSigns {
    vitalSignsID: string;
    encounterID: string;
    temperature?: number;
    bloodPressureSys?: number;
    bloodPressureDia?: number;
    pulseRate?: number;
    respiratoryRate?: number;
    oxygenSaturation?: number;
    weight?: number;
    height?: number;
    bmi?: number;
    recordedAt: string;
}

export interface Diagnosis {
    diagnosisID: string;
    encounterID: string;
    diagnosisName: string;
    description: string;
    diagnosisCode?: string;
    status: string;
    isPrimary: boolean;
}

export interface PrescriptionItem {
    prescriptionID: string;
    medicineName: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions?: string;
}

export interface Prescription {
    prescriptionID: string;
    medicationName: string;
    dosage: string;
    unit: string;
    frequency: string;
    duration: string;
    notes: string;
    createdAt: string;
}

export interface LabTest {
    labTestID: string;
    encounterID: string;
    testName: string;
    testCode?: string;
    orderedAt: string;
    status: string;
    result?: string;
    resultAt?: string;
}

export interface Observation {
    observationID: string;
    encounterID: string;
    observationType: string;
    value: string;
    notes?: string;
    observedAt: string;
}

export interface TreatmentPlan {
    treatmentPlanID: string;
    encounterID: string;
    planDescription: string;
    goals?: string;
    instructions?: string;
    dietaryAdvice?: string;
    followUpDate?: string;
    status: string;
}

export interface MedicalReport {
    medicalReportID: string;
    encounterID: string;
    reportName: string;
    reportType: string;
    reportPath: string;
    uploadedAt: string;
}

export interface EncounterDetail {
    encounterID: string;
    patientID: string;
    patientName: string;
    doctorID: string;
    doctorName: string;
    appointmentID: string;
    encounterType: EncounterType;
    chiefComplaint?: string;
    presentIllnessHistory?: string;
    clinicalNotes?: string;
    physicalExamination?: string;
    assessmentAndPlan?: string;
    encounterDate: string;
    vitalSigns: VitalSigns[];
    diagnoses: Diagnosis[];
    prescriptions: Prescription[];
    labTests: LabTest[];
    observations: Observation[];
    treatmentPlans: TreatmentPlan[];
    medicalReports: MedicalReport[];
}

export interface UpdateEncounterDto {
    encounterID: string;
    chiefComplaint?: string;
    presentIllnessHistory?: string;
    clinicalNotes?: string;
    physicalExamination?: string;
    assessmentAndPlan?: string;
}

export interface CreateVitalSignsDto {
    encounterID: string;
    temperature?: number;
    bloodPressureSys?: number;
    bloodPressureDia?: number;
    pulseRate?: number;
    respiratoryRate?: number;
    oxygenSaturation?: number;
    weight?: number;
    height?: number;
}

export interface CreatePrescriptionDto {
    encounterID: string;
    patientID: string;
    doctorID: string;
    notes?: string;
    medicines: {
        medicineName: string;
        dosage: string;
        frequency: string;
        duration: string;
        instructions?: string;
    }[];
}

export interface CreateLabTestDto {
    encounterID: string;
    testName: string;
    testCode?: string;
    testCategory?: string;
    instructions?: string;
    orderedBy: string;
}

export interface CreateDiagnosisDto {
    encounterID: string;
    diagnosisCode: string;
    diagnosisName: string;
    description?: string;
    status: string;
    isPrimary: boolean;
    diagnosedBy: string;
}

export interface CreateTreatmentPlanDto {
    encounterID: string;
    planDescription: string;
    goals?: string;
    instructions?: string;
    precautions?: string;
    dietaryAdvice?: string;
    lifestyleModifications?: string;
    followUpDate?: string;
    followUpInstructions?: string;
    createdBy: string;
}

export interface CreateObservationDto {
    encounterID: string;
    observationName: string;
    value: string;
    unit?: string;
    referenceRange?: string;
    staffID: string;
}
