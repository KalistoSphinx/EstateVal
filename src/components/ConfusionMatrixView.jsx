import React, { useState } from 'react';
import PageHeader from './PageHeader';

const MODELS = [
  { key: 'random_forest', label: 'Random forest', short: 'Forest' },
  { key: 'linear_regression', label: 'Ridge regression', short: 'Ridge' },
  { key: 'knn', label: 'Nearest neighbours', short: 'KNN' },
];

export default function ConfusionMatrixView({ metrics }) {
  const [model, setModel] = useState('random_forest');
  const [selected, setSelected] = useState(null);

  if (!metrics?.models) {
    return <p className="py-16 text-center text-body text-graphite">Loading…</p>;
  }

  const data = metrics.models[model];
  const cm = data.confusion_matrix;
  const labels = cm.labels;
  const raw = cm.raw_matrix;
  const breakdown = cm.tier_breakdown;

  const short = (label) => label.split('(')[0].trim();
  const rowTotals = raw.map((row) => row.reduce((sum, value) => sum + value, 0));

  return (
    <div>
      <PageHeader
        title="Where the price tiers blur."
        intro="Each predicted price is binned into a market tier. The diagonal is correct; everything off it is a home sorted into the wrong band."
      />

      <div className="mb-8 flex flex-wrap items-center gap-2">
        <div className="flex flex-wrap gap-1 rounded-lg border border-line bg-bone p-1">
          {MODELS.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => { setModel(item.key); setSelected(null); }}
              aria-pressed={model === item.key}
              className={`cursor-pointer rounded-md px-3.5 py-2 text-small transition-colors ${
                model === item.key
                  ? 'bg-ink font-medium text-paper'
                  : 'text-graphite hover:bg-paper hover:text-ink'
              }`}
            >
              <span className="sm:hidden">{item.short}</span>
              <span className="hidden sm:inline">{item.label}</span>
            </button>
          ))}
        </div>
        <span className="ml-1 text-small text-muted tabular">
          {cm.tier_accuracy}% tier accuracy
        </span>
      </div>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-8">
        <div className="lg:col-span-7">
          <div className="rounded-2xl border border-line bg-bone p-4 sm:p-6">
            <p className="mb-3 text-center text-[0.7rem] text-muted sm:text-micro">Predicted tier</p>

            <div
              className="tier-matrix"
              style={{ '--tier-count': labels.length }}
            >
              <div className="flex items-end justify-end pb-1 pr-1 text-micro text-muted">
                Actual
              </div>

              {labels.map((label) => (
                <div key={label} className="px-0.5 py-1 text-center text-[0.75rem] font-medium leading-snug text-graphite sm:px-1 sm:text-label">
                  {short(label)}
                </div>
              ))}

              {raw.map((row, rowIndex) => (
                <React.Fragment key={rowIndex}>
                  <div className="flex items-center justify-end pr-1.5 text-[0.75rem] font-medium leading-snug text-graphite sm:pr-2 sm:text-label">
                    {short(labels[rowIndex])}
                  </div>

                  {row.map((value, columnIndex) => {
                    const isDiagonal = rowIndex === columnIndex;
                    const percent = rowTotals[rowIndex]
                      ? ((value / rowTotals[rowIndex]) * 100).toFixed(1)
                      : '0.0';
                    const isSelected = selected?.rowIndex === rowIndex && selected?.columnIndex === columnIndex;
                    const background = isDiagonal && value > 0
                      ? 'bg-sage/15'
                      : value > 0
                        ? 'bg-marigold/10'
                        : 'bg-paper/70';

                    return (
                      <button
                        key={columnIndex}
                        type="button"
                        onClick={() => setSelected({ rowIndex, columnIndex, value, percent, isDiagonal })}
                        aria-pressed={isSelected}
                        aria-label={`Actual ${short(labels[rowIndex])}, predicted ${short(labels[columnIndex])}: ${value} properties, ${percent}% of row`}
                        className={`tier-cell cursor-pointer rounded-lg text-center transition-all sm:rounded-xl ${background} ${
                          isSelected ? 'ring-2 ring-ink ring-offset-2 ring-offset-bone' : 'hover:ring-1 hover:ring-graphite/40'
                        }`}
                      >
                        <span className="block text-[1.15rem] font-medium leading-none text-ink tabular sm:text-[1.35rem]">
                          {value}
                        </span>
                        <span className="mt-1.5 block text-[0.7rem] text-muted tabular sm:text-micro">{percent}%</span>
                      </button>
                    );
                  })}
                </React.Fragment>
              ))}
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-line-soft pt-4">
              <div className="flex items-center gap-4 text-micro text-muted">
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-sm bg-sage/40" aria-hidden="true" />
                  Correct tier
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-sm bg-marigold/35" aria-hidden="true" />
                  Misclassified
                </span>
              </div>

              {selected ? (
                <p className="max-w-[46ch] text-small text-graphite">
                  {selected.isDiagonal
                    ? `${selected.value} homes correctly classified as ${short(labels[selected.rowIndex])}.`
                    : `${selected.value} homes were ${short(labels[selected.rowIndex])} but predicted ${short(labels[selected.columnIndex])}.`}
                  <span className="text-muted"> ({selected.percent}% of row)</span>
                </p>
              ) : (
                <p className="text-small text-muted">Select a cell for the count behind it.</p>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-5">
          <h2 className="mb-4 font-display text-[1.6rem] tracking-tight text-ink">
            Precision, recall and F1
          </h2>
          <div className="space-y-5">
            {labels.map((tier) => {
              const stats = breakdown[tier] || {};
              return (
                <div key={tier} className="border-b border-line-soft pb-4">
                  <p className="mb-2.5 text-small font-medium text-ink">{tier.replace('–', ' to ')}</p>
                  <div className="grid grid-cols-4 gap-2 text-center">
                    <Stat label="Precision" value={`${(stats.precision * 100).toFixed(1)}%`} />
                    <Stat label="Recall" value={`${(stats.recall * 100).toFixed(1)}%`} />
                    <Stat label="F1" value={stats.f1_score?.toFixed(3)} />
                    <Stat label="Support" value={stats.support} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div>
      <span className="mb-0.5 block text-label text-muted">{label}</span>
      <span className="text-small font-medium text-ink tabular">{value}</span>
    </div>
  );
}
