import { useState } from 'react';

const COLORS = {
  random_forest: { hex: '#5b7f5f', label: 'Random forest' },
  decision_tree: { hex: '#8a6d3b', label: 'Decision tree' },
  linear_regression: { hex: '#56658f', label: 'Ridge regression' },
  knn: { hex: '#87759f', label: 'Nearest neighbours' },
};

function formatPriceLakhs(val) {
  if (val === 0) return '₹0';
  if (val >= 100) {
    const cr = val / 100;
    return Number.isInteger(cr) ? `₹${cr} Cr` : `₹${cr.toFixed(1)} Cr`;
  }
  return `₹${val}L`;
}

export default function ScatterPlot({ samples, selectedModel }) {
  const [hovered, setHovered] = useState(null);

  if (!samples?.length) {
    return (
      <div className="flex h-80 items-center justify-center text-small text-muted">
        No scatter plot samples available.
      </div>
    );
  }

  // 1:1 Square Plot Area so the 45-degree diagonal is a true, undistorted 45° angle
  const size = 680;
  const pad = { top: 36, right: 36, bottom: 76, left: 76 };
  const plotSize = size - pad.left - pad.right; // Exactly 568 x 568 square
  const lo = 0;
  const hi = 520; // 520 Lakhs = ₹5.2 Crores covering all 120 samples

  const scale = (val) => {
    const clamped = Math.max(lo, Math.min(hi, val));
    return (clamped - lo) / (hi - lo);
  };

  const x = (val) => pad.left + scale(val) * plotSize;
  const y = (val) => pad.top + (1 - scale(val)) * plotSize; // Inverted for SVG Y-axis

  const majorTicks = [0, 100, 200, 300, 400, 500];
  const minorTicks = [50, 150, 250, 350, 450];
  const modelInfo = COLORS[selectedModel] || COLORS.random_forest;

  return (
    <div className="relative mx-auto flex w-full max-w-[720px] flex-col items-center select-none">
      <svg
        viewBox={`0 0 ${size} ${size}`}
        className="h-auto w-full overflow-visible"
        role="img"
        aria-label={`Actual vs predicted price scatter plot for ${modelInfo.label}`}
      >
        <defs>
          {/* Subtle gradient for error tolerance band */}
          <linearGradient id="bandGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ede5d8" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#ede5d8" stopOpacity="0.25" />
          </linearGradient>
        </defs>

        {/* ── Background Plot Box ── */}
        <rect
          x={pad.left}
          y={pad.top}
          width={plotSize}
          height={plotSize}
          fill="#faf7f2"
          stroke="#e5ded2"
          strokeWidth="1"
          rx="4"
        />

        {/* ── ±15% Accuracy Tolerance Band ── */}
        <polygon
          points={`
            ${x(0)},${y(0)}
            ${x(hi / 1.15)},${y(hi)}
            ${x(hi)},${y(hi)}
            ${x(hi)},${y(hi * 0.85)}
            ${x(0)},${y(0)}
          `}
          fill="url(#bandGrad)"
        />

        {/* ── Major Gridlines & Ticks ── */}
        {majorTicks.map((tick) => (
          <g key={`major-${tick}`}>
            {/* Horizontal Gridline */}
            <line
              x1={pad.left}
              y1={y(tick)}
              x2={pad.left + plotSize}
              y2={y(tick)}
              stroke="#ebe4d8"
              strokeDasharray="3,3"
            />
            {/* Y-Axis Tick Label */}
            <text
              x={pad.left - 12}
              y={y(tick) + 4}
              textAnchor="end"
              fontSize="12"
              fill="#6b6458"
              className="tabular font-medium"
            >
              {formatPriceLakhs(tick)}
            </text>

            {/* Vertical Gridline */}
            <line
              x1={x(tick)}
              y1={pad.top}
              x2={x(tick)}
              y2={pad.top + plotSize}
              stroke="#ebe4d8"
              strokeDasharray="3,3"
            />
            {/* X-Axis Tick Label */}
            <text
              x={x(tick)}
              y={pad.top + plotSize + 22}
              textAnchor="middle"
              fontSize="12"
              fill="#6b6458"
              className="tabular font-medium"
            >
              {formatPriceLakhs(tick)}
            </text>
          </g>
        ))}

        {/* ── Minor Sub-Tick Marks ── */}
        {minorTicks.map((tick) => (
          <g key={`minor-${tick}`}>
            <line
              x1={pad.left - 4}
              y1={y(tick)}
              x2={pad.left}
              y2={y(tick)}
              stroke="#b5aba0"
              strokeWidth="1"
            />
            <line
              x1={x(tick)}
              y1={pad.top + plotSize}
              x2={x(tick)}
              y2={pad.top + plotSize + 4}
              stroke="#b5aba0"
              strokeWidth="1"
            />
          </g>
        ))}

        {/* ── 45° Ideal Equality Line (y = x) ── */}
        <line
          x1={x(lo)}
          y1={y(lo)}
          x2={x(hi)}
          y2={y(hi)}
          stroke="#8c8273"
          strokeWidth="1.8"
          strokeDasharray="5,5"
        />

        {/* 45° Label angled along diagonal */}
        <text
          x={x(270)}
          y={y(270) - 10}
          fontSize="11"
          fontWeight="500"
          fill="#8c8273"
          transform={`rotate(-45, ${x(270)}, ${y(270)})`}
        >
          Ideal 45° Fit Line (Actual = Predicted)
        </text>

        {/* ── Crosshair Guide Lines on Active Hover ── */}
        {hovered && (
          <g className="pointer-events-none">
            <line
              x1={x(hovered.actual_lakhs)}
              y1={y(hovered.predicted)}
              x2={pad.left}
              y2={y(hovered.predicted)}
              stroke={modelInfo.hex}
              strokeWidth="1"
              strokeDasharray="3,3"
            />
            <line
              x1={x(hovered.actual_lakhs)}
              y1={y(hovered.predicted)}
              x2={x(hovered.actual_lakhs)}
              y2={pad.top + plotSize}
              stroke={modelInfo.hex}
              strokeWidth="1"
              strokeDasharray="3,3"
            />
          </g>
        )}

        {/* ── Scatter Points (120 Unseen Properties) ── */}
        {samples.map((point) => {
          const ptId = point.sample_id || point.id;
          const actual = point.actual_price_lakhs;
          const predicted = point[`${selectedModel}_lakhs`];
          if (actual == null || predicted == null) return null;

          const isHovered = hovered?.id === ptId;
          const cx = x(actual);
          const cy = y(predicted);

          return (
            <circle
              key={ptId}
              cx={cx}
              cy={cy}
              r={isHovered ? 7.5 : 4.5}
              fill={isHovered ? '#211f1a' : modelInfo.hex}
              fillOpacity={isHovered ? 1.0 : 0.72}
              stroke={isHovered ? '#ffffff' : '#ffffff'}
              strokeWidth={isHovered ? 2.5 : 0.8}
              className="cursor-pointer transition-all duration-150"
              onMouseEnter={() =>
                setHovered({
                  id: ptId,
                  actual_lakhs: actual,
                  predicted,
                  cx,
                  cy,
                })
              }
              onMouseLeave={() => setHovered(null)}
            />
          );
        })}

        {/* ── Outer Plot Frame Lines ── */}
        <line
          x1={pad.left}
          y1={pad.top + plotSize}
          x2={pad.left + plotSize}
          y2={pad.top + plotSize}
          stroke="#524d44"
          strokeWidth="1.5"
        />
        <line
          x1={pad.left}
          y1={pad.top}
          x2={pad.left}
          y2={pad.top + plotSize}
          stroke="#524d44"
          strokeWidth="1.5"
        />

        {/* ── X-Axis Title ── */}
        <text
          x={pad.left + plotSize / 2}
          y={size - 18}
          textAnchor="middle"
          fontSize="13"
          fontWeight="500"
          fill="#332f28"
        >
          Actual Holdout Market Price (in ₹ Lakhs / Crores)
        </text>

        {/* ── Y-Axis Title ── */}
        <text
          x={-(pad.top + plotSize / 2)}
          y={22}
          textAnchor="middle"
          fontSize="13"
          fontWeight="500"
          fill="#332f28"
          transform="rotate(-90)"
        >
          Predicted Market Price (in ₹ Lakhs / Crores)
        </text>
      </svg>

      {/* ── Floating Tooltip ── */}
      {hovered && (
        <div
          className="pointer-events-none absolute z-20 w-52 rounded-xl border border-line bg-paper/95 p-3 text-xs shadow-lg backdrop-blur transition-opacity duration-150"
          style={{
            left: `${Math.min(size - 220, Math.max(20, hovered.cx - 100))}px`,
            top: `${Math.max(10, hovered.cy - 105)}px`,
          }}
        >
          <div className="flex items-center justify-between border-b border-line-soft pb-1.5">
            <span className="font-semibold text-ink">Sample #{hovered.id}</span>
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: modelInfo.hex }}
              aria-hidden="true"
            />
          </div>
          <div className="mt-1.5 space-y-1">
            <div className="flex justify-between text-graphite">
              <span>Actual:</span>
              <span className="font-medium text-ink tabular">₹{hovered.actual_lakhs}L</span>
            </div>
            <div className="flex justify-between text-graphite">
              <span>Predicted:</span>
              <span className="font-medium text-ink tabular">₹{hovered.predicted}L</span>
            </div>
            <div className="flex justify-between border-t border-line-soft pt-1 text-[0.72rem]">
              <span className="text-muted">Error gap:</span>
              <span className="font-semibold text-ink tabular">
                ± ₹{Math.abs(hovered.actual_lakhs - hovered.predicted).toFixed(2)}L
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ── Legend Note Below Chart ── */}
      <div className="mt-4 flex flex-wrap items-center justify-center gap-6 text-micro text-graphite">
        <span className="inline-flex items-center gap-2">
          <span className="h-0.5 w-5 border-t border-dashed border-[#8c8273]" aria-hidden="true" />
          <span>Dashed diagonal: Exact equality (0 error)</span>
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="h-3 w-4 rounded-sm bg-[#ede5d8]" aria-hidden="true" />
          <span>Shaded ribbon: ±15% target tolerance band</span>
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: modelInfo.hex }} aria-hidden="true" />
          <span>Data point (1 of 120 holdout properties)</span>
        </span>
      </div>
    </div>
  );
}
