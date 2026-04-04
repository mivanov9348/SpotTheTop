using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace SpotTheTop.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddedMatchesAndScouts : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Players_Teams_TeamId",
                table: "Players");

            migrationBuilder.DropColumn(
                name: "Position",
                table: "Players");

            migrationBuilder.RenameColumn(
                name: "ScoutId",
                table: "ScoutingReports",
                newName: "ScoutUserId");

            migrationBuilder.AddColumn<string>(
                name: "ManagerUserId",
                table: "Teams",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<int>(
                name: "MatchId",
                table: "ScoutingReports",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "PositionId",
                table: "Players",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateTable(
                name: "Matches",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    HomeTeamId = table.Column<int>(type: "int", nullable: false),
                    AwayTeamId = table.Column<int>(type: "int", nullable: false),
                    MatchDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Result = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Matches", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Matches_Teams_AwayTeamId",
                        column: x => x.AwayTeamId,
                        principalTable: "Teams",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Matches_Teams_HomeTeamId",
                        column: x => x.HomeTeamId,
                        principalTable: "Teams",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Positions",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Abbreviation = table.Column<string>(type: "nvarchar(4)", maxLength: 4, nullable: false),
                    Category = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Positions", x => x.Id);
                });

            migrationBuilder.InsertData(
                table: "Positions",
                columns: new[] { "Id", "Abbreviation", "Category", "Name" },
                values: new object[,]
                {
                    { 1, "GK", "Goalkeeper", "Goalkeeper" },
                    { 2, "CB", "Defender", "Center Back" },
                    { 3, "RB", "Defender", "Right Back" },
                    { 4, "LB", "Defender", "Left Back" },
                    { 5, "RWB", "Defender", "Right Wing Back" },
                    { 6, "LWB", "Defender", "Left Wing Back" },
                    { 7, "DM", "Midfielder", "Defensive Midfielder" },
                    { 8, "CM", "Midfielder", "Central Midfielder" },
                    { 9, "AM", "Midfielder", "Attacking Midfielder" },
                    { 10, "RM", "Midfielder", "Right Midfielder" },
                    { 11, "LM", "Midfielder", "Left Midfielder" },
                    { 12, "RW", "Forward", "Right Winger" },
                    { 13, "LW", "Forward", "Left Winger" },
                    { 14, "CF", "Forward", "Center Forward" },
                    { 15, "ST", "Forward", "Striker" }
                });

            migrationBuilder.CreateIndex(
                name: "IX_ScoutingReports_MatchId",
                table: "ScoutingReports",
                column: "MatchId");

            migrationBuilder.CreateIndex(
                name: "IX_Players_PositionId",
                table: "Players",
                column: "PositionId");

            migrationBuilder.CreateIndex(
                name: "IX_Matches_AwayTeamId",
                table: "Matches",
                column: "AwayTeamId");

            migrationBuilder.CreateIndex(
                name: "IX_Matches_HomeTeamId",
                table: "Matches",
                column: "HomeTeamId");

            migrationBuilder.AddForeignKey(
                name: "FK_Players_Positions_PositionId",
                table: "Players",
                column: "PositionId",
                principalTable: "Positions",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Players_Teams_TeamId",
                table: "Players",
                column: "TeamId",
                principalTable: "Teams",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_ScoutingReports_Matches_MatchId",
                table: "ScoutingReports",
                column: "MatchId",
                principalTable: "Matches",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Players_Positions_PositionId",
                table: "Players");

            migrationBuilder.DropForeignKey(
                name: "FK_Players_Teams_TeamId",
                table: "Players");

            migrationBuilder.DropForeignKey(
                name: "FK_ScoutingReports_Matches_MatchId",
                table: "ScoutingReports");

            migrationBuilder.DropTable(
                name: "Matches");

            migrationBuilder.DropTable(
                name: "Positions");

            migrationBuilder.DropIndex(
                name: "IX_ScoutingReports_MatchId",
                table: "ScoutingReports");

            migrationBuilder.DropIndex(
                name: "IX_Players_PositionId",
                table: "Players");

            migrationBuilder.DropColumn(
                name: "ManagerUserId",
                table: "Teams");

            migrationBuilder.DropColumn(
                name: "MatchId",
                table: "ScoutingReports");

            migrationBuilder.DropColumn(
                name: "PositionId",
                table: "Players");

            migrationBuilder.RenameColumn(
                name: "ScoutUserId",
                table: "ScoutingReports",
                newName: "ScoutId");

            migrationBuilder.AddColumn<string>(
                name: "Position",
                table: "Players",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddForeignKey(
                name: "FK_Players_Teams_TeamId",
                table: "Players",
                column: "TeamId",
                principalTable: "Teams",
                principalColumn: "Id");
        }
    }
}
