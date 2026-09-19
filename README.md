# 🩸 EVERY DROP HAS A DECISION
### Smart Blood & Emergency Donor Network
*Healthcare / CivicTech / Explainable Logistics Engine*

---

## 🌟 Overview
**EVERY DROP HAS A DECISION** is a full-stack emergency blood network designed for rapid trauma coordination. It connects **Hospitals**, **Blood Banks**, and **Donors** via a single centralized real-time request engine, backed by an **Explainable Smart Allocation Engine** that balances clinical compatibility, urban transit distance, biological shelf expiry, and regional scarcity indices.

> **Decision-Support Prototype Disclaimer**: This platform is an explainable decision-support prototype. Final transfusion compatibility and clinical actions must always be verified by qualified healthcare professionals and authorized blood-bank personnel.

---

## 🚀 Live Demo & Quick Evaluation Access

The application is currently running at:
👉 **`http://localhost:5173/`**

### Instant 1-Click Demo Accounts (No Signup Required for Judges):
| Role | Demo Entity | One-Click Access | Responsibility |
| :--- | :--- | :--- | :--- |
| **Hospital** | City Care Hospital & Trauma Center | `hospital.demo@example.com` | Create urgent O- request, view live stepper & matching |
| **Blood Bank** | City Central Blood Bank | `bloodbank.demo@example.com` | Shared requests feed, reserve stock, dispatch courier |
| **Donor** | Suresh Varma (O- Universal Donor) | `donor.demo@example.com` | Availability toggle, compatible alerts, rapid commitment |
| **Admin** | Command & Oversight Director | `admin.demo@example.com` | Scarcity heatmaps, expiry monitor, audit trail |

---

## 🏛️ System Architecture

```
                     ┌──────────────────────────────────────────────┐
                     │            CENTRAL DATA LAYER                │
                     │   Single Source of Truth: EmergencyRequests, │
                     │   BloodInventory, Donors, Allocations, Audits│
                     └──────────────────────┬───────────────────────┘
                                            │ Real-time Event Broadcaster
     ┌──────────────────┬───────────────────┼───────────────────┬──────────────────┐
     ▼                  ▼                   ▼                   ▼                  ▼
┌──────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐    ┌─────────────┐
│ Landing  │     │  Hospital   │     │ Blood Bank  │     │    Donor    │    │    Admin    │
│  Portal  │     │  Dashboard  │     │  Dashboard  │     │  Dashboard  │    │  Command    │
└──────────┘     └──────┬──────┘     └──────┬──────┘     └──────┬──────┘    └──────┬──────┘
                        │                   │                   │                  │
                        ▼                   │                   │                  │
                Create Emergency            │                   │                  │
                    Request                 │                   │                  │
                        │                   │                   │                  │
                        ▼                   │                   │                  │
               ┌─────────────────┐          │                   │                  │
               │ Smart Allocation│          ▼                   ▼                  ▼
               │ Engine (Rules,  │──► Live Emergency  ──► Compatible Emergency──► Full Network
               │ Scarcity, Dist) │    Requests Feed       Requests Feed       Audit & Control
               └─────────────────┘
```

---

## 🧠 Explainable Smart Allocation Formula
Allocation candidates are ranked via a transparent 9-factor multi-objective weighted function:

$$\text{Score} = \frac{\sum (w_i \times S_i)}{\sum w_i}$$

- **Compatibility ($w=30$)**: ABO/Rh compatibility hard filter ($S=100$ exact, $S=88$ compatible alternate).
- **Clinical Urgency ($w=15$)**: CRITICAL (100), HIGH (85), MEDIUM (65), NORMAL (45).
- **Stock Availability ($w=15$)**: Real-time units in refrigerated custody.
- **Quantity Fulfillment ($w=10$)**: Ratio of units available to requested.
- **Geographic Proximity ($w=10$)**: Haversine distance decay function.
- **Estimated Travel Time ($w=8$)**: Real-time urban emergency corridor transit model.
- **Expiry / Wastage Prevention ($w=5$)**: Prioritizes units expiring in $\le 4$ days to save every drop.
- **Regional Scarcity Index ($w=4$)**: Priority boost for critically depleted groups (O-, B-, AB-).
- **Entity Verification ($w=3$)**: Accreditations, cold-chain checks.

---

## 🧪 3-to-5 Minute Hackathon Demonstration Flow
1. **Landing Page**: View operational metrics, live simulated node grid, and system architecture.
2. **Hospital Login**: Click "Hospital Demo". Click **"CREATE EMERGENCY REQUEST"**. Lodge an **O- (4 units, CRITICAL)** request. Observe the 8-step live calculation animation rank City Central Blood Bank with a 95/100 score.
3. **Blood Bank Login**: Switch role to "Blood Bank Demo". Open the shared requests tab. Notice the **SAME request** automatically present. Click **"ACCEPT & ALLOCATE"**. Notice available units decrement and reserve.
4. **Hospital Tracking**: Switch back to Hospital. Notice request status changed to `ACCEPTED / RESERVED`.
5. **Blood Bank Dispatch**: Click "Dispatch Vehicle".
6. **Donor Portal**: Switch to "Donor Demo" (Suresh Varma, O-). See the compatible emergency alert. Click **"RESPOND TO DONATE"**.
7. **Hospital Feed**: See volunteer donor commitment phone and arrival window appear. Confirm transfusion fulfillment.
8. **Admin Command Center**: View the complete cryptographic audit trail, blood scarcity monitor, and expiry prevention stats.

---

## 💻 Tech Stack
- **Frontend**: React 19, TypeScript, Vite
- **Styling**: Tailwind CSS, Lucide React
- **Data & State**: Centralized Reactive Store with local persistence & cross-tab synchronization
- **Cloud-Ready**: Includes `.env` adapter for Supabase PostgreSQL & Supabase Auth.
