using TaskManager.Application.DTOs.Task;
using TaskManager.Application.Interfaces;
using TaskManager.Domain.Entities;

namespace TaskManager.Application.Services;

public class TaskService(ITaskRepository repository) : ITaskService
{
    private readonly ITaskRepository _repository = repository;

    public async Task<List<TaskResponseDto>> GetAllAsync(
        string? search,
        bool? isCompleted,
        string? sortBy)
    {
        var tasks = await this._repository.GetAllAsync(search, isCompleted, sortBy);

        return [.. tasks.Select(MapToDto)];
    }

    public async Task<TaskResponseDto?> GetByIdAsync(int id)
    {
        var task = await this._repository.GetByIdAsync(id);

        return task == null ? null : MapToDto(task);
    }

    public async Task<TaskResponseDto> CreateAsync(TaskCreateDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Title))
            throw new ArgumentException("Title is required");

        var task = new TaskItem
        {
            Title = dto.Title,
            Description = dto.Description,
            DueDate = dto.DueDate
        };

        var created = await this._repository.CreateAsync(task);

        return MapToDto(created);
    }

    public async Task<bool> UpdateAsync(int id, TaskUpdateDto dto)
    {
        var existing = await this._repository.GetByIdAsync(id);

        if (existing == null)
            return false;

        existing.Title = dto.Title;
        existing.Description = dto.Description;
        existing.IsCompleted = dto.IsCompleted;
        existing.DueDate = dto.DueDate;

        return await this._repository.UpdateAsync(existing);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        return await this._repository.DeleteAsync(id);
    }

    private static TaskResponseDto MapToDto(TaskItem task)
    {
        return new TaskResponseDto
        {
            Id = task.Id,
            Title = task.Title,
            Description = task.Description,
            IsCompleted = task.IsCompleted,
            DueDate = task.DueDate,
            CreatedAt = task.CreatedAt
        };
    }
}