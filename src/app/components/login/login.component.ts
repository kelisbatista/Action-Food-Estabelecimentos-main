import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../auth.service';

@Component({
  selector: 'app-login',
  imports: [RouterLink, FormsModule],
  templateUrl: './login.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent {
  authService = inject(AuthService);
  router = inject(Router);

  email = '';
  senha = '';

  isLoading = signal(false);
  errorMessage = signal<string | null>(null);

  async fazerLogin() {
    this.isLoading.set(true);
    this.errorMessage.set(null);
    try {
      await this.authService.login(this.email, this.senha);
      this.router.navigate(['/estabelecimento']);
    } catch (error: any) {
      this.errorMessage.set(this.authService.mapAuthCodeToMessage(error.code));
    } finally {
      this.isLoading.set(false);
    }
  }
}
