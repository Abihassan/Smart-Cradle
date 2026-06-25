# NurseEye – Smart Baby Monitoring System

AI-powered baby monitoring platform combining IoT devices, real-time analytics, cry detection, automated comfort responses, and a modern mobile control center.

## Overview

NurseEye provides continuous monitoring of infant well-being through sensor integration, intelligent cry analysis, live alerts, and automated device control.

### Key Features

* Real-time baby monitoring
* AI-based cry detection and classification
* Automated responses (swing, music, feeding assistance)
* Live WebSocket updates
* Mobile-first control dashboard
* Alert and notification management
* Environmental monitoring (temperature, humidity, moisture)
* Secure JWT authentication with refresh-token rotation

---

## Architecture

```text
nurseeye/
├── backend/          FastAPI + PostgreSQL + WebSockets
├── frontend/         Expo React Native
└── docker-compose.yml
```

### Technology Stack

#### Backend

* FastAPI
* PostgreSQL
* SQLAlchemy (Async)
* WebSockets
* JWT Authentication

#### Frontend

* React Native
* Expo
* Zustand
* React Query
* Reanimated

#### Infrastructure

* Docker
* Docker Compose

---

## Quick Start

### Prerequisites

* Node.js 18+
* Python 3.12+
* Docker & Docker Compose (recommended)
* Expo Go or mobile emulator

### Run with Docker

```bash
docker compose up --build
```

Services:

| Service      | URL                        |
| ------------ | -------------------------- |
| Backend API  | http://localhost:8000      |
| Swagger Docs | http://localhost:8000/docs |
| PostgreSQL   | localhost:5432             |

---

## Backend Setup

```bash
cd backend

python -m venv venv
source venv/bin/activate
# Windows:
# venv\Scripts\activate

pip install -r requirements.txt

cp .env.example .env
```

Configure environment variables:

```env
DATABASE_URL=
JWT_SECRET=
REFRESH_TOKEN_SECRET=
```

Start the server:

```bash
uvicorn app.main:app --reload
```

---

## Frontend Setup

```bash
cd frontend

npm install

cp .env.example .env
```

Configure API endpoints:

```env
EXPO_PUBLIC_API_URL=http://localhost:8000
EXPO_PUBLIC_WS_URL=ws://localhost:8000
```

Start Expo:

```bash
npx expo start
```

For physical devices, replace `localhost` with your machine's local IP address.

---

## Core System Flow

### Authentication

1. User registers or logs in.
2. Backend issues access and refresh tokens.
3. Tokens are securely stored on the device.
4. Requests automatically refresh expired access tokens.
5. Invalid sessions are automatically logged out.

### Real-Time Monitoring

1. Sensors send readings to the backend.
2. Data is stored and broadcast through WebSockets.
3. Cry detection engine evaluates incoming events.
4. Decision engine determines appropriate actions.
5. Mobile clients receive instant updates.

---

## API Documentation

Interactive API documentation is available at:

```text
http://localhost:8000/docs
```

---

## Project Structure

### Backend

```text
backend/app/
├── models/
├── schemas/
├── routers/
├── services/
├── middleware/
├── websocket/
└── ml/
```

### Frontend

```text
frontend/
├── app/
├── components/
├── store/
├── api/
├── auth/
└── utils/
```

---

## Roadmap

### Phase 2

* Baby profile creation UI
* Multi-baby support
* Enhanced notification system

### Phase 3

* Production-grade cry detection model
* Sleep pattern analysis
* Advanced reporting dashboard

### Phase 4

* Live camera streaming
* WebRTC integration
* Hardware MQTT bridge
* Raspberry Pi / ESP32 deployment support

---

## Future Enhancements

* Push notifications
* Predictive behavior analytics
* Cloud deployment support
* Multi-user caregiver access
* Historical health insights

---

## License

This project is intended for educational, research, and smart healthcare innovation purposes.
