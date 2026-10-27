import PageHeader from './PageHeader';

export default function ModelBenchmarks({ metrics }) {
  if (!metrics?.models) {
    return <p className="py-16 text-center text-body text-graphite">Loading model data…</p>;
  }

  const { linear_regression: lr, knn, random_forest: rf, decision_tree: dt } = metrics.models;

  const cards = [
    {
      key: 'rf',
      name: 'Random forest',
      rank: 'Rank 1 — Top accuracy',
      color: '#5b7f5f',
      overallAccuracy: (rf.metrics.r2_score * 100).toFixed(2),
      tierAccuracy: rf.confusion_matrix.tier_accuracy,
      relativeAccuracy: (100 - rf.metrics.mape_percent).toFixed(1),
      errorMargin: `± ₹${(rf.metrics.mae / 1e5).toFixed(2)} Lakhs`,
      speed: `${rf.latency_ms_per_prediction} ms`,
      highlight: true,
    },
    ...(dt ? [{
      key: 'dt',
      name: 'Decision tree',
      rank: 'Rank 2 — High fidelity CART',
      color: '#8a6d3b',
      overallAccuracy: (dt.metrics.r2_score * 100).toFixed(2),
      tierAccuracy: dt.confusion_matrix.tier_accuracy,
      relativeAccuracy: (100 - dt.metrics.mape_percent).toFixed(1),
      errorMargin: `± ₹${(dt.metrics.mae / 1e5).toFixed(2)} Lakhs`,
      speed: `${dt.latency_ms_per_prediction} ms`,
      highlight: false,
    }] : []),
    {
      key: 'lr',
      name: 'Ridge regression',
      rank: dt ? 'Rank 3 — Fastest inference' : 'Rank 2 — Fastest inference',
      color: '#56658f',
      overallAccuracy: (lr.metrics.r2_score * 100).toFixed(2),
      tierAccuracy: lr.confusion_matrix.tier_accuracy,
      relativeAccuracy: (100 - lr.metrics.mape_percent).toFixed(1),
      errorMargin: `± ₹${(lr.metrics.mae / 1e5).toFixed(2)} Lakhs`,
      speed: `${lr.latency_ms_per_prediction} ms (Fastest)`,
      highlight: false,
    },
    {
      key: 'knn',
      name: 'Nearest neighbours',
      rank: dt ? 'Rank 4 — Spatial clustering' : 'Rank 3 — Spatial clustering',
      color: '#87759f',
      overallAccuracy: (knn.metrics.r2_score * 100).toFixed(2),
      tierAccuracy: knn.confusion_matrix.tier_accuracy,
      relativeAccuracy: (100 - knn.metrics.mape_percent).toFixed(1),
      errorMargin: `± ₹${(knn.metrics.mae / 1e5).toFixed(2)} Lakhs`,
      speed: `${knn.latency_ms_per_prediction} ms`,
      highlight: false,
    },
  ];

  const accuracyRows = [
    {
      label: 'Overall accuracy (R² fit)',
      rf: `${(rf.metrics.r2_score * 100).toFixed(2)}%`,
      dt: dt ? `${(dt.metrics.r2_score * 100).toFixed(2)}%` : '—',
      lr: `${(lr.metrics.r2_score * 100).toFixed(2)}%`,
      knn: `${(knn.metrics.r2_score * 100).toFixed(2)}%`,
      best: 'rf'
    },
    {
      label: 'Adjusted R² score',
      rf: rf.metrics.adjusted_r2.toFixed(4),
      dt: dt ? dt.metrics.adjusted_r2.toFixed(4) : '—',
      lr: lr.metrics.adjusted_r2.toFixed(4),
      knn: knn.metrics.adjusted_r2.toFixed(4),
      best: 'rf'
    },
    {
      label: 'Price tier placement accuracy',
      rf: `${rf.confusion_matrix.tier_accuracy}%`,
      dt: dt ? `${dt.confusion_matrix.tier_accuracy}%` : '—',
      lr: `${lr.confusion_matrix.tier_accuracy}%`,
      knn: `${knn.confusion_matrix.tier_accuracy}%`,
      best: 'rf'
    },
    {
      label: 'Relative prediction accuracy (100 − MAPE)',
      rf: `${(100 - rf.metrics.mape_percent).toFixed(2)}%`,
      dt: dt ? `${(100 - dt.metrics.mape_percent).toFixed(2)}%` : '—',
      lr: `${(100 - lr.metrics.mape_percent).toFixed(2)}%`,
      knn: `${(100 - knn.metrics.mape_percent).toFixed(2)}%`,
      best: 'rf'
    },
    {
      label: 'MAPE (relative error rate)',
      rf: `${rf.metrics.mape_percent.toFixed(2)}%`,
      dt: dt ? `${dt.metrics.mape_percent.toFixed(2)}%` : '—',
      lr: `${lr.metrics.mape_percent.toFixed(2)}%`,
      knn: `${knn.metrics.mape_percent.toFixed(2)}%`,
      best: 'rf'
    },
  ];

  const errorMarginRows = [
    {
      label: 'Average error deviation (MAE)',
      rf: `± ₹${(rf.metrics.mae / 1e5).toFixed(2)} Lakhs`,
      dt: dt ? `± ₹${(dt.metrics.mae / 1e5).toFixed(2)} Lakhs` : '—',
      lr: `± ₹${(lr.metrics.mae / 1e5).toFixed(2)} Lakhs`,
      knn: `± ₹${(knn.metrics.mae / 1e5).toFixed(2)} Lakhs`,
      best: 'rf'
    },
    {
      label: 'Outlier-weighted deviation (RMSE)',
      rf: `± ₹${(rf.metrics.rmse / 1e5).toFixed(2)} Lakhs`,
      dt: dt ? `± ₹${(dt.metrics.rmse / 1e5).toFixed(2)} Lakhs` : '—',
      lr: `± ₹${(lr.metrics.rmse / 1e5).toFixed(2)} Lakhs`,
      knn: `± ₹${(knn.metrics.rmse / 1e5).toFixed(2)} Lakhs`,
      best: 'rf'
    },
    {
      label: 'Median error deviation',
      rf: `± ₹${(rf.metrics.median_absolute_error / 1e5).toFixed(2)} Lakhs`,
      dt: dt ? `± ₹${(dt.metrics.median_absolute_error / 1e5).toFixed(2)} Lakhs` : '—',
      lr: `± ₹${(lr.metrics.median_absolute_error / 1e5).toFixed(2)} Lakhs`,
      knn: `± ₹${(knn.metrics.median_absolute_error / 1e5).toFixed(2)} Lakhs`,
      best: 'rf'
    },
    {
      label: 'Maximum single outlier gap',
      rf: `± ₹${(rf.metrics.max_error / 1e5).toFixed(0)} Lakhs`,
      dt: dt ? `± ₹${(dt.metrics.max_error / 1e5).toFixed(0)} Lakhs` : '—',
      lr: `± ₹${(lr.metrics.max_error / 1e5).toFixed(0)} Lakhs`,
      knn: `± ₹${(knn.metrics.max_error / 1e5).toFixed(0)} Lakhs`,
      best: 'rf'
    },
    {
      label: 'Inference latency',
      rf: `${rf.latency_ms_per_prediction} ms`,
      dt: dt ? `${dt.latency_ms_per_prediction} ms` : '—',
      lr: `${lr.latency_ms_per_prediction} ms`,
      knn: `${knn.latency_ms_per_prediction} ms`,
      best: 'lr'
    },
    {
      label: 'Training duration',
      rf: `${rf.train_time_sec} s`,
      dt: dt ? `${dt.train_time_sec} s` : '—',
      lr: `${lr.train_time_sec} s`,
      knn: `${knn.train_time_sec} s`,
      best: 'lr'
    },
  ];

  return (
    <div>
      <PageHeader
        title="Overall model accuracy & comparison."
        intro="Every figure below is benchmarked on 2,400 unseen properties (20% holdout split). Accuracy metrics reflect predictive fit, while error margins quantify typical valuation variance."
      />

      {/* ── Overall Accuracy Comparison Cards ── */}
      <section className="mb-12" aria-labelledby="accuracy-summary-heading">
        <h2 id="accuracy-summary-heading" className="mb-4 font-display text-[1.4rem] font-medium tracking-tight text-ink">
          Overall accuracy comparison
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((c) => (
            <div
              key={c.key}
              className={`relative rounded-2xl border p-5 transition-all sm:p-6 ${
                c.highlight ? 'border-sage/40 bg-white shadow-sm' : 'border-line bg-bone'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-2 text-small font-medium text-ink">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: c.color }} aria-hidden="true" />
                  {c.name}
                </span>
                <span className="text-[0.68rem] font-medium text-muted">{c.rank}</span>
              </div>

              <div className="my-4">
                <span className="text-micro text-muted">Overall predictive accuracy</span>
                <p className="font-display text-[2.2rem] leading-none text-ink tabular sm:text-[2.5rem]">
                  {c.overallAccuracy}%
                </p>
                <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-line-soft">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${c.overallAccuracy}%`, backgroundColor: c.color }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 border-t border-line-soft pt-3 text-small">
                <div>
                  <span className="block text-[0.7rem] text-muted">Price tier fit</span>
                  <span className="font-medium text-ink tabular">{c.tierAccuracy}%</span>
                </div>
                <div>
                  <span className="block text-[0.7rem] text-muted">Error margin</span>
                  <span className="font-medium text-ink tabular">{c.errorMargin}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Detailed Metric Table ── */}
      <section className="mb-14" aria-labelledby="matrix-heading">
        <h2 id="matrix-heading" className="mb-4 font-display text-[1.4rem] font-medium tracking-tight text-ink">
          Detailed benchmark breakdown
        </h2>
        <p className="mb-4 text-small text-graphite">
          Accuracy metrics are higher-is-better percentages. Margin of error values quantify deviation between prediction and market reality (lower is better).
        </p>

        <div className="overflow-x-auto rounded-2xl border border-line bg-bone">
          <table className="w-full min-w-[620px] text-left">
            <caption className="sr-only">Comprehensive benchmark table of accuracy and error margins for the models</caption>
            <thead>
              <tr className="border-b border-line bg-paper/50">
                <th className="w-[30%] px-3 py-3 text-[0.72rem] font-normal text-muted sm:px-5 sm:py-3.5 sm:text-label">Metric</th>
                <th className="bg-[#f8f3e9] px-2.5 py-3 text-[0.78rem] font-medium text-ink sm:px-4 sm:py-3.5 sm:text-small">
                  <span className="inline-flex items-center gap-1.5 sm:gap-2">
                    <span className="h-2 w-2 shrink-0 rounded-full bg-sage" aria-hidden="true" />
                    <span>Random forest</span>
                  </span>
                </th>
                <th className="px-2.5 py-3 text-[0.78rem] font-medium text-graphite sm:px-4 sm:py-3.5 sm:text-small">
                  <span className="inline-flex items-center gap-1.5 sm:gap-2">
                    <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: '#8a6d3b' }} aria-hidden="true" />
                    <span>Decision tree</span>
                  </span>
                </th>
                <th className="px-2.5 py-3 text-[0.78rem] font-medium text-graphite sm:px-4 sm:py-3.5 sm:text-small">
                  <span className="inline-flex items-center gap-1.5 sm:gap-2">
                    <span className="h-2 w-2 shrink-0 rounded-full bg-indigo" aria-hidden="true" />
                    <span>Ridge regression</span>
                  </span>
                </th>
                <th className="px-2.5 py-3 text-[0.78rem] font-medium text-graphite sm:px-4 sm:py-3.5 sm:text-small">
                  <span className="inline-flex items-center gap-1.5 sm:gap-2">
                    <span className="h-2 w-2 shrink-0 rounded-full bg-iris" aria-hidden="true" />
                    <span>Nearest neighbours</span>
                  </span>
                </th>
              </tr>
            </thead>
            <tbody>
              {/* Category A: Accuracy & Fit */}
              <tr className="border-b border-line bg-paper/40">
                <th colSpan="5" className="px-3 py-2 text-[0.72rem] font-semibold uppercase tracking-wider text-muted sm:px-5">
                  Accuracy &amp; Goodness of Fit (Higher is better)
                </th>
              </tr>
              {accuracyRows.map((row) => (
                <tr key={row.label} className="border-b border-line-soft transition-colors hover:bg-paper/30">
                  <th scope="row" className="px-3 py-3 text-[0.82rem] font-normal leading-snug text-graphite sm:px-5 sm:text-small">
                    {row.label}
                  </th>
                  <td className="whitespace-nowrap bg-[#f8f3e9] px-2.5 py-3 text-[0.85rem] font-medium text-ink tabular sm:px-4 sm:text-body">
                    {row.rf}
                  </td>
                  <td className="whitespace-nowrap px-2.5 py-3 text-[0.85rem] text-graphite tabular sm:px-4 sm:text-body">
                    {row.dt}
                  </td>
                  <td className="whitespace-nowrap px-2.5 py-3 text-[0.85rem] text-graphite tabular sm:px-4 sm:text-body">
                    {row.lr}
                  </td>
                  <td className="whitespace-nowrap px-2.5 py-3 text-[0.85rem] text-graphite tabular sm:px-4 sm:text-body">
                    {row.knn}
                  </td>
                </tr>
              ))}

              {/* Category B: Error Margins */}
              <tr className="border-b border-line bg-paper/40">
                <th colSpan="5" className="px-3 py-2 text-[0.72rem] font-semibold uppercase tracking-wider text-muted sm:px-5">
                  Error Tolerance &amp; Latency (Lower is better)
                </th>
              </tr>
              {errorMarginRows.map((row, index) => (
                <tr key={row.label} className={index < errorMarginRows.length - 1 ? 'border-b border-line-soft transition-colors hover:bg-paper/30' : 'transition-colors hover:bg-paper/30'}>
                  <th scope="row" className="px-3 py-3 text-[0.82rem] font-normal leading-snug text-graphite sm:px-5 sm:text-small">
                    {row.label}
                  </th>
                  <td className="whitespace-nowrap bg-[#f8f3e9] px-2.5 py-3 text-[0.85rem] font-medium text-ink tabular sm:px-4 sm:text-body">
                    {row.rf}
                  </td>
                  <td className="whitespace-nowrap px-2.5 py-3 text-[0.85rem] text-graphite tabular sm:px-4 sm:text-body">
                    {row.dt}
                  </td>
                  <td className="whitespace-nowrap px-2.5 py-3 text-[0.85rem] text-graphite tabular sm:px-4 sm:text-body">
                    {row.lr}
                  </td>
                  <td className="whitespace-nowrap px-2.5 py-3 text-[0.85rem] text-graphite tabular sm:px-4 sm:text-body">
                    {row.knn}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
