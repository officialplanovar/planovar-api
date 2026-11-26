/**
 * Self-contained HTML for the public account & data deletion page.
 *
 * Served (no auth) at GET /account-deletion so it satisfies Google Play's and
 * Apple's requirement for a publicly reachable "how to delete your account and
 * data" URL. No external assets — renders standalone during store review.
 */
const SUPPORT_EMAIL = 'support@planovar.com';

export function accountDeletionPage(): string {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="robots" content="noindex" />
<title>Delete your Planovar account &amp; data</title>
<style>
  :root { color-scheme: light dark; --bg:#ffffff; --fg:#1a1724; --muted:#5b5570; --card:#f7f5fb; --line:#e7e3f0; --accent:#6d28d9; }
  @media (prefers-color-scheme: dark) {
    :root { --bg:#141221; --fg:#efecf7; --muted:#a79fc0; --card:#1e1b2e; --line:#2c2740; --accent:#a78bfa; }
  }
  * { box-sizing: border-box; }
  body { margin:0; background:var(--bg); color:var(--fg);
    font:16px/1.65 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif; }
  .wrap { max-width:720px; margin:0 auto; padding:48px 20px 72px; }
  h1 { font-size:26px; line-height:1.25; margin:0 0 6px; letter-spacing:-0.02em; }
  h2 { font-size:18px; margin:34px 0 10px; }
  .sub { color:var(--muted); margin:0 0 28px; }
  ol,ul { padding-left:22px; } li { margin:7px 0; }
  .card { background:var(--card); border:1px solid var(--line); border-radius:14px; padding:18px 20px; margin:18px 0; }
  a { color:var(--accent); }
  code { background:var(--card); border:1px solid var(--line); border-radius:6px; padding:1px 6px; font-size:0.92em; }
  .foot { color:var(--muted); font-size:13px; margin-top:40px; border-top:1px solid var(--line); padding-top:18px; }
</style>
</head>
<body>
<main class="wrap">
  <h1>Delete your Planovar account and data</h1>
  <p class="sub">This page explains how to delete your account and associated data from
  the <strong>Planovar Client</strong> and <strong>Planovar Vendor</strong> apps.</p>

  <h2>Delete from within the app</h2>
  <ol>
    <li>Open the Planovar app and sign in.</li>
    <li>Go to your <strong>Profile</strong>, then <strong>Settings</strong>.</li>
    <li>Select <strong>Delete account</strong> and confirm.</li>
  </ol>
  <p>Your account is deactivated immediately and your personal data is deleted or
  irreversibly anonymized as described below.</p>

  <h2>Can't access the app?</h2>
  <div class="card">
    Email <a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a> from the address on your
    account with the subject <code>Delete my account</code>. We verify ownership and
    complete the deletion within 30 days.
  </div>

  <h2>What is deleted</h2>
  <ul>
    <li>Profile details — name, email address, phone number, and profile photo.</li>
    <li>Account credentials and sign-in identifiers.</li>
    <li>Your messages, listings, reviews, and uploaded photos and documents (including any identity / business verification documents).</li>
    <li>Saved locations, preferences, and device notification tokens.</li>
  </ul>

  <h2>What may be retained</h2>
  <p>A limited set of records may be kept in <strong>anonymized</strong> form, no longer
  linked to you, only where required for legal, tax, accounting, or fraud-prevention
  obligations. These are removed once those obligations lapse.</p>

  <p class="foot">Deletion is permanent and cannot be undone. For questions, contact
  <a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a>.</p>
</main>
</body>
</html>`;
}
