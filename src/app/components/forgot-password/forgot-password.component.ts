import { ChangeDetectionStrategy, Component, OnDestroy, signal, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../auth.service';

@Component({
  selector: 'app-forgot-password',
  imports: [FormsModule, RouterLink],
  templateUrl: './forgot-password.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ForgotPasswordComponent implements OnDestroy {
  authService = inject(AuthService);

  email = '';
  resetRequested = signal(false);
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);

  countdown = signal(60);
  isTimerActive = signal(false);
  private timerInterval: any;

  async requestReset() {
    if (!this.email) {
      this.errorMessage.set('Por favor, digite seu e-mail.');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);
    try {
      await this.authService.sendPasswordReset(this.email);
      this.resetRequested.set(true);
      this.startTimer();
    } catch (error: any) {
      this.errorMessage.set(this.authService.mapAuthCodeToMessage(error.code));
    } finally {
      this.isLoading.set(false);
    }
  }

  async resendEmail() {
    try {
      await this.authService.sendPasswordReset(this.email);
      this.startTimer();
    } catch (error) {
      console.error("Failed to resend email", error);
      // Optionally show a small toast/error here.
    }
  }

  startTimer() {
    this.isTimerActive.set(true);
    this.countdown.set(60);
    clearInterval(this.timerInterval);

    this.timerInterval = setInterval(() => {
      this.countdown.update(c => c - 1);
      if (this.countdown() <= 0) {
        clearInterval(this.timerInterval);
        this.isTimerActive.set(false);
      }
    }, 1000);
  }

  ngOnDestroy(): void {
    clearInterval(this.timerInterval);
  }
}
