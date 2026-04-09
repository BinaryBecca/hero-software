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

  return (
    <section className="surface-panel overflow-hidden p-5 shadow-glow sm:p-7">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="field-label">Sprachaufnahme</p>
          <h2 className="mt-2 text-2xl font-extrabold text-hero-text">{'Aufma\u00df per Sprache erfassen'}</h2>
          <p className="mt-2 max-w-2xl text-sm text-hero-muted sm:text-base">
            {'Ein Tipp startet die Aufnahme. Nach dem Stopp l\u00e4uft die Transkription und die KI-Extraktion'}
            {' aktuell vollst\u00e4ndig als Mock.'}
          </p>
        </div>
        <div className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-hero-muted">
          Status: {pipelineState}
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
      >
        <div className="absolute inset-0 bg-[length:200%_100%] bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 transition group-hover:animate-shimmer group-hover:opacity-100" />
        <div className="relative flex flex-col items-center gap-3">
          <div
            className={`flex h-16 w-16 items-center justify-center rounded-full border text-3xl ${
              isRecording
                ? 'border-red-400 bg-red-500/20 text-red-200'
                : isProcessing
                  ? 'border-hero-accent/50 bg-hero-accent/10 text-hero-accent'
                  : 'border-hero-accent/60 bg-hero-accent/10 text-hero-accent'
            }`}
            aria-hidden="true"
          >
            {isProcessing ? '...' : '\u{1F3A4}'}
          </div>
          <div>
            <p className="text-xl font-extrabold text-hero-text sm:text-2xl">
              {isRecording
                ? 'Aufnahme l\u00e4uft...'
                : isProcessing
                  ? 'Verarbeitung...'
                  : 'Aufnahme starten'}
            </p>
            <p className="mt-2 text-sm text-hero-muted">
              {isRecording
                ? 'Zum direkten Verarbeiten erneut tippen oder kurz warten.'
                : 'Beispiel: "Wohnzimmer, 5 Meter lang, 4 Meter breit, Parkett"'}
            </p>
          </div>
        </div>
      </button>
    </section>
  );
}

export default MicButton;
