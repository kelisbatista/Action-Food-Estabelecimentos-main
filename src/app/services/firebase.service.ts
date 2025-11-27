import { Injectable } from '@angular/core';
import { initializeApp, FirebaseApp, getApps, getApp } from 'firebase/app';
import { getFirestore, Firestore, doc, getDoc } from 'firebase/firestore';
import { getAuth, Auth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { BehaviorSubject } from 'rxjs';

export interface UserData {
  nome?: string;
  email?: string;
  telefone?: string;
  endereco?: string;
  cidade?: string;
  bairro?: string;
}

@Injectable({ providedIn: 'root' })
export class FirebaseService {
  private app!: FirebaseApp;
  private db!: Firestore;
  private auth!: Auth;

  // AGORA ESTÁ CERTO:
  userData$ = new BehaviorSubject<UserData | null>(null);

  private firebaseConfig = {
    apiKey: "AIzaSyDnj9rAyzi5GxLxKhnaHHQpWCBzVVkf5G8",
    authDomain: "actionfood-e77c4.firebaseapp.com",
    databaseURL: "https://actionfood-e77c4-default-rtdb.firebaseio.com",
    projectId: "actionfood-e77c4",
    storageBucket: "actionfood-e77c4.firebasestorage.app",
    messagingSenderId: "304053859403",
    appId: "1:304053859403:web:b4c1b02851232a9ace49ce",
    measurementId: "G-64R5F7Y4QY"
  };

  async getUserData(uid: string): Promise<UserData | null> {
    const ref = doc(this.db, "usuarios", uid);
    const snap = await getDoc(ref);

    return snap.exists() ? (snap.data() as UserData) : null;
  }

  async init() {
    if (getApps().length === 0) {
      this.app = initializeApp(this.firebaseConfig);
    } else {
      this.app = getApp();
    }

    this.db = getFirestore(this.app);
    this.auth = getAuth(this.app);

    try {
      if (!this.auth.currentUser) {
        await signInAnonymously(this.auth);
      }

      onAuthStateChanged(this.auth, async (user) => {
        if (user) {
          const data = await this.getUserData(user.uid);
          this.userData$.next(data);
        } else {
          this.userData$.next(null);
        }
      });

    } catch (e) {
      console.warn('Erro ao fazer signInAnonymously', e);
    }
  }

  getDb() {
    if (!this.db) throw new Error('Firebase não inicializado. Chame init() antes.');
    return this.db;
  }

  getAuth() {
    if (!this.auth) throw new Error('Firebase não inicializado. Chame init() antes.');
    return this.auth;
  }

  onAuthStateChanged(cb: (user: any) => void) {
    return onAuthStateChanged(this.getAuth(), cb as any);
  }
}