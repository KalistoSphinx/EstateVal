import { useState } from 'react';

const COLORS = {
  random_forest: '#5b7f5f',
  linear_regression: '#56658f',
  knn: '#87759f',
};

export default function ScatterPlot({ samples, selectedModel }) {
  const [hovered, setHovered] = useState(null);

  if (!samples?.length) return null;

  // Generous SVG coordinate space for high clarity
  const width = 860;
  const height = 460;
  const pad = { top: 28, right: 36, bottom: 64, left: 74 };
  const plotWidth = width - pad.left - pad.right;
  const plotHeight = height - pad.top - pad.bottom;
  const lo = 10;
  const hi = 560;

  const x = (value) => pad.left + ((value - lo) / (hi - lo)) * plotWidth;
  const y = (value) => height - pad.bottom - ((value - lo) / (hi - lo)) * plotHeight;

  const ticks = [50, 100, 150, 200, 250, 300, 350, 400, 450, 500];
  const color = COLORS[selectedModel] || '#5b7f5f';

  return (
    <div className="relative w-full">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-auto w-full select-none overflow-visible"
        role="img"
        aria-label={`Scatter plot of actual versus predicted prices for ${
          selectedModel === 'random_forest' ? 'random forest' : selectedModel === 'knn' ? 'KNN' : 'ridge regression'
        }`}
      >
        {/* Subtle grid lines */}
        {ticks.map((tick) => (
          <g key={tick}>
            <line
              x1={pad.left}
              y1={y(tick)}
              x2={width - pad.right}
              y2={y(tick)}
              stroke="#ebe4d8"
              strokeDasharray="3,3"
            />
            <text
              x={pad.left - 10}
              y={y(tick) + 4}
              textAnchor="end"
              fontSize="12"
              fill="#746d62"
              className="tabular font-medium"
            >
              ₹{tick}L
            </text>

            <line
              x1={x(tick)}
              y1={height - pad.bottom}
              x2={x(tick)}
              y2={pad.top}
              stroke="#ebe4d8"
              strokeDasharray="3,3"
            />
            <text
              x={x(tick)}
              y={height - pad.bottom + 20}
              textAnchor="middle"
              fontSize="12"
              fill="#746d62"
              className="tabular font-medium"
            >
              ₹{tick}L
            </text>
          </g>
        ))}

        {/* 45-degree ideal fit line (y = x) */}
        <line
          x1={x(lo)}
          y1={y(lo)}
          x2={x(hi)}
          y2={y(hi)}
          stroke="#b0a89a"
          strokeWidth="1.5"
          strokeDasharray="5,5"
        />
        <text
          x={x(460)}
          y={y(460) - 12}
          fontSize="11"
          fill="#8c8476"
          fontWeight="500"
          transform={`rotate(-28, ${x(460)}, ${y(460)})`}
        >
          Ideal 45° Equality Line (Actual = Predicted)
        </text>

        {/* Scatter Points */}
        {samples.map((point) => {
          const actual = point.actual_lakhs;
          const predicted = point[`${selectedModel}_lakhs`];
          const isHovered = hovered?.id === point.id;
          return (
            <circle
              key={point.id}
              cx={x(actual)}
              cy={y(predicted)}
              r={isHovered ? 7 : 4}
              fill={color}
              fillOpacity={isHovered ? 1 : 0.65}
              stroke={isHovered ? '#211f1a' : '#ffffff'}
              strokeWidth={isHovered ? 2 : 0.8}
              className="cursor-pointer transition-all duration-150"
              onMouseEnter={() => setHovered({ ...point, predicted })}
              onMouseLeave={() => setHovered(null)}
            />
          );
        })}

        {/* Axes */}
        <line
          x1={pad.left}
          y1={height - pad.bottom}
          x2={width - pad.right}
          y2={height - pad.bottom}
          stroke="#ded7ca"
          strokeWidth="1.5"
        />
        <line
          x1={pad.left}
          y1={pad.top}
          x2={pad.left}
          y2={height - pad.bottom}
          stroke="#ded7ca"
          strokeWidth="1.5"
        />

        {/* Axis Labels */}
        <text
          x={(width + pad.left - pad.right) / 2}
          y={height - 10}
          textAnchor="middle"
          fontSize="13"
          fontWeight="500"
          fill="#524d44"
        >
          Actual Market Price (in ₹ Lakhs)
        </text>
        <text
          x={-(height / 2)}
          y={18}
          textAnchor="middle"
          fontSize="13"
          fontWeight="500"
          fill="#524d44"
          transform="rotate(-90)"
        >
          Predicted Market Price (in ₹ Lakhs)
        </text>
      </svg>

      {/* Hover Floating Details */}
      {hovered && (
        <div className="pointer-events-none absolute right-4 top-4 z-10 rounded-xl border border-line bg-paper/95 p-3.5 text-xs shadow-md backdrop-blur">
          <p className="font-semibold text-ink">Property Sample #{hovered.id}</p>
          <div className="mt-1.5 space-y-1">
            <p className="flex justify-between gap-4 text-graphite">
              <span>Actual price:</span>
              <span className="font-medium text-ink tabular">₹{hovered.actual_lakhs} Lakhs</span>
            </p>
            <p className="flex justify-between gap-4 text-graphite">
              <span>Model prediction:</span>
              <span className="font-medium text-ink tabular">₹{hovered.predicted} Lakhs</span>
            </p>
            <p className="flex justify-between gap-4 border-t border-line-soft pt-1 text-[0.7rem] text-muted">
              <span>Variance gap:</span>
              <span className="tabular font-medium text-ink">
                ± ₹{Math.abs(hovered.actual_lakhs - hovered.predicted).toFixed(2)} Lakhs
              </span>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
