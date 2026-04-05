namespace SpotTheTop.Api.Controllers
{
    using Microsoft.AspNetCore.Authorization;
    using Microsoft.AspNetCore.Mvc;
    using Microsoft.EntityFrameworkCore;
    using SpotTheTop.Data;

    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class TeamsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public TeamsController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetTeams([FromQuery] int? leagueId)
        {
            var query = _context.Teams.Where(t => t.IsApproved);

            if (leagueId.HasValue)
            {
                query = query.Where(t => t.LeagueId == leagueId.Value);
            }

            var teams = await query
                .Select(t => new {
                    t.Id,
                    t.Name,
                    t.City,
                    t.Stadium,
                    LeagueName = t.League.Name,
                    t.LeagueId
                })
                .ToListAsync();

            return Ok(teams);
        }
    }
}