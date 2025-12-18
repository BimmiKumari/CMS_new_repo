using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CMS.Data.Migrations
{
    /// <inheritdoc />
    public partial class RemoveSlotIDFromAppointments : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Appointments_TimeSlots_SlotID",
                table: "Appointments");

            migrationBuilder.DropForeignKey(
                name: "FK_Doctors_Users_UserID",
                table: "Doctors");

            migrationBuilder.DropForeignKey(
                name: "FK_MedicalReports_PatientEncounters_EncounterID1",
                table: "MedicalReports");

            migrationBuilder.DropIndex(
                name: "IX_MedicalReports_EncounterID1",
                table: "MedicalReports");

            migrationBuilder.DropIndex(
                name: "IX_Doctors_UserID",
                table: "Doctors");

            migrationBuilder.DropIndex(
                name: "IX_Appointments_SlotID",
                table: "Appointments");

            migrationBuilder.DropColumn(
                name: "EncounterID1",
                table: "MedicalReports");

            migrationBuilder.DropColumn(
                name: "UserID",
                table: "Doctors");

            migrationBuilder.DropColumn(
                name: "SlotID",
                table: "Appointments");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "EncounterID1",
                table: "MedicalReports",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "UserID",
                table: "Doctors",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "SlotID",
                table: "Appointments",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.CreateIndex(
                name: "IX_MedicalReports_EncounterID1",
                table: "MedicalReports",
                column: "EncounterID1");

            migrationBuilder.CreateIndex(
                name: "IX_Doctors_UserID",
                table: "Doctors",
                column: "UserID");

            migrationBuilder.CreateIndex(
                name: "IX_Appointments_SlotID",
                table: "Appointments",
                column: "SlotID");

            migrationBuilder.AddForeignKey(
                name: "FK_Appointments_TimeSlots_SlotID",
                table: "Appointments",
                column: "SlotID",
                principalTable: "TimeSlots",
                principalColumn: "SlotID");

            migrationBuilder.AddForeignKey(
                name: "FK_Doctors_Users_UserID",
                table: "Doctors",
                column: "UserID",
                principalTable: "Users",
                principalColumn: "UserID");

            migrationBuilder.AddForeignKey(
                name: "FK_MedicalReports_PatientEncounters_EncounterID1",
                table: "MedicalReports",
                column: "EncounterID1",
                principalTable: "PatientEncounters",
                principalColumn: "EncounterID");
        }
    }
}
