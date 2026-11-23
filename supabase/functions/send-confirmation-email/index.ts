import { corsHeaders, escapeHtml, getSupabaseAdmin, jsonResponse, sendViaResend } from '../_shared/resend.ts';

const SETMANES_NOMS: Record<number, string> = {
  1: 'Setmana 1: 28 Juny - 2 Juliol 2027',
  2: 'Setmana 2: 5 Juliol - 9 Juliol 2027',
  3: 'Setmana 3: 12 Juliol - 16 Juliol 2027',
  4: 'Setmana 4: 19 Juliol - 23 Juliol 2027',
};

function parseDiesDinar(raw: unknown): string[] {
  if (Array.isArray(raw)) return raw.map(String);
  if (typeof raw === 'string' && raw.trim()) {
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed.map(String) : [];
    } catch {
      return [];
    }
  }
  return [];
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { inscripcioId, appUrl } = await req.json();
    if (!inscripcioId) {
      return jsonResponse({ error: 'Falta inscripcioId' }, 400);
    }

    const supabase = getSupabaseAdmin();
    const { data: insc, error: inscErr } = await supabase
      .from('inscripcions')
      .select('*, jugadors(*, tutors(*))')
      .eq('id', Number(inscripcioId))
      .single();

    if (inscErr || !insc) {
      return jsonResponse({ error: 'Inscripció no trobada' }, 404);
    }

    const jugador = insc.jugadors;
    const tutor = jugador?.tutors;
    const toEmail = tutor?.email?.trim();

    if (!toEmail) {
      return jsonResponse({ error: 'El tutor no té correu electrònic registrat' }, 400);
    }

    const tutorNom = tutor?.nom_complet || 'Família';
    const jugadorNom = jugador?.nom_complet || 'Jugador/a';
    const dniJugador = jugador?.dni || 'N/A';
    const tallaRoba = jugador?.talla_camiseta || '8-10';
    const setmanaNum = Number(insc.setmana_seleccionada) || 1;
    const setmanaText = SETMANES_NOMS[setmanaNum] || `Setmana ${setmanaNum}`;
    const dinarDies = parseDiesDinar(insc.dinar_dies);
    const numDiesDinar = insc.dinar_dies_total ?? dinarDies.length;
    const diesDinarText = dinarDies.length > 0 ? dinarDies.join(', ') : 'Cap dia seleccionat';
    const intolerancies = insc.intolerancies_menjador || 'Cap';

    const exc1 = Boolean(insc.excursio_30_06);
    const exc2 = Boolean(insc.excursio_07_07);
    const excursionsList: string[] = [];
    if (exc1) excursionsList.push('Excursió 30/06/2027 (+15 €)');
    if (exc2) excursionsList.push('Excursió 07/07/2027 (+15 €)');
    const excursionsText = excursionsList.length > 0 ? excursionsList.join(' • ') : 'Cap excursió seleccionada';

    const preuBase = 110;
    const descompteEnum = String(insc.descompte_aplicat || 'CAP');
    const descompteNom =
      descompteEnum === 'MURENSE'
        ? 'Soci / Jugador C.D. Murense (10%)'
        : descompteEnum === 'FAMILIA_NOMBROSA'
        ? 'Família Nombrosa / Germans (10%)'
        : 'Cap';
    const descompteQuantitat = descompteEnum === 'MURENSE' || descompteEnum === 'FAMILIA_NOMBROSA' ? 11 : 0;
    const dinarCost = numDiesDinar * 8;
    const excursionsCost = (exc1 ? 15 : 0) + (exc2 ? 15 : 0);
    const preuTotal = Number(insc.preu_total) || preuBase - descompteQuantitat + dinarCost + excursionsCost;

    const rootUrl = String(appUrl || Deno.env.get('APP_URL') || 'https://campus-murense.vercel.app').replace(/\/+$/, '');
    const editUrl = `${rootUrl}/modificar-inscripcio?token=${encodeURIComponent(String(insc.edit_token || ''))}`;
    const subject = `Confirmació d'Inscripció Campus C.D. Murense 2027 - ${jugadorNom}`;

    const text = `Hola ${tutorNom},

Hem rebut correctament la inscripció de ${jugadorNom} per al Campus d'Estiu C.D. Murense 2027!

RESUM DE LA INSCRIPCIÓ:
- Jugador/a: ${jugadorNom} (DNI: ${dniJugador})
- Talla de roba: ${tallaRoba}
- Setmana contractada: ${setmanaText}
- Servei de Dinar: ${numDiesDinar} dies (${diesDinarText})
- Intoleràncies alimentàries: ${intolerancies}
- Sortides / Excursions: ${excursionsText}

DESGLOSSAMENT ECONÒMIC:
- Preu Base Setmana: ${preuBase.toFixed(2)} €
- Descompte (${descompteNom}): -${descompteQuantitat.toFixed(2)} €
- Servei Dinar (${numDiesDinar} dies x 8 €): +${dinarCost.toFixed(2)} €
- Excursions: +${excursionsCost.toFixed(2)} €
--------------------------------------------
TOTAL A PAGAR: ${preuTotal.toFixed(2)} €

INSTRUCCIONS DE PAGAMENT (Data límit: 10/06/2027):
1. Transferència bancària:
   - Entitat: Caixa Colonya / CaixaBank
   - Titular: Club Esportiu C.D. Murense
   - IBAN: ES93 2056 0016 0520 8320 6827
   - Concepte OBLIGATORI: CAMPUS ${dniJugador} ${jugadorNom}
2. O presencialment a les oficines del camp de futbol (Dilluns i Dimecres de 18:30h a 20:00h).

MODIFICACIÓ DE LA INSCRIPCIÓ (fins al 10/06/2027):
${editUrl}

Moltes gràcies per la vostra confiança!
Equip de Coordinació del C.D. Murense
campuscdmurense@gmail.com`;

    const html = `<!DOCTYPE html>
<html lang="ca">
<head>
  <meta charset="UTF-8">
  <title>${escapeHtml(subject)}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9; margin: 0; padding: 24px; color: #1e293b; }
    .container { max-width: 620px; margin: 0 auto; background: #ffffff; border-radius: 14px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06); border: 1px solid #e2e8f0; }
    .header { background: linear-gradient(135deg, #b91c1c 0%, #991b1b 100%); color: #ffffff; padding: 32px 28px; text-align: center; }
    .header h1 { margin: 0 0 6px 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px; }
    .header p { margin: 0; font-size: 14px; opacity: 0.92; }
    .body-content { padding: 28px; }
    .alert-success { background: #f0fdf4; border-left: 4px solid #16a34a; padding: 14px 16px; border-radius: 6px; margin-bottom: 24px; font-size: 14px; color: #166534; }
    .section-title { font-size: 15px; font-weight: 700; color: #0f172a; border-bottom: 2px solid #f1f5f9; padding-bottom: 8px; margin: 24px 0 14px 0; text-transform: uppercase; letter-spacing: 0.5px; }
    .info-table { width: 100%; border-collapse: collapse; margin-bottom: 18px; }
    .info-table td { padding: 8px 0; font-size: 14px; border-bottom: 1px dashed #e2e8f0; }
    .info-table td.label { color: #64748b; font-weight: 500; width: 45%; }
    .info-table td.value { color: #0f172a; font-weight: 600; text-align: right; }
    .bank-box { background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 10px; padding: 18px 20px; margin: 20px 0; }
    .bank-box h3 { margin: 0 0 10px 0; font-size: 15px; color: #1e3a8a; }
    .bank-box p { margin: 4px 0; font-size: 13.5px; color: #1e40af; }
    .btn-edit { display: inline-block; background: #b91c1c; color: #ffffff !important; text-decoration: none; padding: 13px 26px; border-radius: 8px; font-weight: 700; font-size: 14px; text-align: center; margin: 12px 0 6px 0; }
    .footer { background: #f8fafc; padding: 20px 28px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>C.D. MURENSE • CAMPUS D'ESTIU 2027</h1>
      <p>Confirmació Oficial de Sol·licitud d'Inscripció</p>
    </div>
    <div class="body-content">
      <div class="alert-success">
        ⚽ <strong>Inscripció Registrada!</strong> Hola ${escapeHtml(tutorNom)}, hem rebut correctament la sol·licitud per a <strong>${escapeHtml(jugadorNom)}</strong>.
      </div>
      <div class="section-title">Resum del Jugador/a i Serveis</div>
      <table class="info-table">
        <tr><td class="label">Nom de l'infant:</td><td class="value">${escapeHtml(jugadorNom)}</td></tr>
        <tr><td class="label">DNI / NIE:</td><td class="value">${escapeHtml(dniJugador)}</td></tr>
        <tr><td class="label">Talla camiseta oficial:</td><td class="value">${escapeHtml(tallaRoba)}</td></tr>
        <tr><td class="label">Setmana contractada:</td><td class="value">${escapeHtml(setmanaText)}</td></tr>
        <tr><td class="label">Servei de Dinar (8 €/dia):</td><td class="value">${numDiesDinar} dies (${escapeHtml(diesDinarText)})</td></tr>
        ${numDiesDinar > 0 ? `<tr><td class="label">Intoleràncies Dinar:</td><td class="value">${escapeHtml(intolerancies)}</td></tr>` : ''}
        <tr><td class="label">Sortides i Excursions:</td><td class="value">${escapeHtml(excursionsText)}</td></tr>
      </table>
      <div class="section-title">Desglossament Econòmic</div>
      <table class="info-table">
        <tr><td class="label">Preu Base 1 Setmana:</td><td class="value">${preuBase.toFixed(2)} €</td></tr>
        ${descompteQuantitat > 0 ? `<tr><td class="label">Descompte (${escapeHtml(descompteNom)}):</td><td class="value" style="color:#16a34a;">-${descompteQuantitat.toFixed(2)} €</td></tr>` : ''}
        <tr><td class="label">Servei Dinar (${numDiesDinar} dies x 8 €):</td><td class="value">+${dinarCost.toFixed(2)} €</td></tr>
        ${excursionsCost > 0 ? `<tr><td class="label">Excursions seleccionades:</td><td class="value">+${excursionsCost.toFixed(2)} €</td></tr>` : ''}
      </table>
      <div style="background:#f8fafc; border:2px solid #b91c1c; border-radius:10px; padding:16px 20px; text-align:right; margin:20px 0;">
        <span style="font-size:14px; font-weight:700; color:#64748b; display:block;">IMPORT TOTAL A PAGAR:</span>
        <span style="font-size:28px; font-weight:900; color:#b91c1c;">${preuTotal.toFixed(2)} €</span>
      </div>
      <div class="bank-box">
        <h3>🏦 Instruccions per al Pagament (Data Límit: 10/06/2027)</h3>
        <p><strong>1. Transferència bancària:</strong></p>
        <p>• Entitat: <strong>Caixa Colonya / CaixaBank</strong></p>
        <p>• Titular: <strong>Club Esportiu C.D. Murense</strong></p>
        <p>• IBAN: <strong style="letter-spacing:0.5px;">ES93 2056 0016 0520 8320 6827</strong></p>
        <p>• Concepte <strong>OBLIGATORI</strong>: <span style="background:#dbeafe; padding:2px 6px; border-radius:4px; font-weight:700;">CAMPUS ${escapeHtml(dniJugador)} ${escapeHtml(jugadorNom)}</span></p>
        <p style="margin-top:10px;"><strong>2. Pagament presencial:</strong> En efectiu o targeta a les oficines del camp de futbol (Dilluns i Dimecres 18:30h - 20:00h).</p>
      </div>
      <div class="section-title">Modificació Directa de la Inscripció</div>
      <p style="font-size:13.5px; color:#475569; margin:0 0 14px 0;">
        Si necessites ajustar els dies de dinar, les autoritzacions o les teves dades de contacte abans del <strong>10/06/2027</strong>, pots accedir directament a través d'aquest enllaç segur sense haver de recordar contrasenyes:
      </p>
      <div style="text-align:center;">
        <a href="${escapeHtml(editUrl)}" class="btn-edit" target="_blank">Modificar la meva inscripció</a>
        <br>
        <span style="font-size:11.5px; color:#94a3b8;">Enllaç vàlid fins al 10 de juny de 2027</span>
      </div>
    </div>
    <div class="footer">
      <p style="margin:0 0 4px 0;">Club Esportiu C.D. Murense • Poliesportiu Municipal de Muro</p>
      <p style="margin:0;">Dubtes o consultes: <a href="mailto:campuscdmurense@gmail.com" style="color:#b91c1c;">campuscdmurense@gmail.com</a></p>
    </div>
  </div>
</body>
</html>`;

    const result = await sendViaResend({ to: toEmail, subject, html, text });
    if (!result.ok) {
      return jsonResponse({ status: 'error', sent: false, error: result.error }, 502);
    }

    return jsonResponse({ status: 'ok', sent: true, to: toEmail });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error intern';
    return jsonResponse({ status: 'error', sent: false, error: message }, 500);
  }
});
