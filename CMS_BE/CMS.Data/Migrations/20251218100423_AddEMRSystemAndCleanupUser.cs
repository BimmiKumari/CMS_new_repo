using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CMS.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddEMRSystemAndCleanupUser : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "BreakEndTime",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "BreakStartTime",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "EndTime",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "Qualification",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "SlotDuration",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "Specialization",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "StartTime",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "WorkingDaysJson",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "YearOfExperience",
                table: "Users");

            migrationBuilder.AddColumn<Guid>(
                name: "UserID",
                table: "Doctors",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "EMRRecords",
                columns: table => new
                {
                    EMRRecordID = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    PatientID = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    MedicalRecordNumber = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETUTCDATE()"),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETUTCDATE()"),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EMRRecords", x => x.EMRRecordID);
                    table.ForeignKey(
                        name: "FK_EMRRecords_Patients_PatientID",
                        column: x => x.PatientID,
                        principalTable: "Patients",
                        principalColumn: "patient_id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "PatientQueues",
                columns: table => new
                {
                    QueueID = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    AppointmentID = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    PatientID = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    DoctorID = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    QueueZone = table.Column<int>(type: "int", nullable: false),
                    QueuePosition = table.Column<int>(type: "int", nullable: false),
                    QueueStatus = table.Column<int>(type: "int", nullable: false),
                    AppointmentTimeSlot = table.Column<TimeSpan>(type: "time", nullable: false),
                    AppointmentDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CheckedInAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    StartedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CompletedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETUTCDATE()"),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETUTCDATE()"),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PatientQueues", x => x.QueueID);
                    table.ForeignKey(
                        name: "FK_PatientQueues_Appointments_AppointmentID",
                        column: x => x.AppointmentID,
                        principalTable: "Appointments",
                        principalColumn: "AppointmentID",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_PatientQueues_Doctors_DoctorID",
                        column: x => x.DoctorID,
                        principalTable: "Doctors",
                        principalColumn: "DoctorID",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_PatientQueues_Patients_PatientID",
                        column: x => x.PatientID,
                        principalTable: "Patients",
                        principalColumn: "patient_id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "PatientEncounters",
                columns: table => new
                {
                    EncounterID = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    PatientID = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    DoctorID = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    AppointmentID = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    EMRRecordID = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    EncounterType = table.Column<int>(type: "int", nullable: false),
                    ParentEncounterID = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    ChiefComplaint = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    PresentIllnessHistory = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    ClinicalNotes = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: true),
                    PhysicalExamination = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    AssessmentAndPlan = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    EncounterDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETUTCDATE()"),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETUTCDATE()"),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PatientEncounters", x => x.EncounterID);
                    table.ForeignKey(
                        name: "FK_PatientEncounters_Appointments_AppointmentID",
                        column: x => x.AppointmentID,
                        principalTable: "Appointments",
                        principalColumn: "AppointmentID",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_PatientEncounters_Doctors_DoctorID",
                        column: x => x.DoctorID,
                        principalTable: "Doctors",
                        principalColumn: "DoctorID",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_PatientEncounters_EMRRecords_EMRRecordID",
                        column: x => x.EMRRecordID,
                        principalTable: "EMRRecords",
                        principalColumn: "EMRRecordID",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_PatientEncounters_PatientEncounters_ParentEncounterID",
                        column: x => x.ParentEncounterID,
                        principalTable: "PatientEncounters",
                        principalColumn: "EncounterID",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_PatientEncounters_Patients_PatientID",
                        column: x => x.PatientID,
                        principalTable: "Patients",
                        principalColumn: "patient_id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Diagnoses",
                columns: table => new
                {
                    DiagnosisID = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    EncounterID = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    DiagnosisCode = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    DiagnosisName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    Status = table.Column<int>(type: "int", nullable: false),
                    IsPrimary = table.Column<bool>(type: "bit", nullable: false),
                    DiagnosedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    DiagnosedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETUTCDATE()"),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETUTCDATE()"),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Diagnoses", x => x.DiagnosisID);
                    table.ForeignKey(
                        name: "FK_Diagnoses_PatientEncounters_EncounterID",
                        column: x => x.EncounterID,
                        principalTable: "PatientEncounters",
                        principalColumn: "EncounterID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "LabTests",
                columns: table => new
                {
                    LabTestID = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    EncounterID = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TestName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    TestCode = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    TestCategory = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    Status = table.Column<int>(type: "int", nullable: false),
                    Instructions = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    Results = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: true),
                    ResultsFileUrl = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    Interpretation = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    IsAbnormal = table.Column<bool>(type: "bit", nullable: false),
                    OrderedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    PerformedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    OrderedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    SampleCollectedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CompletedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETUTCDATE()"),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETUTCDATE()"),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LabTests", x => x.LabTestID);
                    table.ForeignKey(
                        name: "FK_LabTests_PatientEncounters_EncounterID",
                        column: x => x.EncounterID,
                        principalTable: "PatientEncounters",
                        principalColumn: "EncounterID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "MedicalReports",
                columns: table => new
                {
                    ReportID = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    EncounterID = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    FileUrl = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    ReportType = table.Column<int>(type: "int", nullable: false),
                    Findings = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: false),
                    UploadedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    DateUploaded = table.Column<DateTime>(type: "datetime2", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETUTCDATE()"),
                    EncounterID1 = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MedicalReports", x => x.ReportID);
                    table.ForeignKey(
                        name: "FK_MedicalReports_PatientEncounters_EncounterID",
                        column: x => x.EncounterID,
                        principalTable: "PatientEncounters",
                        principalColumn: "EncounterID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_MedicalReports_PatientEncounters_EncounterID1",
                        column: x => x.EncounterID1,
                        principalTable: "PatientEncounters",
                        principalColumn: "EncounterID");
                });

            migrationBuilder.CreateTable(
                name: "Observations",
                columns: table => new
                {
                    ObservationID = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    EncounterID = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ObservationName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    ReferenceRange = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Value = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    Unit = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    DateRecorded = table.Column<DateTime>(type: "datetime2", nullable: false),
                    StaffID = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETUTCDATE()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Observations", x => x.ObservationID);
                    table.ForeignKey(
                        name: "FK_Observations_PatientEncounters_EncounterID",
                        column: x => x.EncounterID,
                        principalTable: "PatientEncounters",
                        principalColumn: "EncounterID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Prescriptions",
                columns: table => new
                {
                    PrescriptionID = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    EncounterID = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    DoctorID = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    MedicationName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Dosage = table.Column<int>(type: "int", nullable: false),
                    Unit = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Frequency = table.Column<int>(type: "int", nullable: false),
                    Duration = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Notes = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETUTCDATE()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Prescriptions", x => x.PrescriptionID);
                    table.ForeignKey(
                        name: "FK_Prescriptions_PatientEncounters_EncounterID",
                        column: x => x.EncounterID,
                        principalTable: "PatientEncounters",
                        principalColumn: "EncounterID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "TreatmentPlans",
                columns: table => new
                {
                    TreatmentPlanID = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    EncounterID = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    PlanDescription = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: false),
                    Goals = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    Instructions = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    Precautions = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    DietaryAdvice = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    LifestyleModifications = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    FollowUpDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    FollowUpInstructions = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    CreatedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETUTCDATE()"),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETUTCDATE()"),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TreatmentPlans", x => x.TreatmentPlanID);
                    table.ForeignKey(
                        name: "FK_TreatmentPlans_PatientEncounters_EncounterID",
                        column: x => x.EncounterID,
                        principalTable: "PatientEncounters",
                        principalColumn: "EncounterID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "VitalSigns",
                columns: table => new
                {
                    VitalSignsID = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    EncounterID = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Temperature = table.Column<decimal>(type: "decimal(5,2)", precision: 5, scale: 2, nullable: true),
                    TemperatureUnit = table.Column<string>(type: "nvarchar(1)", maxLength: 1, nullable: true),
                    SystolicBP = table.Column<int>(type: "int", nullable: true),
                    DiastolicBP = table.Column<int>(type: "int", nullable: true),
                    HeartRate = table.Column<int>(type: "int", nullable: true),
                    RespiratoryRate = table.Column<int>(type: "int", nullable: true),
                    OxygenSaturation = table.Column<decimal>(type: "decimal(5,2)", precision: 5, scale: 2, nullable: true),
                    Height = table.Column<decimal>(type: "decimal(5,2)", precision: 5, scale: 2, nullable: true),
                    Weight = table.Column<decimal>(type: "decimal(5,2)", precision: 5, scale: 2, nullable: true),
                    BMI = table.Column<decimal>(type: "decimal(5,2)", precision: 5, scale: 2, nullable: true),
                    Notes = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    RecordedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    RecordedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETUTCDATE()"),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_VitalSigns", x => x.VitalSignsID);
                    table.ForeignKey(
                        name: "FK_VitalSigns_PatientEncounters_EncounterID",
                        column: x => x.EncounterID,
                        principalTable: "PatientEncounters",
                        principalColumn: "EncounterID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Doctors_UserID",
                table: "Doctors",
                column: "UserID");

            migrationBuilder.CreateIndex(
                name: "IX_Diagnoses_DiagnosedAt",
                table: "Diagnoses",
                column: "DiagnosedAt");

            migrationBuilder.CreateIndex(
                name: "IX_Diagnoses_DiagnosisCode",
                table: "Diagnoses",
                column: "DiagnosisCode");

            migrationBuilder.CreateIndex(
                name: "IX_Diagnoses_EncounterID",
                table: "Diagnoses",
                column: "EncounterID");

            migrationBuilder.CreateIndex(
                name: "IX_EMRRecords_MedicalRecordNumber",
                table: "EMRRecords",
                column: "MedicalRecordNumber",
                unique: true,
                filter: "[MedicalRecordNumber] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_EMRRecords_PatientID",
                table: "EMRRecords",
                column: "PatientID",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_LabTests_EncounterID",
                table: "LabTests",
                column: "EncounterID");

            migrationBuilder.CreateIndex(
                name: "IX_LabTests_OrderedAt",
                table: "LabTests",
                column: "OrderedAt");

            migrationBuilder.CreateIndex(
                name: "IX_LabTests_Status",
                table: "LabTests",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_MedicalReports_DateUploaded",
                table: "MedicalReports",
                column: "DateUploaded");

            migrationBuilder.CreateIndex(
                name: "IX_MedicalReports_EncounterID",
                table: "MedicalReports",
                column: "EncounterID");

            migrationBuilder.CreateIndex(
                name: "IX_MedicalReports_EncounterID1",
                table: "MedicalReports",
                column: "EncounterID1");

            migrationBuilder.CreateIndex(
                name: "IX_MedicalReports_ReportType",
                table: "MedicalReports",
                column: "ReportType");

            migrationBuilder.CreateIndex(
                name: "IX_Observations_DateRecorded",
                table: "Observations",
                column: "DateRecorded");

            migrationBuilder.CreateIndex(
                name: "IX_Observations_EncounterID",
                table: "Observations",
                column: "EncounterID");

            migrationBuilder.CreateIndex(
                name: "IX_PatientEncounters_AppointmentID",
                table: "PatientEncounters",
                column: "AppointmentID");

            migrationBuilder.CreateIndex(
                name: "IX_PatientEncounters_DoctorID",
                table: "PatientEncounters",
                column: "DoctorID");

            migrationBuilder.CreateIndex(
                name: "IX_PatientEncounters_EMRRecordID",
                table: "PatientEncounters",
                column: "EMRRecordID");

            migrationBuilder.CreateIndex(
                name: "IX_PatientEncounters_EncounterDate",
                table: "PatientEncounters",
                column: "EncounterDate");

            migrationBuilder.CreateIndex(
                name: "IX_PatientEncounters_ParentEncounterID",
                table: "PatientEncounters",
                column: "ParentEncounterID");

            migrationBuilder.CreateIndex(
                name: "IX_PatientEncounters_PatientID",
                table: "PatientEncounters",
                column: "PatientID");

            migrationBuilder.CreateIndex(
                name: "IX_PatientQueues_AppointmentID",
                table: "PatientQueues",
                column: "AppointmentID");

            migrationBuilder.CreateIndex(
                name: "IX_PatientQueues_DoctorID",
                table: "PatientQueues",
                column: "DoctorID");

            migrationBuilder.CreateIndex(
                name: "IX_PatientQueues_DoctorID_AppointmentDate_QueueZone",
                table: "PatientQueues",
                columns: new[] { "DoctorID", "AppointmentDate", "QueueZone" });

            migrationBuilder.CreateIndex(
                name: "IX_PatientQueues_PatientID",
                table: "PatientQueues",
                column: "PatientID");

            migrationBuilder.CreateIndex(
                name: "IX_PatientQueues_QueueStatus",
                table: "PatientQueues",
                column: "QueueStatus");

            migrationBuilder.CreateIndex(
                name: "IX_Prescriptions_DoctorID",
                table: "Prescriptions",
                column: "DoctorID");

            migrationBuilder.CreateIndex(
                name: "IX_Prescriptions_EncounterID",
                table: "Prescriptions",
                column: "EncounterID");

            migrationBuilder.CreateIndex(
                name: "IX_TreatmentPlans_EncounterID",
                table: "TreatmentPlans",
                column: "EncounterID");

            migrationBuilder.CreateIndex(
                name: "IX_TreatmentPlans_FollowUpDate",
                table: "TreatmentPlans",
                column: "FollowUpDate");

            migrationBuilder.CreateIndex(
                name: "IX_VitalSigns_EncounterID",
                table: "VitalSigns",
                column: "EncounterID");

            migrationBuilder.CreateIndex(
                name: "IX_VitalSigns_RecordedAt",
                table: "VitalSigns",
                column: "RecordedAt");

            migrationBuilder.AddForeignKey(
                name: "FK_Doctors_Users_UserID",
                table: "Doctors",
                column: "UserID",
                principalTable: "Users",
                principalColumn: "UserID");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Doctors_Users_UserID",
                table: "Doctors");

            migrationBuilder.DropTable(
                name: "Diagnoses");

            migrationBuilder.DropTable(
                name: "LabTests");

            migrationBuilder.DropTable(
                name: "MedicalReports");

            migrationBuilder.DropTable(
                name: "Observations");

            migrationBuilder.DropTable(
                name: "PatientQueues");

            migrationBuilder.DropTable(
                name: "Prescriptions");

            migrationBuilder.DropTable(
                name: "TreatmentPlans");

            migrationBuilder.DropTable(
                name: "VitalSigns");

            migrationBuilder.DropTable(
                name: "PatientEncounters");

            migrationBuilder.DropTable(
                name: "EMRRecords");

            migrationBuilder.DropIndex(
                name: "IX_Doctors_UserID",
                table: "Doctors");

            migrationBuilder.DropColumn(
                name: "UserID",
                table: "Doctors");

            migrationBuilder.AddColumn<TimeSpan>(
                name: "BreakEndTime",
                table: "Users",
                type: "time",
                nullable: true);

            migrationBuilder.AddColumn<TimeSpan>(
                name: "BreakStartTime",
                table: "Users",
                type: "time",
                nullable: true);

            migrationBuilder.AddColumn<TimeSpan>(
                name: "EndTime",
                table: "Users",
                type: "time",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Qualification",
                table: "Users",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "SlotDuration",
                table: "Users",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Specialization",
                table: "Users",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<TimeSpan>(
                name: "StartTime",
                table: "Users",
                type: "time",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "WorkingDaysJson",
                table: "Users",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "YearOfExperience",
                table: "Users",
                type: "int",
                nullable: true);
        }
    }
}
