using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace kamsoft.Migrations
{
    /// <inheritdoc />
    public partial class AddUniqueIndexToPesel : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "WithPeselAndRole_Pesel",
                table: "Persons",
                type: "varchar(11)",
                maxLength: 11,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "longtext",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Pesel",
                table: "Persons",
                type: "varchar(11)",
                maxLength: 11,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "longtext",
                oldNullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Persons_Pesel",
                table: "Persons",
                column: "Pesel",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Persons_WithPeselAndRole_Pesel",
                table: "Persons",
                column: "WithPeselAndRole_Pesel",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Persons_Pesel",
                table: "Persons");

            migrationBuilder.DropIndex(
                name: "IX_Persons_WithPeselAndRole_Pesel",
                table: "Persons");

            migrationBuilder.AlterColumn<string>(
                name: "WithPeselAndRole_Pesel",
                table: "Persons",
                type: "longtext",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "varchar(11)",
                oldMaxLength: 11,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Pesel",
                table: "Persons",
                type: "longtext",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "varchar(11)",
                oldMaxLength: 11,
                oldNullable: true);
        }
    }
}
