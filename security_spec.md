# Security Specification & Test Suite for Kenfoss Enterprise Auth (RBAC)

## 1. Data Invariants
1. **Privilege Isolation**: No user can self-assign or escalate their role to `Super Administrator`, `Manager`, or `Technician`.
2. **Staff Provisioning Boundary**: Privileged staff accounts (`Super Administrator`, `Manager`, `Technician`) can ONLY be created by an active `Super Administrator` from the authenticated Staff Management module.
3. **Immutability of System Audits**: `auditLogs` records are append-only by authenticated users and can NEVER be modified or deleted by any client role.
4. **Owner Self-Modification Limits**: Non-SuperAdmin users can update their own personal profile fields (`displayName`, `phone`, `avatar`), but CANNOT alter their `role`, `status`, or `mustChangePassword` flag.
5. **Suspended Account Revocation**: Accounts with `status == "Suspended"` or `status == "Disabled"` lose all read/write access immediately across all collections.
6. **Customer Portal Boundary**: Customer users (`role == "Customer"`) can only read and write their own bookings, quotes, and AI diagnostics.

## 2. The "Dirty Dozen" Threat Payloads

| ID | Attack Name | Target Collection | Payload Description | Expected Result |
|---|---|---|---|---|
| P1 | Public Role Self-Escalation | `users/{uid}` | Unauthenticated user creates document setting `role: "Super Administrator"`. | `PERMISSION_DENIED` |
| P2 | Customer Role Bump | `users/{uid}` | Customer updates their own document with `role: "Manager"`. | `PERMISSION_DENIED` |
| P3 | Suspended Staff Read | `users/usr-tech-1` | Suspended technician tries reading `bookings`. | `PERMISSION_DENIED` |
| P4 | Non-Admin Staff Creation | `users/new-staff-uid` | Manager attempts creating a new staff account with `role: "Technician"`. | `PERMISSION_DENIED` |
| P5 | Audit Log Tampering | `auditLogs/log-101` | Manager attempts deleting an audit entry that records a privilege change. | `PERMISSION_DENIED` |
| P6 | Audit Log Editing | `auditLogs/log-101` | Attacker attempts updating `details` in an audit record. | `PERMISSION_DENIED` |
| P7 | Customer Accessing Other Bookings | `bookings/bk-101` | Customer A queries booking `bk-102` belonging to Customer B. | `PERMISSION_DENIED` |
| P8 | Public User Table Scraping | `users` | Unauthenticated client executes list query on `users` collection. | `PERMISSION_DENIED` |
| P9 | ID Poisoning Attack | `users/../../../etc/passwd` | Attacker attempts passing path traversal attack string as `{userId}`. | `PERMISSION_DENIED` |
| P10| System Setting Hijack | `settings/website_settings` | Customer attempts updating company contact settings. | `PERMISSION_DENIED` |
| P11| Public Staff Registration via AuthModal | `users/{uid}` | Unauthenticated request attempts setting `role: "Technician"` during public sign-up. | `PERMISSION_DENIED` |
| P12| Non-SuperAdmin Staff Deletion | `users/usr-tech-1` | Manager attempts deleting a technician profile document. | `PERMISSION_DENIED` |

## 3. Test Runner Plan (`firestore.rules.test.ts`)
- Mocks Firebase Auth contexts:
  - `anonContext` (unauthenticated)
  - `customerContext` (`uid: "cust-123"`, `role: "Customer"`)
  - `suspendedTechContext` (`uid: "tech-999"`, `role: "Technician"`, `status: "Suspended"`)
  - `managerContext` (`uid: "mgr-456"`, `role: "Manager"`)
  - `superAdminContext` (`uid: "admin-789"`, `role: "Super Administrator"`)
- Verifies that all 12 Dirty Dozen payloads fail with `PERMISSION_DENIED`.
