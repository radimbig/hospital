using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace kamsoft.Migrations
{
    /// <inheritdoc />
    public partial class fixedcredentialtableerror : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Credentials_Persons_PersonId",
                table: "Credentials");

            migrationBuilder.AlterColumn<Guid>(
                name: "PersonId",
                table: "Credentials",
                type: "char(36)",
                nullable: true,
                oldClrType: typeof(Guid),
                oldType: "char(36)");

            migrationBuilder.AddForeignKey(
                name: "FK_Credentials_Persons_PersonId",
                table: "Credentials",
                column: "PersonId",
                principalTable: "Persons",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Credentials_Persons_PersonId",
                table: "Credentials");

            migrationBuilder.AlterColumn<Guid>(
                name: "PersonId",
                table: "Credentials",
                type: "char(36)",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"),
                oldClrType: typeof(Guid),
                oldType: "char(36)",
                oldNullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_Credentials_Persons_PersonId",
                table: "Credentials",
                column: "PersonId",
                principalTable: "Persons",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
