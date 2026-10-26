export default function PageHeader({ title, intro }) {
  return (
    <header className="mb-10 max-w-[62ch] sm:mb-12">
      <h1 className="page-title text-ink">{title}</h1>
      <p className="mt-4 max-w-[58ch] text-lede text-graphite">{intro}</p>
    </header>
  );
}
