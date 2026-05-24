type Props = {
  pageNumber: number;
  section: string;
  title?: string;
};

export function Folio({ pageNumber, section, title = "The Dev Times" }: Props) {
  return (
    <div className="mt-4 flex items-center justify-between text-[11px] uppercase tracking-[0.18em] text-ink-soft">
      <span>{title}</span>
      <span>{section}</span>
      <span>Page {pageNumber}</span>
    </div>
  );
}
