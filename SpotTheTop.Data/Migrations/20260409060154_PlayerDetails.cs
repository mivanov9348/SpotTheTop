using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SpotTheTop.Data.Migrations
{
    /// <inheritdoc />
    public partial class PlayerDetails : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "AgentName",
                table: "Players",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "ContractEndDate",
                table: "Players",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "JerseyNumber",
                table: "Players",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "MarketValueEuro",
                table: "Players",
                type: "decimal(18,2)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AgentName",
                table: "Players");

            migrationBuilder.DropColumn(
                name: "ContractEndDate",
                table: "Players");

            migrationBuilder.DropColumn(
                name: "JerseyNumber",
                table: "Players");

            migrationBuilder.DropColumn(
                name: "MarketValueEuro",
                table: "Players");
        }
    }
}
