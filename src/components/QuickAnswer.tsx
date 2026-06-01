interface QuickAnswerProps {
  question: string;
  answer: string;
}

export default function QuickAnswer({ question, answer }: QuickAnswerProps) {
  return (
    <div className="my-8 rounded-xl border border-gray-200 bg-white p-6 shadow-sm not-prose">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-teal" aria-hidden="true">
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z"
            />
          </svg>
        </span>
        <span className="text-xs font-semibold uppercase tracking-wider text-teal">
          Quick Answer
        </span>
      </div>
      <h2 className="text-lg font-bold text-navy mb-3 leading-snug">
        {question}
      </h2>
      <p className="text-[0.938rem] leading-relaxed text-gray-700 mb-4">
        {answer}
      </p>
      <p className="text-xs text-warm-gray">
        ↓ Read the full guide below for details, comparisons, and recommendations.
      </p>
    </div>
  );
}
