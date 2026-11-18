import { Component, OnInit } from '@angular/core';
import { MsalService } from '@azure/msal-angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  // standalone: true, (si estás usando standalone)
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  constructor(
    private msalService: MsalService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    // 1. Escuchar el regreso desde Microsoft y procesar el token
    this.msalService.handleRedirectObservable().subscribe({
      next: (result) => {
        // Si result tiene datos (acaba de iniciar sesión)
        // o si ya hay una cuenta guardada en el caché del navegador
        if (result || this.msalService.instance.getAllAccounts().length > 0) {
          // Opcional: Establecer la cuenta activa por defecto
          if (result && result.account) {
            this.msalService.instance.setActiveAccount(result.account);
          }

          // 2. Redirigir al dashboard
          this.router.navigate(['/dashboard']);
        }
      },
      error: (error) => {
        console.error('Error al procesar el login con MSAL:', error);
      },
    });
  }

  loginWithMicrosoft(): void {
    // 3. Disparar el inicio de sesión
    this.msalService.loginRedirect();
  }
}
