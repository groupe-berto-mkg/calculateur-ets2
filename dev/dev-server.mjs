// Serveur local pour tester la page et /api/lead sans compte Vercel : `node dev/dev-server.mjs`.
// Une fausse API Sarbacane est servie sur /mock/v1 : les contacts reçus sont affichés dans la console, rien n'est envoyé à l'extérieur.
import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = join(fileURLToPath(import.meta.url), '..', '..');
const port = Number(process.env.PORT) || 3000;
const types = { '.html': 'text/html; charset=utf-8', '.png': 'image/png', '.js': 'text/javascript', '.json': 'application/json' };

Object.assign(process.env, {
  SARBACANE_ACCOUNT_ID: process.env.SARBACANE_ACCOUNT_ID || 'compte-test', SARBACANE_API_KEY: process.env.SARBACANE_API_KEY || 'cle-test',
  SARBACANE_LIST_ID: process.env.SARBACANE_LIST_ID || 'liste-test',
  SARBACANE_FIELDS: process.env.SARBACANE_FIELDS || '{"prenom":"f1","nom":"f2","societe":"f3","siret":"f4","fonction":"f5","km":"f6","conso":"f7","prix":"f8","transition":"f9","source":"f10"}',
  SARBACANE_API_URL: process.env.SARBACANE_API_URL || `http://localhost:${port}/mock/v1`,
});

const readBody = req => new Promise(ok => { let s = ''; req.on('data', c => s += c); req.on('end', () => ok(s)); });

http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${port}`);
  res.status = c => (res.statusCode = c, res);
  res.json = o => (res.setHeader('Content-Type', 'application/json'), res.end(JSON.stringify(o)));
  try {
    if (url.pathname.startsWith('/mock/v1/')) {
      console.log('[mock Sarbacane]', req.method, url.pathname, 'en-têtes:', Object.keys(req.headers).filter(h => ['accountid', 'apikey'].includes(h)).join(','), '\n', await readBody(req));
      return res.json({ id: 'contact-test' });
    }
    if (url.pathname === '/api/lead') {
      req.body = JSON.parse((await readBody(req)) || '{}');
      return (await import(pathToFileURL(join(root, 'api', 'lead.js')))).default(req, res);
    }
    if (url.pathname === '/embed-test') { // page hôte factice pour tester l'intégration
      res.setHeader('Content-Type', types['.html']);
      return res.end(await readFile(join(root, 'dev', 'embed-test.html')));
    }
    const path = url.pathname === '/' ? '/index.html' : decodeURIComponent(url.pathname);
    const file = join(root, normalize(path));
    if (!file.startsWith(root) || file.includes(`${join(root, 'api')}`) || file.includes(`${join(root, 'dev')}`)) return res.status(404).end();
    res.setHeader('Content-Type', types[extname(file)] || 'application/octet-stream');
    res.end(await readFile(file));
  } catch (e) { res.status(e.code === 'ENOENT' ? 404 : 500).end(e.code === 'ENOENT' ? 'Introuvable' : 'Erreur'); console.error(e.message); }
}).listen(port, () => console.log(`http://localhost:${port}`));
