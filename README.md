<p align="center">
  <img src="banner.svg" alt="Spaß mit Aufmaß" width="100%"/>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-18.2.0-FFD700?style=for-the-badge&labelColor=202020&logo=react&logoColor=1A1A1A" alt="React 18.2.0"/>
  <img src="https://img.shields.io/badge/FastAPI-0.135.3-22C55E?style=for-the-badge&labelColor=202020&logo=fastapi&logoColor=FFFFFF" alt="FastAPI 0.135.3"/>
  <img src="https://img.shields.io/badge/OpenAI-gpt--5.4-FFD700?style=for-the-badge&labelColor=262626&logo=openai&logoColor=1A1A1A" alt="OpenAI gpt-5.4"/>
  <img src="https://img.shields.io/badge/ElevenLabs-scribe__v1-A3A3A3?style=for-the-badge&labelColor=1A1A1A&logoColor=FFFFFF" alt="ElevenLabs scribe_v1"/>
  <img src="https://img.shields.io/badge/License-MIT-343434?style=for-the-badge&labelColor=1A1A1A&logoColor=FFFFFF" alt="MIT License"/>
</p>

This tool was built for HERO Software (https://hero-software.de) and enables craftsmen to record measurements on the job site hands-free using voice input.

Instead of writing measurements down manually, the user can speak rooms, dimensions, and flooring context into the app and continue working while the system structures the result in the background.

## <img src="https://img.shields.io/badge/●-FFD700?style=flat-square&color=FFD700" height="14"/> What It Does

The browser client captures spoken input with `MediaRecorder`, uploads the audio as `multipart/form-data`, and waits for a typed `rooms` response from the backend. FastAPI hands the audio to ElevenLabs for speech-to-text, passes the transcript plus the material catalog into OpenAI `gpt-5.4`, and receives validated room objects back as `MeasurementResult`. Those rooms are inserted into a responsive React table where users can review, correct, extend, and export the measurements. In parallel, the backend turns every recognized material except `UNBEKANNT` into HERO GraphQL document actions using the computed room area as quantity.

## <img src="https://img.shields.io/badge/●-FFD700?style=flat-square&color=FFD700" height="14"/> Features

- <img src="https://img.shields.io/badge/●-FFD700?style=flat-square&color=FFD700" height="12"/> One-button microphone workflow with pipeline states `idle`, `recording`, `processing`, `done`, and `error`
- <img src="https://img.shields.io/badge/●-FFD700?style=flat-square&color=FFD700" height="12"/> Live frontend-to-backend upload to `POST /process_audio`
- <img src="https://img.shields.io/badge/●-FFD700?style=flat-square&color=FFD700" height="12"/> Real ElevenLabs speech-to-text integration at `https://api.elevenlabs.io/v1/speech-to-text`
- <img src="https://img.shields.io/badge/●-FFD700?style=flat-square&color=FFD700" height="12"/> Real OpenAI structured extraction via `client.responses.parse(...)` with model `gpt-5.4`
- <img src="https://img.shields.io/badge/●-1A1A1A?style=flat-square&color=1A1A1A" height="12"/> Typed room extraction with `name`, `length_m`, `width_m`, `material_id`, and optional `comment`
- <img src="https://img.shields.io/badge/●-1A1A1A?style=flat-square&color=1A1A1A" height="12"/> Automatic area calculation per row plus a running total in square meters
- <img src="https://img.shields.io/badge/●-1A1A1A?style=flat-square&color=1A1A1A" height="12"/> Manual row creation plus inline editing and deletion
- <img src="https://img.shields.io/badge/●-1A1A1A?style=flat-square&color=1A1A1A" height="12"/> Responsive table/card UI for mobile and desktop layouts
- <img src="https://img.shields.io/badge/●-1A1A1A?style=flat-square&color=1A1A1A" height="12"/> Warning and success toast notifications
- <img src="https://img.shields.io/badge/●-FFD700?style=flat-square&color=FFD700" height="12"/> Print/PDF export with totals, comments, and signature lines
- <img src="https://img.shields.io/badge/●-FFD700?style=flat-square&color=FFD700" height="12"/> HERO GraphQL document creation for recognized materials

## <img src="https://img.shields.io/badge/●-1A1A1A?style=flat-square&color=1A1A1A" height="14"/> Tech Stack

### Frontend

| Package                | Version   | Type          |
| ---------------------- | --------- | ------------- |
| `react`                | `18.2.0`  | dependency    |
| `react-dom`            | `18.2.0`  | dependency    |
| `@vitejs/plugin-react` | `4.2.1`   | devDependency |
| `autoprefixer`         | `10.4.19` | devDependency |
| `postcss`              | `8.4.38`  | devDependency |
| `tailwindcss`          | `3.4.3`   | devDependency |
| `vite`                 | `5.2.10`  | devDependency |

### Backend

| Package             | Declared in `pyproject.toml` | Locked in `uv.lock`   |
| ------------------- | ---------------------------- | --------------------- |
| `fastapi[standard]` | `>=0.135.3`                  | `fastapi 0.135.3`     |
| `httpx`             | `>=0.28.0`                   | `httpx 0.28.1`        |
| `openai`            | `>=1.70.0`                   | `openai 2.31.0`       |
| `python-dotenv`     | `>=1.1.0`                    | `python-dotenv 1.2.2` |

### Runtime / Tooling

- <img src="https://img.shields.io/badge/●-1A1A1A?style=flat-square&color=1A1A1A" height="12"/> Python `>=3.13` · version file: `3.13` · mise: `3.13.5`
- <img src="https://img.shields.io/badge/●-1A1A1A?style=flat-square&color=1A1A1A" height="12"/> Node `22.14.0` via `mise.toml`

## <img src="https://img.shields.io/badge/●-FFD700?style=flat-square&color=FFD700" height="14"/> Voice Pipeline

### 1. Audio capture in the browser

- <img src="https://img.shields.io/badge/●-FFD700?style=flat-square&color=FFD700" height="12"/> `MicButton.jsx` requests mic access via `navigator.mediaDevices.getUserMedia({ audio: true })`
- <img src="https://img.shields.io/badge/●-FFD700?style=flat-square&color=FFD700" height="12"/> Records with `MediaRecorder` — preferred: `audio/webm;codecs=opus`, fallback: `audio/mp4`

### 2. Frontend request to the backend

The frontend creates `FormData`, appends the blob as `file`, names it `recording.webm`, and sends it here:

```http
POST /process_audio
Content-Type: multipart/form-data
```

### 3. ElevenLabs integration

This integration is real, not mocked.

- <img src="https://img.shields.io/badge/●-FFD700?style=flat-square&color=FFD700" height="12"/> Endpoint: `https://api.elevenlabs.io/v1/speech-to-text`
- <img src="https://img.shields.io/badge/●-FFD700?style=flat-square&color=FFD700" height="12"/> Headers: `xi-api-key: $ELEVENLABS_API_KEY`
- <img src="https://img.shields.io/badge/●-1A1A1A?style=flat-square&color=1A1A1A" height="12"/> Fields: `file` (audio bytes) + `model_id: scribe_v1`

### 4. OpenAI integration

This integration is also real, not mocked.

- <img src="https://img.shields.io/badge/●-FFD700?style=flat-square&color=FFD700" height="12"/> SDK call: `AsyncOpenAI(...).responses.parse(...)`
- <img src="https://img.shields.io/badge/●-FFD700?style=flat-square&color=FFD700" height="12"/> Model: `gpt-5.4`
- <img src="https://img.shields.io/badge/●-1A1A1A?style=flat-square&color=1A1A1A" height="12"/> Input: `MATERIALS` list + ElevenLabs transcript
- <img src="https://img.shields.io/badge/●-1A1A1A?style=flat-square&color=1A1A1A" height="12"/> Structured target: `MeasurementResult`

```text
Extract room measurements from the German transcript. For each room, extract the name,
length and width in meters, and match the flooring material to the provided materials
list by ID. Include any additional comments mentioned for the room.
```

```json
{
  "rooms": [
    {
      "name": "string",
      "length_m": "Decimal",
      "width_m": "Decimal",
      "material_id": "HA0ZWAOXoAA | HA0bFSoDsAA | HA0Z0--YIAA | UNBEKANNT",
      "comment": "string | null"
    }
  ]
}
```

### 5. HERO document creation

- <img src="https://img.shields.io/badge/●-FFD700?style=flat-square&color=FFD700" height="12"/> Endpoint: `https://login.hero-software.de/api/external/v9/graphql`
- <img src="https://img.shields.io/badge/●-FFD700?style=flat-square&color=FFD700" height="12"/> Auth: `Authorization: Bearer $HERO_API_TOKEN`
- <img src="https://img.shields.io/badge/●-1A1A1A?style=flat-square&color=1A1A1A" height="12"/> One action per room where `material_id != UNBEKANNT`

## <img src="https://img.shields.io/badge/●-1A1A1A?style=flat-square&color=1A1A1A" height="14"/> Frontend ↔ Backend

- <img src="https://img.shields.io/badge/●-FFD700?style=flat-square&color=FFD700" height="12"/> Dev proxy: `/process_audio → http://localhost:8000`
- <img src="https://img.shields.io/badge/●-FFD700?style=flat-square&color=FFD700" height="12"/> Payload: `FormData` with one field `file`
- <img src="https://img.shields.io/badge/●-1A1A1A?style=flat-square&color=1A1A1A" height="12"/> On success: filters via `isValidRow(...)`, appends to React state, shows success toast
- <img src="https://img.shields.io/badge/●-1A1A1A?style=flat-square&color=1A1A1A" height="12"/> On error: warning toast + pipeline state switches to `error`

## <img src="https://img.shields.io/badge/●-FFD700?style=flat-square&color=FFD700" height="14"/> Getting Started

### Backend

```bash
cd backend
cp .env.example .env
uv sync
uv run python -m uvicorn main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## <img src="https://img.shields.io/badge/●-1A1A1A?style=flat-square&color=1A1A1A" height="14"/> API Endpoints

| Method | Path             | Request body                   | Response                 | Description                                                              |
| ------ | ---------------- | ------------------------------ | ------------------------ | ------------------------------------------------------------------------ |
| `POST` | `/process_audio` | `multipart/form-data` (`file`) | `MeasurementResult` JSON | Transcribes audio, extracts rooms, creates HERO actions, returns results |

- `422 Unprocessable Entity` — `"Could not extract measurements from audio"` if extraction returns `None`

## <img src="https://img.shields.io/badge/●-FFD700?style=flat-square&color=FFD700" height="14"/> Environment Variables

| Variable             | Where referenced         | Purpose                                             |
| -------------------- | ------------------------ | --------------------------------------------------- |
| `OPENAI_API_KEY`     | `backend/services.py`    | Authenticates the OpenAI `AsyncOpenAI` client       |
| `ELEVENLABS_API_KEY` | `backend/services.py`    | Authenticates the ElevenLabs speech-to-text request |
| `HERO_API_TOKEN`     | `backend/hero_client.py` | Authenticates the HERO GraphQL request              |

## <img src="https://img.shields.io/badge/●-1A1A1A?style=flat-square&color=1A1A1A" height="14"/> Project Structure

```text
.
├─ banner.svg
├─ mise.toml
├─ backend/
│  ├─ .env.example
│  ├─ hero_client.py
│  ├─ main.py
│  ├─ models.py
│  ├─ pyproject.toml
│  ├─ services.py
│  └─ uv.lock
└─ frontend/
   ├─ package.json
   ├─ tailwind.config.js
   ├─ vite.config.js
   └─ src/
      ├─ App.jsx
      ├─ index.css
      └─ components/
         ├─ AufmassTable.jsx
         ├─ MicButton.jsx
         └─ Toast.jsx
```

## <img src="https://img.shields.io/badge/●-FFD700?style=flat-square&color=FFD700" height="14"/> About HERO Software

HERO Software is Germany's leading craft management platform, used by thousands of tradespeople for invoicing, project management, and field operations. This project extends HERO's ecosystem with a voice-driven measurement workflow deeply integrated into HERO's GraphQL API. Learn more at https://hero-software.de.

## <img src="https://img.shields.io/badge/●-1A1A1A?style=flat-square&color=1A1A1A" height="14"/> CheftreffAI Hackathon

Built at the CheftreffAI Hackathon as a rapid prototype exploring AI voice interfaces for the trades industry.

## <img src="https://img.shields.io/badge/●-FFD700?style=flat-square&color=FFD700" height="14"/> License

MIT © 2025 HERO Software GmbH
