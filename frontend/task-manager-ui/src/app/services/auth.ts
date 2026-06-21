import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { APP_CONFIG } from '../config/app-config';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly appConfig = inject(APP_CONFIG);
  private readonly authCheckUrl = `${this.appConfig.apiBaseUrl.replace(/\/+$/, '')}/api/tasks`;

  login(username: string, password: string): Observable<void> {
    const token = btoa(`${username}:${password}`);

    return this.http.get(this.authCheckUrl, {
      headers: {
        Authorization: `Basic ${token}`
      },
      observe: 'response'
    }).pipe(
      map(() => {
        localStorage.setItem('authToken', token);
      })
    );
  }

  clearAuthToken(): void {
    localStorage.removeItem('authToken');
  }

  getAuthHeader(): { [header: string]: string } {
    const token = localStorage.getItem('authToken');

    if (!token) {
      return {};
    }

    return {
      Authorization: `Basic ${token}`
    };
  }

  hasAuthToken(): boolean {
    return !!localStorage.getItem('authToken');
  }
}
