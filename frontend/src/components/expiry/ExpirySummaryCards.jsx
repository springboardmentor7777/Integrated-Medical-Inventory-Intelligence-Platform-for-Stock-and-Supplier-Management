const ExpirySummaryCards = ({
  total = 0,
  expired = 0,
  expiringSoon = 0,
  safe = 0,
}) => {
  const cards = [
    {
      label: "Total Medicines",
      value: total,
      icon: "💊",
      tone: "bg-sky-50 text-sky-700",
    },
    {
      label: "Expired Medicines",
      value: expired,
      icon: "⛔",
      tone: "bg-red-50 text-red-700",
    },
    {
      label: "Expiring Soon",
      value: expiringSoon,
      icon: "⏳",
      tone: "bg-amber-50 text-amber-700",
    },
    {
      label: "Safe Medicines",
      value: safe,
      icon: "✅",
      tone: "bg-emerald-50 text-emerald-700",
    },
  ];

  return (
    <section
      aria-label="Expiry summary"
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
    >
      {cards.map((card) => (
        <article
          key={card.label}
          className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md"
        >
          <div
            aria-hidden="true"
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-xl ${card.tone}`}
          >
            {card.icon}
          </div>

          <div className="min-w-0">
            <p className="text-sm font-medium text-slate-500">
              {card.label}
            </p>

            <p className="mt-1 text-2xl font-bold text-slate-900">
              {Number(card.value) || 0}
            </p>
          </div>
        </article>
      ))}
    </section>
  );
};

export default ExpirySummaryCards;