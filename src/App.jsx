import { useEffect, useState } from 'react';
import AufmassTable from './components/AufmassTable';
import MicButton from './components/MicButton';
import Toast from './components/Toast';

const materials = [
  { id: 1, label: 'Parkett' },
  { id: 2, label: 'Fliesen' },
  { id: 3, label: 'Teppich' },
  { id: 4, label: 'Laminat' },
];

let rowCounter = 0;

const createEmptyRow = (overrides = {}) => {
  rowCounter += 1;

  return {
    id: `row-${rowCounter}`,
    name: '',
    length_m: '',
    width_m: '',
    material_id: '',
    comment: '',
    ...overrides,
  };
};

function App() {
  const [rows, setRows] = useState([]);
  const [pipelineState, setPipelineState] = useState('idle');
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (pipelineState !== 'done' && pipelineState !== 'error') {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      setPipelineState('idle');
    }, 1400);

    return () => window.clearTimeout(timeoutId);
  }, [pipelineState]);

  const showToast = (nextToast) => {
    setToast({
      id: Date.now(),
      ...nextToast,
    });
  };

  const handleNewVoiceRow = (row) => {
    setRows((currentRows) => [
      ...currentRows,
      createEmptyRow({
        ...row,
        length_m: String(row.length_m ?? ''),
        width_m: String(row.width_m ?? ''),
        material_id: String(row.material_id ?? ''),
        comment: row.comment ?? '',
      }),
    ]);

    showToast({
      type: 'success',
      message: '\u2713 Eintrag hinzugef\u00fcgt',
    });
  };

  const handleAddRow = () => {
    setRows((currentRows) => [...currentRows, createEmptyRow()]);
  };

  const handleDeleteRow = (rowId) => {
    setRows((currentRows) => currentRows.filter((row) => row.id !== rowId));
  };

  const handleUpdateRow = (rowId, field, value) => {
    setRows((currentRows) =>
      currentRows.map((row) => {
        if (row.id !== rowId) {
          return row;
        }

        return {
          ...row,
          [field]: value,
        };
      }),
    );
  };

  return (
    <div className="min-h-screen bg-hero-grid bg-[size:28px_28px]">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col px-4 py-4 sm:px-6 lg:px-8">
        <header className="surface-panel relative overflow-hidden px-5 py-5 shadow-glow sm:px-7">
          <div className="absolute inset-0 bg-gradient-to-r from-hero-accent/10 via-transparent to-transparent" />
          <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="field-label">Hero Software Style</p>
              <h1 className="mt-2 text-3xl font-black tracking-tight text-hero-accent sm:text-4xl">
                {'Aufma\u00df'}
              </h1>
              <p className="mt-3 max-w-2xl text-sm text-hero-muted sm:text-base">
                {'Sprachgesteuerte Fl\u00e4chenerfassung f\u00fcr Handwerker mit editierbarer Tabelle,'}
                mobiloptimierter Kartenansicht und vorbereitetem Export-Workflow.
              </p>
            </div>

            <nav className="flex flex-wrap gap-3 text-sm font-semibold">
              <a
                href="#aufnahme"
                className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-hero-text transition hover:border-hero-accent/40 hover:text-hero-accent"
              >
                Aufnahme
              </a>
              <a
                href="#tabelle"
                className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-hero-text transition hover:border-hero-accent/40 hover:text-hero-accent"
              >
                Tabelle
              </a>
              <button
                type="button"
                className="rounded-full bg-hero-accent px-4 py-2 text-[#191919] shadow-yellow transition hover:-translate-y-0.5 hover:brightness-105"
              >
                Export
              </button>
            </nav>
          </div>
        </header>

        <main className="flex-1 space-y-6 py-6">
          <div id="aufnahme">
            <MicButton
              pipelineState={pipelineState}
              onStateChange={setPipelineState}
              onNewRow={handleNewVoiceRow}
              onShowToast={showToast}
            />
          </div>

          <AufmassTable
            rows={rows}
            materials={materials}
            onAddRow={handleAddRow}
            onDeleteRow={handleDeleteRow}
            onUpdateRow={handleUpdateRow}
          />
        </main>
      </div>

      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}

export default App;
