import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TaskService } from '../../services/task';
import { Task } from '../../models/task';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-tasks',
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './tasks.html',
  styleUrl: './tasks.css'
})

export class Tasks implements OnInit {
  private readonly taskService = inject(TaskService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  tasks = signal<Task[]>([]);

  selectedTaskId: number | null = null;

  taskForm = {
    title: '',
    description: '',
    dueDate: '',
    isCompleted: false
  };

  searchText = '';
  statusFilter = '';
  sortBy = '';
  loadError = signal('');
  notification = signal<{ message: string; type: 'success' | 'deleted' | 'error' } | null>(null);
  private notifyTimer: ReturnType<typeof setTimeout> | null = null;

  formErrors = signal({ title: '', dueDate: '' });

  get hasTasks(): boolean {
    return this.tasks().length > 0;
  }

  get hasNoTasks(): boolean {
    return !this.hasTasks;
  }

  ngOnInit(): void {
    this.loadTasks();
  }

  onTitleInput(event: Event): void {
    this.taskForm.title = (event.target as HTMLInputElement).value;
    if (this.taskForm.title.trim()) {
      this.formErrors.update(e => ({ ...e, title: '' }));
    }
  }

  onDescriptionInput(event: Event): void {
    this.taskForm.description = (event.target as HTMLTextAreaElement).value;
  }

  onDueDateInput(event: Event): void {
    this.taskForm.dueDate = (event.target as HTMLInputElement).value;
    if (this.taskForm.dueDate) {
      this.formErrors.update(e => ({ ...e, dueDate: '' }));
    }
  }

  onCompletedChange(event: Event): void {
    this.taskForm.isCompleted = (event.target as HTMLInputElement).checked;
  }

  onSearchInput(event: Event): void {
    this.searchText = (event.target as HTMLInputElement).value;
    this.applyFilters();
  }

  onStatusFilterChange(event: Event): void {
    this.statusFilter = (event.target as HTMLSelectElement).value;
    this.applyFilters();
  }

  onSortByChange(event: Event): void {
    this.sortBy = (event.target as HTMLSelectElement).value;
    this.applyFilters();
  }

  loadTasks(): void {
    this.loadError.set('');

    this.taskService.getTasks(
      this.searchText,
      this.statusFilter,
      this.sortBy
    ).subscribe({
      next: (response: unknown) => {
        this.tasks.set(this.extractTasks(response));
        console.log('API response:', response);
        console.log('Extracted tasks:', this.tasks());
      },
      error: (error) => {
        console.error('API error:', error);
        this.tasks.set([]);

        if (error?.status === 401 || error?.status === 403) {
          this.loadError.set('Your session expired. Please sign in again.');
          return;
        }

        this.loadError.set('Could not load tasks. Please verify the API is running and try again.');
      }
    });
  }

  private extractTasks(response: unknown): Task[] {
    const rawTasks = this.findTaskArray(response);
    return rawTasks.map((raw) => this.normalizeTask(raw));
  }

  private findTaskArray(payload: unknown): any[] {
    if (typeof payload === 'string') {
      try {
        const parsed = JSON.parse(payload);
        return this.findTaskArray(parsed);
      } catch {
        return [];
      }
    }

    if (Array.isArray(payload)) {
      return payload;
    }

    const record = payload as Record<string, unknown> | null;
    if (!record || typeof record !== 'object') {
      return [];
    }

    const prioritizedKeys = ['tasks', 'items', 'data', 'value', 'results', 'list', '$values'];
    for (const key of prioritizedKeys) {
      const candidate = record[key];
      const result = this.findTaskArray(candidate);
      if (result.length > 0) {
        return result;
      }
    }

    for (const candidate of Object.values(record)) {
      const result = this.findTaskArray(candidate);
      if (result.length > 0) {
        return result;
      }
    }

    return [];
  }

  private normalizeTask(raw: any): Task {
    const dueDate = raw?.dueDate ?? raw?.DueDate ?? undefined;
    const createdAt = raw?.createdAt ?? raw?.CreatedAt ?? new Date().toISOString();

    return {
      id: raw?.id ?? raw?.Id ?? 0,
      title: raw?.title ?? raw?.Title ?? '',
      description: raw?.description ?? raw?.Description ?? '',
      isCompleted: raw?.isCompleted ?? raw?.IsCompleted ?? false,
      dueDate,
      createdAt
    };
  }

  saveTask(): void {

    if (!this.validateForm()) {
      return;
    }

    if (this.selectedTaskId) {

      this.taskService.updateTask(
        this.selectedTaskId,
        this.taskForm
      ).subscribe(() => {

        this.resetForm();
        this.loadTasks();
        this.showNotification('Task updated successfully');

      });

    } else {

      this.taskService.createTask(
        this.taskForm
      ).subscribe(() => {

        this.resetForm();
        this.loadTasks();
        this.showNotification('Task added successfully');

      });

    }
  }

  editTask(task: any): void {

    this.selectedTaskId = task.id;

    this.taskForm = {
      title: task.title,
      description: task.description,
      dueDate: task.dueDate?.substring(0, 10),
      isCompleted: task.isCompleted
    };
  }

  deleteTask(id: number): void {

    if (!confirm('Delete this task?')) {
      return;
    }

    this.taskService.deleteTask(id)
      .subscribe(() => {
        this.loadTasks();
        this.showNotification('Task deleted', 'deleted');
      });
  }

  toggleComplete(task: any): void {

    const payload = {
      title: task.title,
      description: task.description,
      dueDate: task.dueDate,
      isCompleted: !task.isCompleted
    };

    this.taskService.updateTask(task.id, payload)
      .subscribe(() => {
        this.loadTasks();
        const label = payload.isCompleted ? 'Completed' : 'Pending';
        this.showNotification(`Task marked as ${label}`);
      });
  }

  resetForm(): void {

    this.selectedTaskId = null;
    this.formErrors.set({ title: '', dueDate: '' });

    this.taskForm = {
      title: '',
      description: '',
      dueDate: '',
      isCompleted: false
    };
  }

  private validateForm(): boolean {
    const errors = { title: '', dueDate: '' };
    if (!this.taskForm.title.trim()) {
      errors.title = 'Title is required';
    }
    if (!this.taskForm.dueDate) {
      errors.dueDate = 'Due date is required';
    }
    this.formErrors.set(errors);
    return !errors.title && !errors.dueDate;
  }

  private showNotification(message: string, type: 'success' | 'deleted' | 'error' = 'success'): void {
    if (this.notifyTimer) clearTimeout(this.notifyTimer);
    this.notification.set({ message, type });
    this.notifyTimer = setTimeout(() => this.notification.set(null), 3500);
  }

  dismissNotification(): void {
    if (this.notifyTimer) clearTimeout(this.notifyTimer);
    this.notification.set(null);
  }

  applyFilters(): void {
    this.loadTasks();
  }

  clearFilters(): void {
    this.searchText = '';
    this.statusFilter = '';
    this.sortBy = '';
    this.loadTasks();
  }

  logout(): void {
    this.authService.clearAuthToken();
    this.router.navigate(['/login']);
  }
}
