import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideClientHydration } from '@angular/platform-browser';
import {
  provideHttpClient,
  withInterceptorsFromDi,
  HTTP_INTERCEPTORS,
  withFetch,
} from '@angular/common/http';
import {
  MSAL_GUARD_CONFIG,
  MSAL_INSTANCE,
  MSAL_INTERCEPTOR_CONFIG,
  MsalGuard,
  MsalService,
  MsalBroadcastService,
  MsalInterceptor,
} from '@azure/msal-angular';

import { routes } from './app.routes';
import { msalGuardConfigFactory } from '../msal-guard-config';
import { msalInstanceFactory } from '../msal-config';
import { msalInterceptorConfigFactory } from '../msal-interceptor-config'; // Asegúrate de crear/importar tu factory

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideClientHydration(),

    // 1. Habilitar cliente HTTP para interceptores
    provideHttpClient(withFetch(), withInterceptorsFromDi()),

    // 2. Registrar el interceptor de MSAL
    {
      provide: HTTP_INTERCEPTORS,
      useClass: MsalInterceptor,
      multi: true,
    },
    { provide: MSAL_INTERCEPTOR_CONFIG, useFactory: msalInterceptorConfigFactory },

    { provide: MSAL_INSTANCE, useFactory: msalInstanceFactory },
    { provide: MSAL_GUARD_CONFIG, useFactory: msalGuardConfigFactory },

    MsalGuard,
    MsalService,
    MsalBroadcastService,
  ],
};
