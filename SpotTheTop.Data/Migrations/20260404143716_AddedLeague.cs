using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace SpotTheTop.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddedLeague : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "Positions",
                keyColumn: "Id",
                keyValue: 3);

            migrationBuilder.DeleteData(
                table: "Positions",
                keyColumn: "Id",
                keyValue: 4);

            migrationBuilder.DeleteData(
                table: "Positions",
                keyColumn: "Id",
                keyValue: 5);

            migrationBuilder.DeleteData(
                table: "Positions",
                keyColumn: "Id",
                keyValue: 6);

            migrationBuilder.DeleteData(
                table: "Positions",
                keyColumn: "Id",
                keyValue: 7);

            migrationBuilder.DeleteData(
                table: "Positions",
                keyColumn: "Id",
                keyValue: 9);

            migrationBuilder.DeleteData(
                table: "Positions",
                keyColumn: "Id",
                keyValue: 10);

            migrationBuilder.DeleteData(
                table: "Positions",
                keyColumn: "Id",
                keyValue: 11);

            migrationBuilder.DeleteData(
                table: "Positions",
                keyColumn: "Id",
                keyValue: 12);

            migrationBuilder.DeleteData(
                table: "Positions",
                keyColumn: "Id",
                keyValue: 13);

            migrationBuilder.DeleteData(
                table: "Positions",
                keyColumn: "Id",
                keyValue: 14);

            migrationBuilder.AddColumn<int>(
                name: "LeagueId",
                table: "Teams",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateTable(
                name: "Leagues",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Country = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Leagues", x => x.Id);
                });

            migrationBuilder.InsertData(
                table: "Leagues",
                columns: new[] { "Id", "Country", "Name" },
                values: new object[] { 1, "Bulgaria", "Efbet Лига" });

            migrationBuilder.InsertData(
                table: "Teams",
                columns: new[] { "Id", "City", "IsApproved", "LeagueId", "ManagerUserId", "Name", "Stadium" },
                values: new object[,]
                {
                    { 1, "София", true, 1, "System", "ПФК Левски", "Георги Аспарухов" },
                    { 2, "София", true, 1, "System", "ПФК ЦСКА", "Васил Левски" }
                });

            migrationBuilder.InsertData(
                table: "Matches",
                columns: new[] { "Id", "AwayTeamId", "HomeTeamId", "MatchDate", "Result" },
                values: new object[,]
                {
                    { 1, 2, 1, new DateTime(2024, 4, 7, 17, 0, 0, 0, DateTimeKind.Unspecified), "2-0" },
                    { 2, 1, 2, new DateTime(2024, 5, 20, 18, 0, 0, 0, DateTimeKind.Unspecified), null }
                });

            migrationBuilder.InsertData(
                table: "Players",
                columns: new[] { "Id", "AddedByUserId", "DateOfBirth", "FirstName", "IsApproved", "LastName", "PositionId", "TeamId" },
                values: new object[,]
                {
                    { 1, "System", new DateTime(2004, 12, 15, 0, 0, 0, 0, DateTimeKind.Unspecified), "Пламен", true, "Андреев", 1, 1 },
                    { 2, "System", new DateTime(2001, 6, 3, 0, 0, 0, 0, DateTimeKind.Unspecified), "Хосе", true, "Кордоба", 2, 1 },
                    { 3, "System", new DateTime(1990, 10, 23, 0, 0, 0, 0, DateTimeKind.Unspecified), "Густаво", true, "Бусато", 1, 2 },
                    { 4, "System", new DateTime(1991, 4, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), "Фернандо", true, "Каранга", 15, 2 }
                });

            migrationBuilder.CreateIndex(
                name: "IX_Teams_LeagueId",
                table: "Teams",
                column: "LeagueId");

            migrationBuilder.AddForeignKey(
                name: "FK_Teams_Leagues_LeagueId",
                table: "Teams",
                column: "LeagueId",
                principalTable: "Leagues",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Teams_Leagues_LeagueId",
                table: "Teams");

            migrationBuilder.DropTable(
                name: "Leagues");

            migrationBuilder.DropIndex(
                name: "IX_Teams_LeagueId",
                table: "Teams");

            migrationBuilder.DeleteData(
                table: "Matches",
                keyColumn: "Id",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "Matches",
                keyColumn: "Id",
                keyValue: 2);

            migrationBuilder.DeleteData(
                table: "Players",
                keyColumn: "Id",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "Players",
                keyColumn: "Id",
                keyValue: 2);

            migrationBuilder.DeleteData(
                table: "Players",
                keyColumn: "Id",
                keyValue: 3);

            migrationBuilder.DeleteData(
                table: "Players",
                keyColumn: "Id",
                keyValue: 4);

            migrationBuilder.DeleteData(
                table: "Teams",
                keyColumn: "Id",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "Teams",
                keyColumn: "Id",
                keyValue: 2);

            migrationBuilder.DropColumn(
                name: "LeagueId",
                table: "Teams");

            migrationBuilder.InsertData(
                table: "Positions",
                columns: new[] { "Id", "Abbreviation", "Category", "Name" },
                values: new object[,]
                {
                    { 3, "RB", "Defender", "Right Back" },
                    { 4, "LB", "Defender", "Left Back" },
                    { 5, "RWB", "Defender", "Right Wing Back" },
                    { 6, "LWB", "Defender", "Left Wing Back" },
                    { 7, "DM", "Midfielder", "Defensive Midfielder" },
                    { 9, "AM", "Midfielder", "Attacking Midfielder" },
                    { 10, "RM", "Midfielder", "Right Midfielder" },
                    { 11, "LM", "Midfielder", "Left Midfielder" },
                    { 12, "RW", "Forward", "Right Winger" },
                    { 13, "LW", "Forward", "Left Winger" },
                    { 14, "CF", "Forward", "Center Forward" }
                });
        }
    }
}
