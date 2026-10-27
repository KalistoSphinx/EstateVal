import { useEffect, useId, useRef, useState } from 'react';

const PRESETS = [
  { name: 'Bangalore 3BHK', city: 'Bangalore', tier: 'Mid', bhk: 3, bath: 3, superArea: 1450, carpetArea: 1160, floor: 7, floors: 16, age: 3, parking: 1, furn: 'Semi-Furnished', lift: 1, gated: 1, metro: 1.2, center: 14.5, school: 1.5, hospital: 2.1, crime: 28.5 },
  { name: 'Mumbai luxury', city: 'Mumbai', tier: 'Premium', bhk: 3, bath: 4, superArea: 1680, carpetArea: 1350, floor: 18, floors: 26, age: 2, parking: 1, furn: 'Fully-Furnished', lift: 1, gated: 1, metro: 0.8, center: 9.0, school: 0.8, hospital: 1.2, crime: 18.2 },
  { name: 'Hyderabad 2BHK', city: 'Hyderabad', tier: 'Mid', bhk: 2, bath: 2, superArea: 1050, carpetArea: 840, floor: 4, floors: 10, age: 6, parking: 1, furn: 'Semi-Furnished', lift: 1, gated: 1, metro: 2.5, center: 15.0, school: 2.2, hospital: 3.0, crime: 34.0 },
  { name: 'Nagpur starter', city: 'Nagpur', tier: 'Budget', bhk: 1, bath: 1, superArea: 540, carpetArea: 430, floor: 2, floors: 6, age: 8, parking: 0, furn: 'Unfurnished', lift: 1, gated: 0, metro: 4.8, center: 12.0, school: 2.8, hospital: 3.5, crime: 55.0 },
  { name: 'Pune premium', city: 'Pune', tier: 'Premium', bhk: 2, bath: 2, superArea: 1120, carpetArea: 890, floor: 11, floors: 18, age: 4, parking: 1, furn: 'Semi-Furnished', lift: 1, gated: 1, metro: 1.5, center: 11.0, school: 1.8, hospital: 2.4, crime: 26.0 },
];

const MODEL_META = {
  random_forest: { name: 'Random forest', note: 'best fit', color: '#5b7f5f' },
  decision_tree: { name: 'Decision tree', note: 'fast tree', color: '#8a6d3b' },
  linear_regression: { name: 'Ridge regression', color: '#56658f' },
  knn: { name: 'Nearest neighbours', color: '#87759f' },
};

function applyPreset(p) {
  return {
    City: p.city, Locality_Tier: p.tier, BHK: p.bhk, Bathrooms: p.bath,
    Super_Area_sqft: p.superArea, Carpet_Area_sqft: p.carpetArea,
    Floor_No: p.floor, Total_Floors: p.floors, Property_Age_years: p.age,
    Parking: p.parking, Furnishing: p.furn, Lift: p.lift,
    Gated_Society: p.gated, Distance_to_Metro_km: p.metro,
    Distance_to_CityCenter_km: p.center, Nearby_School_km: p.school,
    Nearby_Hospital_km: p.hospital, Crime_Rate_Index: p.crime, model: 'all',
  };
}

const DEFAULT = applyPreset(PRESETS[0]);

const number = (value) => Number(value).toLocaleString('en-IN');

export default function ValuationStudio({ metadata, onPredict, predictions, predicting }) {
  const [form, setForm] = useState(DEFAULT);
  const [showEstimateBar, setShowEstimateBar] = useState(false);
  const predictRef = useRef(onPredict);
  const studioHeaderRef = useRef(null);
  const resultsRef = useRef(null);

  useEffect(() => {
    predictRef.current = onPredict;
  }, [onPredict]);

  useEffect(() => {
    const timer = setTimeout(() => predictRef.current(form), 250);
    return () => clearTimeout(timer);
  }, [form]);

  useEffect(() => {
    const updateBar = () => {
      const header = studioHeaderRef.current;
      const results = resultsRef.current;
      if (!header || !results) return;

      const headerPassed = header.getBoundingClientRect().top < 0;
      const resultsBelow = results.getBoundingClientRect().top > window.innerHeight - 80;
      setShowEstimateBar(headerPassed && resultsBelow);
    };

    updateBar();
    window.addEventListener('scroll', updateBar, { passive: true });
    window.addEventListener('resize', updateBar);
    return () => {
      window.removeEventListener('scroll', updateBar);
      window.removeEventListener('resize', updateBar);
    };
  }, []);

  const set = (key, val) => setForm((prev) => ({ ...prev, [key]: val }));

  const cities = metadata?.cities || ['Bangalore', 'Hyderabad', 'Mumbai', 'Nagpur', 'Pune'];
  const localityTiers = metadata?.locality_tiers || ['Budget', 'Mid', 'Premium'];
  const furnishingOptions = metadata?.furnishing_options || ['Unfurnished', 'Semi-Furnished', 'Fully-Furnished'];

  const normalized = predictions?.predictions || {};
  const modelEntries = Object.entries(MODEL_META);
  const values = modelEntries
    .map(([key]) => normalized[key]?.predicted_price_inr)
    .filter(Boolean);
  const maxValue = values.length ? Math.max(...values) : 0;

  return (
    <div>
      <div ref={studioHeaderRef} className="mb-7 flex flex-wrap items-end justify-between gap-5 border-b border-line-soft pb-7">
        <div className="max-w-[46ch]">
          <h2 className="font-display text-[2rem] leading-tight tracking-tight text-ink">
            Describe the property
          </h2>
          <p className="mt-2 text-small text-graphite">
            The estimate recalculates as you change a detail. Nothing is saved.
          </p>
        </div>
        <p className="text-label text-muted">18 features, 4 models</p>
      </div>

      <div className="mb-9 flex flex-wrap items-center gap-2">
        <span className="mr-1 text-label text-muted">Start with</span>
        {PRESETS.map((preset) => (
          <button
            key={preset.name}
            type="button"
            onClick={() => setForm(applyPreset(preset))}
            className="cursor-pointer rounded-full border border-line px-3.5 py-2 text-small text-graphite transition-colors hover:border-ink hover:text-ink"
          >
            {preset.name}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1.16fr)_minmax(0,0.84fr)] lg:gap-0">
        {/* ── Form ── */}
        <div className="space-y-10 lg:pr-10">
          <section aria-labelledby="location-heading">
            <SectionTitle id="location-heading">Location</SectionTitle>
            <fieldset className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <legend className="sr-only">Location</legend>
              <div>
                <label htmlFor="city" className="mb-2 block text-label text-graphite">City</label>
                <select
                  id="city"
                  value={form.City}
                  onChange={(event) => set('City', event.target.value)}
                  className="w-full cursor-pointer rounded-lg border border-line bg-bone px-3.5 py-2.5 text-body text-ink transition-colors focus:border-indigo focus:outline-none"
                >
                  {cities.map((city) => <option key={city}>{city}</option>)}
                </select>
              </div>
              <div>
                <span className="mb-2 block text-label text-graphite">Locality tier</span>
                <Segmented
                  options={localityTiers}
                  value={form.Locality_Tier}
                  onChange={(value) => set('Locality_Tier', value)}
                  label="Locality tier"
                />
              </div>
            </fieldset>
          </section>

          <section aria-labelledby="home-heading">
            <SectionTitle id="home-heading">The home</SectionTitle>
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <span className="mb-2 block text-label text-graphite">Bedrooms (BHK)</span>
                  <Segmented
                    options={[1, 2, 3, 4, 5]}
                    value={form.BHK}
                    onChange={(value) => set('BHK', value)}
                    label="Bedrooms in BHK"
                  />
                </div>
                <div>
                  <span className="mb-2 block text-label text-graphite">Bathrooms</span>
                  <Segmented
                    options={[1, 2, 3, 4, 5]}
                    value={form.Bathrooms}
                    onChange={(value) => set('Bathrooms', value)}
                    label="Bathrooms"
                  />
                </div>
              </div>

              <div>
                <span className="mb-2 block text-label text-graphite">Furnishing</span>
                <Segmented
                  options={furnishingOptions}
                  value={form.Furnishing}
                  onChange={(value) => set('Furnishing', value)}
                  label="Furnishing"
                />
              </div>

              <div className="space-y-6 pt-1">
                <RangeField
                  label="Super built-up area"
                  value={form.Super_Area_sqft}
                  min={350} max={3000} step={25}
                  suffix=" sqft"
                  onChange={(value) => {
                    const ratio = form.Carpet_Area_sqft / form.Super_Area_sqft;
                    const safeRatio = ratio > 0.55 && ratio < 0.95 ? ratio : 0.78;
                    setForm((prev) => ({
                      ...prev,
                      Super_Area_sqft: value,
                      Carpet_Area_sqft: Math.round(value * safeRatio),
                    }));
                  }}
                />
                <RangeField
                  label="Carpet area"
                  value={form.Carpet_Area_sqft}
                  min={250} max={2300} step={20}
                  suffix=" sqft"
                  onChange={(value) => set('Carpet_Area_sqft', value)}
                />
              </div>
            </div>
          </section>

          <section aria-labelledby="building-heading">
            <SectionTitle id="building-heading">The building</SectionTitle>
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                <NumField label="Floor" value={form.Floor_No} min={0} max={form.Total_Floors}
                  onChange={(value) => set('Floor_No', value)} />
                <NumField label="Total floors" value={form.Total_Floors} min={1} max={40}
                  onChange={(value) => set('Total_Floors', value)} />
                <NumField label="Age (years)" value={form.Property_Age_years} min={0} max={35}
                  onChange={(value) => set('Property_Age_years', value)} />
              </div>

              <div>
                <span className="mb-2 block text-label text-graphite">Amenities</span>
                <div className="flex flex-wrap gap-2.5">
                  <Toggle label="Parking" checked={form.Parking === 1} onChange={(value) => set('Parking', value ? 1 : 0)} />
                  <Toggle label="Lift" checked={form.Lift === 1} onChange={(value) => set('Lift', value ? 1 : 0)} />
                  <Toggle label="Gated society" checked={form.Gated_Society === 1} onChange={(value) => set('Gated_Society', value ? 1 : 0)} />
                </div>
              </div>
            </div>
          </section>

          <section aria-labelledby="neighbourhood-heading">
            <SectionTitle id="neighbourhood-heading">The neighbourhood</SectionTitle>
            <div className="space-y-6">
              <RangeField label="Distance to metro" value={form.Distance_to_Metro_km}
                min={0.1} max={15} step={0.1} suffix=" km"
                onChange={(value) => set('Distance_to_Metro_km', value)} />
              <RangeField label="Distance to city centre" value={form.Distance_to_CityCenter_km}
                min={0.5} max={35} step={0.5} suffix=" km"
                onChange={(value) => set('Distance_to_CityCenter_km', value)} />
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <RangeField label="Nearest school" value={form.Nearby_School_km}
                  min={0.1} max={10} step={0.1} suffix=" km"
                  onChange={(value) => set('Nearby_School_km', value)} />
                <RangeField label="Nearest hospital" value={form.Nearby_Hospital_km}
                  min={0.1} max={10} step={0.1} suffix=" km"
                  onChange={(value) => set('Nearby_Hospital_km', value)} />
              </div>
              <RangeField label="Crime rate index" value={form.Crime_Rate_Index}
                min={5} max={85} step={1} suffix=""
                onChange={(value) => set('Crime_Rate_Index', value)} />
            </div>
          </section>
        </div>

        {/* ── Results ── */}
        <div ref={resultsRef} id="valuation-results" className="scroll-mt-6 border-t border-line-soft pt-9 lg:border-l lg:border-t-0 lg:pl-10 lg:pt-0">
          <div className="space-y-7 lg:sticky lg:top-8" aria-busy={predicting}>
            <div className="rounded-2xl border border-line bg-paper/80 p-5 sm:p-6">
              <div className="flex items-center justify-between gap-3">
                <p className="text-label text-graphite">Ensemble estimate</p>
                <p className="text-micro text-muted">
                  {predictions ? `${predictions.price_spread_percentage.toFixed(1)}% spread` : '—'}
                </p>
              </div>

              <p
                key={predictions?.ensemble_average_inr || 'empty'}
                aria-live="polite"
                aria-atomic="true"
                className="price-display value-refresh mt-4 text-ink"
              >
                {predictions?.ensemble_average_formatted || '—'}
              </p>

              <p className="mt-3 text-small text-graphite">
                Average of three independent models
              </p>

              <p className="mt-5 border-t border-line-soft pt-4 text-micro text-muted">
                {predicting
                  ? 'Updating with the latest details…'
                  : 'Not a formal valuation. Use it as a starting point for research.'}
              </p>
            </div>

            <div>
              <p className="mb-1 text-label text-muted">Individual models</p>
              <div>
                {modelEntries.map(([key, meta]) => {
                  const pred = normalized[key];
                  const width = pred && maxValue ? Math.max(4, (pred.predicted_price_inr / maxValue) * 100) : 0;
                  return (
                    <ModelResult key={key} meta={meta} pred={pred} width={width} />
                  );
                })}
              </div>
              <p className="mt-5 text-micro text-muted">
                The ensemble weights all four models equally. Random forest has the
                strongest held-out fit.
              </p>
            </div>
          </div>
        </div>
      </div>

      {showEstimateBar && (
        <div className="sticky bottom-3 z-20 mt-8 flex items-center gap-3 rounded-2xl border border-line bg-bone/95 px-4 py-2.5 shadow-[0_16px_36px_-24px_rgba(33,31,26,0.6)] backdrop-blur lg:hidden">
          <span className="shrink-0 text-micro text-muted">Estimate</span>
          <span className="font-display text-[1.5rem] leading-none text-ink tabular">
            {predictions?.ensemble_average_formatted || '—'}
          </span>
          <a
            href="#valuation-results"
            className="ml-auto shrink-0 text-label text-graphite underline decoration-line underline-offset-4 hover:text-ink"
          >
            Model detail
          </a>
        </div>
      )}
    </div>
  );
}

/* ── Internal primitives ── */

function SectionTitle({ id, children }) {
  return (
    <h3 id={id} className="mb-4 font-display text-[1.35rem] font-medium tracking-tight text-ink">
      {children}
    </h3>
  );
}

function ModelResult({ meta, pred, width }) {
  return (
    <div className="border-b border-line-soft py-4 last:border-b-0">
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-2.5">
          <span
            className="mt-[0.5rem] h-2 w-2 shrink-0 rounded-full"
            style={{ backgroundColor: meta.color }}
            aria-hidden="true"
          />
          <div className="min-w-0">
            <p className="text-body font-medium text-ink">
              {meta.name}
              {meta.note && (
                <span className="ml-2 text-micro font-normal text-sage-deep">({meta.note})</span>
              )}
            </p>
            <p className="mt-0.5 text-micro text-graphite tabular">
              {pred
                ? `₹${number(pred.price_per_sqft)}/sqft, ${pred.price_tier.split(' (')[0]} tier`
                : 'Waiting for a prediction'}
            </p>
          </div>
        </div>
        <p className="shrink-0 font-display text-[1.6rem] leading-none text-ink tabular">
          {pred?.formatted_inr || '—'}
        </p>
      </div>

      <div className="mt-3 h-[3px] overflow-hidden rounded-full bg-line-soft">
        <div
          className="h-full rounded-full transition-[width] duration-300"
          style={{ width: `${width}%`, backgroundColor: meta.color }}
        />
      </div>
    </div>
  );
}

function Segmented({ options, value, onChange, label, suffix = '' }) {
  return (
    <div
      role="group"
      aria-label={label}
      className="inline-flex flex-wrap gap-1 rounded-lg border border-line bg-bone p-1"
    >
      {options.map((option) => {
        const active = option === value;
        return (
          <button
            key={option}
            type="button"
            onClick={() => onChange(option)}
            aria-pressed={active}
            className={`cursor-pointer rounded-md px-3 py-1.5 text-small transition-colors ${
              active
                ? 'bg-ink font-medium text-paper'
                : 'text-graphite hover:bg-paper hover:text-ink'
            }`}
          >
            {option}{suffix}
          </button>
        );
      })}
    </div>
  );
}

function RangeField({ label, value, min, max, step, suffix, onChange }) {
  const id = useId();
  const numVal = typeof value === 'number' && !isNaN(value) ? value : min;
  const display = Number.isInteger(numVal) ? number(numVal) : numVal.toFixed(1);

  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-label text-graphite">{label}</label>
        <span className="text-small font-medium text-ink tabular">{display}{suffix}</span>
      </div>
      <input
        id={id}
        type="range"
        min={min} max={max} step={step}
        value={numVal}
        aria-valuetext={`${display}${suffix}`}
        onChange={(event) => {
          const val = Number(parseFloat(event.target.value).toFixed(2));
          onChange(val);
        }}
        className="mt-2"
      />
      <div className="flex justify-between text-micro text-muted tabular" aria-hidden="true">
        <span>{number(min)}{suffix}</span>
        <span>{number(max)}{suffix}</span>
      </div>
    </div>
  );
}

function NumField({ label, value, min, max, onChange }) {
  const id = useId();

  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-label text-graphite">{label}</label>
      <input
        id={id}
        type="number"
        min={min} max={max}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="w-full rounded-lg border border-line bg-bone px-3.5 py-2.5 text-body text-ink tabular transition-colors focus:border-indigo focus:outline-none"
      />
    </div>
  );
}

function Toggle({ label, checked, onChange }) {
  return (
    <label
      className={`flex cursor-pointer items-center gap-2.5 rounded-lg border px-3.5 py-2.5 text-small transition-colors ${
        checked
          ? 'border-ink bg-bone text-ink'
          : 'border-line text-graphite hover:border-graphite'
      }`}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="h-[18px] w-[18px] cursor-pointer accent-ink"
      />
      {label}
    </label>
  );
}
