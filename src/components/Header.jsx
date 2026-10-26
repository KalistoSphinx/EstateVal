import Bloom from './Bloom';

const TABS = [
  { id: 'predict', label: 'Estimate' },
  { id: 'benchmarks', label: 'Models' },
  { id: 'confusion', label: 'Tiers' },
  { id: 'diagnostics', label: 'Charts' },
  { id: 'dataset', label: 'Data' },
];

export default function Header({ activeTab, setActiveTab, onEstimate }) {
  const nav = (
    <nav aria-label="Sections" className="flex items-center gap-0.5 overflow-x-auto">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => setActiveTab(tab.id)}
          aria-current={activeTab === tab.id ? 'page' : undefined}
          className="nav-tab shrink-0 cursor-pointer"
        >
          {tab.label}
        </button>
      ))}
    </nav>
  );

  return (
    <header className="border-b border-line/80">
      <div className="mx-auto w-full max-w-[1180px] px-6">
        <div className="flex h-[76px] items-center justify-between gap-4 md:grid md:grid-cols-[1fr_auto_1fr]">
          <a
            href="#studio"
            onClick={(event) => {
              event.preventDefault();
              onEstimate();
            }}
            className="flex shrink-0 items-center gap-3 rounded-lg"
            aria-label="EstateVal, go to the valuation studio"
          >
            <span className="grid h-9 w-9 place-items-center rounded-[0.7rem] border border-line bg-bone text-marigold">
              <Bloom className="h-[21px] w-[21px]" />
            </span>
            <span className="font-display text-[1.4rem] font-medium tracking-tight text-ink">
              EstateVal
            </span>
          </a>

          <div className="hidden md:block">{nav}</div>

          <button
            type="button"
            onClick={onEstimate}
            className="justify-self-end whitespace-nowrap rounded-full bg-ink px-3.5 py-2.5 text-small font-medium text-paper transition-colors hover:bg-[#3b382f] sm:px-5"
          >
            Estimate a property
          </button>
        </div>

        <div className="pb-3 md:hidden">{nav}</div>
      </div>
    </header>
  );
}
