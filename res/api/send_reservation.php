<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false]);
    exit;
}

session_start();

$data = json_decode(file_get_contents('php://input'), true);

$ref        = htmlspecialchars($data['ref']        ?? '');
$nom        = htmlspecialchars($data['nom']        ?? 'Visiteur');
$email      = filter_var($data['email'] ?? '', FILTER_VALIDATE_EMAIL);
$date       = htmlspecialchars($data['date']       ?? '');
$creneau    = htmlspecialchars($data['creneau']    ?? '');
$type       = htmlspecialchars($data['type']       ?? '');
$langue     = htmlspecialchars($data['langue']     ?? '');
$oeuvres    = htmlspecialchars($data['oeuvres']    ?? '');
$visiteurs  = $data['visiteurs']  ?? [];   // [{label, qty, unitPrice, total}]
$total      = htmlspecialchars($data['total']      ?? '0');
$qr_url     = htmlspecialchars($data['qr_url']    ?? '');

if (!$email || !$ref) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Email ou référence manquant.']);
    exit;
}

/* ── Construction du tableau visiteurs ── */
$rows_html = '';
$rows_txt  = '';
foreach ($visiteurs as $v) {
    $label = htmlspecialchars($v['label']      ?? '');
    $qty   = intval($v['qty']                  ?? 0);
    $unit  = htmlspecialchars($v['unitPrice']  ?? '');
    $tot   = htmlspecialchars($v['total']      ?? '');
    $rows_html .= "
      <tr>
        <td style='padding:6px 12px;color:#4a3728;font-family:Georgia,serif'>{$qty} × {$label}</td>
        <td style='padding:6px 12px;color:#8a6a50;font-family:Arial,sans-serif;font-size:13px'>{$unit} / pers.</td>
        <td style='padding:6px 12px;color:#c1440e;font-family:Georgia,serif;text-align:right'>{$tot}</td>
      </tr>";
    $rows_txt .= "  {$qty} × {$label} — {$tot}\n";
}

/* ── Lignes optionnelles ── */
$opt_html = '';
$opt_txt  = '';
if ($langue) {
    $opt_html .= "<tr><td style='padding:6px 12px;color:#8a6a50;font-size:12px;letter-spacing:.1em;text-transform:uppercase;font-family:Arial,sans-serif'>Langue</td><td colspan='2' style='padding:6px 12px;color:#1a130a;font-family:Georgia,serif'>{$langue}</td></tr>";
    $opt_txt  .= "Langue        : {$langue}\n";
}
if ($oeuvres) {
    $opt_html .= "<tr><td style='padding:6px 12px;color:#8a6a50;font-size:12px;letter-spacing:.1em;text-transform:uppercase;font-family:Arial,sans-serif'>Œuvres souhaitées</td><td colspan='2' style='padding:6px 12px;color:#1a130a;font-family:Georgia,serif'>{$oeuvres}</td></tr>";
    $opt_txt  .= "Œuvres        : {$oeuvres}\n";
}
if ($creneau) {
    $opt_html = "<tr><td style='padding:6px 12px;color:#8a6a50;font-size:12px;letter-spacing:.1em;text-transform:uppercase;font-family:Arial,sans-serif'>Créneau</td><td colspan='2' style='padding:6px 12px;color:#1a130a;font-family:Georgia,serif'>{$creneau}</td></tr>" . $opt_html;
    $opt_txt  = "Créneau       : {$creneau}\n" . $opt_txt;
}

/* ── QR code image (service tiers, aucune dépendance) ── */
$qr_img_url = 'https://api.qrserver.com/v1/create-qr-code/?size=180x180&color=1a130a&bgcolor=faf6f0&data=' . urlencode($qr_url);

/* ════════════════════════════
   CORPS HTML
════════════════════════════ */
$html = <<<HTML
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><title>Réservation Musée FABI — {$ref}</title></head>
<body style="margin:0;padding:0;background:#f0ebe3;font-family:Arial,sans-serif">

<table width="100%" cellpadding="0" cellspacing="0" style="background:#f0ebe3;padding:32px 0">
<tr><td align="center">
<table width="580" cellpadding="0" cellspacing="0" style="background:#faf6f0;border-radius:4px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.12)">

  <!-- En-tête -->
  <tr>
    <td style="background:#1a130a;padding:32px 40px;text-align:center">
      <p style="margin:0;font-family:Arial,sans-serif;font-size:11px;letter-spacing:.4em;text-transform:uppercase;color:#c1440e">Musée FABI</p>
      <h1 style="margin:12px 0 0;font-family:Georgia,serif;font-size:26px;font-weight:400;color:#f0e8d8;letter-spacing:.06em">Votre réservation</h1>
    </td>
  </tr>

  <!-- Référence + message accueil -->
  <tr>
    <td style="padding:28px 40px 0;text-align:center">
      <p style="margin:0;font-family:Arial,sans-serif;font-size:11px;letter-spacing:.3em;text-transform:uppercase;color:#8a6a50">Référence de réservation</p>
      <p style="margin:8px 0 0;font-family:Georgia,serif;font-size:22px;letter-spacing:.12em;color:#1a130a">{$ref}</p>
      <div style="width:40px;height:1px;background:#c1440e;margin:16px auto"></div>
      <p style="margin:0;font-family:Arial,sans-serif;font-size:13px;color:#4a3728;line-height:1.7;max-width:420px;margin:0 auto">
        Merci pour votre réservation, <strong>{$nom}</strong>.<br>
        Veuillez <strong>présenter ce récapitulatif à l'entrée du musée</strong> pour accéder à votre visite.<br>
        Le QR code ci-dessous sera scanné par notre équipe d'accueil.
      </p>
    </td>
  </tr>

  <!-- QR Code -->
  <tr>
    <td style="padding:28px 40px;text-align:center">
      <img src="{$qr_img_url}" width="160" height="160" alt="QR Code réservation" style="display:block;margin:0 auto;border:6px solid #1a130a;border-radius:4px">
      <p style="margin:10px 0 0;font-family:Arial,sans-serif;font-size:11px;color:#8a6a50;letter-spacing:.1em">Scannez à l'entrée du musée</p>
    </td>
  </tr>

  <!-- Séparateur -->
  <tr><td style="padding:0 40px"><div style="height:1px;background:#e0d8cc"></div></td></tr>

  <!-- Détails -->
  <tr>
    <td style="padding:24px 40px 0">
      <p style="margin:0 0 12px;font-family:Arial,sans-serif;font-size:11px;letter-spacing:.3em;text-transform:uppercase;color:#8a6a50">Détails de la visite</p>
      <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse">
        <tr style="background:#f0ebe3">
          <td style="padding:6px 12px;color:#8a6a50;font-size:12px;letter-spacing:.1em;text-transform:uppercase;font-family:Arial,sans-serif">Date</td>
          <td colspan="2" style="padding:6px 12px;color:#1a130a;font-family:Georgia,serif">{$date}</td>
        </tr>
        <tr>
          <td style="padding:6px 12px;color:#8a6a50;font-size:12px;letter-spacing:.1em;text-transform:uppercase;font-family:Arial,sans-serif">Type</td>
          <td colspan="2" style="padding:6px 12px;color:#1a130a;font-family:Georgia,serif">{$type}</td>
        </tr>
        {$opt_html}
      </table>
    </td>
  </tr>

  <!-- Visiteurs -->
  <tr>
    <td style="padding:20px 40px 0">
      <p style="margin:0 0 12px;font-family:Arial,sans-serif;font-size:11px;letter-spacing:.3em;text-transform:uppercase;color:#8a6a50">Composition du groupe</p>
      <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse">
        {$rows_html}
        <tr style="border-top:1px solid #e0d8cc">
          <td colspan="2" style="padding:12px 12px 8px;font-family:Arial,sans-serif;font-size:11px;letter-spacing:.2em;text-transform:uppercase;color:#1a130a;font-weight:bold">Total estimé</td>
          <td style="padding:12px 12px 8px;font-family:Georgia,serif;font-size:20px;color:#c1440e;text-align:right">{$total}</td>
        </tr>
      </table>
      <p style="margin:8px 0 0;font-family:Arial,sans-serif;font-size:11px;color:#8a6a50;font-style:italic">Le paiement s'effectue à l'accueil le jour de votre visite.</p>
    </td>
  </tr>

  <!-- Footer -->
  <tr>
    <td style="padding:32px 40px;text-align:center;background:#1a130a;margin-top:28px">
      <p style="margin:0;font-family:Arial,sans-serif;font-size:11px;color:#6b5040;letter-spacing:.15em">25 Quai de Rive Neuve, 13007 Marseille</p>
      <p style="margin:6px 0 0;font-family:Arial,sans-serif;font-size:11px;color:#6b5040;letter-spacing:.1em">Mardi – Dimanche · 10h – 18h</p>
      <p style="margin:16px 0 0;font-family:Arial,sans-serif;font-size:10px;color:#4a3728;letter-spacing:.05em">© 2026 Musée FABI. Tous droits réservés.</p>
    </td>
  </tr>

</table>
</td></tr>
</table>

</body>
</html>
HTML;

/* ════════════════════════════
   CORPS TEXTE (fallback)
════════════════════════════ */
$txt = <<<TXT
MUSÉE FABI — Confirmation de réservation
==========================================

Référence : {$ref}
Bonjour {$nom},

Veuillez présenter ce récapitulatif à l'entrée du musée pour accéder à votre visite.

DÉTAILS
-------
Date          : {$date}
Type de visite: {$type}
{$opt_txt}
VISITEURS
---------
{$rows_txt}
TOTAL ESTIMÉ  : {$total}
Le paiement s'effectue à l'accueil le jour de votre visite.

---
Musée FABI · 25 Quai de Rive Neuve, 13007 Marseille
Mardi – Dimanche · 10h – 18h
TXT;

/* ── Envoi ── */
$subject = "=?UTF-8?B?" . base64_encode("Musée FABI — Réservation {$ref}") . "?=";
$headers  = "From: Musée FABI <noreply@museedufabi.fr>\r\n";
$headers .= "Reply-To: contact@museedufabi.fr\r\n";
$headers .= "MIME-Version: 1.0\r\n";
$boundary = md5(uniqid());
$headers .= "Content-Type: multipart/alternative; boundary=\"{$boundary}\"\r\n";

$body  = "--{$boundary}\r\n";
$body .= "Content-Type: text/plain; charset=UTF-8\r\n";
$body .= "Content-Transfer-Encoding: base64\r\n\r\n";
$body .= chunk_split(base64_encode($txt)) . "\r\n";
$body .= "--{$boundary}\r\n";
$body .= "Content-Type: text/html; charset=UTF-8\r\n";
$body .= "Content-Transfer-Encoding: base64\r\n\r\n";
$body .= chunk_split(base64_encode($html)) . "\r\n";
$body .= "--{$boundary}--";

$sent = mail($email, $subject, $body, $headers);

echo json_encode(['success' => $sent]);
