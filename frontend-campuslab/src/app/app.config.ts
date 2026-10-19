import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { MsalInterceptor, MSAL_INTERCEPTOR_CONFIG } from '@azure/msal-angular';
import { msalInterceptorConfigFactory } from '../msal-interceptor-config';
import { provideClientHydration } from '@angular/platform-browser';
import {
  MSAL_GUARD_CONFIG,
  MSAL_INSTANCE,
  MsalGuard,
  MsalService,
  MsalBroadcastService
} from '@azure/msal-angular';

import { routes } from './app.routes';
import { msalGuardConfigFactory } from '../msal-guard-config';
import { msalInstanceFactory } from '../msal-config';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withInterceptorsFromDi()),
    { provide: MSAL_INTERCEPTOR_CONFIG, useFactory: msalInterceptorConfigFactory },
    { provide: HTTP_INTERCEPTORS, useClass: MsalInterceptor, multi: true },
    provideClientHydration(),
    // Corrección aquí: msalInstanceFactory para MSAL_INSTANCE
    { provide: MSAL_INSTANCE, useFactory: msalInstanceFactory },
    { provide: MSAL_GUARD_CONFIG, useFactory: msalGuardConfigFactory },

    MsalGuard,
    MsalService,
    MsalBroadcastService
  ]
};
