using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PersonalWebsiteAPI.Migrations
{
    /// <inheritdoc />
    public partial class AddSkillsSectionHeading : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "SkillsBadge",
                table: "Profiles",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "SkillsSubtitle",
                table: "Profiles",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "SkillsTitle",
                table: "Profiles",
                type: "nvarchar(max)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "SkillsBadge",
                table: "Profiles");

            migrationBuilder.DropColumn(
                name: "SkillsSubtitle",
                table: "Profiles");

            migrationBuilder.DropColumn(
                name: "SkillsTitle",
                table: "Profiles");
        }
    }
}
