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