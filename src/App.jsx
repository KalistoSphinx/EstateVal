import { useState, useEffect } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import ValuationStudio from './components/ValuationStudio';
import ModelBenchmarks from './components/ModelBenchmarks';
import ConfusionMatrixView from './components/ConfusionMatrixView';
import DiagnosticCharts from './components/DiagnosticCharts';
import DatasetExplorer from './components/DatasetExplorer';
import Bloom from './components/Bloom';

const API = (import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000').replace(/\/$/, '');

const DEFAULT_FEATURES = {
  City: 'Bangalore', Locality_Tier: 'Mid', BHK: 2, Bathrooms: 2,
  Super_Area_sqft: 1050, Carpet_Area_sqft: 820, Floor_No: 5,
  Total_Floors: 14, Property_Age_years: 5, Parking: 1,
  Furnishing: 'Semi-Furnished', Lift: 1, Gated_Society: 1,
  Distance_to_Metro_km: 1.8, Distance_to_CityCenter_km: 12.0,
  Nearby_School_km: 2.5, Nearby_Hospital_km: 2.8,
  Crime_Rate_Index: 35.0, model: 'all',
};

function calmScroll() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
}

export default function App() {
  const [tab, setTab] = useState('predict');
  const [metadata, setMetadata] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [predictions, setPredictions] = useState(null);
  const [predicting, setPredicting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const [metaRes, metricsRes] = await Promise.all([
          fetch(`${API}/api/features`),
          fetch(`${API}/api/models/metrics`),
        ]);
        if (metaRes.ok) setMetadata(await metaRes.json());
        if (metricsRes.ok) setMetrics(await metricsRes.json());

        predict(DEFAULT_FEATURES);
      } catch {
        setError(`Could not reach the FastAPI server at ${API}.`);
      }
    })();
  }, []);

  async function predict(features) {
    setPredicting(true);
    try {
      const res = await fetch(`${API}/api/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(features),
      });
      if (res.ok) {
        setPredictions(await res.json());
        setError(null);
      } else {
        setError(`Prediction failed (${res.status}: ${res.statusText}).`);
      }
    } catch {
      setError(`Prediction request failed. Ensure the API is reachable at ${API}.`);
    } finally {
      setPredicting(false);
    }
  }

  function changeTab(next) {
    setTab(next);
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }

  function goToStudio() {
    if (tab !== 'predict') {
      setTab('predict');
      window.setTimeout(() => {
        document.getElementById('studio')?.scrollIntoView({
          behavior: calmScroll(),
          block: 'start',
        });
      }, 80);
      return;
    }
    document.getElementById('studio')?.scrollIntoView({
      behavior: calmScroll(),
      block: 'start',
    });
  }

  const status = predicting ? 'Updating' : predictions ? 'Live' : 'Connecting';
  const statusColor = predicting ? 'bg-marigold' : predictions ? 'bg-sage' : 'bg-muted';

  return (
    <div className="flex min-h-screen flex-col">
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>

      <Header activeTab={tab} setActiveTab={changeTab} onEstimate={goToStudio} />

      <main id="main-content" className="flex-1">
        {tab === 'predict' ? (
          <>
            <Hero onEstimate={goToStudio} onCompare={() => changeTab('benchmarks')} />

            <section
              id="studio"
              className="relative mx-auto w-full max-w-[1120px] scroll-mt-6 px-5 pb-24 sm:px-6 sm:pb-28"
            >
              <div className="studio-window reveal reveal-late">
                <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 rounded-t-[1.2rem] border-b border-line-soft bg-[#f8f3e9] px-4 py-3 sm:px-5">
                  <div className="flex items-center gap-1.5" aria-hidden="true">
                    <span className="h-2.5 w-2.5 rounded-full bg-rose/80" />
                    <span className="h-2.5 w-2.5 rounded-full bg-marigold/80" />
                    <span className="h-2.5 w-2.5 rounded-full bg-sage/80" />
                  </div>
                  <p className="text-label text-graphite">Valuation studio</p>
                  <p className="justify-self-end inline-flex items-center gap-2 text-label text-graphite">
                    <span className={`h-1.5 w-1.5 rounded-full ${statusColor}`} aria-hidden="true" />
                    {status}
                  </p>
                </div>

                <div className="px-5 py-7 sm:px-8 sm:py-9 lg:px-10 lg:py-10">
                  {error && (
                    <p
                      role="alert"
                      className="mb-7 rounded-xl border border-[#b4544b]/25 bg-[#fbedea] px-5 py-4 text-small text-[#8c3a32]"
                    >
                      {error}
                    </p>
                  )}

                  <ValuationStudio
                    metadata={metadata}
                    onPredict={predict}
                    predictions={predictions}
                    predicting={predicting}
                  />
                </div>
              </div>
            </section>
          </>
        ) : (
          <div className="mx-auto w-full max-w-[1080px] px-6 pb-24 pt-12 sm:pt-16">
            {error && (
              <p
                role="alert"
                className="mb-8 rounded-xl border border-[#b4544b]/25 bg-[#fbedea] px-5 py-4 text-small text-[#8c3a32]"
              >
                {error}
              </p>
            )}

            {tab === 'benchmarks' && <ModelBenchmarks metrics={metrics} />}
            {tab === 'confusion' && <ConfusionMatrixView metrics={metrics} />}
            {tab === 'diagnostics' && <DiagnosticCharts metrics={metrics} />}
            {tab === 'dataset' && <DatasetExplorer summary={metrics?.dataset_summary} />}
          </div>
        )}
      </main>

      <footer className="border-t border-line/80">
        <div className="mx-auto flex w-full max-w-[1180px] flex-col gap-4 px-6 py-7 text-small text-muted sm:flex-row sm:items-center sm:justify-between">
          <span className="flex items-center gap-2.5 text-ink">
            <Bloom className="h-4 w-4 text-marigold" />
            <span className="font-display text-[1.15rem] tracking-tight">EstateVal</span>
          </span>
          <span className="max-w-[58ch] sm:text-right">
            12,000 properties across five Indian metros. Model output is an estimate,
            not a formal valuation.
          </span>
        </div>
      </footer>
    </div>
  );
}
