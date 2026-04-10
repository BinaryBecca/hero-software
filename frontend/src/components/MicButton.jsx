import { useCallback, useEffect, useRef } from 'react';

async function submitAudio(blob) {
  const formData = new FormData();
  formData.append('file', blob, 'recording.webm');

  const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/process_audio`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Server error ${response.status}: ${detail}`);
  }

  return response.json();
}

function isValidRow(row) {
  return Boolean(
    row &&
      row.name &&
      Number.isFinite(Number(row.length_m)) &&
      Number.isFinite(Number(row.width_m)) &&
      row.material_id,
  );
}

function MicIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-11 w-11"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
    >
      <path d="M12 3.25a3.25 3.25 0 0 0-3.25 3.25v5a3.25 3.25 0 0 0 6.5 0v-5A3.25 3.25 0 0 0 12 3.25Z" />
      <path d="M18.25 10.75a6.25 6.25 0 0 1-12.5 0" />
      <path d="M12 17v3.75" />
      <path d="M8.75 20.75h6.5" />
    </svg>
  );
}

function AnimatedDots({ tone = 'accent' }) {
  const colorClass = tone === 'danger' ? 'bg-red-300' : 'bg-hero-accent';

  return (
    <span className="flex items-center justify-center gap-2" aria-hidden="true">
      {[0, 1, 2].map((dot) => (
        <span
          key={dot}
          className={`h-3 w-3 animate-bounce rounded-full ${colorClass}`}
          style={{ animationDelay: `${dot * 140}ms` }}
        />
      ))}
    </span>
  );
}

const statusLabels = {
  idle: 'Bereit',
  recording: 'Aufnahme',
  processing: 'Verarbeitung',
  done: 'Fertig',
  error: 'Fehler',
};

function MicButton({ pipelineState, onNewRows, onStateChange, onShowToast }) {
  const processingRef = useRef(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  // Cleanup: stop recording if component unmounts while recording
  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stream?.getTracks().forEach((t) => t.stop());
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  const stopRecordingAndProcess = useCallback(async () => {
    if (processingRef.current) {
      return;
    }

    processingRef.current = true;
    onStateChange('processing');

    try {
      const blob = await new Promise((resolve, reject) => {
        const recorder = mediaRecorderRef.current;
        if (!recorder || recorder.state === 'inactive') {
          reject(new Error('No active recording'));
          return;
        }
        recorder.onstop = () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: recorder.mimeType });
          resolve(audioBlob);
        };
        recorder.stop();
      });

      // Release microphone
      mediaRecorderRef.current?.stream?.getTracks().forEach((t) => t.stop());
      mediaRecorderRef.current = null;

      const data = await submitAudio(blob);
      const rooms = data.rooms ?? [];
      const validRooms = rooms.filter(isValidRow);

      if (validRooms.length === 0) {
        onShowToast({
          type: 'warning',
          message: 'Eingabe nicht erkannt \u2013 bitte erneut sprechen',
        });
        onStateChange('error');
        return;
      }

      onNewRows(validRooms);
      onStateChange('done');
    } catch (error) {
      mediaRecorderRef.current?.stream?.getTracks().forEach((t) => t.stop());
      mediaRecorderRef.current = null;

      onShowToast({
        type: 'warning',
        message: 'Eingabe nicht erkannt \u2013 bitte erneut sprechen',
      });
      onStateChange('error');
    } finally {
      processingRef.current = false;
    }
  }, [onNewRows, onShowToast, onStateChange]);

  const handleClick = async () => {
    if (pipelineState === 'processing') {
      return;
    }

    if (pipelineState === 'recording') {
      await stopRecordingAndProcess();
      return;
    }

    // Start recording
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : 'audio/mp4';
      const recorder = new MediaRecorder(stream, { mimeType });
      audioChunksRef.current = [];
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      recorder.start();
      mediaRecorderRef.current = recorder;
      onStateChange('recording');
    } catch (err) {
      onShowToast({
        type: 'warning',
        message: 'Mikrofon-Zugriff verweigert',
      });
      onStateChange('error');
    }
  };

  const isRecording = pipelineState === 'recording';
  const isProcessing = pipelineState === 'processing';
  const buttonLabel = isRecording
    ? 'Aufnahme laeuft'
    : isProcessing
      ? 'Aufnahme wird verarbeitet'
      : 'Aufnahme starten';

  return (
    <section className="surface-panel overflow-hidden p-5 shadow-glow sm:p-7">
      <div className="mb-6 flex justify-end">
        <div className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-hero-muted">
          Status: {statusLabels[pipelineState] ?? pipelineState}
        </div>
      </div>

      <button
        type="button"
        onClick={handleClick}
        className={`group relative flex min-h-28 w-full items-center justify-center overflow-hidden rounded-[2rem] border px-6 py-8 text-center transition duration-200 focus:outline-none focus:ring-4 focus:ring-hero-accent/20 sm:min-h-32 ${
          isRecording
            ? 'animate-pulseRing border-red-500 bg-red-500/10'
            : 'border-hero-accent/70 bg-gradient-to-r from-white/[0.03] to-hero-accent/10 hover:-translate-y-0.5 hover:shadow-yellow'
        } ${isProcessing ? 'cursor-wait opacity-80' : ''}`}
        disabled={isProcessing}
        aria-label={buttonLabel}
        title={buttonLabel}
      >
        <div className="pointer-events-none absolute inset-px rounded-[1.9rem] bg-[length:200%_100%] bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 transition group-hover:animate-shimmer group-hover:opacity-100" />
        <div
          className={`relative flex h-20 w-20 items-center justify-center rounded-full border sm:h-24 sm:w-24 ${
            isRecording
              ? 'border-red-400 bg-red-500/20 text-red-200'
              : isProcessing
                ? 'border-hero-accent/50 bg-hero-accent/10 text-hero-accent'
                : 'border-hero-accent/60 bg-hero-accent/10 text-hero-accent'
          }`}
        >
          <span className="sr-only">{buttonLabel}</span>
          {isRecording ? <AnimatedDots tone="danger" /> : null}
          {isProcessing ? <AnimatedDots /> : null}
          {!isRecording && !isProcessing ? <MicIcon /> : null}
        </div>
      </button>
    </section>
  );
}

export default MicButton;
