# Torque Inspection Mobile — PRD
## Original problem
Mobile vehicle inspection site (FR, Montréal). Public landing + booking (SIMULATED payment), custom JWT portal with 3 roles: Admin (patron, sees all plain-text passwords by explicit request), Employee (photos + detailed digital report), Client (portal). Public Album managed by admin.
## Architecture
React (CRA) + FastAPI (/app/backend/server.py) + MongoDB. Pages: Landing, Booking, Login, AdminDashboard, EmployeeApp, ClientPortal, Album, ReportLookup (/rapport/:code).
## Implemented
- MVP (landing, booking, roles, album w/ cropper, detailed inspection report) — earlier
- 2026-06: OG/Twitter meta tags + /api/og-image (latest album image, unsplash fallback)
- 2026-06: 5-char reference code per inspection, public lookup section on landing + /api/lookup/{code}
- 2026-06: Admin manual inspection creation (/api/inspections/manual)
- 2026-06: Free push alerts via ntfy.sh (topic in NTFY_TOPIC env) on each booking; Admin "Alertes" tab with topic + test button. (TextBelt free SMS blocked for Canada.)
## Backlog
- P1: Real Stripe payment (currently SIMULATED)
- P2: Rate limiting on /api/lookup, PDF export of report, send ref code to client by SMS/email
