"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.emailTemplates = void 0;
const BRAND = {
    magenta: '#C44AE1',
    indigo: '#5B50F0',
    blue: '#2D9CFD',
    navy: '#0F0D2E',
    gold: '#D9A441',
    ink: '#1A1A2E',
    body: '#374151',
    muted: '#9CA3AF',
    surface: '#F5F4FA',
};
const gradient = `linear-gradient(135deg, ${BRAND.magenta} 0%, ${BRAND.indigo} 55%, ${BRAND.blue} 100%)`;
const assetBase = () => (process.env.API_BASE_URL ?? 'http://localhost:3000').replace(/\/$/, '');
const logoDarkUrl = () => process.env.EMAIL_LOGO_URL ?? `${assetBase()}/branding/planovar-logo-dark.png`;
const logoLightUrl = () => `${assetBase()}/branding/planovar-logo-light.png`;
const logoBlock = () => `
    <img src="${logoDarkUrl()}" alt="PLANOVAR" height="44" class="logo-dark"
         style="height:44px;max-width:220px;" />
    <img src="${logoLightUrl()}" alt="" height="44" class="logo-light"
         style="height:44px;max-width:220px;display:none;" />`;
const confetti = () => `
  <div style="text-align:center;padding:10px 0 0;line-height:0;">
    <span style="display:inline-block;width:8px;height:8px;border-radius:2px;background:${BRAND.magenta};margin:0 5px;transform:rotate(12deg);"></span>
    <span style="display:inline-block;width:6px;height:6px;border-radius:50%;background:${BRAND.gold};margin:0 5px;"></span>
    <span style="display:inline-block;width:9px;height:9px;border-radius:2px;background:${BRAND.blue};margin:0 5px;transform:rotate(-14deg);"></span>
    <span style="display:inline-block;width:5px;height:5px;border-radius:50%;background:${BRAND.indigo};margin:0 5px;"></span>
    <span style="display:inline-block;color:${BRAND.gold};font-size:13px;margin:0 4px;vertical-align:-2px;">✦</span>
    <span style="display:inline-block;width:7px;height:7px;border-radius:2px;background:${BRAND.indigo};margin:0 5px;transform:rotate(20deg);"></span>
    <span style="display:inline-block;width:5px;height:5px;border-radius:50%;background:${BRAND.magenta};margin:0 5px;"></span>
    <span style="display:inline-block;width:8px;height:8px;border-radius:2px;background:${BRAND.gold};margin:0 5px;transform:rotate(-8deg);"></span>
  </div>`;
const base = (content, preheader = '') => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Planovar</title>
  <style>
    body { margin: 0; padding: 0; background: ${BRAND.surface}; font-family: 'Segoe UI', Arial, sans-serif; }
    .wrapper { max-width: 560px; margin: 32px auto; background: #ffffff; border-radius: 18px; overflow: hidden; box-shadow: 0 6px 28px rgba(91,80,240,0.10); }
    .header { background: ${BRAND.navy}; padding: 30px 40px 24px; text-align: center; }
    .gradbar { height: 5px; background: ${gradient}; }
    .body { padding: 36px 40px 32px; color: ${BRAND.ink}; }
    .body h2 { font-size: 21px; font-weight: 800; color: ${BRAND.ink}; margin: 0 0 14px; }
    .body p { font-size: 15px; line-height: 1.7; margin: 0 0 16px; color: ${BRAND.body}; }
    .otp { font-size: 38px; font-weight: 800; letter-spacing: 10px; color: ${BRAND.indigo}; text-align: center; padding: 22px 12px; background: ${BRAND.surface}; border: 2px solid ${BRAND.indigo}; border-radius: 14px; margin: 24px 0 8px; }
    .otp-hint { text-align: center; font-size: 12px; color: ${BRAND.muted}; margin: 0 0 8px; }
    .btn { display: inline-block; background: ${gradient}; color: #ffffff !important; text-decoration: none; padding: 14px 34px; border-radius: 50px; font-size: 15px; font-weight: 700; margin: 14px 0 4px; }
    .info-card { background: ${BRAND.surface}; border-left: 4px solid ${BRAND.indigo}; border-radius: 10px; padding: 16px 20px; margin: 20px 0; }
    .info-card p { margin: 5px 0; font-size: 14px; }
    .info-card strong { color: ${BRAND.ink}; }
    .amount { font-size: 26px; font-weight: 800; color: ${BRAND.indigo}; }
    .pill { display:inline-block; background:${BRAND.surface}; color:${BRAND.indigo}; border-radius:50px; padding:4px 14px; font-size:12px; font-weight:700; letter-spacing:1px; }
    .footer { padding: 26px 40px 30px; background: ${BRAND.navy}; text-align: center; }
    .tagline { color: ${BRAND.gold}; font-size: 12px; font-weight: 700; letter-spacing: 2.5px; text-transform: uppercase; margin: 0 0 12px; }
    .footer p { font-size: 12px; color: #8B93A7; margin: 4px 0; }
    .footer a { color: #B9B3F5; text-decoration: none; }
    .divider { border: none; border-top: 1px solid #EEEDF7; margin: 24px 0; }
    .warning { background: #FEF2F2; border-left: 4px solid #EF4444; border-radius: 10px; padding: 12px 16px; margin: 18px 0; }
    .warning p { color: #991B1B; font-size: 13px; margin: 0; }
    .success { background: #F0FDF4; border-left: 4px solid #22C55E; border-radius: 10px; padding: 12px 16px; margin: 18px 0; }
    .success p { color: #166534; font-size: 13px; margin: 0; }

    /* ── Light/dark adaptability ─────────────────────────────────────────
       Default (clients with no media-query support, e.g. most Gmail): navy
       header + dark-bg logo — safe in both modes.
       Light mode: white header + light-bg logo.
       Dark mode: dark surfaces throughout + dark-bg logo. */
    @media (prefers-color-scheme: light) {
      .header { background: #ffffff !important; border-bottom: 1px solid #EEEDF7; }
      .logo-dark { display: none !important; }
      .logo-light { display: inline-block !important; }
    }
    @media (prefers-color-scheme: dark) {
      body { background: #0B0A1E !important; }
      .wrapper { background: #161430 !important; box-shadow: none !important; }
      .body { color: #E8E6F8 !important; }
      .body h2 { color: #FFFFFF !important; }
      .body p { color: #C7C4E0 !important; }
      .info-card { background: #1E1B3E !important; }
      .info-card strong { color: #FFFFFF !important; }
      .otp { background: #1E1B3E !important; }
      .divider { border-top-color: #2A2752 !important; }
    }
  </style>
</head>
<body>
  ${preheader ? `<div style="display:none;max-height:0;overflow:hidden;">${preheader}</div>` : ''}
  <div class="wrapper">
    <div class="header">
      ${logoBlock()}
      ${confetti()}
    </div>
    <div class="gradbar"></div>
    <div class="body">
      ${content}
    </div>
    <div class="footer">
      <p class="tagline">✦ Plan better. Celebrate bigger. ✦</p>
      <p>© ${new Date().getFullYear()} Planovar. All rights reserved.</p>
      <p><a href="https://planovar.com">planovar.com</a> · <a href="https://planovar.com/privacy">Privacy</a> · <a href="https://planovar.com/unsubscribe">Unsubscribe</a></p>
    </div>
  </div>
</body>
</html>
`.trim();
exports.emailTemplates = {
    otp(otp, purpose) {
        const labels = {
            verify: {
                title: 'Verify your email',
                intro: 'Welcome to Planovar! Use the code below to verify your account. It expires in 10 minutes.',
                action: 'email verification',
            },
            reset: {
                title: 'Reset your password',
                intro: 'Use the code below to reset your Planovar password. It expires in 10 minutes.',
                action: 'password reset',
            },
            login: {
                title: 'Your sign-in code',
                intro: 'Use the code below to sign in to Planovar. It expires in 10 minutes.',
                action: 'sign-in',
            },
        };
        const l = labels[purpose];
        return {
            subject: l.title,
            html: base(`
        <h2>${l.title}</h2>
        <p>${l.intro}</p>
        <div class="otp">${otp}</div>
        <p class="otp-hint">This code expires in 10 minutes</p>
        <div class="warning"><p>If you didn't request this ${l.action}, you can safely ignore this email — your account is secure.</p></div>
      `, `Your Planovar ${l.action} code: ${otp}`),
        };
    },
    bookingRequest(data) {
        return {
            subject: `New booking inquiry — ${data.listingTitle}`,
            html: base(`
        <span class="pill">NEW INQUIRY</span>
        <h2 style="margin-top:14px;">You have a new booking inquiry 🎉</h2>
        <p><strong>${data.clientName}</strong> wants to book you.</p>
        <div class="info-card">
          <p><strong>Service:</strong> ${data.listingTitle}</p>
          <p><strong>Event date:</strong> ${data.eventDate}</p>
          <p><strong>Location:</strong> ${data.eventLocation}</p>
          ${data.requirements ? `<p><strong>Requirements:</strong> ${data.requirements}</p>` : ''}
        </div>
        <p>Respond quickly — fast replies win more bookings.</p>
        <a class="btn" href="https://planovar.com/vendor/bookings">Review inquiry</a>
      `, `New booking inquiry from ${data.clientName}`),
        };
    },
    bookingConfirmed(data) {
        return {
            subject: `Booking confirmed — ${data.listingTitle}`,
            html: base(`
        <h2>It's officially a celebration! 🎊</h2>
        <div class="success"><p>Your booking has been confirmed.</p></div>
        <div class="info-card">
          <p><strong>Service:</strong> ${data.listingTitle}</p>
          <p><strong>Vendor:</strong> ${data.vendorName}</p>
          <p><strong>Event date:</strong> ${data.eventDate}</p>
          <p><strong>Location:</strong> ${data.eventLocation}</p>
        </div>
        <p>You can message your vendor any time from the Planovar app.</p>
        <a class="btn" href="https://planovar.com/bookings">View booking</a>
      `, `Your booking with ${data.vendorName} is confirmed`),
        };
    },
    bookingCancelled(data) {
        return {
            subject: `Booking cancelled — ${data.listingTitle}`,
            html: base(`
        <h2>Booking cancelled</h2>
        <div class="warning"><p>A booking on your account has been cancelled.</p></div>
        <div class="info-card">
          <p><strong>Service:</strong> ${data.listingTitle}</p>
          <p><strong>Event date:</strong> ${data.eventDate}</p>
          <p><strong>Cancelled by:</strong> ${data.cancelledBy}</p>
          ${data.reason ? `<p><strong>Reason:</strong> ${data.reason}</p>` : ''}
        </div>
        <p>If you believe this was a mistake, our support team can help.</p>
        <a class="btn" href="https://planovar.com/support">Contact support</a>
      `, 'Booking cancellation notice'),
        };
    },
    quoteReceived(data) {
        return {
            subject: `Quote received from ${data.vendorName}`,
            html: base(`
        <span class="pill">NEW QUOTE</span>
        <h2 style="margin-top:14px;">${data.vendorName} sent you a quote</h2>
        <p>For <strong>${data.listingTitle}</strong>:</p>
        <div class="info-card">
          <p><strong>Total:</strong> <span class="amount">₦${data.amount}</span></p>
          <p><strong>Valid until:</strong> ${data.validUntil}</p>
        </div>
        <p>Review the itemised breakdown and accept or decline in the app.</p>
        <a class="btn" href="https://planovar.com/messages">Review quote</a>
      `, `Quote from ${data.vendorName}: ₦${data.amount}`),
        };
    },
    quoteAccepted(data) {
        return {
            subject: `Quote accepted — ${data.listingTitle}`,
            html: base(`
        <h2>Great news, ${data.vendorName}! 🎉</h2>
        <div class="success"><p><strong>${data.clientName}</strong> accepted your quote.</p></div>
        <div class="info-card">
          <p><strong>Service:</strong> ${data.listingTitle}</p>
          <p><strong>Quoted total:</strong> <span class="amount">₦${data.amount}</span></p>
        </div>
        <p>A booking inquiry has been created — coordinate the details with your client in chat.</p>
        <a class="btn" href="https://planovar.com/vendor/bookings">View booking</a>
      `, `${data.clientName} accepted your quote for ₦${data.amount}`),
        };
    },
    paymentReceived(data) {
        return {
            subject: `Payment received — ₦${data.amount}`,
            html: base(`
        <h2>Payment received</h2>
        <div class="success"><p>A payment has been received for your booking.</p></div>
        <div class="info-card">
          <p><strong>Service:</strong> ${data.listingTitle}</p>
          <p><strong>Client:</strong> ${data.clientName}</p>
          ${data.installmentLabel ? `<p><strong>Instalment:</strong> ${data.installmentLabel}</p>` : ''}
          <p><strong>Amount:</strong> <span class="amount">₦${data.amount}</span></p>
        </div>
        <a class="btn" href="https://planovar.com/vendor/payments">View payments</a>
      `, `Payment of ₦${data.amount} received from ${data.clientName}`),
        };
    },
    payoutProcessed(data) {
        return {
            subject: `Payout of ₦${data.amount} is on its way`,
            html: base(`
        <h2>Your payout is on its way 💸</h2>
        <div class="success"><p>Your payout has been processed.</p></div>
        <div class="info-card">
          <p><strong>Amount:</strong> <span class="amount">₦${data.amount}</span></p>
          <p><strong>Bank account:</strong> ****${data.bankAccount.slice(-4)}</p>
          <p><strong>Estimated arrival:</strong> 1–2 business days</p>
        </div>
        <a class="btn" href="https://planovar.com/vendor/payments">View payout history</a>
      `, `Your payout of ₦${data.amount} is on its way`),
        };
    },
    installmentDue(data) {
        return {
            subject: `Payment due: ₦${data.amount} for ${data.listingTitle}`,
            html: base(`
        <h2>Payment reminder</h2>
        <p>An instalment is due for your booking with <strong>${data.vendorName}</strong>.</p>
        <div class="info-card">
          <p><strong>Service:</strong> ${data.listingTitle}</p>
          <p><strong>Instalment:</strong> ${data.label}</p>
          <p><strong>Amount due:</strong> <span class="amount">₦${data.amount}</span></p>
          <p><strong>Due date:</strong> ${data.dueDate}</p>
        </div>
        <a class="btn" href="https://planovar.com/payments">Pay now</a>
      `, `Payment of ₦${data.amount} due on ${data.dueDate}`),
        };
    },
    reviewRequested(data) {
        return {
            subject: `How was your experience with ${data.vendorName}?`,
            html: base(`
        <h2>How did it go? ⭐</h2>
        <p>Your event is complete! We'd love to hear how things went with <strong>${data.vendorName}</strong>.</p>
        <div class="info-card">
          <p><strong>Service:</strong> ${data.listingTitle}</p>
        </div>
        <p>Your honest review helps other planners choose great vendors — and helps great vendors shine.</p>
        <a class="btn" href="https://planovar.com/reviews/new">Leave a review</a>
      `, `Rate your experience with ${data.vendorName}`),
        };
    },
    disputeOpened(data) {
        return {
            subject: `[Admin] Report raised — booking ${data.bookingId}`,
            html: base(`
        <h2>Report requires review</h2>
        <div class="warning">
          <p><strong>Booking ID:</strong> ${data.bookingId}</p>
          <p><strong>Raised by:</strong> ${data.raisedBy}</p>
          <p><strong>Reason:</strong> ${data.reason}</p>
        </div>
        <a class="btn" href="https://admin.planovar.com/disputes/${data.bookingId}">Review report</a>
      `, `Report raised for booking ${data.bookingId}`),
        };
    },
    welcome(data) {
        const isVendor = data.role === 'vendor';
        return {
            subject: `Welcome to Planovar, ${data.firstName}! 🎉`,
            html: base(`
        <h2>Welcome aboard, ${data.firstName}! 🥂</h2>
        <p><strong>Planovar</strong> is where Nigeria's best events come together — vendors, planners, and unforgettable celebrations.</p>
        ${isVendor
                ? `<p>Your vendor account is ready. Complete your profile and add your first listing to start reaching thousands of event planners.</p>
               <a class="btn" href="https://planovar.com/vendor/onboarding">Complete your profile</a>`
                : `<p>Start planning your next event — browse verified vendors for every budget and every celebration.</p>
               <a class="btn" href="https://planovar.com">Start exploring</a>`}
        <hr class="divider" />
        <p style="font-size:13px;color:${BRAND.muted};">Questions? We're at <a href="mailto:support@planovar.com" style="color:${BRAND.indigo};">support@planovar.com</a></p>
      `, 'Your Planovar account is ready'),
        };
    },
};
//# sourceMappingURL=index.js.map