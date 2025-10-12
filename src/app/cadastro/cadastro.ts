import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { getDatabase, ref, push, set } from '@angular/fire/database';

@Component({
  selector: 'app-cadastro',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cadastro.html',
  styleUrl: './cadastro.scss'
})
export class CadastroEstabelecimento {
  // Campos do formulário
  nome = '';
  email = '';
  senha = '';
  telefone = '';
  endereco = '';
  categoria = '';
  descricao = '';
  logoUrl = '';

  // Função de cadastro
  async fazerCadastro() {
    if (!this.nome || !this.email || !this.senha) {
      alert('Preencha os campos obrigatórios: Nome, Email e Senha.');
      return;
    }

    try {
      const db = getDatabase();
      const refEstabelecimentos = ref(db, 'estabelecimentos');
      const novoEstabelecimento = push(refEstabelecimentos);

      await set(novoEstabelecimento, {
        nome: this.nome,
        email: this.email,
        senha: this.senha, // ⚠️ apenas para teste — ideal seria usar Auth no futuro
        telefone: this.telefone,
        endereco: this.endereco,
        categoria: this.categoria,
        descricao: this.descricao,
        logoUrl: this.logoUrl
      });

      alert('Cadastro realizado com sucesso!');
      this.limparCampos();
    } catch (erro) {
      console.error('Erro ao cadastrar:', erro);
      alert('Ocorreu um erro ao cadastrar. Tente novamente.');
    }
  }

  limparCampos() {
    this.nome = '';
    this.email = '';
    this.senha = '';
    this.telefone = '';
    this.endereco = '';
    this.categoria = '';
    this.descricao = '';
    this.logoUrl = '';
  }
}
