import { Component, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { BookingLookupDialogComponent } from '../../shared/booking-detail/booking-lookup-dialog.component';

@Component({
  selector: 'cl-home', standalone: true,
  imports: [CommonModule, RouterLink, BookingLookupDialogComponent],
  template: `
    <main>
      <nav><a routerLink="/" class="brand">CampusLab</a><a routerLink="/dashboard">Iniciar sesión →</a></nav>
      <section class="intro"><span>LABORATORIOS Y RECURSOS</span><h1>Tu reserva, a un código de distancia.</h1>
        <p>Consulta quién reservó, el espacio o recurso y las fechas de ocupación sin iniciar sesión.</p></section>
      <section class="search-card">
        <button type="button" (click)="lookup().show()">Consultar reserva por código</button>
        <p class="hint">El código llega a tu correo después de que se aprueba la reserva.</p>
      </section>
      <cl-booking-lookup-dialog />
      <footer>¿Necesitas reservar un espacio? <a routerLink="/bookings">Ingresa a tu cuenta</a></footer>
    </main>`,
  styles: [`
    :host { display:block; min-height:100dvh; background:linear-gradient(135deg,#f1f6ff,#f8fafc 65%); color:#152a43; }
    main { max-width:1120px; margin:auto; padding:24px 24px 48px; }
    nav { display:flex; align-items:center; justify-content:space-between; gap:20px; }
    a { color:#245db0; text-decoration:none; }
    a:hover { text-decoration:underline; }
    .brand { font-weight:800; font-size:25px; }
    nav > a:last-child { font-size:15px; font-weight:600; padding:10px 0; }
    .intro { max-width:720px; margin:0 auto; padding:64px 0 24px; text-align:center; }
    .intro span { font-size:12px; letter-spacing:2px; color:#426c9f; font-weight:700; }
    h1 { font-size:clamp(32px,4vw,48px); line-height:1.15; margin:18px 0; text-wrap:balance; }
    .intro p { max-width:600px; margin:0 auto; color:#576b83; font-size:17px; line-height:1.6; text-wrap:pretty; }
    .search-card { box-sizing:border-box; max-width:600px; margin:0 auto; background:white; border:1px solid #e0e8f1; border-radius:16px; padding:28px; text-align:center; box-shadow:0 12px 32px #153d690a; }
    button { display:block; width:100%; border:0; background:#245db0; color:white; padding:15px 20px; border-radius:8px; font:inherit; font-weight:600; line-height:1.4; cursor:pointer; transition:background .15s ease; }
    button:hover { background:#1c4c92; }
    button:disabled { opacity:.6; cursor:not-allowed; }
    a:focus-visible,button:focus-visible { outline:3px solid #245db0; outline-offset:4px; }
    .hint,footer { color:#64748b; font-size:14px; line-height:1.6; }
    .hint { margin:14px auto 0; max-width:420px; }
    footer { margin:24px auto 0; text-align:center; }
    @media(max-width:560px) {
      main { padding:20px 18px 32px; }
      nav { gap:12px; }
      .brand { font-size:23px; }
      nav > a:last-child { font-size:14px; }
      .intro { padding:44px 0 24px; }
      .intro p { font-size:16px; }
      .search-card { padding:22px 18px; }
    }
  `],
})
export class HomeComponent {
  lookup = viewChild.required(BookingLookupDialogComponent);
}
