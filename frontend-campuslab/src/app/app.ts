import { RoleService } from './core/auth/role.service';
import {

  Component,

  inject,

  OnDestroy,

  OnInit,

  signal

} from '@angular/core';

import { CommonModule } from '@angular/common';

import { RouterOutlet } from '@angular/router';

import {

  MsalBroadcastService,

  MsalService

} from '@azure/msal-angular';

import { InteractionStatus } from '@azure/msal-browser';

import { Subject } from 'rxjs';

import { filter, takeUntil } from 'rxjs/operators';



@Component({

  selector: 'app-root',

  imports: [CommonModule, RouterOutlet],

  templateUrl: './app.html',

  styleUrl: './app.css'

})

export class App implements OnInit, OnDestroy {

  protected readonly title = signal('mi-proyecto');



  private readonly roles = inject(RoleService);
  private readonly msalService = inject(MsalService);

  private readonly msalBroadcastService = inject(MsalBroadcastService);

  private readonly destroying$ = new Subject<void>();



  readonly isLoggedIn = signal(false);

  readonly loginSuccessMessage = signal(false);



  ngOnInit(): void {

    this.msalService

      .handleRedirectObservable()

      .pipe(takeUntil(this.destroying$))

      .subscribe({

        next: (result) => {
          this.roles.refreshAccount(result?.account);

          this.updateLoginStatus();



          // Solo muestra el mensaje cuando acaba de completarse un login.

          if (result) {

            this.loginSuccessMessage.set(true);



            setTimeout(() => {

              this.loginSuccessMessage.set(false);

            }, 4000);

          }

        },

        error: (error) => {

          console.error(

            'Error procesando el retorno de MSAL:',

            error

          );

        }

      });



    this.msalBroadcastService.inProgress$

      .pipe(

        filter(

          (status: InteractionStatus) =>

            status === InteractionStatus.None

        ),

        takeUntil(this.destroying$)

      )

      .subscribe(() => {

        this.updateLoginStatus();

      });

  }



  login(): void {

    this.msalService.loginRedirect();

  }



  logout(): void {

    this.msalService.logoutRedirect();

  }



  private updateLoginStatus(): void {
    this.roles.refreshAccount();

    const hasAccounts =

      this.msalService.instance.getAllAccounts().length > 0;



    this.isLoggedIn.set(hasAccounts);

  }



  ngOnDestroy(): void {

    this.destroying$.next();

    this.destroying$.complete();

  }

}
