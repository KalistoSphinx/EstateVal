import { useState } from 'react';

const FEATURE_METADATA = {
  City: {
    name: 'Location',
    category: 'Metro Geography',
    desc: 'The metropolitan city market determining baseline land pricing and geographic demand.',
  },
  Super_Area_sqft: {
    name: 'Super built-up area',
    category: 'Physical Area',
    desc: 'Total built-up residential space. Primary physical determinant of baseline property valuation.',
  },
  Locality_Tier: {
    name: 'Locality tier',
    category: 'Neighborhood',
    desc: 'Micro-market neighborhood classification (Budget, Mid, or Premium) defining localized quality tier.',
  },
  Carpet_Area_sqft: {
    name: 'Usable carpet area',
    category: 'Physical Area',
    desc: 'Internal net usable floor area enclosed within apartment walls.',
  },
  BHK: {
    name: 'Bedrooms (BHK)',
    category: 'Unit Layout',
    desc: 'Apartment bedroom count defining family accommodation capacity.',
  },
  Distance_to_CityCenter_km: {
    name: 'Distance to city centre',
    category: 'Commute',
    desc: 'Proximity to central business district. Distance introduces inverse travel friction discount.',
  },
  Crime_Rate_Index: {
    name: 'Crime safety index',
    category: 'Safety',
    desc: 'Neighborhood safety index score. Higher crime index exerts downward pricing pressure.',
  },
  Nearby_Hospital_km: {
    name: 'Distance to hospital',
    category: 'Infrastructure',
    desc: 'Proximity to major emergency medical healthcare facilities.',
  },
  Distance_to_Metro_km: {
    name: 'Distance to metro',
    category: 'Transit',
    desc: 'Walking or short-drive distance to rapid urban mass transit lines.',
  },
  Total_Floors: {
    name: 'Total building floors',
    category: 'Structure',
    desc: 'Vertical height of high-rise building, reflecting modern gated tower amenities.',
  },
  Floor_No: {
    name: 'Floor number',
    category: 'Structure',
    desc: 'Apartment elevation level; upper floors in metros often command view premiums.',
  },
  Furnishing: {
    name: 'Furnishing status',
    category: 'Interior',
    desc: 'Level of interior woodwork, appliances, and modular cabinetry (Unfurnished, Semi, or Furnished).',
  },
  Bathrooms: {
    name: 'Bathroom count',
    category: 'Unit Layout',
    desc: 'Number of dedicated baths and en-suites within apartment.',
  },
  Property_Age_years: {
    name: 'Property age',
    category: 'Condition',
    desc: 'Years since construction completion; older buildings show modest depreciation adjustments.',
  },
  Nearby_School_km: {
    name: 'Distance to school',
    category: 'Infrastructure',
    desc: 'Proximity to primary and secondary educational institutions.',
  },
  Parking: {
    name: 'Dedicated parking',
    category: 'Amenity',
    desc: 'Reserved vehicle parking slot, highly valued in high-density Indian metros.',
  },
  Lift: {
    name: 'Passenger lift',
    category: 'Amenity',
    desc: 'Elevator accessibility, essential for modern multi-storey apartments.',
  },
  Gated_Society: {
    name: 'Gated society',
    category: 'Security',
    desc: 'Gated community perimeter security, access control, and clubhouse amenities.',
  },
};

export default function FeatureImportancePlot({ importances }) {
  const [model, setModel] = useState('random_forest'); // 'random_forest' | 'decision_tree' | 'knn' | 'linear_regression'
  const [hovered, setHovered] = useState(null);

  if (!importances) return null;

  const rawRf = importances.random_forest || [];
  const rawDt = importances.decision_tree || [];
  const rawKnn = importances.knn || [];
  const rawLr = importances.linear_regression || [];

  // Prepare normalized horizontal column data sorted from #1 (most important) to #12
  let items = [];
  let maxScale = 60;
  let metricLabel = 'Ensemble tree impurity reduction %';
  let modelColor = '#5b7f5f'; // Sage for RF
  let topColor = '#426146';

  if (model === 'random_forest') {
    maxScale = 60;
    metricLabel = 'Ensemble tree impurity reduction %';
    modelColor = '#5b7f5f';
    topColor = '#426146';
    items = rawRf.map((item, idx) => ({
      key: item.feature,
      name: FEATURE_METADATA[item.feature]?.name || item.feature.replace(/_/g, ' '),
      category: FEATURE_METADATA[item.feature]?.category || 'Attribute',
      desc: FEATURE_METADATA[item.feature]?.desc || '',
      rank: idx + 1,
      percentage: Number(item.percentage.toFixed(2)),
      displayVal: `${item.percentage.toFixed(2)}%`,
    }));
  } else if (model === 'decision_tree') {
    maxScale = 60;
    metricLabel = 'Single tree Gini split variance reduction %';
    modelColor = '#8a6d3b'; // Bronze/warm ochre for DT
    topColor = '#6b5126';
    items = rawDt.map((item, idx) => ({
      key: item.feature,
      name: FEATURE_METADATA[item.feature]?.name || item.feature.replace(/_/g, ' '),
      category: FEATURE_METADATA[item.feature]?.category || 'Attribute',
      desc: FEATURE_METADATA[item.feature]?.desc || '',
      rank: idx + 1,
      percentage: Number(item.percentage.toFixed(2)),
      displayVal: `${item.percentage.toFixed(2)}%`,
    }));
  } else if (model === 'knn') {
    maxScale = 75;
    metricLabel = 'Permutation score drop when shuffled %';
    modelColor = '#87759f'; // Purple/iris for KNN
    topColor = '#6b5883';
    items = rawKnn.map((item, idx) => ({
      key: item.feature,
      name: FEATURE_METADATA[item.feature]?.name || item.feature.replace(/_/g, ' '),
      category: FEATURE_METADATA[item.feature]?.category || 'Attribute',
      desc: FEATURE_METADATA[item.feature]?.desc || '',
      rank: idx + 1,
      percentage: Number(item.percentage.toFixed(2)),
      displayVal: `${item.percentage.toFixed(2)}%`,
    }));
  } else {
    // Ridge regression
    maxScale = 60;
    metricLabel = 'Relative normalized coefficient weight %';
    modelColor = '#56658f'; // Steel blue for Ridge
    topColor = '#3e4c73';
    items = rawLr.map((item, idx) => ({
      key: item.feature,
      name: FEATURE_METADATA[item.feature]?.name || item.feature.replace(/_/g, ' '),
      category: FEATURE_METADATA[item.feature]?.category || 'Attribute',
      desc: FEATURE_METADATA[item.feature]?.desc || '',
      rank: idx + 1,
      percentage: Number(item.percentage.toFixed(2)),
      displayVal: `${item.percentage.toFixed(2)}%`,
    }));
  }

  // Horizontal SVG coordinates
  const width = 880;
  const height = 480;
  const pad = { top: 32, right: 85, bottom: 44, left: 195 };
  const plotWidth = width - pad.left - pad.right;
  const plotHeight = height - pad.top - pad.bottom;

  const barCount = items.length;
  const barHeight = 22;
  const barGap = barCount > 1 ? (plotHeight - barCount * barHeight) / (barCount - 1) : 0;

  const getTicks = () => {
    if (maxScale === 75) return [0, 15, 30, 45, 60, 75];
    return [0, 10, 20, 30, 40, 50, 60];
  };

  const getX = (pct) => pad.left + (pct / maxScale) * plotWidth;

  return (
    <div className="w-full select-none">
      {/* ── Model Switcher Header ── */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-line-soft pb-4">
        <div className="flex flex-wrap gap-1 rounded-lg border border-line bg-bone p-1" role="group" aria-label="Feature importance model selection">
          <button
            type="button"
            onClick={() => { setModel('random_forest'); setHovered(null); }}
            aria-pressed={model === 'random_forest'}
            className={`cursor-pointer rounded-md px-3 py-1.5 text-small transition-colors ${
              model === 'random_forest'
                ? 'bg-ink font-medium text-paper'
                : 'text-graphite hover:bg-paper hover:text-ink'
            }`}
          >
            Random forest
          </button>
          <button
            type="button"
            onClick={() => { setModel('decision_tree'); setHovered(null); }}
            aria-pressed={model === 'decision_tree'}
            className={`cursor-pointer rounded-md px-3 py-1.5 text-small transition-colors ${
              model === 'decision_tree'
                ? 'bg-ink font-medium text-paper'
                : 'text-graphite hover:bg-paper hover:text-ink'
            }`}
          >
            Decision tree
          </button>
          <button
            type="button"
            onClick={() => { setModel('knn'); setHovered(null); }}
            aria-pressed={model === 'knn'}
            className={`cursor-pointer rounded-md px-3 py-1.5 text-small transition-colors ${
              model === 'knn'
                ? 'bg-ink font-medium text-paper'
                : 'text-graphite hover:bg-paper hover:text-ink'
            }`}
          >
            KNN
          </button>
          <button
            type="button"
            onClick={() => { setModel('linear_regression'); setHovered(null); }}
            aria-pressed={model === 'linear_regression'}
            className={`cursor-pointer rounded-md px-3 py-1.5 text-small transition-colors ${
              model === 'linear_regression'
                ? 'bg-ink font-medium text-paper'
                : 'text-graphite hover:bg-paper hover:text-ink'
            }`}
          >
            Ridge regression
          </button>
        </div>

        <span className="text-micro font-medium text-muted">
          Normal attributes ranked from most important (#1) downward
        </span>
      </div>

      {/* ── Horizontal Bar / Column Visualization ── */}
      <div className="relative rounded-xl border border-line-soft bg-paper/60 p-4 sm:p-6">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="h-auto w-full overflow-visible"
          role="img"
          aria-label={`Horizontal column chart of normal attribute importances for ${model}`}
        >
          {/* Vertical Gridlines & Percentage Ticks */}
          {getTicks().map((tick) => {
            const xPos = getX(tick);
            return (
              <g key={tick}>
                <line
                  x1={xPos}
                  y1={pad.top}
                  x2={xPos}
                  y2={height - pad.bottom}
                  stroke="#ebe4d8"
                  strokeDasharray="3,3"
                />
                <text
                  x={xPos}
                  y={height - pad.bottom + 19}
                  textAnchor="middle"
                  fontSize="11"
                  fill="#746d62"
                  className="tabular font-medium"
                >
                  {tick}%
                </text>
              </g>
            );
          })}

          {/* Horizontal Columns (Ranked Top to Bottom) */}
          {items.map((col, idx) => {
            const y = pad.top + idx * (barHeight + barGap);
            const barW = Math.max(3, (col.percentage / maxScale) * plotWidth);
            const isHovered = hovered?.key === col.key;

            let fill = modelColor;
            if (idx === 0) fill = topColor; // Emphasize #1 driver
            else if (idx >= 6) fill = '#92a395'; // Muted for smaller tails
            if (model === 'decision_tree' && idx >= 6) fill = '#a8987b';
            if (model === 'knn' && idx >= 6) fill = '#a497b5';
            if (model === 'linear_regression' && idx >= 6) fill = '#8291b5';

            if (isHovered) fill = '#211f1a';

            return (
              <g
                key={col.key}
                className="cursor-pointer transition-all duration-150"
                onMouseEnter={() => setHovered(col)}
                onMouseLeave={() => setHovered(null)}
              >
                {/* Rank Badge */}
                <rect
                  x={pad.left - 188}
                  y={y + 3}
                  width={20}
                  height={16}
                  rx={3}
                  fill={isHovered ? '#211f1a' : '#f0ece3'}
                />
                <text
                  x={pad.left - 178}
                  y={y + 15}
                  textAnchor="middle"
                  fontSize="10"
                  fontWeight="600"
                  fill={isHovered ? '#ffffff' : '#746d62'}
                  className="tabular"
                >
                  {col.rank}
                </text>

                {/* Y-Axis Normal Attribute Name */}
                <text
                  x={pad.left - 12}
                  y={y + barHeight / 2 + 4}
                  textAnchor="end"
                  fontSize="12"
                  fontWeight={isHovered ? '600' : '400'}
                  fill={isHovered ? '#211f1a' : '#524d44'}
                >
                  {col.name}
                </text>

                {/* Background Track */}
                <rect
                  x={pad.left}
                  y={y}
                  width={plotWidth}
                  height={barHeight}
                  rx={4}
                  fill="#f2eee7"
                />

                {/* Horizontal Column / Bar */}
                <rect
                  x={pad.left}
                  y={y}
                  width={barW}
                  height={barHeight}
                  rx={4}
                  fill={fill}
                  fillOpacity={isHovered ? 1 : 0.88}
                  className="transition-colors duration-150"
                />

                {/* Percentage label directly at the end of each horizontal column */}
                <text
                  x={pad.left + barW + 8}
                  y={y + barHeight / 2 + 4}
                  fontSize="11"
                  fontWeight="600"
                  fill={isHovered ? '#211f1a' : '#426146'}
                  className="tabular"
                >
                  {col.displayVal}
                </text>
              </g>
            );
          })}

          {/* Bottom X-Axis Line */}
          <line
            x1={pad.left}
            y1={height - pad.bottom}
            x2={width - pad.right}
            y2={height - pad.bottom}
            stroke="#ded7ca"
            strokeWidth="1.5"
          />

          {/* Left Y-Axis Line */}
          <line
            x1={pad.left}
            y1={pad.top}
            x2={pad.left}
            y2={height - pad.bottom}
            stroke="#ded7ca"
            strokeWidth="1.5"
          />

          {/* X-Axis Title */}
          <text
            x={(width + pad.left - pad.right) / 2}
            y={height - 8}
            textAnchor="middle"
            fontSize="12"
            fontWeight="500"
            fill="#524d44"
          >
            Importance Share ({metricLabel})
          </text>
        </svg>

        {/* Floating Tooltip Card on Hover */}
        {hovered && (
          <div className="pointer-events-none absolute right-6 top-6 z-10 max-w-xs rounded-xl border border-line bg-paper/95 p-3.5 text-xs shadow-lg backdrop-blur">
            <div className="flex items-center justify-between gap-2 border-b border-line-soft pb-2">
              <span className="font-semibold text-ink">
                #{hovered.rank} {hovered.name}
              </span>
              <span className="rounded bg-bone px-2 py-0.5 text-[0.72rem] font-semibold text-ink tabular">
                {hovered.displayVal}
              </span>
            </div>
            <p className="mt-1 text-[0.7rem] font-medium text-sage-deep">
              Category: {hovered.category}
            </p>
            <p className="mt-1 text-[0.75rem] leading-relaxed text-graphite">
              {hovered.desc}
            </p>
          </div>
        )}
      </div>

      {/* ── Model-Specific Insights Below Chart ── */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {model === 'random_forest' && (
          <>
            <div className="rounded-xl border border-line bg-bone p-4">
              <div className="flex items-center justify-between">
                <span className="text-micro font-medium text-muted">#1 Most Important</span>
                <span className="rounded bg-sage/20 px-2 py-0.5 text-micro font-semibold text-sage-deep">53.35%</span>
              </div>
              <p className="mt-1 font-display text-[1.2rem] font-medium text-ink">Super Built-up Area</p>
              <p className="mt-1 text-small text-graphite">
                Determines over half of all ensemble decision tree splits, establishing the primary physical baseline price.
              </p>
            </div>
            <div className="rounded-xl border border-line bg-bone p-4">
              <div className="flex items-center justify-between">
                <span className="text-micro font-medium text-muted">#2 Geographic Market</span>
                <span className="rounded bg-sage/20 px-2 py-0.5 text-micro font-semibold text-sage-deep">35.73%</span>
              </div>
              <p className="mt-1 font-display text-[1.2rem] font-medium text-ink">Location</p>
              <p className="mt-1 text-small text-graphite">
                Metropolitan geography explains over a third of remaining price variance between high-demand coastal and inland metros.
              </p>
            </div>
            <div className="rounded-xl border border-line bg-bone p-4">
              <div className="flex items-center justify-between">
                <span className="text-micro font-medium text-muted">#3 Micro-Market</span>
                <span className="rounded bg-sage/20 px-2 py-0.5 text-micro font-semibold text-sage-deep">9.05%</span>
              </div>
              <p className="mt-1 font-display text-[1.2rem] font-medium text-ink">Locality Tier</p>
              <p className="mt-1 text-small text-graphite">
                Neighborhood infrastructure tier (Budget, Mid, or Premium) acts as the third strongest categorical branching split.
              </p>
            </div>
          </>
        )}

        {model === 'decision_tree' && (
          <>
            <div className="rounded-xl border border-line bg-bone p-4">
              <div className="flex items-center justify-between">
                <span className="text-micro font-medium text-muted">#1 Root Split</span>
                <span className="rounded bg-[#f0e6d2] px-2 py-0.5 text-micro font-semibold text-[#6b5126]">52.91%</span>
              </div>
              <p className="mt-1 font-display text-[1.2rem] font-medium text-ink">Super Built-up Area</p>
              <p className="mt-1 text-small text-graphite">
                Root and early node splits partition properties by square footage scale before any geographic branching.
              </p>
            </div>
            <div className="rounded-xl border border-line bg-bone p-4">
              <div className="flex items-center justify-between">
                <span className="text-micro font-medium text-muted">#2 Geographic Branching</span>
                <span className="rounded bg-[#f0e6d2] px-2 py-0.5 text-micro font-semibold text-[#6b5126]">36.26%</span>
              </div>
              <p className="mt-1 font-display text-[1.2rem] font-medium text-ink">Location</p>
              <p className="mt-1 text-small text-graphite">
                Second-tier decision nodes isolate city markets (Mumbai vs Bangalore vs Nagpur) to adjust baseline pricing.
              </p>
            </div>
            <div className="rounded-xl border border-line bg-bone p-4">
              <div className="flex items-center justify-between">
                <span className="text-micro font-medium text-muted">#3 Quality Tier</span>
                <span className="rounded bg-[#f0e6d2] px-2 py-0.5 text-micro font-semibold text-[#6b5126]">9.13%</span>
              </div>
              <p className="mt-1 font-display text-[1.2rem] font-medium text-ink">Locality Tier</p>
              <p className="mt-1 text-small text-graphite">
                Tertiary branches separate Budget, Mid, and Premium micro-markets within each metropolitan territory.
              </p>
            </div>
          </>
        )}

        {model === 'knn' && (
          <>
            <div className="rounded-xl border border-line bg-bone p-4">
              <div className="flex items-center justify-between">
                <span className="text-micro font-medium text-muted">#1 Spatial Clustering</span>
                <span className="rounded bg-iris/20 px-2 py-0.5 text-micro font-semibold text-iris">67.52%</span>
              </div>
              <p className="mt-1 font-display text-[1.2rem] font-medium text-ink">Location</p>
              <p className="mt-1 text-small text-graphite">
                Dominant spatial filter: KNN isolates nearest comparable sales by metropolitan geographic market first.
              </p>
            </div>
            <div className="rounded-xl border border-line bg-bone p-4">
              <div className="flex items-center justify-between">
                <span className="text-micro font-medium text-muted">#2 Size Coordinate</span>
                <span className="rounded bg-iris/20 px-2 py-0.5 text-micro font-semibold text-iris">8.09%</span>
              </div>
              <p className="mt-1 font-display text-[1.2rem] font-medium text-ink">Super Built-up Area</p>
              <p className="mt-1 text-small text-graphite">
                Within a city market, square footage acts as the primary geometric coordinate locating the nearest sale comparables.
              </p>
            </div>
            <div className="rounded-xl border border-line bg-bone p-4">
              <div className="flex items-center justify-between">
                <span className="text-micro font-medium text-muted">#3 Neighborhood Quality</span>
                <span className="rounded bg-iris/20 px-2 py-0.5 text-micro font-semibold text-iris">6.20%</span>
              </div>
              <p className="mt-1 font-display text-[1.2rem] font-medium text-ink">Locality Tier</p>
              <p className="mt-1 text-small text-graphite">
                Locality tier ensures budget homes are not mistakenly matched with luxury residences within the same city.
              </p>
            </div>
          </>
        )}

        {model === 'linear_regression' && (
          <>
            <div className="rounded-xl border border-line bg-bone p-4">
              <div className="flex items-center justify-between">
                <span className="text-micro font-medium text-muted">#1 Baseline Shift</span>
                <span className="rounded bg-indigo/20 px-2 py-0.5 text-micro font-semibold text-indigo">54.50%</span>
              </div>
              <p className="mt-1 font-display text-[1.2rem] font-medium text-ink">Location</p>
              <p className="mt-1 text-small text-graphite">
                Metropolitan city baseline shifts command the highest overall weight in linear pricing adjustments across India.
              </p>
            </div>
            <div className="rounded-xl border border-line bg-bone p-4">
              <div className="flex items-center justify-between">
                <span className="text-micro font-medium text-muted">#2 Tier Step-Up</span>
                <span className="rounded bg-indigo/20 px-2 py-0.5 text-micro font-semibold text-indigo">21.14%</span>
              </div>
              <p className="mt-1 font-display text-[1.2rem] font-medium text-ink">Locality Tier</p>
              <p className="mt-1 text-small text-graphite">
                Micro-market tier coefficients introduce significant linear step-ups between budget, mid-market, and prime sectors.
              </p>
            </div>
            <div className="rounded-xl border border-line bg-bone p-4">
              <div className="flex items-center justify-between">
                <span className="text-micro font-medium text-muted">#3 Continuous Scaling</span>
                <span className="rounded bg-indigo/20 px-2 py-0.5 text-micro font-semibold text-indigo">16.40%</span>
              </div>
              <p className="mt-1 font-display text-[1.2rem] font-medium text-ink">Super Built-up Area</p>
              <p className="mt-1 text-small text-graphite">
                Super built-up area scales continuously, adding incremental value for each additional square foot built.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
