# Planovar branding assets

Drop the logo PNGs **in this folder** with these exact names:

| File | What it is | Used on |
|---|---|---|
| `planovar-logo-light.png` | Logo for **light backgrounds** (black "PLAN" + gradient "OVAR" — the white-background export) | Light-mode emails, light app surfaces |
| `planovar-logo-dark.png` | Logo for **dark backgrounds** (white "PLAN" + gradient "OVAR" — the black-background export) | Dark-mode emails, the navy email header, dark app surfaces |

Recommended: transparent-background PNGs, ~600px wide (retina @2x), < 200 KB.

## How they're served
The API serves this folder statically:

- `http://localhost:3000/branding/planovar-logo-light.png`
- `http://localhost:3000/branding/planovar-logo-dark.png`

In production the URLs become `${API_BASE_URL}/branding/...` automatically —
email templates build their image URLs from the `API_BASE_URL` env var.
(`EMAIL_LOGO_URL` env still works as a manual override, e.g. to point at a CDN.)

## Note for emails
Emails are sent with BOTH variants embedded; CSS `prefers-color-scheme` swaps
them in clients that support dark mode (Apple Mail, Outlook app). Clients that
ignore it (most Gmail surfaces) show the dark variant, which sits on the navy
header and works in both modes.
