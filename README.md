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

## 🎯 What It Does

The browser client captures spoken input with `MediaRecorder`, uploads the audio as `multipart/form-data`, and waits for a typed `rooms` response from the backend. FastAPI hands the audio to ElevenLabs for speech-to-text, passes the transcript plus the material catalog into OpenAI `gpt-5.4`, and receives validated room objects back as `MeasurementResult`. Those rooms are inserted into a responsive React table where users can review, correct, extend, and export the measurements. In parallel, the backend turns every recognized material except `UNBEKANNT` into HERO GraphQL document actions using the computed room area as quantity.

## ✨ Features

- 🎙️ One-button microphone workflow with pipeline states `idle`, `recording`, `processing`, `done`, and `error`
- 📤 Live frontend-to-backend upload to `POST /process_audio`
- 🗣️ Real ElevenLabs speech-to-text integration at `https://api.elevenlabs.io/v1/speech-to-text`
- 🧠 Real OpenAI structured extraction via `client.responses.parse(...)` with model `gpt-5.4`
- 🧱 Typed room extraction with `name`, `length_m`, `width_m`, `material_id`, and optional `comment`
- 🧮 Automatic area calculation per row plus a running total in square meters
- 📝 Manual row creation plus inline editing and deletion
- 📱 Responsive table/card UI for mobile and desktop layouts
- 🔔 Warning and success toast notifications
- 🧾 Print/PDF export with totals, comments, and signature lines
- 🔗 HERO GraphQL document creation for recognized materials

## 🧰 Tech Stack

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

- Python requirement in `backend/pyproject.toml`: `>=3.13`
- Python version file in `backend/.python-version`: `3.13`
- Root `mise.toml`: `python = "3.13.5"`, `node = "22.14.0"`

## 🎙️ Voice Pipeline

### 1. Audio capture in the browser

- `frontend/src/components/MicButton.jsx` requests microphone access with `navigator.mediaDevices.getUserMedia({ audio: true })`
- It records with `MediaRecorder`
- Preferred MIME type: `audio/webm;codecs=opus`
- Fallback MIME type: `audio/mp4`

### 2. Frontend request to the backend

The frontend creates `FormData`, appends the blob as `file`, names it `recording.webm`, and sends it here:

```http
POST /process_audio
Content-Type: multipart/form-data
```

### 3. ElevenLabs integration

This integration is real, not mocked.

- Endpoint: `https://api.elevenlabs.io/v1/speech-to-text`
- HTTP method: `POST`
- Headers: `xi-api-key: $ELEVENLABS_API_KEY`
- Form fields:
  - `file`: uploaded audio bytes with the original filename
  - `model_id`: `scribe_v1`

The response is validated into this Pydantic model:

```json
{
  "language_code": "string",
  "language_probability": 0.0,
  "text": "string",
  "words": [
    {
      "text": "string",
      "start": 0.0,
      "end": 0.0,
      "type": "string",
      "logprob": 0.0
    }
  ],
  "transcription_id": "string",
  "audio_duration_secs": 0.0
}
```

### 4. OpenAI integration

This integration is also real, not mocked.

- SDK call: `AsyncOpenAI(...).responses.parse(...)`
- Model: `gpt-5.4`
- Input text: the hard-coded `MATERIALS` list plus the transcript returned by ElevenLabs
- Structured target: `MeasurementResult`

Instructions passed to the Responses API:

```text
Extract room measurements from the German transcript. For each room, extract the name, length and width in meters, and match the flooring material to the provided materials list by ID. Include any additional comments mentioned for the room (e.g. extra materials needed).
```

Expected structured output:

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

Validation rules from `backend/models.py`:

- `length_m` and `width_m` accept decimal commas and normalize `,` to `.`
- `material_id` must match one of the IDs in `MATERIALS`
- `area_m2` is computed as `length_m * width_m`

### 5. HERO document creation

After extraction, the backend builds one `add_product_position_by_id` action per room whose `material_id` is not `UNBEKANNT` and sends them to:

- Endpoint: `https://login.hero-software.de/api/external/v9/graphql`
- Auth header: `Authorization: Bearer $HERO_API_TOKEN`
- Hard-coded arguments:
  - `document_type_id = 1227309`
  - `project_match_id = 10049819`
  - `publish = false` by default

## 🔌 Frontend ↔ Backend

The frontend does call the backend.

- Request path from the browser: `/process_audio`
- Dev proxy in `frontend/vite.config.js`: `/process_audio -> http://localhost:8000`
- Request payload: `FormData` containing one field named `file`
- Success response: JSON matching `MeasurementResult`
- Frontend behavior after response:
  - filters invalid rows with `isValidRow(...)`
  - appends valid rooms to local React state
  - shows a success toast with the number of inserted entries
- Error behavior:
  - shows a warning toast saying the input was not recognized
  - switches the pipeline state to `error`

In practice, the UI behaves like a voice-first capture surface while FastAPI handles transcription, extraction, and the HERO handoff behind the scenes.

## 🚀 Getting Started

Run the backend first so the frontend proxy target at `http://localhost:8000` is available during development.

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

### Available frontend scripts

| Script    | Command        |
| --------- | -------------- |
| `dev`     | `vite`         |
| `build`   | `vite build`   |
| `preview` | `vite preview` |

### Root tooling

- `mise.toml` defines `python = "3.13.5"` and `node = "22.14.0"`
- No `vercel.json` is present in the repository root

## 🌐 API Endpoints

| Method | Path             | Request body                                          | Response                 | Description                                                                                                     |
| ------ | ---------------- | ----------------------------------------------------- | ------------------------ | --------------------------------------------------------------------------------------------------------------- |
| `POST` | `/process_audio` | `multipart/form-data` with one required `file` upload | `MeasurementResult` JSON | Reads audio, transcribes it, extracts room data, creates HERO document actions, and returns the extracted rooms |

Possible error path from the code:

- `422 Unprocessable Entity` with detail `"Could not extract measurements from audio"` if `extract_measurements(...)` returns `None`

## 🔐 Environment Variables

No frontend `.env`, `.env.example`, or `.env.local` files are present under `frontend/`.

| Variable             | Where referenced         | Purpose                                             |
| -------------------- | ------------------------ | --------------------------------------------------- |
| `OPENAI_API_KEY`     | `backend/services.py`    | Authenticates the OpenAI `AsyncOpenAI` client       |
| `ELEVENLABS_API_KEY` | `backend/services.py`    | Authenticates the ElevenLabs speech-to-text request |
| `HERO_API_TOKEN`     | `backend/hero_client.py` | Authenticates the HERO GraphQL request              |

The backend loads `.env` on startup through `load_dotenv()` in `backend/main.py`.

## 🎨 Color Palette

Unique hex colors found in `frontend/tailwind.config.js` and `frontend/src/index.css`:

- `#1A1A1A`
- `#202020`
- `#262626`
- `#343434`
- `#FFD700`
- `#FFFFFF`
- `#A3A3A3`
- `#EF4444`
- `#22C55E`
- `#1D1D1D`
- `#151515`

## 🗂️ Project Structure

```text
.
├─ banner.svg
├─ mise.toml
├─ backend/
│  ├─ .env.example
│  ├─ .gitignore
│  ├─ .python-version
│  ├─ hero_client.py
│  ├─ main.py
│  ├─ models.py
│  ├─ pyproject.toml
│  ├─ services.py
│  └─ uv.lock
└─ frontend/
   ├─ .gitignore
   ├─ index.html
   ├─ package-lock.json
   ├─ package.json
   ├─ postcss.config.js
   ├─ tailwind.config.js
   ├─ vite.config.js
   └─ src/
      ├─ App.jsx
      ├─ index.css
      ├─ main.jsx
      └─ components/
         ├─ AufmassTable.jsx
         ├─ MicButton.jsx
         └─ Toast.jsx
```

## 🏢 About HERO Software

HERO Software is the company context explicitly referenced throughout this repository: in the package naming, the HERO-themed color system, and the GraphQL endpoint at `login.hero-software.de`. The project is positioned as a voice-driven measurement workflow around HERO's ecosystem, and the linked company website is https://hero-software.de.

## 🏆 CheftreffAI Hackathon

The repository references the CheftreffAI Hackathon in `banner.svg`, so this project is documented here as a CheftreffAI Hackathon build without adding further claims beyond that source.

## 📄 License

MIT © 2025 HERO Software GmbH
