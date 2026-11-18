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
    :host { display:block; min-height:100vh; background:linear-gradient(135deg,#f1f6ff,#f8fafc 65%); color:#152a43; }
    main { max-width:1000px; margin:auto; padding:28px 24px 60px; } nav { display:flex; align-items:center; justify-content:space-between; gap:20px; }
    a { color:#245db0; text-decoration:none; } .brand { font-weight:800; font-size:25px; } .intro { max-width:700px; padding:80px 0 30px; }
    .intro span { font-size:12px; letter-spacing:2px; color:#426c9f; font-weight:700; } h1 { font-size:clamp(32px,5vw,52px); line-height:1.12; margin:18px 0; }
    .intro p { color:#576b83; font-size:18px; line-height:1.6; } .search-card { background:white; border:1px solid #e0e8f1; border-radius:20px; padding:30px; box-shadow:0 15px 40px #153d690a; }
    label { display:block; font-weight:600; margin-bottom:12px; } .search-row { display:flex; gap:12px; }
    input { flex:1; min-width:0; border:1px solid #b8c8dc; border-radius:8px; padding:14px; font:inherit; }
    button { border:0; background:#245db0; color:white; padding:14px 22px; border-radius:8px; font:inherit; cursor:pointer; } button:disabled { opacity:.6; }
    .hint,footer { color:#64748b; font-size:14px; } footer { margin-top:28px; text-align:center; } cl-booking-detail { border-top:1px solid #e0e8f1; padding-top:28px; margin-top:28px; }
    @media(max-width:560px) { .search-row { flex-direction:column; } .search-card { padding:20px; } .intro { padding-top:50px; } }
  `],
})
export class HomeComponent {
  lookup = viewChild.required(BookingLookupDialogComponent);
}
