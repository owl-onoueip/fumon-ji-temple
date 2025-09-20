# SECURITY NOTES — Email Forms (Contact & Toba)

This document summarizes the security-related settings and decisions for the website's email forms:
- Contact form: `contact.html` (`#contactForm`)
- Online Toba application: `downloads.html` (`#tobaForm`)
- JavaScript logic: `script.js`
- Styles and visual emphasis: `styles.css`

## 1) Anti-spam measures
- Honeypot fields (invisible to users)
  - Contact: hidden input `#website`
  - Toba: hidden input `#toba_website`
  - Logic: in `script.js`, if honeypot has any value, submission is dropped without error.
- Client-side rate limiting (per browser)
  - Contact: LocalStorage key `contact_last_submit_ts`
  - Toba: LocalStorage key `toba_last_submit_ts`
  - Window: 60 seconds (editable in `script.js`). If a user tries again too soon, an alert is shown.

## 2) Client-side validation
- Common rules
  - Email format check (basic regex)
  - Phone number: optional on Contact, required on Toba. When present, only digits and `+ - ( )` and spaces, 6–20 chars.
  - Required fields are enforced by HTML `required` attributes and additional JS checks.
- Required by page
  - Contact (`contact.html`): Name, Email, Subject, Message (>= 10 chars)
  - Toba (`downloads.html`): Applicant name, Email, Phone, At least 1 Shishu (施主) row with name

## 3) Privacy consent
- At your request, privacy consent checkboxes and on-page policy section have been removed from both forms.
- If required in the future, reintroduce a checkbox in HTML and a corresponding check in `script.js`.

## 4) EmailJS specifics
- Public key init in `script.js`: `emailjs.init('ihjRUl-y6KLX5NFCf')`
- Service ID: `service_hug4h5d`
- Template ID (temporary for both forms): `template_pygnzri`
- Recommended: create a dedicated template for Toba (e.g., `template_toba_xxxx`) to avoid interfering with the Contact template.
- Failure handling: If `emailjs` is undefined or sending fails, the user sees an error message and buttons are re-enabled.

## 5) Payload details (EmailJS)
- Contact
  - Params: `name, email, phone, inquiry_type (subject), message, submission_date, reply_to`
- Toba
  - Applicant: `applicant_name, applicant_kana, applicant_phone, applicant_email, applicant_address`
  - Ceremony: `service_date, start_time, attendees`
  - Deceased: `deceased_zokumyo, deceased_kaimyo, deceased_meinichi`
  - Services: `services` (comma-joined list)
  - Shishu list: `items_json` (array JSON), `items_html` (pre-rendered HTML table), `items_count`
  - Other: `message, reply_to`

## 6) UI security/usability aids
- Disable submit button during send, revert afterward (prevents double submit).
- Clear success/error messages areas that toggle visibility.
- Minimal HTML escaping in `items_html` for safety (replaces `<` with `&lt;`).

## 7) Configuration knobs (where to change)
- Rate limit window
  - Contact: `RATE_LIMIT_SECONDS` in `handleContactForm()`
  - Toba: `WINDOW_SEC` in `initTobaForm()`
- Required/optional fields
  - HTML `required` attributes in `downloads.html` and `contact.html`
  - Matching validation logic in `script.js`
- Initial row count (施主)
  - In `initTobaForm()`: `for (let i = 0; i < 5; i++) addRow();`
- Cache and security headers
  - `netlify.toml` (e.g., PDF caching with `*.pdf` headers)

## 8) Additional recommendations (optional enhancements)
- Add CAPTCHA (Google reCAPTCHA v3 or Cloudflare Turnstile) for stronger bot protection.
- Split templates per form in EmailJS for better maintainability and isolation.
- Server-side relay for emails (if future security/policy requires hiding keys or adding server checks).

---

## How to use this document
- Onboarding: Share this file with any maintainer to explain the current security posture and where to change settings.
- Maintenance: When you change validation, rate limits, or EmailJS template IDs, update this file to keep docs in sync.
- Audits/Reviews: Use it as a checklist during periodic security reviews.
- Incident response: If spam volume spikes, use “Configuration knobs” to quickly tighten limits, then consider “Additional recommendations”.
