interface KeyStatProps {
  stat: string;
  context: string;
  source?: string;
}

export default function KeyStat({ stat, context, source }: KeyStatProps) {
  return (
    <div className="my-8 rounded-lg border border-navy-200 bg-navy-50 p-5 text-center not-prose">
      <p className="text-3xl font-extrabold text-navy mb-1 leading-tight">
        {stat}
      </p>
      <p className="text-[0.938rem] text-navy-700 leading-relaxed">
        {context}
      </p>
      {source && (
        <p className="text-xs text-warm-gray mt-2">
          Source: {source}
        </p>
      )}
    </div>
  );
}
