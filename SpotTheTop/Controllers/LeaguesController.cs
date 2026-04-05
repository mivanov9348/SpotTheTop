namespace SpotTheTop.Api.Controllers
{
    using Microsoft.AspNetCore.Authorization;
    using Microsoft.AspNetCore.Mvc;
    using Microsoft.EntityFrameworkCore;
    using SpotTheTop.Data;

    [Route("api/[controller]")]
    [ApiController]
    [Authorize] 
    public class LeaguesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public LeaguesController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetLeagues()
        {
            var leagues = await _context.Leagues
                .Select(l => new { l.Id, l.Name, l.Country }) 
                .ToListAsync();

            return Ok(leagues);
        }
    }
}