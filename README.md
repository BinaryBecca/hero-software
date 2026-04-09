# Aufmass App

React + Vite + Tailwind CSS demo for a German craftsman measurement workflow in a dark Hero-Software-inspired UI.

## Features

- Dark responsive design with yellow accent color and mobile-first layout
- Mock microphone flow with pipeline states: `idle`, `recording`, `processing`, `done`, `error`
- Mocked ElevenLabs transcription and mocked OpenAI data extraction
- Automatic row creation after successful voice parsing
- Yellow warning toast for unclear input and green success toast for valid entries
- Fully editable table cells for name, comment, length, width, and material
- Automatic `Messgehalt (m2)` and total area calculation
- Mobile card layout, tablet horizontal scroll, desktop full table layout

## Tech Stack

- React 18
- Vite 5
- Tailwind CSS 3

## Setup

```bash
npm install
npm run dev
```

Build for production:

```bash
npm run build
```

## Project Structure

- `src/App.jsx`
- `src/components/MicButton.jsx`
- `src/components/AufmassTable.jsx`
- `src/components/Toast.jsx`

## Mock Pipeline

The current voice flow is intentionally mocked:

1. The user starts recording.
2. The mock transcription returns:
   `Wohnzimmer, 5 Meter lang, 4 Meter breit, Parkett`
3. The mock AI extraction returns:

```js
{
  name: "Wohnzimmer",
  length_m: 5.0,
  width_m: 4.0,
  material_id: 1,
  comment: ""
}
```

No real API calls are used yet. The app is ready for future ElevenLabs and OpenAI integration.
