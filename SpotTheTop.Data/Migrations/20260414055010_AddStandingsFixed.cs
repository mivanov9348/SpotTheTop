using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SpotTheTop.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddStandingsFixed : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "LeagueId",
                table: "TeamSeasonStandings",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_TeamSeasonStandings_LeagueId",
                table: "TeamSeasonStandings",
                column: "LeagueId");

            migrationBuilder.AddForeignKey(
                name: "FK_TeamSeasonStandings_Leagues_LeagueId",
                table: "TeamSeasonStandings",
                column: "LeagueId",
                principalTable: "Leagues",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_TeamSeasonStandings_Leagues_LeagueId",
                table: "TeamSeasonStandings");

            migrationBuilder.DropIndex(
                name: "IX_TeamSeasonStandings_LeagueId",
                table: "TeamSeasonStandings");

            migrationBuilder.DropColumn(
                name: "LeagueId",
                table: "TeamSeasonStandings");
        }
    }
}
