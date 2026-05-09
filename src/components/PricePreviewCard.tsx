import Link from "next/link";
import { formatPeso, formatDateShort } from "@/lib/format";

export function PricePreviewCard(props: {
  title: string;
  subtitle?: string;
  range: { min: number; max: number; monthStart: string } | null;
  unitLabel: string;
  href: string;
}) {
  return (
    <Link
      href={props.href}
      className="group rounded-2xl border border-forest/45 bg-forest/25 p-5 shadow-md backdrop-blur-sm transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-jade/45 hover:bg-forest/35 hover:shadow-lg active:scale-[0.99]"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-mint/65">{props.subtitle ?? "Preview"}</p>
          <h3 className="mt-1 text-lg font-semibold tracking-tight text-mint">{props.title}</h3>
        </div>
        <span className="rounded-full bg-jade/20 px-3 py-1 text-xs font-semibold text-mint transition-colors duration-300 group-hover:bg-jade/30">
          Tingnan
        </span>
      </div>

      <div className="mt-4">
        {props.range ? (
          <>
            <p className="text-2xl font-semibold tracking-tight text-mint">
              {formatPeso(props.range.min)}–{formatPeso(props.range.max)}
              <span className="ml-2 text-sm font-medium text-mint/55">/ {props.unitLabel}</span>
            </p>
            <p className="mt-1 text-sm text-mint/65">
              Saklaw ng buwan: {formatDateShort(props.range.monthStart)}
            </p>
          </>
        ) : (
          <p className="text-sm text-mint/65">Walang data pa para sa item na ito.</p>
        )}
      </div>
    </Link>
  );
}
