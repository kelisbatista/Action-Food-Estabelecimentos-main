import { bootstrapApplication } from '@angular/platform-browser';
import { App } from '../app/app';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideAuth, getAuth } from '@angular/fire/auth';

const firebaseConfig = {
  apiKey: "AIzaSyDnj9rAyzi5GxLxKhnaHHQpWCBzVVkf8G",
  authDomain: "actionfood-e77c4.firebaseapp.com",
  databaseURL: "https://actionfood-e77c4-default-rtdb.firebaseio.com",
  projectId: "actionfood-e77c4",
  storageBucket: "actionfood-e77c4.firebasestorage.app",
  messagingSenderId: "304053859403",
  appId: "1:304053859403:web:b4c1b02851232a9ace49ce",
  measurementId: "G-64R5F7Y4QY"
};

bootstrapApplication(App, {
  providers: [
    provideFirebaseApp(() => initializeApp(firebaseConfig)),
    provideAuth(() => getAuth())
  ]
});
