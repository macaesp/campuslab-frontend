import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
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
import { jwtInterceptor } from './core/interceptors/jwt.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideClientHydration(),
    provideHttpClient(withFetch(), withInterceptors([jwtInterceptor])),

    // Corrección aquí: msalInstanceFactory para MSAL_INSTANCE
    { provide: MSAL_INSTANCE, useFactory: msalInstanceFactory },
    { provide: MSAL_GUARD_CONFIG, useFactory: msalGuardConfigFactory },

    MsalGuard,
    MsalService,
    MsalBroadcastService
  ]
};
