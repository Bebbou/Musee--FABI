<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false]);
    exit;
}

$data  = json_decode(file_get_contents('php://input'), true);
$email = filter_var($data['email'] ?? '', FILTER_VALIDATE_EMAIL);

if (!$email) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Adresse e-mail invalide.']);
    exit;
}

$pdf = __DIR__ . '/../assets/newsletter/Newsletter_test.pdf';
if (!file_exists($pdf)) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Newsletter introuvable.']);
    exit;
}

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require __DIR__ . '/PHPMailer/Exception.php';
require __DIR__ . '/PHPMailer/PHPMailer.php';
require __DIR__ . '/PHPMailer/SMTP.php';

$html = <<<HTML
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f0ebe3;font-family:Arial,sans-serif">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f0ebe3;padding:32px 0">
<tr><td align="center">
<table width="560" cellpadding="0" cellspacing="0" style="background:#faf6f0;border-radius:4px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.12)">
  <tr>
    <td style="background:#1a130a;padding:32px 40px;text-align:center">
      <p style="margin:0;font-family:Arial,sans-serif;font-size:11px;letter-spacing:.4em;text-transform:uppercase;color:#c1440e">Musée FABI</p>
      <h1 style="margin:12px 0 0;font-family:Georgia,serif;font-size:24px;font-weight:400;color:#f0e8d8;letter-spacing:.06em">Notre Newsletter</h1>
    </td>
  </tr>
  <tr>
    <td style="padding:32px 40px;text-align:center">
      <p style="margin:0;font-family:Arial,sans-serif;font-size:13px;color:#4a3728;line-height:1.8;max-width:400px;margin:0 auto">
        Merci de vous être abonné à la newsletter du Musée FABI.<br>
        Vous trouverez notre dernière édition en pièce jointe.
      </p>
      <div style="width:40px;height:1px;background:#c1440e;margin:24px auto"></div>
      <p style="margin:0;font-family:Georgia,serif;font-size:14px;color:#8a6a50;font-style:italic">
        À bientôt au musée.
      </p>
    </td>
  </tr>
  <tr>
    <td style="padding:24px 40px;background:#1a130a;text-align:center">
      <p style="margin:0;font-family:Arial,sans-serif;font-size:11px;color:#6b5040;letter-spacing:.15em">25 Quai de Rive Neuve, 13007 Marseille</p>
      <p style="margin:6px 0 0;font-family:Arial,sans-serif;font-size:10px;color:#4a3728">© 2026 Musée FABI. Tous droits réservés.</p>
    </td>
  </tr>
</table>
</td></tr>
</table>
</body>
</html>
HTML;

$mail = new PHPMailer(true);
try {
    $mail->isSMTP();
    $mail->Host       = 'smtp.gmail.com';
    $mail->SMTPAuth   = true;
    $mail->Username   = 'museefabi@gmail.com';
    $mail->Password   = 'nvlk zjxc qklw edvf';
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
    $mail->Port       = 587;
    $mail->CharSet    = 'UTF-8';

    $mail->setFrom('museefabi@gmail.com', 'Musée FABI');
    $mail->addReplyTo('museefabi@gmail.com', 'Musée FABI');
    $mail->addAddress($email);

    $mail->Subject = 'Musée FABI — Votre Newsletter';
    $mail->isHTML(true);
    $mail->Body    = $html;
    $mail->AltBody = "Merci de vous être abonné à la newsletter du Musée FABI.\nVotre dernière édition est en pièce jointe.\n\n© 2026 Musée FABI — 25 Quai de Rive Neuve, 13007 Marseille";

    $mail->addAttachment($pdf, 'Newsletter_FABI.pdf');

    $mail->send();
    echo json_encode(['success' => true]);
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => $mail->ErrorInfo]);
}
