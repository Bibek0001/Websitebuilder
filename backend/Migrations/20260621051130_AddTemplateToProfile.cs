using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PersonalWebsiteAPI.Migrations
{
    /// <inheritdoc />
    public partial class AddTemplateToProfile : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "SelectedTemplate",
                table: "Profiles",
                type: "nvarchar(max)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "SelectedTemplate",
                table: "Profiles");
        }
    }
}
