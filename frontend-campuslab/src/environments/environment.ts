// Despliegue: ver CONEXIONES-EC2-VERCEL.md en la raíz del repositorio.
// Vercel: cambia apiUrl al HTTPS público del BFF y azure.redirectUri al dominio del frontend.
// No incluir secretos: este archivo se incorpora al navegador al compilar.
export const environment = {
  production: true,
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

