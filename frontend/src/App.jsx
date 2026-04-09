import { useEffect, useState } from 'react';
import AufmassTable from './components/AufmassTable';
import MicButton from './components/MicButton';
import Toast from './components/Toast';

const materials = [
  { id: 'HA0ZWAOXoAA', label: 'PVC Bodenbelag' },
  { id: 'HA0bFSoDsAA', label: 'Vinyl Bodenbelag' },
  { id: 'HA0Z0--YIAA', label: 'Fliesen' },
  { id: 'UNBEKANNT', label: 'Unbekannt' },
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

  const handleNewVoiceRows = (rooms) => {
    const newRows = rooms.map((room) =>
      createEmptyRow({
        ...room,
        length_m: String(room.length_m ?? ''),
        width_m: String(room.width_m ?? ''),
        material_id: String(room.material_id ?? ''),
        comment: room.comment ?? '',
      }),
    );

    setRows((currentRows) => [...currentRows, ...newRows]);

    showToast({
      type: 'success',
      message: `\u2713 ${newRows.length} ${newRows.length === 1 ? 'Eintrag' : 'Eintr\u00e4ge'} hinzugef\u00fcgt`,
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
        <main className="flex-1 space-y-6 py-6">
          <div id="aufnahme">
            <MicButton
              pipelineState={pipelineState}
              onStateChange={setPipelineState}
              onNewRows={handleNewVoiceRows}
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
