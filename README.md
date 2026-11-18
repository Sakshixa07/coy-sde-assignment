# Coy SDE Intern Assignment

## Part A: Product Analysis & Feature Proposals

After exploring Coy (`app.getcoy.com`) across phone OTP onboarding, crush slot selection, email verification, invite link sharing, and the extra-slots flow, here are two core features that strengthen engagement while preserving Coy's zero-leak privacy model:

### 1. Mutual-Match Icebreakers & Ephemeral "Nudge" Prompts
* **What it is:** Once two users mutually match, unlock optional, low-pressure conversation starters—such as anonymous multiple-choice prompts (*"Where do we know each other from?"*, *"Coffee or drinks?"*) or a single daily "Nudge" that expires after 24 hours if unreciprocated.
* **Why it is required:** Coy removes the fear of unrequited rejection, but because many crushes are existing acquaintances (classmates, coworkers, mutual friends), post-match awkwardness often stalls the first message. Structured, low-stakes prompts bridge the gap between a mutual crush and a real-world conversation.

### 2. Anti-Enumeration & Crush-Slot Cooldowns
* **What it is:** Enforce a cooldown window (e.g., 7 days) before a removed crush slot can be reused, paired with rate-limiting on contact/handle lookups.
* **Why it is required:** Coy's core promise is that nobody knows you liked them unless it is mutual. Without slot-churn cooldowns, a user could repeatedly add a contact, check for an instant match, remove them, and cycle through a contact list to enumerate who liked them. A reuse cooldown closes this privacy edge case without affecting genuine users.

---

## Part B: "Discover" Tab Prototype

A mobile-first, swipe-based discovery experience built alongside Coy's existing tab bar (`Home` placeholder, `Discover`, and `Matches`).

### Tech Stack
* **Frontend:** Next.js (App Router), React, TypeScript, Tailwind CSS, Lucide Icons
* **Backend:** Next.js API Routes (`GET /api/feed`, `POST /api/swipe`, `GET /api/matches`, `POST /api/reset`)
* **Storage:** Server-side JSON file persistence (`/data/profiles.json` & `/data/userState.json`)

### Key Implementation Highlights
* **Zero-Leak Privacy Enforcement:** The `likedCurrentUser` flag exists strictly on the server and is stripped via `sanitizeProfile()` before serving `/api/feed`, ensuring network inspection never reveals unreciprocated likes.
* **Gesture & Desktop Support:** Supports pointer/touch drag gestures with dynamic rotation and `LIKE`/`PASS` overlays, plus accessible button controls on desktop.
* **Persistent State:** Swipes and mutual matches persist across page reloads, and swiped profiles never reappear in the feed.

### Running Locally

```bash
npm install
npm run dev