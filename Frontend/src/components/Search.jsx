const Search = ({
  value,
  onChange,
  placeholder = "Search...",
  buttonLabel,
  onButtonClick,
}) => {
  return (
    <div className="flex flex-col sm:flex-row items-center gap-4 px-8 py-6 border-slate-100">
      
      {/* Search Input */}
      <div className="relative flex-1">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>

        <input
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="w-full pl-9 pr-4 py-3 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-teal-400 transition"
        />
      </div>

      {/* Right Buttons */}
      <div className="flex gap-3 w-full sm:w-auto">

        {["Group by", "Filter", "Sort by"].map((label) => (
          <button
            key={label}
            className="text-xs px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 transition font-medium flex-1 sm:flex-none"
          >
            {label}
          </button>
        ))}

        {/* Optional Add Button */}
        {buttonLabel && (
          <button
            onClick={onButtonClick}
            className="text-xs px-5 py-2.5 rounded-lg bg-teal-500 text-white font-semibold hover:bg-teal-600 active:scale-95 transition shadow-sm flex items-center gap-2 flex-1 sm:flex-none justify-center sm:justify-start"
          >
            <span className="text-base leading-none">+</span>
            {buttonLabel}
          </button>
        )}
      </div>
    </div>
  );
};

export default Search;