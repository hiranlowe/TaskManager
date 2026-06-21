import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { AuthService } from './auth';
import { TaskCreate, TaskUpdate } from '../models/task';
import { APP_CONFIG } from '../config/app-config';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private readonly appConfig = inject(APP_CONFIG);

  private readonly apiUrl = `${this.appConfig.apiBaseUrl.replace(/\/+$/, '')}/api/tasks`;

  getTasks(search = '', isCompleted = '', sortBy = '') {
    let params = new HttpParams();

    if (search.trim()) {
      params = params.set('search', search.trim());
    }

    if (isCompleted !== '') {
      params = params.set('isCompleted', isCompleted);
    }

    if (sortBy.trim()) {
      params = params.set('sortBy', sortBy.trim());
    }

    return this.http.get<any>(this.apiUrl, {
      headers: this.authService.getAuthHeader(),
      params
    });
  }

  createTask(task: TaskCreate) {
    return this.http.post(this.apiUrl, task, {
      headers: this.authService.getAuthHeader()
    });
  }

  updateTask(id: number, task: TaskUpdate) {
    return this.http.put(`${this.apiUrl}/${id}`, task, {
      headers: this.authService.getAuthHeader()
    });
  }

  deleteTask(id: number) {
    return this.http.delete(`${this.apiUrl}/${id}`, {
      headers: this.authService.getAuthHeader()
    });
  }
}
