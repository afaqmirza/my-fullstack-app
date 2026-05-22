import { Search, X } from 'lucide-react';

export default function ToolsSearchBar({ value, onChange, placeholder = 'Search tools by name, category, or feature…' }) {
  return (
    <div className="tools-search-bar">
      <Search size={20} className="tools-search-icon" />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label="Search tools"
      />
      {value && (
        <button type="button" className="tools-search-clear" onClick={() => onChange('')} aria-label="Clear search">
          <X size={18} />
        </button>
      )}
    </div>
  );
}

export function toolMatchesQuery(tool, query) {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const haystack = [tool.title, tool.description, tool.category, ...(tool.features || [])]
    .join(' ')
    .toLowerCase();
  return haystack.includes(q);
}
