using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CMS.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddUserIdToEntitiesV2 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_EMRRecords_PatientID",
                table: "EMRRecords");

            migrationBuilder.AddColumn<Guid>(
                name: "user_id",
                table: "Patients",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "user_id",
                table: "PatientQueues",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AlterColumn<Guid>(
                name: "PatientID",
                table: "EMRRecords",
                type: "uniqueidentifier",
                nullable: true,
                oldClrType: typeof(Guid),
                oldType: "uniqueidentifier");

            migrationBuilder.AddColumn<Guid>(
                name: "user_id",
                table: "EMRRecords",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "user_id",
                table: "Appointments",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Patients_user_id",
                table: "Patients",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "IX_PatientQueues_user_id",
                table: "PatientQueues",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "IX_EMRRecords_PatientID",
                table: "EMRRecords",
                column: "PatientID",
                unique: true,
                filter: "[PatientID] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_EMRRecords_user_id",
                table: "EMRRecords",
                column: "user_id",
                unique: true,
                filter: "[user_id] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_Appointments_user_id",
                table: "Appointments",
                column: "user_id");

            migrationBuilder.AddForeignKey(
                name: "FK_Appointments_Users_user_id",
                table: "Appointments",
                column: "user_id",
                principalTable: "Users",
                principalColumn: "UserID");

            migrationBuilder.AddForeignKey(
                name: "FK_EMRRecords_Users_user_id",
                table: "EMRRecords",
                column: "user_id",
                principalTable: "Users",
                principalColumn: "UserID",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_PatientQueues_Users_user_id",
                table: "PatientQueues",
                column: "user_id",
                principalTable: "Users",
                principalColumn: "UserID",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Patients_Users_user_id",
                table: "Patients",
                column: "user_id",
                principalTable: "Users",
                principalColumn: "UserID",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Appointments_Users_user_id",
                table: "Appointments");

            migrationBuilder.DropForeignKey(
                name: "FK_EMRRecords_Users_user_id",
                table: "EMRRecords");

            migrationBuilder.DropForeignKey(
                name: "FK_PatientQueues_Users_user_id",
                table: "PatientQueues");

            migrationBuilder.DropForeignKey(
                name: "FK_Patients_Users_user_id",
                table: "Patients");

            migrationBuilder.DropIndex(
                name: "IX_Patients_user_id",
                table: "Patients");

            migrationBuilder.DropIndex(
                name: "IX_PatientQueues_user_id",
                table: "PatientQueues");

            migrationBuilder.DropIndex(
                name: "IX_EMRRecords_PatientID",
                table: "EMRRecords");

            migrationBuilder.DropIndex(
                name: "IX_EMRRecords_user_id",
                table: "EMRRecords");

            migrationBuilder.DropIndex(
                name: "IX_Appointments_user_id",
                table: "Appointments");

            migrationBuilder.DropColumn(
                name: "user_id",
                table: "Patients");

            migrationBuilder.DropColumn(
                name: "user_id",
                table: "PatientQueues");

            migrationBuilder.DropColumn(
                name: "user_id",
                table: "EMRRecords");

            migrationBuilder.DropColumn(
                name: "user_id",
                table: "Appointments");

            migrationBuilder.AlterColumn<Guid>(
                name: "PatientID",
                table: "EMRRecords",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"),
                oldClrType: typeof(Guid),
                oldType: "uniqueidentifier",
                oldNullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_EMRRecords_PatientID",
                table: "EMRRecords",
                column: "PatientID",
                unique: true);
        }
    }
}
