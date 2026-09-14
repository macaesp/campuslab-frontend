export const environment = {
  production: false,
  allowRolePreview: false,
  apiUrl: 'http://localhost:8080', // URL base de ms-campuslab-bff
  azure: {
    // Debe coincidir con el permiso expuesto por la API en Entra ID.
    apiScope: 'api://d8793dbc-f7d6-4578-8867-e4a34d94977f/access_as_user',
    clientId: 'd8793dbc-f7d6-4578-8867-e4a34d94977f',
    tenantId: 'f3a39ecb-b323-42e2-bdda-f9b1bf8f81c9',
    authority: 'https://login.microsoftonline.com/f3a39ecb-b323-42e2-bdda-f9b1bf8f81c9',
    redirectUri: 'http://localhost:4200/',
  },
};
