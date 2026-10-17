import { copyFileSync, existsSync } from 'node:fs';

const directory = new URL('../dist/frontend-campuslab/browser/', import.meta.url);
const index = new URL('index.html', directory);
// Angular puede generar index.csr.html para rutas completamente de navegador.
if (!existsSync(index)) {
  copyFileSync(new URL('index.csr.html', directory), index);
}
console.log('Frontend estático listo en dist/frontend-campuslab/browser');
