using Moq;
using TaskManager.Application.DTOs.Task;
using TaskManager.Application.Interfaces;
using TaskManager.Application.Services;
using TaskManager.Domain.Entities;
using Xunit;

namespace TaskManager.Application.Tests;

public class TaskServiceTests
{
    private readonly Mock<ITaskRepository> _repositoryMock = new();

    [Fact]
    public async Task GetAllAsync_ReturnsMappedDtos()
    {
        var tasks = new List<TaskItem>
        {
            new()
            {
                Id = 1,
                Title = "Task 1",
                Description = "First task",
                IsCompleted = false,
                DueDate = new DateTime(2026, 6, 21),
                CreatedAt = new DateTime(2026, 6, 20)
            }
        };

        this._repositoryMock
            .Setup(repository => repository.GetAllAsync("search", true, "title"))
            .ReturnsAsync(tasks);

        var service = new TaskService(this._repositoryMock.Object);

        var result = await service.GetAllAsync("search", true, "title");

        Assert.Single(result);
        Assert.Equal(1, result[0].Id);
        Assert.Equal("Task 1", result[0].Title);
        Assert.Equal("First task", result[0].Description);
        Assert.False(result[0].IsCompleted);
        Assert.Equal(new DateTime(2026, 6, 21), result[0].DueDate);
        Assert.Equal(new DateTime(2026, 6, 20), result[0].CreatedAt);
        this._repositoryMock.Verify(repository => repository.GetAllAsync("search", true, "title"), Times.Once);
    }

    [Fact]
    public async Task GetByIdAsync_ReturnsNullWhenTaskIsMissing()
    {
        this._repositoryMock
            .Setup(repository => repository.GetByIdAsync(42))
            .ReturnsAsync((TaskItem?)null);

        var service = new TaskService(this._repositoryMock.Object);

        var result = await service.GetByIdAsync(42);

        Assert.Null(result);
    }

    [Fact]
    public async Task CreateAsync_ThrowsWhenTitleIsMissing()
    {
        var service = new TaskService(this._repositoryMock.Object);

        await Assert.ThrowsAsync<ArgumentException>(() => service.CreateAsync(new TaskCreateDto { Title = " " }));
    }

    [Fact]
    public async Task CreateAsync_PersistsAndReturnsCreatedTask()
    {
        var dto = new TaskCreateDto
        {
            Title = "New task",
            Description = "Created in a test",
            DueDate = new DateTime(2026, 6, 22)
        };

        this._repositoryMock
            .Setup(repository => repository.CreateAsync(It.IsAny<TaskItem>()))
            .ReturnsAsync((TaskItem task) =>
            {
                task.Id = 7;
                task.CreatedAt = new DateTime(2026, 6, 21, 12, 0, 0, DateTimeKind.Utc);
                return task;
            });

        var service = new TaskService(this._repositoryMock.Object);

        var result = await service.CreateAsync(dto);

        Assert.Equal(7, result.Id);
        Assert.Equal(dto.Title, result.Title);
        Assert.Equal(dto.Description, result.Description);
        Assert.Equal(dto.DueDate, result.DueDate);
        this._repositoryMock.Verify(repository => repository.CreateAsync(It.Is<TaskItem>(task =>
            task.Title == dto.Title &&
            task.Description == dto.Description &&
            task.DueDate == dto.DueDate)), Times.Once);
    }

    [Fact]
    public async Task UpdateAsync_ReturnsFalseWhenTaskDoesNotExist()
    {
        this._repositoryMock
            .Setup(repository => repository.GetByIdAsync(99))
            .ReturnsAsync((TaskItem?)null);

        var service = new TaskService(this._repositoryMock.Object);

        var result = await service.UpdateAsync(99, new TaskUpdateDto { Title = "Updated" });

        Assert.False(result);
        this._repositoryMock.Verify(repository => repository.UpdateAsync(It.IsAny<TaskItem>()), Times.Never);
    }

    [Fact]
    public async Task UpdateAsync_UpdatesExistingTask()
    {
        var existing = new TaskItem
        {
            Id = 5,
            Title = "Original",
            Description = "Old",
            IsCompleted = false,
            DueDate = new DateTime(2026, 6, 21)
        };

        this._repositoryMock
            .Setup(repository => repository.GetByIdAsync(5))
            .ReturnsAsync(existing);
        this._repositoryMock
            .Setup(repository => repository.UpdateAsync(existing))
            .ReturnsAsync(true);

        var service = new TaskService(this._repositoryMock.Object);
        var dto = new TaskUpdateDto
        {
            Title = "Updated",
            Description = "Updated description",
            IsCompleted = true,
            DueDate = new DateTime(2026, 6, 30)
        };

        var result = await service.UpdateAsync(5, dto);

        Assert.True(result);
        Assert.Equal(dto.Title, existing.Title);
        Assert.Equal(dto.Description, existing.Description);
        Assert.True(existing.IsCompleted);
        Assert.Equal(dto.DueDate, existing.DueDate);
        this._repositoryMock.Verify(repository => repository.UpdateAsync(existing), Times.Once);
    }

    [Fact]
    public async Task DeleteAsync_ReturnsRepositoryResult()
    {
        this._repositoryMock
            .Setup(repository => repository.DeleteAsync(8))
            .ReturnsAsync(true);

        var service = new TaskService(this._repositoryMock.Object);

        var result = await service.DeleteAsync(8);

        Assert.True(result);
    }
}