using Microsoft.EntityFrameworkCore;
using TaskManager.Application.Interfaces;
using TaskManager.Domain.Entities;
using TaskManager.Infrastructure.Data;

namespace TaskManager.Infrastructure.Repositories;

public class TaskRepository(AppDbContext context) : ITaskRepository
{
    private readonly AppDbContext _context = context;

    public async Task<List<TaskItem>> GetAllAsync(
        string? search,
        bool? isCompleted,
        string? sortBy)
    {
        var query = this._context.Tasks.AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
            query = query.Where(t => t.Title.Contains(search));

        if (isCompleted.HasValue)
            query = query.Where(t => t.IsCompleted == isCompleted.Value);

        query = sortBy?.ToLower() switch
        {
            "title" => query.OrderBy(t => t.Title),
            "duedate" => query.OrderBy(t => t.DueDate),
            "completed" => query.OrderBy(t => t.IsCompleted),
            _ => query.OrderByDescending(t => t.CreatedAt)
        };

        return await query.ToListAsync();
    }

    public async Task<TaskItem?> GetByIdAsync(int id)
    {
        return await this._context.Tasks.FindAsync(id);
    }

    public async Task<TaskItem> CreateAsync(TaskItem task)
    {
        this._context.Tasks.Add(task);
        await this._context.SaveChangesAsync();

        return task;
    }

    public async Task<bool> UpdateAsync(TaskItem task)
    {
        this._context.Tasks.Update(task);
        await this._context.SaveChangesAsync();

        return true;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var task = await this._context.Tasks.FindAsync(id);

        if (task == null)
            return false;

        this._context.Tasks.Remove(task);
        await this._context.SaveChangesAsync();

        return true;
    }
}