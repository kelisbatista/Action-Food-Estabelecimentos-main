import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../auth.service';

@Component({
  selector: 'app-alert',
  standalone: true,
  templateUrl: './alert.component.html',
})
export class AlertComponent implements OnInit {
  authService = inject(AuthService);
  router = inject(Router);

  showMessage = true;
  email: string | null = null;

  ngOnInit(): void {
    const user = this.authService.currentUser();
    if (user) {
      this.email = user.email;
    }

    // 3 segundos → some e redireciona
    setTimeout(() => {
      this.showMessage = false;
      this.router.navigate(['/estabelecimento']);
    }, 3000);
  }
}
