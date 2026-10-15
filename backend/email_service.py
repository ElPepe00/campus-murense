# backend/email_service.py
import os
import json
import logging
import smtplib
import ssl
import urllib.request
import urllib.error
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from typing import List, Dict, Any, Optional

log = logging.getLogger(__name__)

# Configuració des de variables d'entorn
RESEND_API_KEY = os.getenv("RESEND_API_KEY")
SMTP_HOST = os.getenv("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER = os.getenv("SMTP_USER", "campuscdmurense@gmail.com")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD")
EMAIL_FROM = os.getenv("EMAIL_FROM", f"Campus C.D. Murense <{SMTP_USER}>")
APP_URL = os.getenv("APP_URL", "http://localhost:5173").rstrip("/")

SETMANES_NOMS = {
    1: "Setmana 1: 28 Juny - 2 Juliol 2027",
    2: "Setmana 2: 5 Juliol - 9 Juliol 2027",
    3: "Setmana 3: 12 Juliol - 16 Juliol 2027",
    4: "Setmana 4: 19 Juliol - 23 Juliol 2027",
}


def _send_via_resend(to_email: str, subject: str, html_body: str, text_body: str) -> bool:
    """Envia el correu electrònic mitjançant l'API REST oficial de Resend."""
    try:
        url = "https://api.resend.com/emails"
        headers = {
            "Authorization": f"Bearer {RESEND_API_KEY}",
            "Content-Type": "application/json",
            "User-Agent": "CampusMurense/1.0"
        }
        payload = {
            "from": EMAIL_FROM if "onboarding@resend.dev" not in EMAIL_FROM and "<" in EMAIL_FROM else f"Campus C.D. Murense <onboarding@resend.dev>",
            "to": [to_email],
            "subject": subject,
            "html": html_body,
            "text": text_body
        }
        # Si tenim un domini verificat a Resend
        if os.getenv("RESEND_FROM_EMAIL"):
            payload["from"] = os.getenv("RESEND_FROM_EMAIL")

        req = urllib.request.Request(url, data=json.dumps(payload).encode("utf-8"), headers=headers, method="POST")
        with urllib.request.urlopen(req, timeout=10) as response:
            if response.status in (200, 201):
                log.info(f"[Resend] Correu enviat correctament a {to_email}")
                return True
            else:
                log.warning(f"[Resend] Codi de resposta no esperat: {response.status}")
                return False
    except urllib.error.HTTPError as e:
        err_body = e.read().decode("utf-8", errors="ignore")
        log.error(f"[Resend] Error HTTP enviant correu a {to_email}: {e.code} - {err_body}")
        return False
    except Exception as e:
        log.error(f"[Resend] Error enviant correu a {to_email}: {e}")
        return False


def _send_via_smtp(to_email: str, subject: str, html_body: str, text_body: str) -> bool:
    """Envia el correu electrònic via SMTP directe (ex: Gmail amb App Password)."""
    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = EMAIL_FROM
        msg["To"] = to_email

        part_text = MIMEText(text_body, "plain", "utf-8")
        part_html = MIMEText(html_body, "html", "utf-8")
        msg.attach(part_text)
        msg.attach(part_html)

        if SMTP_PORT == 465:
            context = ssl.create_default_context()
            with smtplib.SMTP_SSL(SMTP_HOST, SMTP_PORT, context=context, timeout=15) as server:
                if SMTP_PASSWORD:
                    server.login(SMTP_USER, SMTP_PASSWORD)
                server.sendmail(SMTP_USER, [to_email], msg.as_string())
        else:
            with smtplib.SMTP(SMTP_HOST, SMTP_PORT, timeout=15) as server:
                server.ehlo()
                context = ssl.create_default_context()
                server.starttls(context=context)
                server.ehlo()
                if SMTP_PASSWORD:
                    server.login(SMTP_USER, SMTP_PASSWORD)
                server.sendmail(SMTP_USER, [to_email], msg.as_string())

        log.info(f"[SMTP] Correu enviat satisfactòriament a {to_email}")
        return True
    except Exception as e:
        log.error(f"[SMTP] Error enviant correu a {to_email}: {e}")
        return False


def send_email(to_email: str, subject: str, html_body: str, text_body: str) -> bool:
    """
    Fa l'enviament de correu prioritzant Resend si hi ha API key,
    o bé SMTP de Gmail/FastAPI si hi ha credencials SMTP.
    Si cap d'ells està configurat (entorn de desenvolupament o proves),
    mostra el contingut per consola sense interrompre el flux.
    """
    if RESEND_API_KEY:
        success = _send_via_resend(to_email, subject, html_body, text_body)
        if success:
            return True
        log.warning("[Resend ha fallat, intentant fallback a SMTP si disponible...]")

    if SMTP_PASSWORD:
        return _send_via_smtp(to_email, subject, html_body, text_body)

    # Mode fallback de desenvolupament / simulació
    log.info(
        f"\n======================================================\n"
        f" [SIMULACIÓ CORREU ELECTRÒNIC] (Ni RESEND_API_KEY ni SMTP_PASSWORD definits)\n"
        f" Destinatari: {to_email}\n"
        f" Assumpte: {subject}\n"
        f"------------------------------------------------------\n"
        f"{text_body}\n"
        f"======================================================\n"
    )
    return True


def send_confirmation_email(
    to_email: str,
    tutor_nom: str,
    jugador_nom: str,
    dni_jugador: str,
    setmana_num: int,
    dinar_dies: List[str],
    intolerancies: Optional[str],
    excursio1: bool,
    excursio2: bool,
    descompte_nom: str,
    preu_base: float,
    descompte_quantitat: float,
    dinar_cost: float,
    excursions_cost: float,
    preu_total: float,
    edit_token: str,
    talla_roba: str = "8-10",
    base_url: Optional[str] = None
) -> bool:
    """
    Envia el correu oficial de confirmació d'inscripció amb tot el desglossament,
    instruccions de pagament, data límit (10/06/2027) i enllaç segur de modificació.
    """
    root_url = (base_url or APP_URL).rstrip("/")
    edit_url = f"{root_url}/modificar-inscripcio?token={edit_token}"
    setmana_text = SETMANES_NOMS.get(setmana_num, f"Setmana {setmana_num}")

    num_dies_dinar = len(dinar_dies)
    dies_dinar_text = ", ".join(dinar_dies) if dinar_dies else "Cap dia seleccionat"
    
    excursions_list = []
    if excursio1:
        excursions_list.append("Excursió 30/06/2027 (+15 €)")
    if excursio2:
        excursions_list.append("Excursió 07/07/2027 (+15 €)")
    excursions_text = " • ".join(excursions_list) if excursions_list else "Cap excursió seleccionada"

    subject = f"Confirmació d'Inscripció Campus C.D. Murense 2027 - {jugador_nom}"

    # Versió Text Pla
    text_content = f"""Hola {tutor_nom},

Hem rebut correctament la inscripció de {jugador_nom} per al Campus d'Estiu C.D. Murense 2027!

RESUM DE LA INSCRIPCIÓ:
- Jugador/a: {jugador_nom} (DNI: {dni_jugador})
- Talla de roba: {talla_roba}
- Setmana contractada: {setmana_text}
- Servei de Dinar: {num_dies_dinar} dies ({dies_dinar_text})
- Intoleràncies alimentàries: {intolerancies or "Cap"}
- Sortides / Excursions: {excursions_text}

DESGLOSSAMENT ECONÒMIC:
- Preu Base Setmana: {preu_base:.2f} €
- Descompte ({descompte_nom}): -{descompte_quantitat:.2f} €
- Servei Dinar ({num_dies_dinar} dies x 8 €): +{dinar_cost:.2f} €
- Excursions: +{excursions_cost:.2f} €
--------------------------------------------
TOTAL A PAGAR: {preu_total:.2f} €

INSTRUCCIONS DE PAGAMENT:
Per a formalitzar i garantir la plaça, cal realitzar el pagament abans del 10/06/2027:
1. Transferència bancària:
   - Entitat: Caixa Colonya / CaixaBank
   - Titular: Club Esportiu C.D. Murense
   - IBAN: ES93 2056 0016 0520 8320 6827
   - Concepte OBLIGATORI: CAMPUS {dni_jugador} {jugador_nom}
2. O presencialment a les oficines del camp de futbol (Dilluns i Dimecres de 18:30h a 20:00h).

MODIFICACIÓ DE LA INSCRIPCIÓ:
Si necessites modificar dies de dinar, autoritzacions o dades de contacte, pots fer-ho directament sense contrasenya a través del següent enllaç (actiu fins al 10/06/2027):
{edit_url}

Moltes gràcies per la vostra confiança!
Equip de Coordinació del C.D. Murense
campuscdmurense@gmail.com
"""

    # Versió HTML moderna amb branding del C.D. Murense
    html_content = f"""<!DOCTYPE html>
<html lang="ca">
<head>
  <meta charset="UTF-8">
  <title>{subject}</title>
  <style>
    body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9; margin: 0; padding: 24px; color: #1e293b; }}
    .container {{ max-width: 620px; margin: 0 auto; background: #ffffff; border-radius: 14px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06); border: 1px solid #e2e8f0; }}
    .header {{ background: linear-gradient(135deg, #b91c1c 0%, #991b1b 100%); color: #ffffff; padding: 32px 28px; text-align: center; }}
    .header h1 {{ margin: 0 0 6px 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px; }}
    .header p {{ margin: 0; font-size: 14px; opacity: 0.92; }}
    .body-content {{ padding: 28px; }}
    .alert-success {{ background: #f0fdf4; border-left: 4px solid #16a34a; padding: 14px 16px; border-radius: 6px; margin-bottom: 24px; font-size: 14px; color: #166534; }}
    .section-title {{ font-size: 15px; font-weight: 700; color: #0f172a; border-bottom: 2px solid #f1f5f9; padding-bottom: 8px; margin: 24px 0 14px 0; text-transform: uppercase; letter-spacing: 0.5px; }}
    .info-table {{ width: 100%; border-collapse: collapse; margin-bottom: 18px; }}
    .info-table td {{ padding: 8px 0; font-size: 14px; border-bottom: 1px dashed #e2e8f0; }}
    .info-table td.label {{ color: #64748b; font-weight: 500; width: 45%; }}
    .info-table td.value {{ color: #0f172a; font-weight: 600; text-align: right; }}
    .total-banner {{ background: #f8fafc; border: 2px solid #b91c1c; border-radius: 10px; padding: 16px 20px; display: flex; justify-content: space-between; align-items: center; margin: 24px 0; text-align: right; }}
    .total-label {{ font-size: 15px; font-weight: 700; color: #0f172a; display: block; }}
    .total-amount {{ font-size: 26px; font-weight: 800; color: #b91c1c; }}
    .bank-box {{ background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 10px; padding: 18px 20px; margin: 20px 0; }}
    .bank-box h3 {{ margin: 0 0 10px 0; font-size: 15px; color: #1e3a8a; }}
    .bank-box p {{ margin: 4px 0; font-size: 13.5px; color: #1e40af; }}
    .btn-edit {{ display: inline-block; background: #b91c1c; color: #ffffff !important; text-decoration: none; padding: 13px 26px; border-radius: 8px; font-weight: 700; font-size: 14px; text-align: center; margin: 12px 0 6px 0; }}
    .footer {{ background: #f8fafc; padding: 20px 28px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; }}
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
        ⚽ <strong>Inscripció Registrada!</strong> Hola {tutor_nom}, hem rebut correctament la sol·licitud per a <strong>{jugador_nom}</strong>.
      </div>

      <div class="section-title">Resum del Jugador/a i Serveis</div>
      <table class="info-table">
        <tr>
          <td class="label">Nom de l'infant:</td>
          <td class="value">{jugador_nom}</td>
        </tr>
        <tr>
          <td class="label">DNI / NIE:</td>
          <td class="value">{dni_jugador}</td>
        </tr>
        <tr>
          <td class="label">Talla camiseta oficial:</td>
          <td class="value">{talla_roba}</td>
        </tr>
        <tr>
          <td class="label">Setmana contractada:</td>
          <td class="value">{setmana_text}</td>
        </tr>
        <tr>
          <td class="label">Servei de Dinar (8 €/dia):</td>
          <td class="value">{num_dies_dinar} dies ({dies_dinar_text})</td>
        </tr>
        {"<tr><td class='label'>Intoleràncies Dinar:</td><td class='value'>" + (intolerancies or "Cap") + "</td></tr>" if num_dies_dinar > 0 else ""}
        <tr>
          <td class="label">Sortides i Excursions:</td>
          <td class="value">{excursions_text}</td>
        </tr>
      </table>

      <div class="section-title">Desglossament Econòmic</div>
      <table class="info-table">
        <tr>
          <td class="label">Preu Base 1 Setmana:</td>
          <td class="value">{preu_base:.2f} €</td>
        </tr>
        {"<tr><td class='label'>Descompte (" + descompte_nom + "):</td><td class='value' style='color:#16a34a;'>-" + f"{descompte_quantitat:.2f}" + " €</td></tr>" if descompte_quantitat > 0 else ""}
        <tr>
          <td class="label">Servei Dinar ({num_dies_dinar} dies x 8 €):</td>
          <td class="value">+{dinar_cost:.2f} €</td>
        </tr>
        {"<tr><td class='label'>Excursions seleccionades:</td><td class='value'>+" + f"{excursions_cost:.2f}" + " €</td></tr>" if excursions_cost > 0 else ""}
      </table>

      <div style="background:#f8fafc; border:2px solid #b91c1c; border-radius:10px; padding:16px 20px; text-align:right; margin:20px 0;">
        <span style="font-size:14px; font-weight:700; color:#64748b; display:block;">IMPORT TOTAL A PAGAR:</span>
        <span style="font-size:28px; font-weight:900; color:#b91c1c;">{preu_total:.2f} €</span>
      </div>

      <div class="bank-box">
        <h3>🏦 Instruccions per al Pagament (Data Límit: 10/06/2027)</h3>
        <p><strong>1. Transferència bancària:</strong></p>
        <p>• Entitat: <strong>Caixa Colonya / CaixaBank</strong></p>
        <p>• Titular: <strong>Club Esportiu C.D. Murense</strong></p>
        <p>• IBAN: <strong style="letter-spacing:0.5px;">ES93 2056 0016 0520 8320 6827</strong></p>
        <p>• Concepte <strong>OBLIGATORI</strong>: <span style="background:#dbeafe; padding:2px 6px; border-radius:4px; font-weight:700;">CAMPUS {dni_jugador} {jugador_nom}</span></p>
        <p style="margin-top:10px;"><strong>2. Pagament presencial:</strong> En efectiu o targeta a les oficines del camp de futbol (Dilluns i Dimecres 18:30h - 20:00h).</p>
      </div>

      <div class="section-title">Modificació Directa de la Inscripció</div>
      <p style="font-size:13.5px; color:#475569; margin:0 0 14px 0;">
        Si necessites ajustar els dies de dinar, les autoritzacions o les teves dades de contacte abans del <strong>10/06/2027</strong>, pots accedir directament a través d'aquest enllaç segur sense haver de recordar contrasenyes:
      </p>
      <div style="text-align:center;">
        <a href="{edit_url}" class="btn-edit" target="_blank">Modificar la meva inscripció</a>
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
</html>
"""

    return send_email(to_email, subject, html_content, text_content)


def send_bulk_admin_email(
    recipients: List[Dict[str, str]],
    subject: str,
    message_body: str
) -> Dict[str, Any]:
    """
    Envia comunicats massius des del panell admin als tutors inscrits.
    Permet placeholders com [NOM_TUTOR] i [NOM_INFANT].
    """
    sent_count = 0
    failed_count = 0
    errors = []

    for item in recipients:
        tutor_email = item.get("email")
        tutor_nom = item.get("nom_tutor", "Família")
        jugador_nom = item.get("nom_jugador", "el teu fill/a")

        if not tutor_email:
            continue

        personalized_body = (
            message_body
            .replace("[NOM_TUTOR]", tutor_nom)
            .replace("[NOM_INFANT]", jugador_nom)
            .replace("[NOM_JUGADOR]", jugador_nom)
        )

        html_body = f"""<!DOCTYPE html>
<html lang="ca">
<head>
  <meta charset="UTF-8">
  <title>{subject}</title>
</head>
<body style="font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color:#f8fafc; padding:24px; color:#1e293b; margin:0;">
  <div style="max-width:600px; margin:0 auto; background:#ffffff; border-radius:12px; overflow:hidden; border:1px solid #e2e8f0;">
    <div style="background:#b91c1c; color:#ffffff; padding:24px 28px; text-align:center;">
      <h2 style="margin:0; font-size:20px; font-weight:800;">C.D. MURENSE • CAMPUS D'ESTIU 2027</h2>
      <p style="margin:4px 0 0; font-size:13px; opacity:0.9;">Comunicat Oficial de Coordinació</p>
    </div>
    <div style="padding:28px; font-size:14.5px; line-height:1.6;">
      <p>Hola <strong>{tutor_nom}</strong>,</p>
      <div style="white-space:pre-wrap; color:#334155; margin:18px 0; background:#f8fafc; padding:16px 20px; border-radius:8px; border-left:4px solid #b91c1c;">
{personalized_body}
      </div>
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
</html>
"""

        ok = send_email(tutor_email, subject, html_body, personalized_body)
        if ok:
            sent_count += 1
        else:
            failed_count += 1
            errors.append(f"Error enviant a {tutor_email}")

    return {
        "status": "ok",
        "total": len(recipients),
        "sent": sent_count,
        "failed": failed_count,
        "errors": errors
    }
