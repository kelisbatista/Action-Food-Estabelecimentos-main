import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { firebaseConfig } from './firebase.config';
import { signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly router = inject(Router);
  
  private app = initializeApp(firebaseConfig);
  private auth = getAuth(this.app);
  private firestore = getFirestore(this.app);

  currentUser = signal<User | null>(null);

  constructor() {
    onAuthStateChanged(this.auth, (user) => {
      this.currentUser.set(user);
    });
  }

  async register(partner: any) {
    const { email, senha, ...partnerData } = partner;
    const userCredential = await createUserWithEmailAndPassword(this.auth, email, senha);
    const user = userCredential.user;
    
    // Save additional partner data to Firestore
    await setDoc(doc(this.firestore, 'estabelecimentos', user.uid), {
      ...partnerData,
      email: user.email,
      uid: user.uid,
    });
  }

  async login(email: string, senha: string) {
    await signInWithEmailAndPassword(this.auth, email, senha);
  }

  async sendPasswordReset(email: string) {
    await sendPasswordResetEmail(this.auth, email);
  }

  async logout() {
    await signOut(this.auth);
    this.router.navigate(['/login']);
  }

  mapAuthCodeToMessage(code: string): string {
    switch (code) {
      case 'auth/invalid-email':
        return 'O formato do e-mail é inválido.';
      case 'auth/user-not-found':
        return 'Nenhum usuário encontrado com este e-mail.';
      case 'auth/wrong-password':
        return 'Senha incorreta. Tente novamente.';
      case 'auth/email-already-in-use':
        return 'Este e-mail já está em uso por outra conta.';
      case 'auth/weak-password':
        return 'A senha deve ter no mínimo 6 caracteres.';
      default:
        return 'Ocorreu um erro inesperado. Tente novamente mais tarde.';
    }
  }
}