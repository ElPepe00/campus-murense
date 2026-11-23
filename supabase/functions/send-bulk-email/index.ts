import { corsHeaders, escapeHtml, getSupabaseAdmin, jsonResponse, sendViaResend } from '../_shared/resend.ts';

interface RecipientInfo {
  email: string;
  tutorNom: string;
  jugadorNom: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return jsonResponse({ error: 'No autoritzat' }, 401);
    }

    const supabase = getSupabaseAdmin();
    const token = authHeader.replace('Bearer ', '').trim();
    const { data: userData, error: authErr } = await supabase.auth.getUser(token);
    if (authErr || !userData?.user) {
      return jsonResponse({ error: 'Sessió no vàlida' }, 401);
    }

    const body = await req.json();
    const subject = String(body.assumpte || '').trim();
    const messageBody = String(body.missatge || '').trim();

    if (!subject || !messageBody) {
      return jsonResponse({ error: 'L\'assumpte i el missatge són obligatoris' }, 400);
    }

    const [inscRes, jugRes, tutRes] = await Promise.all([
      supabase.from('inscripcions').select('*'),
      supabase.from('jugadors').select('id, nom_complet, tutor_id'),
      supabase.from('tutors').select('id, nom_complet, email'),
    ]);

    const jugadorsMap = new Map((jugRes.data || []).map((j) => [j.id, j]));
    const tutorsMap = new Map((tutRes.data || []).map((t) => [t.id, t]));

    let inscrits = inscRes.data || [];
    if (body.filter_grup && body.filter_grup !== 'Tots') {
      inscrits = inscrits.filter((i) => i.grup_assignat === body.filter_grup);
    }
    if (body.filter_setmana) {
      inscrits = inscrits.filter((i) => i.setmana_seleccionada === Number(body.filter_setmana));
    }
    if (body.filter_estat_pagament && body.filter_estat_pagament !== 'Tots') {
      inscrits = inscrits.filter((i) => i.estat_pagament === body.filter_estat_pagament);
    }

    const recipientsMap = new Map<string, RecipientInfo>();
    for (const insc of inscrits) {
      const jug = jugadorsMap.get(insc.jugador_id);
      const tut = jug?.tutor_id ? tutorsMap.get(jug.tutor_id) : null;
      const email = tut?.email?.toLowerCase().trim();
      if (email && !recipientsMap.has(email)) {
        recipientsMap.set(email, {
          email,
          tutorNom: tut?.nom_complet || 'Família',
          jugadorNom: jug?.nom_complet || 'el teu fill/a',
        });
      }
    }

    const recipients = Array.from(recipientsMap.values());
    let sent = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const item of recipients) {
      const personalizedText = messageBody
        .replaceAll('[NOM_TUTOR]', item.tutorNom)
        .replaceAll('[NOM_INFANT]', item.jugadorNom)
        .replaceAll('[NOM_JUGADOR]', item.jugadorNom);

      const html = `<!DOCTYPE html>
<html lang="ca">
<head><meta charset="UTF-8"><title>${escapeHtml(subject)}</title></head>
<body style="font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color:#f8fafc; padding:24px; color:#1e293b; margin:0;">
  <div style="max-width:600px; margin:0 auto; background:#ffffff; border-radius:12px; overflow:hidden; border:1px solid #e2e8f0;">
    <div style="background:#b91c1c; color:#ffffff; padding:24px 28px; text-align:center;">
      <h2 style="margin:0; font-size:20px; font-weight:800;">C.D. MURENSE • CAMPUS D'ESTIU 2027</h2>
      <p style="margin:4px 0 0; font-size:13px; opacity:0.9;">Comunicat Oficial de Coordinació</p>
    </div>
    <div style="padding:28px; font-size:14.5px; line-height:1.6;">
      <p>Hola <strong>${escapeHtml(item.tutorNom)}</strong>,</p>
      <div style="white-space:pre-wrap; color:#334155; margin:18px 0; background:#f8fafc; padding:16px 20px; border-radius:8px; border-left:4px solid #b91c1c;">${escapeHtml(personalizedText)}</div>
      <p style="margin-top:24px; font-size:13.5px; color:#64748b;">
        Salutacions cordials,<br>
        <strong>Equip de Monitors i Coordinació C.D. Murense</strong>
      </p>
    </div>
    <div style="background:#f1f5f9; padding:16px 24px; text-align:center; font-size:12px; color:#64748b;">
      Aquest missatge s'ha enviat als tutors registrats al Campus C.D. Murense 2027.<br>
      Contacte: campuscdmurense@gmail.com
    </div>
  </div>
</body>
</html>`;

      const res = await sendViaResend({ to: item.email, subject, html, text: personalizedText });
      if (res.ok) {
        sent++;
      } else {
        failed++;
        errors.push(`${item.email}: ${res.error}`);
      }
    }

    return jsonResponse({
      status: failed === 0 ? 'ok' : 'partial',
      total: recipients.length,
      sent,
      failed,
      errors,
      message: `Enviats ${sent} de ${recipients.length} correus.`,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error intern';
    return jsonResponse({ status: 'error', total: 0, sent: 0, failed: 0, error: message }, 500);
  }
});
