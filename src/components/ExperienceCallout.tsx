interface ExperienceCalloutProps {
  title?: string;
  children: React.ReactNode;
}

export default function ExperienceCallout({
  title = "From Our Experience",
  children,
}: ExperienceCalloutProps) {
  return (
    <div className="my-8 rounded-lg border-l-4 border-navy bg-navy-50 p-5 not-prose">
      <div className="flex items-start gap-3">
        <span className="text-xl leading-none mt-0.5" aria-hidden="true">
          💡
        </span>
        <div>
          <p className="font-semibold text-navy text-sm uppercase tracking-wide mb-2">
            {title}
          </p>
          <div className="text-navy-800 text-[0.938rem] leading-relaxed [&>p]:mb-0">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
