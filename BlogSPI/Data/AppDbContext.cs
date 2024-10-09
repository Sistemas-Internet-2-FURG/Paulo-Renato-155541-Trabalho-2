using BlogSPI.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace BlogSPI.Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }
    public DbSet<User> Users { get; set; }
    public DbSet<Post> Posts { get; set; }
}