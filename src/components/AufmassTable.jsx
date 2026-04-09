const formatArea = (value) => Number(value || 0).toFixed(2);

const calculateArea = (length, width) => {
  const parsedLength = Number.parseFloat(length);
  const parsedWidth = Number.parseFloat(width);

  if (!Number.isFinite(parsedLength) || !Number.isFinite(parsedWidth)) {
    return 0;
  }

  return parsedLength * parsedWidth;
};

function AufmassTable({ rows, materials, onAddRow, onDeleteRow, onUpdateRow }) {
  const totalArea = rows.reduce((sum, row) => sum + calculateArea(row.length_m, row.width_m), 0);

  return (
    <section id="tabelle" className="surface-panel p-4 sm:p-6">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="field-label">{'Aufma\u00df'}</p>
          <h2 className="mt-2 text-2xl font-extrabold text-hero-text">Erfasste Positionen</h2>
          <p className="mt-2 text-sm text-hero-muted">
            {'Alle Felder sind jederzeit direkt editierbar. Auf Mobilger\u00e4ten erscheinen die Eintr\u00e4ge als Karten.'}
          </p>
        </div>
        <div className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-hero-muted">
          Positionen: {rows.length}
        </div>
      </div>

      <div className="space-y-4 md:hidden">
        {rows.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-white/10 bg-white/[0.02] px-5 py-8 text-center text-sm text-hero-muted">
            {'Noch keine Positionen vorhanden. F\u00fcgen Sie eine Zeile hinzu oder starten Sie die Sprachaufnahme.'}
          </div>
        ) : (
          rows.map((row, index) => {
            const area = calculateArea(row.length_m, row.width_m);

            return (
              <article key={row.id} className="rounded-3xl border border-white/10 bg-white/[0.03] p-4 shadow-lg">
                <div className="mb-4 flex items-start justify-between gap-4">
                  <div>
                    <p className="field-label">Nr.</p>
                    <p className="mt-1 text-lg font-bold text-hero-text">{index + 1}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onDeleteRow(row.id)}
                    className="rounded-2xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-lg text-red-300 transition hover:bg-red-500/20"
                    aria-label={`Zeile ${index + 1} l\u00f6schen`}
                  >
                    {'\u{1F5D1}\uFE0F'}
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="field-label" htmlFor={`name-mobile-${row.id}`}>
                      Bezeichnung
                    </label>
                    <input
                      id={`name-mobile-${row.id}`}
                      className="field-base mt-2"
                      value={row.name}
                      onChange={(event) => onUpdateRow(row.id, 'name', event.target.value)}
                      placeholder="z. B. Wohnzimmer"
                    />
                  </div>

                  <div>
                    <label className="field-label" htmlFor={`comment-mobile-${row.id}`}>
                      Kommentar
                    </label>
                    <input
                      id={`comment-mobile-${row.id}`}
                      className="field-base mt-2"
                      value={row.comment ?? ''}
                      onChange={(event) => onUpdateRow(row.id, 'comment', event.target.value)}
                      placeholder="Optional"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="field-label" htmlFor={`length-mobile-${row.id}`}>
                        {'L\u00e4nge (m)'}
                      </label>
                      <input
                        id={`length-mobile-${row.id}`}
                        className="field-base mt-2"
                        inputMode="decimal"
                        value={row.length_m}
                        onChange={(event) => onUpdateRow(row.id, 'length_m', event.target.value)}
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <label className="field-label" htmlFor={`width-mobile-${row.id}`}>
                        Breite (m)
                      </label>
                      <input
                        id={`width-mobile-${row.id}`}
                        className="field-base mt-2"
                        inputMode="decimal"
                        value={row.width_m}
                        onChange={(event) => onUpdateRow(row.id, 'width_m', event.target.value)}
                        placeholder="0.00"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="field-label" htmlFor={`material-mobile-${row.id}`}>
                      Material
                    </label>
                    <select
                      id={`material-mobile-${row.id}`}
                      className="field-base mt-2"
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

                  <div className="rounded-2xl border border-hero-accent/15 bg-hero-accent/10 px-4 py-3">
                    <p className="field-label text-hero-accent/80">{'Me\u00dfgehalt'}</p>
                    <p className="mt-1 text-lg font-bold text-hero-accent">{formatArea(area)} {'m\u00b2'}</p>
                  </div>
                </div>
              </article>
            );
          })
        )}
      </div>

      <div className="hidden overflow-x-auto md:block">
        <table className="min-w-[1040px] w-full border-separate border-spacing-y-3">
          <thead>
            <tr className="text-left text-xs uppercase tracking-[0.18em] text-hero-muted">
              <th className="px-4 py-3">Nr.</th>
              <th className="px-4 py-3">Bezeichnung</th>
              <th className="px-4 py-3">{'L\u00e4nge (m)'}</th>
              <th className="px-4 py-3">Breite (m)</th>
              <th className="px-4 py-3">Material</th>
              <th className="px-4 py-3">{'Me\u00dfgehalt (m\u00b2)'}</th>
              <th className="px-4 py-3 text-center">{'L\u00f6schen'}</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan="7"
                  className="rounded-3xl border border-dashed border-white/10 bg-white/[0.02] px-4 py-8 text-center text-sm text-hero-muted"
                >
                  {'Noch keine Positionen vorhanden. F\u00fcgen Sie eine Zeile hinzu oder starten Sie die Sprachaufnahme.'}
                </td>
              </tr>
            ) : (
              rows.map((row, index) => {
                const area = calculateArea(row.length_m, row.width_m);

                return (
                  <tr key={row.id} className="overflow-hidden rounded-3xl bg-white/[0.03] shadow-lg">
                    <td className="rounded-l-3xl border-y border-l border-white/10 px-4 py-4 text-sm font-bold text-hero-text">
                      {index + 1}
                    </td>
                    <td className="border-y border-white/10 px-4 py-4">
                      <div className="space-y-3">
                        <input
                          className="field-base"
                          value={row.name}
                          onChange={(event) => onUpdateRow(row.id, 'name', event.target.value)}
                          placeholder="Bezeichnung"
                        />
                        <input
                          className="field-base"
                          value={row.comment ?? ''}
                          onChange={(event) => onUpdateRow(row.id, 'comment', event.target.value)}
                          placeholder="Kommentar (optional)"
                        />
                      </div>
                    </td>
                    <td className="border-y border-white/10 px-4 py-4">
                      <input
                        className="field-base min-w-[140px]"
                        inputMode="decimal"
                        value={row.length_m}
                        onChange={(event) => onUpdateRow(row.id, 'length_m', event.target.value)}
                        placeholder="0.00"
                      />
                    </td>
                    <td className="border-y border-white/10 px-4 py-4">
                      <input
                        className="field-base min-w-[140px]"
                        inputMode="decimal"
                        value={row.width_m}
                        onChange={(event) => onUpdateRow(row.id, 'width_m', event.target.value)}
                        placeholder="0.00"
                      />
                    </td>
                    <td className="border-y border-white/10 px-4 py-4">
                      <select
                        className="field-base min-w-[180px]"
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
                    <td className="border-y border-white/10 px-4 py-4">
                      <div className="rounded-2xl border border-hero-accent/15 bg-hero-accent/10 px-4 py-3 text-center text-sm font-bold text-hero-accent">
                        {formatArea(area)} {'m\u00b2'}
                      </div>
                    </td>
                    <td className="rounded-r-3xl border-y border-r border-white/10 px-4 py-4 text-center">
                      <button
                        type="button"
                        onClick={() => onDeleteRow(row.id)}
                        className="rounded-2xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-lg text-red-300 transition hover:bg-red-500/20"
                        aria-label={`Zeile ${index + 1} l\u00f6schen`}
                      >
                        {'\u{1F5D1}\uFE0F'}
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-6 flex flex-col gap-4 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <button
            type="button"
            onClick={onAddRow}
            className="rounded-2xl bg-hero-accent px-5 py-3 text-sm font-bold text-[#191919] shadow-yellow transition hover:-translate-y-0.5 hover:brightness-105"
          >
            {'+ Zeile hinzuf\u00fcgen'}
          </button>
          <p className="text-sm font-semibold text-hero-text">
            Gesamt: <span className="text-hero-accent">{formatArea(totalArea)} {'m\u00b2'}</span>
          </p>
        </div>

        <button
          type="button"
          className="rounded-2xl border border-hero-accent/40 bg-hero-accent/10 px-5 py-3 text-sm font-bold text-hero-accent transition hover:bg-hero-accent/15"
        >
          Exportieren
        </button>
      </div>
    </section>
  );
}

export default AufmassTable;
