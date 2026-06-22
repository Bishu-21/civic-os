# 🏛️ Appwrite Database Schema & Role-Based Access Control Blueprint

This document defines the production-grade schema blueprint, permission rules, and metadata extensions for the **Delhi CM Grievance Dashboard** system.

---

## 👥 1. Roles & Permissions Matrix

We enforce strict role-based access control (RBAC) across three principal tiers:
1. **`citizen`**: Access to register, view own grievances, download receipts, and trigger self-verification.
2. **`team` (CMO / Department Team)**: Access to view all grievances, assign field officers, update status, and post resolutions.
3. **`cm` (Chief Minister)**: Read-all oversight across all wards, power to trigger system-wide SLA audits, and priority escalation monitoring.
4. **`authority`** (Legacy role, mapped to departmental administration).

| Collection | Role | Read (Query) | Create | Update | Delete |
|:---|:---|:---:|:---:|:---:|:---:|
| **`profiles`** | `citizen` | Own Only | Own Only | Own Only | None |
| | `team` / `cm` | All | None | None | None |
| **`grievances`** | `citizen` | Own Only | Yes | None | None |
| | `team` | All | Yes (Internal) | Yes (Status/Assigned) | None |
| | `cm` | All | None | None | None |
| **`departments`**| Anyone | Read-All | None | None | None |
| **`audits`** | `team` / `cm` | Read-All | System | None | None |

---

## 🗄️ 2. Collection Schemas

### A. Collection: `profiles`
Stores verified identities and metadata for citizens and officials.

| Attribute Name | Data Type | Size / Format | Description | Required |
|:---|:---|:---|:---|:---:|
| `userId` | String | 36 (Unique ID) | Link to Appwrite Authentication | Yes |
| `name` | String | 255 | User's full name / designation | Yes |
| `govIdType` | String | Enum (`Aadhaar`, `PAN`, `VoterID`) | Type of Government Identification | Yes |
| `govIdNumber` | String | 20 (Encrypted) | Masked/Encrypted ID number | Yes |
| `address` | String | 500 | Resident address or Secretariat department | Yes |
| `role` | String | Enum (`citizen`, `team`, `cm`, `authority`) | Authorization role | Yes |
| `createdAt` | DateTime | ISO 8601 | Profile registration date | Yes |

---

### B. Collection: `grievances`
Tracks the lifecycle of reported complaints from intake to official resolution.

| Attribute Name | Data Type | Format | Description | Required |
|:---|:---|:---|:---|:---:|
| `$id` | String | Unique ID | Stable ticket reference | Yes |
| `userId` | String | 36 | Submitter's profile reference | Yes |
| `description` | String | 2000 (Text) | Professional English refined description | Yes |
| `rawDescription`| String | 2000 (Text) | Original multi-lingual / vernacular text | No |
| `category` | String | Enum (`Streetlight`, `Garbage`, etc.) | Automatically classified category | Yes |
| `priority` | String | Enum (`Critical`, `High`, `Medium`, `Low`) | AI-determined urgency level | Yes |
| `department` | String | 100 | Assigned administrative department | Yes |
| `ward` | String | 100 | Delhi NCT administrative ward designation | Yes |
| `lat` | Double | Float | Latitude coordinate of the issue | Yes |
| `lng` | Double | Float | Longitude coordinate of the issue | Yes |
| `status` | String | Enum (`Pending`, `In Progress`, `Resolved`, `Escalated`) | Action workflow stage | Yes |
| `assignedTo` | String | 255 | Assigned field officer or escalation unit | Yes |
| `citizenPhoto` | String | String (Bucket Link) | Raw evidence image link | No |
| `repairPhoto` | String | String (Bucket Link) | Resolution proof image link | No |
| `afterImageUrl` | String | String (Bucket Link) | Verification visual proof link | No |
| `slaDeadline` | DateTime | ISO 8601 | Calculated threshold for SLA breach | Yes |
| `resolvedAt` | DateTime | ISO 8601 | Timestamp of closure | No |

---

### C. Collection: `departments`
Holds configured departments and fallback contacts. Easy to add new ones.

| Attribute Name | Data Type | Description | Required |
|:---|:---|:---|:---:|
| `id` | String | Unique department code (e.g. `DEP_SAN`) | Yes |
| `name` | String | Human readable name (e.g. `Sanitation & Waste Management`) | Yes |
| `headEmail` | String | Official email address of department chief | Yes |
| `defaultSlaHours`| Integer | Baseline SLA resolution window | Yes |

---

### D. Collection: `audits` (SLA Escalations)
Immutable log of system checks, audits, and official actions.

| Attribute Name | Data Type | Description | Required |
|:---|:---|:---|:---:|
| `ticketId` | String | Grievance ticket reference | Yes |
| `assignedDepartment` | String | Department responsible at breach | Yes |
| `ward` | String | Affected ward | Yes |
| `escalatedAt` | DateTime | Escalation timestamp | Yes |
| `breachDuration` | Integer | Minutes past deadline | Yes |

---

## 📈 3. SLA & Escalation Governance Rules

Deadlines are calculated automatically at intake based on AI-classified priority:

| Priority | SLA Resolution Window | Action on Expiration (Escalation) |
|:---|:---:|:---|
| **Critical** | **4 Hours** | Status -> `Escalated`, AssignedTo -> `CMO Escalation Cell` |
| **High** | **12 Hours** | Status -> `Escalated`, AssignedTo -> `Division Head` |
| **Medium** | **24 Hours** | Status -> `Escalated`, AssignedTo -> `Ward Supervisor` |
| **Low** | **48 Hours** | Status -> `Escalated`, AssignedTo -> `Department Coordinator` |

---

## 🛠️ 4. Extending the Schema (Adding new categories/departments)

To add a new complaint type or department:
1. **Update Categories**: Add the new category name in `src/lib/types.ts` under the `ComplaintCategory` union type and the `categories` array in `src/app/map/page.tsx` and `src/app/report/page.tsx`.
2. **Configure Department**: Insert a new department row in the `departments` database collection. The AI Classifier will automatically match raw descriptions to the closest department key.
3. **No Migration Needed**: Since Appwrite supports schemaless attributes or dynamic updates, adding custom metadata is non-breaking.
