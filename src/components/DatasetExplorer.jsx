import PageHeader from './PageHeader';

export default function DatasetExplorer({ summary }) {
  if (!summary) {
    return <p className="py-16 text-center text-body text-graphite">Loading dataset…</p>;
  }

  const cityAvg = summary.city_avg_prices || {};
  const cityDistribution = summary.city_distribution || {};
  const bhkDistribution = summary.bhk_distribution || {};
  const maxCityAvg = Math.max(...Object.values(cityAvg), 1);

  return (
    <div>
      <PageHeader
        title="Twelve thousand homes, five metros."
        intro="A comprehensive survey of verified residential properties across Bangalore, Mumbai, Hyderabad, Pune, and Nagpur."
      />

      <div className="mb-14 grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-4">
        <Figure label="Properties" value={summary.total_records.toLocaleString('en-IN')} />
        <Figure
          label="Median price"
          value={`₹${(summary.target_stats.median / 1e5).toFixed(1)} L`}
        />
        <Figure
          label="Price range"
          value={`₹${(summary.target_stats.min / 1e5).toFixed(0)}L – ₹${(summary.target_stats.max / 1e7).toFixed(1)}Cr`}
          small
        />
        <Figure label="Features used" value="18" />
      </div>

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-10">
        <section aria-labelledby="city-prices-heading">
          <h2 id="city-prices-heading" className="mb-5 font-display text-[1.6rem] tracking-tight text-ink">
            Average price by city
          </h2>
          <div className="space-y-5">
            {Object.entries(cityAvg)
              .sort((a, b) => b[1] - a[1])
              .map(([city, average]) => (
                <div key={city}>
                  <div className="mb-2 flex items-baseline justify-between gap-3 text-small">
                    <span className="text-graphite">
                      {city}{' '}
                      <span className="text-muted">({(cityDistribution[city] || 0).toLocaleString('en-IN')})</span>
                    </span>
                    <span className="font-medium text-ink tabular">
                      ₹{(average / 1e5).toFixed(1)} L
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-line-soft">
                    <div
                      className="h-full rounded-full bg-indigo"
                      style={{ width: `${(average / maxCityAvg) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
          </div>
        </section>

        <section aria-labelledby="size-distribution-heading">
          <h2 id="size-distribution-heading" className="mb-5 font-display text-[1.6rem] tracking-tight text-ink">
            Apartment size distribution
          </h2>
          <div className="space-y-5">
            {Object.entries(bhkDistribution)
              .sort((a, b) => Number(a[0]) - Number(b[0]))
              .map(([bhk, count]) => {
                const percent = ((count / summary.total_records) * 100).toFixed(1);
                return (
                  <div key={bhk}>
                    <div className="mb-2 flex items-baseline justify-between gap-3 text-small">
                      <span className="text-graphite">{bhk} BHK</span>
                      <span className="text-ink tabular">
                        {count.toLocaleString('en-IN')} <span className="text-muted">({percent}%)</span>
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-line-soft">
                      <div
                        className="h-full rounded-full bg-sage"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
          </div>
        </section>
      </div>
    </div>
  );
}

function Figure({ label, value, small }) {
  return (
    <div>
      <p className="text-micro text-muted">{label}</p>
      <p className={`mt-1 font-display leading-tight text-ink ${small ? 'text-[1.35rem] sm:text-[1.5rem]' : 'text-[1.8rem] sm:text-[2.1rem]'}`}>
        {value}
      </p>
    </div>
  );
}
