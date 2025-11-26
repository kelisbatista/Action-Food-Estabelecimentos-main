<<<<<<< HEAD
import { Routes } from '@angular/router';
import { InicioComponent } from './inicio/inicio';
import { LoginComponent } from './login/login';
import { CadastroEstabelecimento } from './cadastro/cadastro';
import { Estabelecimento } from './estabelecimento/estabelecimento';


export const routes: Routes = [

    { path: '', redirectTo: 'inicio', pathMatch: 'full' },
    { path: 'inicio', component: InicioComponent },
    { path: 'login', component: LoginComponent },
    { path: 'cadastro', component: CadastroEstabelecimento },
    { path: 'estabelecimento', component: Estabelecimento } 
];
=======
import { inject } from '@angular/core';
import { CanActivateFn, Router, Routes } from '@angular/router';
import { WelcomeComponent } from './components/welcome/welcome.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { ForgotPasswordComponent } from './components/forgot-password/forgot-password.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { AuthService } from './auth.service';

const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.currentUser()) {
    return true;
  }

  return router.parseUrl('/login');
};

export const appRoutes: Routes = [
  { path: '', component: WelcomeComponent, title: 'Welcome to Action Food' },
  { path: 'login', component: LoginComponent, title: 'Login - Action Food' },
  { path: 'cadastro', component: RegisterComponent, title: 'Register - Action Food' },
  { path: 'forgot-password', component: ForgotPasswordComponent, title: 'Reset Password - Action Food' },
  { path: 'dashboard', component: DashboardComponent, title: 'Dashboard - Action Food', canActivate: [authGuard] },
  { path: '**', redirectTo: '', pathMatch: 'full' }
];
>>>>>>> 3476ba53d01bb511ca6c3a39eca1338b7dad1c18
