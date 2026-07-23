import { env } from "@backgroundgone/env/server";
import nodemailer, { type Transporter } from "nodemailer";

let transporter: Transporter | null = null;

/** Returns a Gmail SMTP transport, or null when SMTP isn't configured. */
function getTransport(): Transporter | null {
  if (!env.SMTP_USER || !env.SMTP_PASS) return null;
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_PORT === 465, // 465 = implicit TLS, 587 = STARTTLS
      auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
    });
  }
  return transporter;
}

interface PurchaseEmail {
  to: string;
  name?: string;
  downloadUrl: string;
}

/**
 * On-brand purchase email. Table-based, inline-styled HTML for broad email
 * client support; brand color #ff6b6b, Georgia serif headline to echo the
 * app's Instrument Serif. No emojis. Includes a fallback "magic link".
 */
function renderPurchaseEmail({ name, downloadUrl }: PurchaseEmail): {
  html: string;
  text: string;
} {
  const hello = name ? `Hi ${name},` : "Hi there,";
  const html = `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#f4f4f5;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;">
      <tr>
        <td align="center" style="padding:32px 16px;">
          <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:600px;max-width:100%;background:#ffffff;border:1px solid #ececee;border-radius:16px;overflow:hidden;font-family:Arial,Helvetica,sans-serif;">
            <!-- Header -->
            <tr>
              <td style="padding:24px 32px;border-bottom:1px solid #f1f1f3;">
                <table role="presentation" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="width:34px;height:34px;background:#18181b;border-radius:9px;text-align:center;vertical-align:middle;">
                      <span style="display:inline-block;width:16px;height:16px;background:#ff6b6b;border-radius:5px;"></span>
                    </td>
                    <td style="padding-left:11px;font-size:17px;font-weight:bold;letter-spacing:-0.02em;color:#18181b;">
                      BackgroundGone
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <!-- Body -->
            <tr>
              <td style="padding:36px 32px 8px;">
                <h1 style="margin:0;font-family:Georgia,'Times New Roman',serif;font-weight:normal;font-size:30px;line-height:1.2;color:#18181b;">
                  Your download is ready.
                </h1>
                <p style="margin:16px 0 0;font-size:15px;line-height:1.6;color:#52525b;">
                  ${hello} thanks for buying BackgroundGone. It's yours forever &mdash;
                  no account, no subscription, and it runs entirely on your PC.
                  Click below to download the installer for Windows.
                </p>
              </td>
            </tr>
            <!-- Button -->
            <tr>
              <td align="center" style="padding:28px 32px 8px;">
                <table role="presentation" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="background:#ff6b6b;border-radius:12px;">
                      <a href="${downloadUrl}" style="display:inline-block;padding:15px 30px;font-size:15px;font-weight:bold;color:#ffffff;text-decoration:none;">
                        Download for Windows
                      </a>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <!-- Fallback link -->
            <tr>
              <td style="padding:16px 32px 32px;">
                <p style="margin:0;font-size:13px;line-height:1.6;color:#71717a;">
                  If the button doesn't work, copy and paste this link into your browser:
                </p>
                <p style="margin:6px 0 0;font-size:13px;line-height:1.5;word-break:break-all;">
                  <a href="${downloadUrl}" style="color:#ff6b6b;text-decoration:underline;">${downloadUrl}</a>
                </p>
              </td>
            </tr>
            <!-- Footer -->
            <tr>
              <td style="padding:20px 32px;background:#fafafa;border-top:1px solid #f1f1f3;">
                <p style="margin:0;font-size:12px;line-height:1.6;color:#a1a1aa;">
                  You're receiving this because you purchased BackgroundGone.
                  Keep this email &mdash; the link above works whenever you need to
                  reinstall.
                </p>
                <p style="margin:10px 0 0;font-size:12px;color:#a1a1aa;">
                  &copy; 2026 BackgroundGone
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  const text = `${hello}

Thanks for buying BackgroundGone. Your download is ready.

Download for Windows:
${downloadUrl}

Keep this email — the link works whenever you need to reinstall.

© 2026 BackgroundGone`;

  return { html, text };
}

export async function sendPurchaseEmail(opts: PurchaseEmail): Promise<void> {
  const t = getTransport();
  if (!t) {
    console.warn("[mail] SMTP not configured — skipping purchase email");
    return;
  }
  await t.sendMail({
    from: env.MAIL_FROM ?? `BackgroundGone <${env.SMTP_USER}>`,
    to: opts.to,
    subject: "Your BackgroundGone download",
    ...renderPurchaseEmail(opts),
  });
}
