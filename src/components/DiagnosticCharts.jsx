import { useState } from 'react';
import PageHeader from './PageHeader';
import ScatterPlot from './ScatterPlot';
import ResidualPlot from './ResidualPlot';
import FeatureImportancePlot from './FeatureImportancePlot';

const MODEL_OPTS = [
  { id: 'random_forest', label: 'Random forest' },
  { id: 'linear_regression', label: 'Ridge regression' },
  { id: 'knn', label: 'Nearest neighbours' },
];

const CITY_MODEL_OPTS = [
  { id: 'random_forest', label: 'Random forest' },
  { id: 'linear_regression', label: 'Ridge regression' },
  { id: 'knn', label: 'Nearest neighbours' },
  { id: 'compare_all', label: 'Compare all three' },
];

export default function DiagnosticCharts({ metrics }) {
  const [scatterModel, setScatterModel] = useState('random_forest');
  const [residModel, setResidModel] = useState('random_forest');
  const [cityModel, setCityModel] = useState('random_forest');

  if (!metrics) {
    return <p className="py-16 text-center text-body text-graphite">Loading charts…</p>;
  }

  const samples = metrics.scatter_samples || [];
  const residuals = metrics.models?.[residModel]?.residuals;

  const rfCityErrors = metrics.models?.random_forest?.city_errors || {};
  const lrCityErrors = metrics.models?.linear_regression?.city_errors || {};
  const knnCityErrors = metrics.models?.knn?.city_errors || {};

  const activeCityErrors =
    cityModel === 'linear_regression'
      ? lrCityErrors
      : cityModel === 'knn'
      ? knnCityErrors
      : rfCityErrors;

  const citiesList = ['Bangalore', 'Hyderabad', 'Mumbai', 'Nagpur', 'Pune'];

  return (
    <div>
      <PageHeader
        title="Diagnostic visualizations & feature analysis."
        intro="Inspect the regression fit at high resolution: price scatter, residual error spread around zero, mathematical feature importances, and regional accuracy."
      />

      {/* ── 1. Full-Width Scatter Plot ── */}
      <section className="mb-12 rounded-2xl border border-line bg-bone p-5 sm:p-7" aria-labelledby="scatter-heading">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 id="scatter-heading" className="font-display text-[1.4rem] font-medium tracking-tight text-ink">
              Actual vs predicted market prices
            </h2>
            <p className="mt-0.5 text-small text-graphite">
              Points directly on the dashed 45° diagonal line have zero prediction error. Points hugging it indicate tight predictive fit.
            </p>
          </div>
          <ModelSwitch options={MODEL_OPTS} value={scatterModel} onChange={setScatterModel} label="Scatter plot model" />
        </div>

        <div className="rounded-xl border border-line-soft bg-paper/60 p-4 sm:p-6">
          <ScatterPlot samples={samples} selectedModel={scatterModel} />
        </div>
        <p className="mt-3 text-center text-micro text-muted">
          Showing 120 evenly spaced holdout test properties spanning ₹15 Lakhs to ₹5.5 Crores. Hover over any point to inspect exact actual vs predicted values.
        </p>
      </section>

      {/* ── 2. Full-Width Residual Error Histogram ── */}
      <section className="mb-12 rounded-2xl border border-line bg-bone p-5 sm:p-7" aria-labelledby="residual-heading">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 id="residual-heading" className="font-display text-[1.4rem] font-medium tracking-tight text-ink">
              Residual error distribution
            </h2>
            <p className="mt-0.5 text-small text-graphite">
              Frequency distribution of prediction errors (Actual Price − Predicted Price in ₹ Lakhs). A tall, narrow peak centered at zero reflects high precision without systematic bias.
            </p>
          </div>
          <ModelSwitch options={MODEL_OPTS} value={residModel} onChange={setResidModel} label="Residual plot model" />
        </div>

        <div className="rounded-xl border border-line-soft bg-paper/60 p-4 sm:p-6">
          <ResidualPlot histogram={residuals?.histogram} />
        </div>

        {residuals?.percentiles && (
          <div className="mt-5 grid grid-cols-2 gap-3 border-t border-line-soft pt-4 text-center sm:grid-cols-4">
            <Stat label="Median error deviation" value={`± ₹${(residuals.percentiles.p50 / 1e5).toFixed(2)}L`} />
            <Stat label="75th percentile gap" value={`± ₹${(residuals.percentiles.p75 / 1e5).toFixed(2)}L`} />
            <Stat label="90th percentile gap" value={`± ₹${(residuals.percentiles.p90 / 1e5).toFixed(2)}L`} />
            <Stat label="95th percentile gap" value={`± ₹${(residuals.percentiles.p95 / 1e5).toFixed(2)}L`} />
          </div>
        )}
      </section>

      {/* ── 3. Full-Width Feature Importance Columns Visualization ── */}
      <section className="mb-12 rounded-2xl border border-line bg-bone p-5 sm:p-7" aria-labelledby="features-heading">
        <div className="mb-3">
          <h2 id="features-heading" className="font-display text-[1.4rem] font-medium tracking-tight text-ink">
            Feature importance ranking (normal property attributes)
          </h2>
          <p className="text-small text-graphite">
            Ranked horizontal columns displaying the percentage contribution of each normal property attribute (e.g. Location, Super built-up area, Locality tier) from most important (#1) downward.
          </p>
        </div>

        <FeatureImportancePlot importances={metrics.feature_importances} />
      </section>

      {/* ── 4. Regional Accuracy by City (With Model Switcher) ── */}
      <section className="rounded-2xl border border-line bg-bone p-5 sm:p-7" aria-labelledby="city-heading">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 id="city-heading" className="font-display text-[1.4rem] font-medium tracking-tight text-ink">
              Model accuracy across metropolitan markets
            </h2>
            <p className="mt-0.5 text-small text-graphite">
              Evaluating how each model performs across individual cities on 2,400 holdout tests.
            </p>
          </div>
          <ModelSwitch
            options={CITY_MODEL_OPTS}
            value={cityModel}
            onChange={setCityModel}
            label="City accuracy model selection"
          />
        </div>

        {/* View Mode A: Individual Selected Model */}
        {cityModel !== 'compare_all' && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {Object.entries(activeCityErrors)
              .sort((a, b) => b[1].r2 - a[1].r2)
              .map(([city, data]) => {
                const r2Pct = (data.r2 * 100).toFixed(1);
                const isSolid = data.r2 >= 0.85;
                return (
                  <div key={city} className="rounded-xl border border-line-soft bg-paper/60 p-4 transition-all">
                    <div className="flex items-center justify-between">
                      <span className="text-body font-medium text-ink">{city}</span>
                      <span className="text-micro text-muted">{data.count} tests</span>
                    </div>
                    <div className="mt-3">
                      <span className="text-micro text-muted">Accuracy (R²)</span>
                      <p className={`font-display text-[1.7rem] leading-none tabular ${isSolid ? 'text-ink' : 'text-amber-700'}`}>
                        {r2Pct}%
                      </p>
                    </div>
                    <p className="mt-2.5 border-t border-line-soft pt-2 text-micro text-graphite tabular">
                      Mean error: ± ₹{(data.mae / 1e5).toFixed(2)}L
                    </p>
                  </div>
                );
              })}
          </div>
        )}

        {/* View Mode B: Compare All Three Side-by-Side */}
        {cityModel === 'compare_all' && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {citiesList.map((city) => {
              const rf = rfCityErrors[city] || {};
              const lr = lrCityErrors[city] || {};
              const knn = knnCityErrors[city] || {};
              const count = rf.count || 0;

              return (
                <div key={city} className="rounded-xl border border-line-soft bg-paper/70 p-4">
                  <div className="flex items-center justify-between border-b border-line-soft pb-2">
                    <span className="text-body font-semibold text-ink">{city}</span>
                    <span className="text-micro text-muted">{count} tests</span>
                  </div>

                  <div className="mt-3 space-y-2.5 text-small">
                    {/* Random Forest */}
                    <div className="rounded-lg bg-sage/15 p-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[0.72rem] font-medium text-sage-deep">Random forest</span>
                        <span className="text-[0.7rem] font-bold text-sage-deep">R² {(rf.r2 * 100).toFixed(1)}%</span>
                      </div>
                      <span className="text-[0.68rem] text-graphite tabular">MAE ± ₹{(rf.mae / 1e5).toFixed(1)}L</span>
                    </div>

                    {/* Ridge Regression */}
                    <div className="rounded-lg bg-indigo/10 p-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[0.72rem] font-medium text-indigo">Ridge</span>
                        <span className="text-[0.7rem] font-bold text-indigo">R² {(lr.r2 * 100).toFixed(1)}%</span>
                      </div>
                      <span className="text-[0.68rem] text-graphite tabular">MAE ± ₹{(lr.mae / 1e5).toFixed(1)}L</span>
                    </div>

                    {/* KNN */}
                    <div className="rounded-lg bg-bone p-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[0.72rem] font-medium text-graphite">KNN</span>
                        <span className="text-[0.7rem] font-bold text-ink">R² {(knn.r2 * 100).toFixed(1)}%</span>
                      </div>
                      <span className="text-[0.68rem] text-muted tabular">MAE ± ₹{(knn.mae / 1e5).toFixed(1)}L</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

function ModelSwitch({ options, value, onChange, label }) {
  return (
    <div role="group" aria-label={label} className="flex flex-wrap gap-1 rounded-lg border border-line bg-bone p-1">
      {options.map((option) => (
        <button
          key={option.id}
          type="button"
          onClick={() => onChange(option.id)}
          aria-pressed={value === option.id}
          className={`cursor-pointer rounded-md px-2.5 py-1.5 text-label transition-colors ${
            value === option.id
              ? 'bg-ink font-medium text-paper'
              : 'text-graphite hover:bg-paper hover:text-ink'
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="rounded-xl border border-line-soft bg-paper/60 p-2.5">
      <span className="block text-[0.7rem] text-muted">{label}</span>
      <span className="mt-0.5 font-medium text-ink tabular text-small">{value}</span>
    </div>
  );
}
