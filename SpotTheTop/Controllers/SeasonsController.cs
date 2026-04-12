namespace SpotTheTop.Api.Controllers
{
    using Microsoft.AspNetCore.Authorization;
    using Microsoft.AspNetCore.Mvc;
    using Microsoft.EntityFrameworkCore;
    using SpotTheTop.Data;
    using System.Linq;
    using System.Threading.Tasks;

    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class SeasonsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public SeasonsController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetSeasons([FromQuery] int? leagueId)
        {
            var query = _context.Seasons.AsQueryable();

            if (leagueId.HasValue)
            {
                query = query.Where(s => s.LeagueId == leagueId.Value);
            }

            var seasons = await query
                .OrderByDescending(s => s.StartDate)
                .Select(s => new
                {
                    s.Id,
                    s.Name,
                    s.LeagueId,
                    s.IsActive
                })
                .ToListAsync();

            return Ok(seasons);
        }
    }
}   