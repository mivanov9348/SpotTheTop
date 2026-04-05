using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using SpotTheTop.Api;
using SpotTheTop.Data;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// --- Връзка с базата ---
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(connectionString));

// --- Identity ---
builder.Services.AddIdentity<IdentityUser, IdentityRole>(options =>
{
    // Премахва изискването за цифра
    options.Password.RequireDigit = false;

    // Минималната възможна дължина е 1 (Identity не позволява 0)
    options.Password.RequiredLength = 1;

    // Премахва изискването за малка буква
    options.Password.RequireLowercase = false;

    // Премахва изискването за главна буква
    options.Password.RequireUppercase = false;

    // Премахва изискването за специален символ (@, #, !, и т.н.)
    options.Password.RequireNonAlphanumeric = false;

    // Премахва изискването за брой уникални символи
    options.Password.RequiredUniqueChars = 0;
})
.AddEntityFrameworkStores<ApplicationDbContext>()
.AddDefaultTokenProviders();
// --- JWT ---
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    var jwtKey = builder.Configuration["Jwt:Key"]!;

    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = builder.Configuration["Jwt:Issuer"],
        ValidAudience = builder.Configuration["Jwt:Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey))
    };
});

// --- Controllers ---
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

// --- Swagger ---
builder.Services.AddSwaggerGen(options =>
{
    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Въведи токена си тук (без 'Bearer ')"
    });

    options.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            new string[] {}
        }
    });
});

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReact", builder =>
    {
        builder.WithOrigins("http://localhost:5173") 
               .AllowAnyMethod()
               .AllowAnyHeader();
    });
});

var app = builder.Build();

// --- Seed роли и админ ---
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    await DbSeeder.SeedRolesAndAdminAsync(services);

    var context = services.GetRequiredService<ApplicationDbContext>();
    await DbSeeder.SeedDatabaseAsync(context);
}

// --- Pipeline ---
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors("AllowReact");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();