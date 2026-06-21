import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-login',
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly invalidCredentialsMessage = 'Login failed. Check your username or password and try again.';

  username = '';
  password = '';
  errorMessage = signal('');

  onUsernameInput(event: Event): void {
    this.username = (event.target as HTMLInputElement).value;
    this.errorMessage.set('');
  }

  onPasswordInput(event: Event): void {
    this.password = (event.target as HTMLInputElement).value;
    this.errorMessage.set('');
  }

  login(): void {
    if (!this.username || !this.password) {
      this.errorMessage.set('Username and password are required');
      return;
    }

    this.errorMessage.set('');

    this.authService.login(this.username, this.password).subscribe({
      next: () => {
        this.router.navigate(['/tasks']);
      },
      error: () => {
        this.authService.clearAuthToken();
        this.errorMessage.set(this.invalidCredentialsMessage);
      }
    });
  }
}
