# NurseEye — Smart Baby Monitoring System

Real-time AI + IoT baby monitoring: cry detection, automated swing/music/feeding responses, and a premium animated mobile control center.

```
nurseeye/
├── backend/      FastAPI + PostgreSQL + WebSockets
├── frontend/     Expo (React Native) + Reanimated + Zustand
└── docker-compose.yml
```

---

## 1. Prerequisites

- **Node.js** 18+ and npm
- **Python** 3.12+
- **Docker** (recommended — runs Postgres + backend together) OR a local PostgreSQL 16 instance
- **Expo Go** app on your phone (iOS/Android), or an emulator/simulator

---

## 2. Running the Backend

### Option A — Docker (recommended)

From the project root:

```bash
docker compose up --build
```

This starts:
- PostgreSQL on `localhost:5432`
- FastAPI on `localhost:8000`

API docs available at `http://localhost:8000/docs` (Swagger UI) once it's up.

### Option B — Local Python

```bash
cd backend
python3 -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate
pip install -r requirements.txt --break-system-packages

# Set up Postgres locally, then:
cp .env.example .env
# edit .env with your DATABASE_URL, JWT_SECRET, REFRESH_TOKEN_SECRET

uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Tables are auto-created on startup (`init_db()` in `database.py`) — no migration step needed for this MVP. Swap to Alembic before production.

---

## 3. Running the Frontend

```bash
cd frontend
npm install

cp .env.example .env
# EXPO_PUBLIC_API_URL and EXPO_PUBLIC_WS_URL point at your backend
```

**Important — device networking:** `localhost` only works for the iOS simulator. For a physical phone via Expo Go, or for Android emulators, replace `localhost` with your machine's LAN IP (e.g. `http://192.168.1.50:8000`) in `frontend/.env`.

Start the dev server:

```bash
npx expo start
```

Scan the QR code with Expo Go (Android) or the Camera app (iOS), or press `i` / `a` for simulator/emulator.

---

## 4. First-Time Setup Workflow

The app has no seed data — here's the flow on first run:

1. **Register** an account on the login screen ("Create an account").
2. You're dropped at `(tabs)/home` — but there's **no baby profile yet**, so the dashboard will show skeletons / empty status.
3. Create a baby profile via the API directly (no UI screen for this in the MVP — see note below):

   ```bash
   curl -X POST http://localhost:8000/api/baby \
     -H "Authorization: Bearer <your-access-token>" \
     -H "Content-Type: application/json" \
     -d '{"name": "Aria", "birth_date": "2025-04-12"}'
   ```

   Get `<your-access-token>` from `POST /api/auth/login` response, or inspect it via React Native debugger / `TokenService.getAccessToken()`.

4. Reload the app — Home will now show the baby's status card, pulse ring, and quick actions.

> **Note:** A "Create baby profile" screen/modal is the natural next addition (Phase 2) — the backend endpoint (`POST /api/baby`) already exists; it just isn't wired to a form yet, to keep the initial frontend file count minimal per the project's simplicity requirement.

---

## 5. Simulating Sensor Data & Cry Detection

Without real hardware connected, you can exercise the full real-time pipeline manually:

**Push a sensor reading** (triggers a WebSocket broadcast to any connected app):

```bash
curl -X POST http://localhost:8000/api/baby/<baby_id>/sensors \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"type": "temperature", "value": 23.4}'
```

**Trigger cry detection + decision engine** (the AI pipeline):

```bash
# Step 1: cry detection (stub model — returns a result)
curl -X POST http://localhost:8000/api/baby/<baby_id>/ai/cry-detect \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{}'

# Step 2: feed that result into the decision engine
curl -X POST http://localhost:8000/api/baby/<baby_id>/ai/decision \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"cry": true, "reason": "tired", "confidence": 0.91}'
```

If your app is open with that baby selected, you'll see the Home pulse ring switch to "Crying", the device store update (swing/music turn on), and a new entry appear in Alerts — all via the open WebSocket, no refresh needed.

---

## 6. End-to-End Workflow (How It All Fits Together)

### Auth flow
1. **Register/Login** → `auth.service.ts` calls `/api/auth/register` or `/login` → backend issues an access token (15min) + refresh token (30 days, hashed + stored in `refresh_tokens` table).
2. Tokens saved via `TokenService` (Expo SecureStore).
3. `AuthGuard` (in `app/_layout.tsx`) hydrates on launch: reads stored token → calls `/api/auth/me` → sets Zustand `auth.store`.
4. Every `apiClient` request attaches the access token. On a `401`, the **refresh queue interceptor** in `api/client.ts` automatically calls `/api/auth/refresh`, rotates tokens, and retries — concurrent requests queue rather than each firing their own refresh.
5. If refresh itself fails (revoked/expired), `TokenService.clear()` runs and `AuthGuard` redirects to `/login`.
6. **Logout-all-devices**: bumping `users.token_version` instantly invalidates every outstanding access token (checked in `get_current_user`) and refresh token (checked in `refresh_tokens`).

### Real-time data flow
1. Hardware (ESP32/Pi) or your `curl` commands → `POST /api/baby/{id}/sensors` or `/ai/cry-detect`.
2. Sensor router writes to `sensor_readings` and broadcasts `sensor_update` via `ConnectionManager`.
3. Cry detection (`ml/cry_model.py`, currently a heuristic stub) → if confidence ≥ threshold, writes a `cry` Alert.
4. `/ai/decision` runs `decision_engine.evaluate_and_act()`:
   - `hunger` → `feeding_active = True`
   - `tired` → `swing_on = True`, `music_on = True`
   - `pain` → emergency Alert (fires even if `auto_mode` is off)
   - `discomfort` → `swing_on = True`
   - If `auto_mode` is `False`, only the emergency path acts — everything else is logged but not actuated (the Control screen's "Manual override" toggle).
5. Updated `device_states` row is broadcast as `device_state` over the WebSocket.
6. Frontend's `useLiveSocket` hook (mounted once in `(tabs)/_layout.tsx`) receives all three message types and writes directly into `baby.store` / `device.store` — every screen reading from those stores re-renders instantly.

### Frontend screen map
- **Home** — `BabyStatusCard` (pulse ring reflects `isCrying`), environment readouts (temp/humidity/moisture), quick action toggles (Swing/Music/Feed). Long-press the status card → `modals/device-control` quick panel.
- **Live** — placeholder camera feed (night-vision tinted; wire a real `<Video>`/WebRTC source here in Phase 4), live status overlay, audio level meter.
- **Alerts** — filterable list (cry/wetness/feeding/emergency), mark-as-read, tap a cry alert → `modals/cry-details` (shows confidence + what action was auto-taken).
- **Control** — Auto/Manual override switch, vertical gesture-driven swing intensity slider, music playlist, feeding trigger → `modals/feeding-confirm`.
- **Reports** — 24h sleep radial (placeholder until sleep-state derivation lands in Phase 3), cry pattern timeline, temperature/humidity area charts — all computed from `GET /api/baby/{id}/reports`.

---

## 7. Project Structure Reference

### Backend (`backend/app/`)
```
main.py            FastAPI app, CORS, router registration, lifespan (init_db)
config.py          Settings (pydantic-settings, .env)
database.py        Async SQLAlchemy engine/session
models/            User, RefreshToken, Baby, SensorReading, Alert, DeviceState
schemas/           Pydantic request/response models
routers/           auth, baby, sensors, alerts, control, ai
services/          auth_service, jwt_service, cry_service, decision_engine
middleware/        get_current_user dependency (token_version check)
ml/cry_model.py    Cry detection (heuristic stub → swap for librosa/CNN in Phase 3)
websocket/live.py  ConnectionManager + /ws/live/{baby_id}
```

### Frontend (`frontend/`)
```
app/
  _layout.tsx          Root: fonts, QueryClient, AuthGuard, modal stack
  index.tsx            Splash while AuthGuard redirects
  (auth)/login.tsx, register.tsx
  (tabs)/_layout.tsx    Glass pill tab bar + single WebSocket connection
  (tabs)/home.tsx, live.tsx, alerts.tsx, control.tsx, reports.tsx
  modals/device-control.tsx, cry-details.tsx, feeding-confirm.tsx

components/
  common/    GlassCard, NeonButton, GradientText, Header, Skeleton, FormField
  cards/     BabyStatusCard (pulse ring), DeviceCard, AlertCard
  charts/    TempGraph, SleepChart, CryTimeline
  live/      CameraFeed, AudioMeter
  control/   SwingSlider (gesture), MusicPlaylist

auth/        token.service, auth.service, auth.guard
store/       auth.store, baby.store, device.store (Zustand)
api/         client (axios + refresh queue), index (typed endpoints), useLiveSocket
utils/       constants (theme tokens), format, haptics
```

---

## 8. Roadmap / Known Phase 2-4 Items

- "Create baby profile" UI screen (endpoint already exists)
- Multi-baby picker on Home
- Replace cry detection stub with trained librosa/CNN model
- Real camera stream (WebRTC/HLS) in `CameraFeed`
- Sleep-state derivation for the Reports sleep radial
- Push notifications (Expo Notifications) for alerts when backgrounded
- Alembic migrations for production schema changes
- MQTT bridge service for ESP32/Raspberry Pi hardware layer