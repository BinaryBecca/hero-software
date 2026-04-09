const formatArea = (value) => Number(value || 0).toFixed(2);

const calculateArea = (length, width) => {
  const parsedLength = Number.parseFloat(length);
  const parsedWidth = Number.parseFloat(width);

  if (!Number.isFinite(parsedLength) || !Number.isFinite(parsedWidth)) {
    return 0;
  }

  return parsedLength * parsedWidth;
};

function TrashIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.9"
    >
      <path d="M4.75 7h14.5" />
      <path d="M9.5 7V5.4c0-.77.63-1.4 1.4-1.4h2.2c.77 0 1.4.63 1.4 1.4V7" />
      <path d="M17.5 7l-.62 11.08a2 2 0 0 1-2 1.89H9.12a2 2 0 0 1-2-1.89L6.5 7" />
      <path d="M10 11v5" />
      <path d="M14 11v5" />
    </svg>
  );
}

function AufmassTable({ rows, materials, onAddRow, onDeleteRow, onUpdateRow }) {
  const totalArea = rows.reduce((sum, row) => sum + calculateArea(row.length_m, row.width_m), 0);

  return (
    <section id="tabelle" className="surface-panel overflow-hidden p-0">
      <div className="flex flex-col gap-3 border-b border-hero-border bg-hero-surfaceAlt/80 p-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <div className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-xs font-bold uppercase tracking-[0.18em] text-hero-muted">
            Positionen: {rows.length}
          </div>
          <div className="rounded-lg border border-hero-accent/30 bg-hero-accent/10 px-3 py-2 text-xs font-bold uppercase tracking-[0.18em] text-hero-accent">
            Gesamt: {formatArea(totalArea)} {'m\u00b2'}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onAddRow}
            className="rounded-lg bg-hero-accent px-4 py-2 text-sm font-extrabold text-[#191919] shadow-yellow transition hover:-translate-y-0.5 hover:brightness-105"
          >
            {'+ Zeile'}
          </button>
          <button
            type="button"
            className="rounded-lg border border-hero-accent/40 bg-hero-accent/10 px-4 py-2 text-sm font-bold text-hero-accent transition hover:bg-hero-accent/15"
          >
            Exportieren
          </button>
        </div>
      </div>

      <div className="space-y-3 p-3 lg:hidden">
        {rows.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] px-5 py-8 text-center text-sm text-hero-muted">
            {'Noch keine Positionen vorhanden. F\u00fcgen Sie eine Zeile hinzu oder starten Sie die Sprachaufnahme.'}
          </div>
        ) : (
          rows.map((row, index) => {
            const area = calculateArea(row.length_m, row.width_m);

            return (
              <article key={row.id} className="overflow-hidden rounded-2xl border border-hero-border bg-white/[0.03]">
                <div className="flex items-center justify-between border-b border-hero-border bg-hero-surfaceAlt/70 px-3 py-2">
                  <div className="text-sm font-extrabold uppercase tracking-[0.18em] text-hero-accent">
                    Nr. {index + 1}
                  </div>
                  <button
                    type="button"
                    onClick={() => onDeleteRow(row.id)}
                    className="inline-flex items-center justify-center rounded-lg border border-red-500/30 bg-red-500/10 p-2.5 text-red-300 transition hover:bg-red-500/20"
                    aria-label={`Zeile ${index + 1} l\u00f6schen`}
                  >
                    <TrashIcon />
                  </button>
                </div>

                <div className="grid gap-px bg-hero-border">
                  <div className="bg-hero-surface p-3">
                    <label className="field-label" htmlFor={`name-mobile-${row.id}`}>
                      Bezeichnung
                    </label>
                    <input
                      id={`name-mobile-${row.id}`}
                      className="field-base mt-2 rounded-lg"
                      value={row.name}
                      onChange={(event) => onUpdateRow(row.id, 'name', event.target.value)}
                      placeholder="z. B. Wohnzimmer"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-px bg-hero-border">
                    <div className="bg-hero-surface p-3">
                      <label className="field-label" htmlFor={`length-mobile-${row.id}`}>
                        {'L\u00e4nge (m)'}
                      </label>
                      <input
                        id={`length-mobile-${row.id}`}
                        className="field-base mt-2 rounded-lg"
                        inputMode="decimal"
                        value={row.length_m}
                        onChange={(event) => onUpdateRow(row.id, 'length_m', event.target.value)}
                        placeholder="0.00"
                      />
                    </div>
                    <div className="bg-hero-surface p-3">
                      <label className="field-label" htmlFor={`width-mobile-${row.id}`}>
                        Breite (m)
                      </label>
                      <input
                        id={`width-mobile-${row.id}`}
                        className="field-base mt-2 rounded-lg"
                        inputMode="decimal"
                        value={row.width_m}
                        onChange={(event) => onUpdateRow(row.id, 'width_m', event.target.value)}
                        placeholder="0.00"
                      />
                    </div>
                  </div>

                  <div className="bg-hero-surface p-3">
                    <label className="field-label" htmlFor={`material-mobile-${row.id}`}>
                      Material
                    </label>
                    <select
                      id={`material-mobile-${row.id}`}
                      className="field-base mt-2 rounded-lg"
                      value={row.material_id}
                      onChange={(event) => onUpdateRow(row.id, 'material_id', event.target.value)}
                    >
                      <option value="">{'Material w\u00e4hlen'}</option>
                      {materials.map((material) => (
                        <option key={material.id} value={material.id}>
                          {material.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="bg-hero-surface p-3">
                    <label className="field-label" htmlFor={`comment-mobile-${row.id}`}>
                      Kommentar
                    </label>
                    <input
                      id={`comment-mobile-${row.id}`}
                      className="field-base mt-2 rounded-lg"
                      value={row.comment ?? ''}
                      onChange={(event) => onUpdateRow(row.id, 'comment', event.target.value)}
                      placeholder="Optional"
                    />
                  </div>

                  <div className="bg-hero-accent/10 px-3 py-3 text-right text-lg font-extrabold text-hero-accent">
                    {formatArea(area)} {'m\u00b2'}
                  </div>
                </div>
              </article>
            );
          })
        )}
      </div>

      <div className="hidden max-h-[62vh] overflow-auto lg:block">
        <table className="min-w-[980px] w-full border-collapse text-sm">
          <thead>
            <tr className="sticky top-0 z-10 bg-hero-surfaceAlt text-left text-[11px] uppercase tracking-[0.18em] text-hero-accent">
              <th className="w-14 border border-hero-border px-3 py-3 text-center">Nr.</th>
              <th className="min-w-[260px] border border-hero-border px-3 py-3">Bezeichnung</th>
              <th className="w-36 border border-hero-border px-3 py-3">{'L\u00e4nge (m)'}</th>
              <th className="w-36 border border-hero-border px-3 py-3">Breite (m)</th>
              <th className="w-44 border border-hero-border px-3 py-3">Material</th>
              <th className="w-36 border border-hero-border px-3 py-3 text-right">{'Me\u00dfgehalt (m\u00b2)'}</th>
              <th className="w-20 border border-hero-border px-3 py-3 text-center" aria-label="Aktionen" />
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan="7"
                  className="border border-hero-border bg-white/[0.02] px-4 py-10 text-center text-sm text-hero-muted"
                >
                  {'Noch keine Positionen vorhanden. F\u00fcgen Sie eine Zeile hinzu oder starten Sie die Sprachaufnahme.'}
                </td>
              </tr>
            ) : (
              rows.map((row, index) => {
                const area = calculateArea(row.length_m, row.width_m);

                return (
                  <tr key={row.id} className="bg-white/[0.02] transition hover:bg-hero-accent/5">
                    <td className="border border-hero-border px-3 py-2 text-center font-extrabold text-hero-accent">
                      {index + 1}
                    </td>
                    <td className="border border-hero-border px-3 py-2">
                      <div className="grid gap-2">
                        <input
                          className="field-base rounded-lg px-3 py-2"
                          value={row.name}
                          onChange={(event) => onUpdateRow(row.id, 'name', event.target.value)}
                          placeholder="Bezeichnung"
                        />
                        <input
                          className="field-base rounded-lg px-3 py-2 text-xs"
                          value={row.comment ?? ''}
                          onChange={(event) => onUpdateRow(row.id, 'comment', event.target.value)}
                          placeholder="Kommentar (optional)"
                        />
                      </div>
                    </td>
                    <td className="border border-hero-border px-3 py-2">
                      <input
                        className="field-base rounded-lg px-3 py-2"
                        inputMode="decimal"
                        value={row.length_m}
                        onChange={(event) => onUpdateRow(row.id, 'length_m', event.target.value)}
                        placeholder="0.00"
                      />
                    </td>
                    <td className="border border-hero-border px-3 py-2">
                      <input
                        className="field-base rounded-lg px-3 py-2"
                        inputMode="decimal"
                        value={row.width_m}
                        onChange={(event) => onUpdateRow(row.id, 'width_m', event.target.value)}
                        placeholder="0.00"
                      />
                    </td>
                    <td className="border border-hero-border px-3 py-2">
                      <select
                        className="field-base rounded-lg px-3 py-2"
                        value={row.material_id}
                        onChange={(event) => onUpdateRow(row.id, 'material_id', event.target.value)}
                      >
                        <option value="">{'Material w\u00e4hlen'}</option>
                        {materials.map((material) => (
                          <option key={material.id} value={material.id}>
                            {material.label}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="border border-hero-border bg-hero-accent/10 px-3 py-2 text-right font-extrabold text-hero-accent">
                      {formatArea(area)}
                    </td>
                    <td className="border border-hero-border px-3 py-2 text-center">
                      <button
                        type="button"
                        onClick={() => onDeleteRow(row.id)}
                        className="inline-flex items-center justify-center rounded-lg border border-red-500/30 bg-red-500/10 p-2.5 text-red-300 transition hover:bg-red-500/20"
                        aria-label={`Zeile ${index + 1} l\u00f6schen`}
                      >
                        <TrashIcon />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
          <tfoot>
            <tr className="bg-hero-accent/10 text-hero-accent">
              <td className="border border-hero-border px-3 py-3 text-right font-extrabold" colSpan="5">
                Gesamt
              </td>
              <td className="border border-hero-border px-3 py-3 text-right font-extrabold">
                {formatArea(totalArea)}
              </td>
              <td className="border border-hero-border" />
            </tr>
          </tfoot>
        </table>
      </div>
    </section>
  );
}

export default AufmassTable;
