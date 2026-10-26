import { useState } from 'react';

export default function ResidualPlot({ histogram }) {
  const [hovered, setHovered] = useState(null);

  if (!histogram?.length) return null;

  const width = 860;
  const height = 340;
  const pad = { top: 28, right: 36, bottom: 64, left: 68 };
  const plotWidth = width - pad.left - pad.right;
  const plotHeight = height - pad.top - pad.bottom;

  const maxCount = Math.max(...histogram.map((bin) => bin.count), 1);
  const barWidth = plotWidth / histogram.length;

  return (
    <div className="relative w-full">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-auto w-full select-none overflow-visible"
        role="img"
        aria-label="Histogram of prediction residuals"
      >
        {/* Horizontal gridlines */}
        {[0.25, 0.5, 0.75, 1.0].map((ratio) => {
          const y = height - pad.bottom - ratio * plotHeight;
          return (
            <g key={ratio}>
              <line
                x1={pad.left}
                y1={y}
                x2={width - pad.right}
                y2={y}
                stroke="#ebe4d8"
                strokeDasharray="3,3"
              />
              <text
                x={pad.left - 10}
                y={y + 4}
                textAnchor="end"
                fontSize="12"
                fill="#746d62"
                className="tabular font-medium"
              >
                {Math.round(maxCount * ratio)}
              </text>
            </g>
          );
        })}

        {/* Zero-error vertical axis */}
        {(() => {
          const zeroIndex = histogram.findIndex((bin) => bin.bin_start <= 0 && bin.bin_end >= 0);
          if (zeroIndex < 0) return null;
          const x = pad.left + zeroIndex * barWidth + barWidth / 2;
          return (
            <g>
              <line
                x1={x}
                y1={pad.top}
                x2={x}
                y2={height - pad.bottom}
                stroke="#5b7f5f"
                strokeWidth="1.5"
                strokeDasharray="4,4"
              />
              <text
                x={x}
                y={pad.top - 8}
                textAnchor="middle"
                fontSize="11"
                fill="#5b7f5f"
                fontWeight="600"
              >
                Zero Error Axis (0.0 Lakhs)
              </text>
            </g>
          );
        })()}

        {/* Histogram Bars */}
        {histogram.map((bin, index) => {
          const barHeight = (bin.count / maxCount) * plotHeight;
          const x = pad.left + index * barWidth + 2;
          const widthOfBar = Math.max(2, barWidth - 4);
          const y = height - pad.bottom - barHeight;
          const spansZero = bin.bin_start <= 0 && bin.bin_end >= 0;
          const isHovered = hovered?.index === index;

          return (
            <g key={index}>
              <rect
                x={x}
                y={y}
                width={widthOfBar}
                height={barHeight}
                rx={2}
                fill={isHovered ? '#211f1a' : spansZero ? '#5b7f5f' : '#56658f'}
                fillOpacity={spansZero ? 0.78 : 0.58}
                className="cursor-pointer transition-colors duration-150"
                onMouseEnter={() => setHovered({ ...bin, index })}
                onMouseLeave={() => setHovered(null)}
              />
              {/* X tick labels every 2 or 3 bars */}
              {(index % 2 === 0 || index === histogram.length - 1) && (
                <text
                  x={x + widthOfBar / 2}
                  y={height - pad.bottom + 20}
                  textAnchor="middle"
                  fontSize="11"
                  fill="#746d62"
                  className="tabular font-medium"
                >
                  {bin.bin_start}L
                </text>
              )}
            </g>
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
          Residual Deviation: Actual Price − Predicted Price (in ₹ Lakhs)
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
          Property Count
        </text>
      </svg>

      {/* Floating Hover Card */}
      {hovered && (
        <div className="pointer-events-none absolute right-4 top-4 z-10 rounded-xl border border-line bg-paper/95 p-3.5 text-xs shadow-md backdrop-blur">
          <p className="font-semibold text-ink">Residual Bin Details</p>
          <div className="mt-1.5 space-y-1">
            <p className="flex justify-between gap-4 text-graphite">
              <span>Deviation range:</span>
              <span className="font-medium text-ink tabular">{hovered.bin_start}L to {hovered.bin_end}L</span>
            </p>
            <p className="flex justify-between gap-4 text-graphite">
              <span>Homes in bracket:</span>
              <span className="font-medium text-ink tabular">{hovered.count} properties</span>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
