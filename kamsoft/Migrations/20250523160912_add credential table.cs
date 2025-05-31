using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace kamsoft.Migrations
{
    /// <inheritdoc />
    public partial class addcredentialtable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterDatabase()
                .Annotation("MySQL:Charset", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "Persons",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "char(36)", nullable: false),
                    PersonType = table.Column<string>(type: "varchar(21)", maxLength: 21, nullable: false),
                    Name = table.Column<string>(type: "longtext", nullable: true),
                    Surname = table.Column<string>(type: "longtext", nullable: true),
                    WithPesel_Name = table.Column<string>(type: "longtext", nullable: true),
                    WithPesel_Surname = table.Column<string>(type: "longtext", nullable: true),
                    Pesel = table.Column<string>(type: "longtext", nullable: true),
                    WithPeselAndRole_Name = table.Column<string>(type: "longtext", nullable: true),
                    WithPeselAndRole_Surname = table.Column<string>(type: "longtext", nullable: true),
                    WithPeselAndRole_Pesel = table.Column<string>(type: "longtext", nullable: true),
                    Role = table.Column<int>(type: "int", nullable: true, defaultValue: 1),
                    WithRole_Name = table.Column<string>(type: "longtext", nullable: true),
                    WithRole_Surname = table.Column<string>(type: "longtext", nullable: true),
                    WithRole_Role = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Persons", x => x.Id);
                })
                .Annotation("MySQL:Charset", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "Appointments",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "char(36)", nullable: false),
                    Slot_Start = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    Slot_End = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    PatientId = table.Column<Guid>(type: "char(36)", nullable: true),
                    DoctorId = table.Column<Guid>(type: "char(36)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Appointments", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Appointments_Persons_DoctorId",
                        column: x => x.DoctorId,
                        principalTable: "Persons",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Appointments_Persons_PatientId",
                        column: x => x.PatientId,
                        principalTable: "Persons",
                        principalColumn: "Id");
                })
                .Annotation("MySQL:Charset", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "Credentials",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "char(36)", nullable: false),
                    Login = table.Column<string>(type: "varchar(255)", nullable: false),
                    PasswordHash = table.Column<string>(type: "longtext", nullable: false),
                    PersonId = table.Column<Guid>(type: "char(36)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Credentials", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Credentials_Persons_PersonId",
                        column: x => x.PersonId,
                        principalTable: "Persons",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySQL:Charset", "utf8mb4");

            migrationBuilder.CreateIndex(
                name: "IX_Appointments_DoctorId",
                table: "Appointments",
                column: "DoctorId");

            migrationBuilder.CreateIndex(
                name: "IX_Appointments_PatientId",
                table: "Appointments",
                column: "PatientId");

            migrationBuilder.CreateIndex(
                name: "IX_Credentials_Login",
                table: "Credentials",
                column: "Login",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Credentials_PersonId",
                table: "Credentials",
                column: "PersonId",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Appointments");

            migrationBuilder.DropTable(
                name: "Credentials");

            migrationBuilder.DropTable(
                name: "Persons");
        }
    }
}
