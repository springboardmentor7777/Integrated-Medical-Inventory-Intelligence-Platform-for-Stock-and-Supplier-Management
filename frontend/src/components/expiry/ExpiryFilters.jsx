const ExpiryFilters = ({
  search = "",
  onSearchChange,
  statusFilter = "",
  onStatusChange,
  categoryFilter = "",
  onCategoryChange,
  categories = [],
  onReset,
}) => {
  return (
    <div className="mb-5 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 md:flex-row md:flex-wrap md:items-center">
      {/* Search */}
      <div className="min-w-0 flex-1 md:min-w-[240px]">
        <label
          htmlFor="expiry-search"
          className="sr-only"
        >
          Search medicine
        </label>

        <input
          id="expiry-search"
          type="text"
          className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
          placeholder="Search medicine by name..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      {/* Status Filter */}
      <div>
        <label
          htmlFor="expiry-status"
          className="sr-only"
        >
          Filter by expiry status
        </label>

        <select
          id="expiry-status"
          className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100 md:w-auto"
          value={statusFilter}
          onChange={(e) => onStatusChange(e.target.value)}
        >
          <option value="">All Status</option>
          <option value="Expired">Expired</option>
          <option value="Expiring Soon">Expiring Soon</option>
          <option value="Safe">Safe</option>
        </select>
      </div>

      {/* Category Filter */}
      {categories.length > 0 && (
        <div>
          <label
            htmlFor="expiry-category"
            className="sr-only"
          >
            Filter by category
          </label>

          <select
            id="expiry-category"
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100 md:w-auto"
            value={categoryFilter}
            onChange={(e) => onCategoryChange(e.target.value)}
          >
            <option value="">All Categories</option>

            {categories.map((category) => (
              <option
                key={category}
                value={category}
              >
                {category}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Reset */}
      <button
        type="button"
        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-100 md:w-auto"
        onClick={onReset}
      >
        Reset Filters
      </button>
    </div>
  );
};

export default ExpiryFilters;