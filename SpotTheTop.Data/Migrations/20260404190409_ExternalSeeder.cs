using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace SpotTheTop.Data.Migrations
{
    /// <inheritdoc />
    public partial class ExternalSeeder : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
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
                table: "Positions",
                keyColumn: "Id",
                keyValue: 8);

            migrationBuilder.DeleteData(
                table: "Positions",
                keyColumn: "Id",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "Positions",
                keyColumn: "Id",
                keyValue: 2);

            migrationBuilder.DeleteData(
                table: "Positions",
                keyColumn: "Id",
                keyValue: 15);

            migrationBuilder.DeleteData(
                table: "Teams",
                keyColumn: "Id",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "Teams",
                keyColumn: "Id",
                keyValue: 2);

            migrationBuilder.DeleteData(
                table: "Leagues",
                keyColumn: "Id",
                keyValue: 1);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
                table: "Leagues",
                columns: new[] { "Id", "Country", "Name" },
                values: new object[] { 1, "Bulgaria", "Efbet Лига" });

            migrationBuilder.InsertData(
                table: "Positions",
                columns: new[] { "Id", "Abbreviation", "Category", "Name" },
                values: new object[,]
                {
                    { 1, "GK", "Goalkeeper", "Goalkeeper" },
                    { 2, "CB", "Defender", "Center Back" },
                    { 8, "CM", "Midfielder", "Central Midfielder" },
                    { 15, "ST", "Forward", "Striker" }
                });

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
        }
    }
}
