import { FirebaseApp, initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, User, Auth, signInAnonymously } from 'firebase/auth';
import { Injectable } from '@angular/core';
import { Firestore, getFirestore } from 'firebase/firestore';

// Configurações do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDnj9rAyzi5GxLxKhnaHHQpWCBzVVkf5G8",
  authDomain: "actionfood-e77c4.firebaseapp.com",
  databaseURL: "https://actionfood-e77c4-default-rtdb.firebaseio.com",
  projectId: "actionfood-e77c4",
  storageBucket: "actionfood-e77c4.firebasestorage.app",
  messagingSenderId: "304053859403",
  appId: "1:304053859403:web:b4c1b02851232a9ace49ce",
  measurementId: "G-64R5F7Y4QY"
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Funções de autenticação
export async function register(email: string, password: string) {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error: any) {
    throw new Error(error.message);
  }
}

export async function login(email: string, password: string) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error: any) {
    throw new Error(error.message);
  }
}

export async function logout() {
  await signOut(auth);
}

