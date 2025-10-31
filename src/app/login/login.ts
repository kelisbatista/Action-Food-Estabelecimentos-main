import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { login } from '../services/auth';

@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.scss']
})
export class LoginComponent {
  email = '';
  senha = '';

  async fazerLogin() {
    try {
      const user = await login(this.email, this.senha);
      alert('Login realizado com sucesso: ' + user.email);
    } catch (err: any) {
      alert('Erro ao fazer login: ' + err.message);
    }
  }
}
