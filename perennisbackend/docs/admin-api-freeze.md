# Admin API — Frozen Surface

Version: v1 (unversioned, locked)

Endpoints:
- GET /api/admin/dashboard → AdminDashboardDTO
- GET /api/admin/overview → AdminOverviewDTO
- GET /api/admin/reflections/flagged
- GET /api/admin/inquiries
- GET /api/admin/users

Rules:
- No breaking changes
- New data requires new endpoint or version
- Frontend assumes strict shapes
