import { useCallback, useEffect, useRef } from 'react';

const delay = (ms) =>
  new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });

async function mockTranscribe() {
  await delay(900);
  return 'Wohnzimmer, 5 Meter lang, 4 Meter breit, Parkett';
}

async function mockExtractWithAI(transcript) {
  await delay(900);

  if (!transcript?.trim()) {
    return null;
  }

  return {
    name: 'Wohnzimmer',
    length_m: 5.0,
    width_m: 4.0,
    material_id: 1,
    comment: '',
  };
}

function isValidRow(row) {
  return Boolean(
    row &&
      row.name &&
      Number.isFinite(Number(row.length_m)) &&
      Number.isFinite(Number(row.width_m)) &&
      Number(row.material_id) > 0,
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

function MicButton({ pipelineState, onNewRow, onStateChange, onShowToast }) {
  const processingRef = useRef(false);

  const stopRecordingAndProcess = useCallback(async () => {
    if (processingRef.current) {
      return;
    }

    processingRef.current = true;
    onStateChange('processing');

    try {
      const transcript = await mockTranscribe();
      const result = await mockExtractWithAI(transcript);

      if (isValidRow(result)) {
        onNewRow(result);
        onStateChange('done');
        return;
      }

      onShowToast({
        type: 'warning',
        message: 'Eingabe nicht erkannt \u2013 bitte erneut sprechen',
      });
      onStateChange('error');
    } catch (error) {
      onShowToast({
        type: 'warning',
        message: 'Eingabe nicht erkannt \u2013 bitte erneut sprechen',
      });
      onStateChange('error');
    } finally {
      processingRef.current = false;
    }
  }, [onNewRow, onShowToast, onStateChange]);

  useEffect(() => {
    if (pipelineState !== 'recording') {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      stopRecordingAndProcess();
    }, 2200);

    return () => window.clearTimeout(timeoutId);
  }, [pipelineState, stopRecordingAndProcess]);

  const handleClick = async () => {
    if (pipelineState === 'processing') {
      return;
    }

    if (pipelineState === 'recording') {
      await stopRecordingAndProcess();
      return;
    }

    onStateChange('recording');
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
        className={`group relative flex min-h-28 w-full items-center justify-center rounded-[2rem] border px-6 py-8 text-center transition duration-200 focus:outline-none focus:ring-4 focus:ring-hero-accent/20 sm:min-h-32 ${
          isRecording
            ? 'animate-pulseRing border-red-500 bg-red-500/10'
            : 'border-hero-accent/70 bg-gradient-to-r from-white/[0.03] to-hero-accent/10 hover:-translate-y-0.5 hover:shadow-yellow'
        } ${isProcessing ? 'cursor-wait opacity-80' : ''}`}
        disabled={isProcessing}
        aria-label={buttonLabel}
        title={buttonLabel}
      >
        <div className="absolute inset-0 bg-[length:200%_100%] bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 transition group-hover:animate-shimmer group-hover:opacity-100" />
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
