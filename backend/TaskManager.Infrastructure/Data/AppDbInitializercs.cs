using Microsoft.EntityFrameworkCore;
using TaskManager.Domain.Entities;

namespace TaskManager.Infrastructure.Data;

public static class AppDbInitializer
{
    public static async Task SeedAsync(AppDbContext dbContext)
    {
        await dbContext.Database.MigrateAsync();

        if (await dbContext.Tasks.AnyAsync())
        {
            return;
        }

        var now = DateTime.UtcNow;

        dbContext.Tasks.AddRange(
            new TaskItem
            {
                Title = "Set up backend auth",
                Description = "Verify Basic auth works with Swagger and API calls",
                IsCompleted = true,
                CreatedAt = now.AddDays(-4)
            },
            new TaskItem
            {
                Title = "Add initial seed data",
                Description = "Seed starter tasks at first app run",
                IsCompleted = true,
                DueDate = now.AddDays(-1),
                CreatedAt = now.AddDays(-3)
            },
            new TaskItem
            {
                Title = "Create task filters",
                Description = "Support filtering by completion and search text",
                IsCompleted = false,
                DueDate = now.AddDays(2),
                CreatedAt = now.AddDays(-2)
            },
            new TaskItem
            {
                Title = "Add sorting options",
                Description = "Sort tasks by due date and created date",
                IsCompleted = false,
                DueDate = now.AddDays(3),
                CreatedAt = now.AddDays(-2)
            },
            new TaskItem
            {
                Title = "Write API integration tests",
                Description = "Cover GET, POST, PUT, DELETE flows",
                IsCompleted = false,
                DueDate = now.AddDays(5),
                CreatedAt = now.AddDays(-1)
            },
            new TaskItem
            {
                Title = "Polish Angular task list UI",
                Description = "Improve empty state, loading state, and validation messages",
                IsCompleted = false,
                DueDate = now.AddDays(7),
                CreatedAt = now
            });

        await dbContext.SaveChangesAsync();
    }
}