import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MsalService } from '@azure/msal-angular';

@Component({
  selector: 'app-login',
  standalone: true,
  template: `
    <main class="login-page">
      <section class="login-card">
        <span class="eyebrow">PLATAFORMA ACADÉMICA</span>
        <h1>CampusLab</h1>
        <p>Reserva laboratorios, equipos e insumos desde un solo lugar.</p>
        <button type="button" (click)="login()">Iniciar sesión con Microsoft</button>
      </section>
    </main>
  `,
  styles: [`
    .login-page { min-height: 100vh; display: grid; place-items: center; padding: 1.5rem; background: linear-gradient(135deg, #003366, #05668d); font-family: system-ui, sans-serif; }
    .login-card { width: min(100%, 420px); padding: 3rem; border-radius: 18px; background: #fff; box-shadow: 0 18px 50px rgba(0, 0, 0, .24); }
    .eyebrow { color: #05668d; font-size: .75rem; font-weight: 700; letter-spacing: .12em; }
    h1 { margin: .6rem 0; color: #003366; font-size: 2.5rem; }
    p { color: #52616b; line-height: 1.6; }
    button { width: 100%; margin-top: 1.5rem; padding: .85rem 1rem; border: 0; border-radius: 8px; background: #003366; color: #fff; font-size: 1rem; font-weight: 700; cursor: pointer; }
    button:hover { background: #004b85; }
  `]
})
export class LoginComponent implements OnInit {
  private readonly msalService = inject(MsalService);
  private readonly router = inject(Router);

  ngOnInit(): void {
    const account = this.msalService.instance.getActiveAccount() ?? this.msalService.instance.getAllAccounts()[0];
    if (account) {
      this.msalService.instance.setActiveAccount(account);
      void this.router.navigate(['/dashboard']);
    }
  }

  login(): void {
    this.msalService.loginRedirect();
  }
}
