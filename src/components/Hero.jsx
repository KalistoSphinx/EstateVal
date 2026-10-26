import Bloom from './Bloom';

export default function Hero({ onEstimate, onCompare }) {
  return (
    <section className="relative isolate overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 hidden xl:block"
      >
        <Bloom
          className="absolute -left-24 top-[188px] h-[19rem] w-[19rem] -rotate-12 text-rose"
          petal="#c98993"
          core="#b06e79"
        />
        <Bloom
          className="absolute -right-28 top-[92px] h-[22rem] w-[22rem] rotate-[18deg] text-indigo"
          petal="#5c6b96"
          core="#46527a"
        />
      </div>

      <div className="relative mx-auto w-full max-w-[1180px] px-6 pb-14 pt-16 sm:pb-16 sm:pt-20 lg:pt-24">
        <div className="reveal mx-auto max-w-[920px] text-center">
          <h1 className="hero-title text-ink">
            A property estimate
            <br />
            that shows its work.
          </h1>

          <p className="mx-auto mt-7 max-w-[640px] text-lede text-graphite sm:mt-8">
            Three models value the same home independently: a random forest, a ridge
            regression, and a nearest-neighbour search. Change one detail and watch each
            respond.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-6">
            <button
              type="button"
              onClick={onEstimate}
              className="w-full rounded-full bg-ink px-6 py-3 text-body font-medium text-paper transition-colors hover:bg-[#3b382f] sm:w-auto"
            >
              Estimate a property
            </button>
            <button
              type="button"
              onClick={onCompare}
              className="rounded-sm text-body text-ink underline decoration-line underline-offset-[6px] transition-colors hover:decoration-ink"
            >
              Compare the models
            </button>
          </div>

          <p className="mx-auto mt-7 max-w-[560px] text-small text-muted">
            12,000 listings across Bangalore, Mumbai, Hyderabad, Pune and Nagpur.
            Trained on 18 features, evaluated on 2,400 held-out homes.
          </p>
        </div>
      </div>
    </section>
  );
}
