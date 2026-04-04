namespace SpotTheTop.Api.Controllers
{
    using Microsoft.AspNetCore.Authorization;
    using Microsoft.AspNetCore.Mvc;
    using Microsoft.EntityFrameworkCore;
    using SpotTheTop.Core.DTOs;
    using SpotTheTop.Core.Entities;
    using SpotTheTop.Data;
    using System.Security.Claims;

    [Route("api/[controller]")]
    [ApiController]
    [Authorize] // Заключваме целия контролер по подразбиране
    public class PlayersController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public PlayersController(ApplicationDbContext context)
        {
            _context = context;
        }

        // 1. Вземи всички ОДОБРЕНИ играчи
        [HttpGet]
        public async Task<IActionResult> GetApprovedPlayers()
        {
            var players = await _context.Players
                .Where(p => p.IsApproved == true)
                .Select(p => new PlayerResponseDto
                {
                    Id = p.Id,
                    FullName = $"{p.FirstName} {p.LastName}",
                    Age = DateTime.Now.Year - p.DateOfBirth.Year,
                    // ТУК Е ПРОМЯНАТА: Взимаме свойството Name от обекта Position
                    Position = p.Position.Name,
                    IsApproved = p.IsApproved,
                    AddedBy = p.AddedByUserId
                })
                .ToListAsync();

            return Ok(players);
        }

        // 2. ДОБАВЯНЕ НА ИГРАЧ
        [HttpPost]
        [Authorize(Roles = "Admin,Scout")]
        public async Task<IActionResult> AddPlayer([FromBody] PlayerCreateDto dto)
        {
            var currentUserEmail = User.FindFirstValue(ClaimTypes.Name) ?? "Unknown";
            bool isAdmin = User.IsInRole("Admin");

            var newPlayer = new Player
            {
                FirstName = dto.FirstName,
                LastName = dto.LastName,
                DateOfBirth = dto.DateOfBirth,

                // ТУК Е ПРОМЯНАТА: Записваме директно ID-тата
                PositionId = dto.PositionId,
                TeamId = dto.TeamId,

                AddedByUserId = currentUserEmail,
                IsApproved = isAdmin
            };

            _context.Players.Add(newPlayer);
            await _context.SaveChangesAsync();

            if (isAdmin)
                return Ok($"Играчът е добавен и директно одобрен от Админ!");
            else
                return Ok($"Скауте, играчът е добавен успешно, но чака одобрение от Админ!");
        }

        // 3. СПИСЪК С ЧАКАЩИ ИГРАЧИ (Само за Админ)
        [HttpGet("pending")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetPendingPlayers()
        {
            var pendingPlayers = await _context.Players
                .Where(p => p.IsApproved == false)
                .Select(p => new PlayerResponseDto
                {
                    Id = p.Id,
                    FullName = $"{p.FirstName} {p.LastName}",

                    // ТУК СЪЩО ОПРАВЯМЕ ПОЗИЦИЯТА
                    Position = p.Position.Name,

                    IsApproved = p.IsApproved,
                    AddedBy = p.AddedByUserId
                })
                .ToListAsync();

            return Ok(pendingPlayers);
        }

        // 4. ОДОБРЯВАНЕ НА ИГРАЧ (Само за Админ)
        [HttpPatch("{id}/approve")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> ApprovePlayer(int id)
        {
            var player = await _context.Players.FindAsync(id);
            if (player == null) return NotFound("Играчът не е намерен.");

            if (player.IsApproved) return BadRequest("Този играч вече е одобрен.");

            player.IsApproved = true;
            await _context.SaveChangesAsync();

            return Ok($"Играч {player.FirstName} {player.LastName} беше успешно одобрен!");
        }
    }
}