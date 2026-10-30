// Reçoit la demande de rappel et la transmet à la liste Sarbacane (création ou mise à jour du contact).
// Variables d'environnement Vercel :
//   SARBACANE_ACCOUNT_ID, SARBACANE_API_KEY  identifiants de l'API Sarbacane Contacts
//   SARBACANE_LIST_ID                        liste « ETS 2 – Calculette »
//   SARBACANE_FIELDS                         JSON : nom de la donnée -> identifiant du champ Sarbacane,
//                                            clés : prenom, nom, societe, siret, fonction, km, conso, prix, transition, source, suivi, suiviDate
//                                            « suivi » et « suiviDate » : colonnes pixelOptin et pixelOptinAt, renseignées si la case facultative est cochée
//   SARBACANE_API_URL (facultatif)           par défaut https://sarbacaneapis.com/v1
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const clean = (v, max = 200) => String(v ?? '').replace(/[\u0000-\u001f]/g, ' ').trim().slice(0, max);

const num = v => { const x = Number(v); return Number.isFinite(x) && x >= 0 ? x : undefined; };
// Numéro au format international, tel qu'attendu par Sarbacane : 01 02 03 04 05 -> +33102030405
const intlPhone = raw => { const p = raw.replace(/[\s.-]/g, ''); return /^0\d{9}$/.test(p) ? '+33' + p.slice(1) : /^00\d+$/.test(p) ? '+' + p.slice(2) : p; };

export default async function handler(req, res) {
  if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return res.status(405).json({ error: 'method_not_allowed' }); }
  const b = req.body && typeof req.body === 'object' ? req.body : {};

  if (clean(b.website)) return res.status(200).json({ ok: true }); // champ piège : on fait semblant d'accepter

  const d = {
    prenom: clean(b.prenom), nom: clean(b.nom), societe: clean(b.societe), siret: clean(b.siret, 14).replace(/\s/g, ''),
    fonction: clean(b.fonction), email: clean(b.email).toLowerCase(), tel: clean(b.tel, 30),
    km: num(b.sim?.km), conso: clean(b.sim?.conso, 6), prix: num(b.sim?.price), transition: clean(b.sim?.share, 3), // km et prix : colonnes de type numéro
    source: clean(b.source) || 'direct',
  };
  if (!d.prenom || !d.nom || !d.societe || !d.fonction || !/^\d{14}$/.test(d.siret) || !EMAIL.test(d.email) || !/^[+\d][\d\s.-]{7,}$/.test(d.tel))
    return res.status(400).json({ error: 'invalid' });
  // Case facultative « actualités + mesure d'ouverture » : seuls les « oui » sont enregistrés, avec la date, côté serveur
  if (b.news === true) { d.suivi = true; d.suiviDate = new Date().toISOString(); }

  const { SARBACANE_ACCOUNT_ID: account, SARBACANE_API_KEY: key, SARBACANE_LIST_ID: list } = process.env;
  if (!account || !key || !list) { console.error('[lead] variables Sarbacane manquantes'); return res.status(503).json({ error: 'not_configured' }); }

  let map = {};
  try { map = JSON.parse(process.env.SARBACANE_FIELDS || '{}'); } catch { console.error('[lead] SARBACANE_FIELDS illisible'); }
  const body = { email: d.email, phone: intlPhone(d.tel) };
  for (const [name, fieldId] of Object.entries(map)) if (d[name] !== undefined && d[name] !== '') body[fieldId] = d[name];

  try {
    const base = process.env.SARBACANE_API_URL || 'https://sarbacaneapis.com/v1';
    const r = await fetch(`${base}/lists/${encodeURIComponent(list)}/contacts/upsert`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', accountId: account, apiKey: key }, body: JSON.stringify(body),
    });
    if (!r.ok) { console.error('[lead] Sarbacane a répondu', r.status, (await r.text()).slice(0, 300)); return res.status(502).json({ error: 'upstream' }); }
    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error('[lead] échec de l\'appel Sarbacane', e.message);
    return res.status(502).json({ error: 'upstream' });
  }
}
