import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../auth.service';

@Component({
  selector: 'app-register',
  imports: [FormsModule, RouterLink],
  templateUrl: './register.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegisterComponent {
  authService = inject(AuthService);
  router = inject(Router);

  partner = {
    nome: '',
    email: '',
    senha: '',
    telefone: '',
    logoUrl: '',
  };

  isLoading = signal(false);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);

  async fazerCadastro() {
    if (!this.partner.email || !this.partner.senha || !this.partner.nome || !this.partner.telefone) {
      this.errorMessage.set('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    try {
      await this.authService.register(this.partner);
      this.successMessage.set('Cadastro realizado com sucesso! Redirecionando para o login...');
      setTimeout(() => {
        this.router.navigate(['/login']);
      }, 2000);
    } catch (error: any) {
      this.errorMessage.set(this.authService.mapAuthCodeToMessage(error.code));
    } finally {
      this.isLoading.set(false);
    }
  }
}
