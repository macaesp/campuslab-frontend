import { TestBed } from '@angular/core/testing';
import { App } from './app';
import { provideRouter, Router } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { MsalService, MsalBroadcastService } from '@azure/msal-angular';
import { InteractionStatus } from '@azure/msal-browser';
import { of } from 'rxjs';
import { routes } from './app.routes';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter(routes), provideHttpClient(),
        { provide: MsalService, useValue: {
          handleRedirectObservable: () => of(null),
          instance: { getAllAccounts: () => [], getActiveAccount: () => null },
        } },
        { provide: MsalBroadcastService, useValue: { inProgress$: of(InteractionStatus.None) } },
      ],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('opens the public reservation search without an account', async () => {
    const fixture = TestBed.createComponent(App);
    await TestBed.inject(Router).navigateByUrl('/');
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('Tu reserva');
    expect(compiled.querySelector('.search-card button')?.textContent).toContain('Consultar reserva por código');
    expect(compiled.querySelector('dialog')).toBeTruthy();
    const dialog = compiled.querySelector('dialog') as HTMLDialogElement;
    dialog.showModal = () => dialog.setAttribute('open', '');
    (compiled.querySelector('.search-card button') as HTMLButtonElement).click();
    await fixture.whenStable();
    expect(dialog.hasAttribute('open')).toBe(true);
    expect(TestBed.inject(Router).url).toBe('/');
  });
});
