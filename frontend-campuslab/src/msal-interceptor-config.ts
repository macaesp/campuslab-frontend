import { MsalInterceptorConfiguration, ProtectedResourceScopes } from '@azure/msal-angular';
import { InteractionType } from '@azure/msal-browser';
import { environment } from './environments/environment';

export function msalInterceptorConfigFactory(): MsalInterceptorConfiguration {
  const protectedResourceMap = new Map<string, Array<string | ProtectedResourceScopes> | null>();

  // Aquí le decimos a MSAL: "A cualquier petición que vaya a http://localhost:8080/api/*,
  // inyéctale el Bearer Token en los headers"
  protectedResourceMap.set(`${environment.apiUrl}/api/*`, [
    // IMPORTANTE: Reemplaza esto con el App ID URI / Scope que expusiste en Azure AD para tu API.
    // Suele verse como 'api://<TU_API_CLIENT_ID>/access_as_user' o similar.
    `api://${environment.azure.clientId}/access_as_user`,
  ]);

  return {
    interactionType: InteractionType.Redirect, // Si el token expira, redirige al login silenciosamente
    protectedResourceMap,
  };
}
