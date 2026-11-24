const GENRES = ["fiction", "non-fiction", "science", "history", "fantasy", "other"];

export function FilterBar({ filters, onChange }) {
  const handleField = (key, value) => {
    onChange({ ...filters, [key]: value });
  };

  return (
    <section className="panel">
      <div className="controls-row">
        <input
          type="text"
          placeholder="Search title or author..."
          value={filters.q}
          onChange={(e) => handleField("q", e.target.value)}
        />

        <select value={filters.genre} onChange={(e) => handleField("genre", e.target.value)}>
          <option value="">All Genres</option>
          {GENRES.map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </select>

        <select value={filters.read} onChange={(e) => handleField("read", e.target.value)}>
          <option value="">All Statuses</option>
          <option value="true">Read</option>
          <option value="false">Unread</option>
        </select>

        <select value={filters.sort} onChange={(e) => handleField("sort", e.target.value)}>
          <option value="">Sort by ID</option>
          <option value="title">Title</option>
          <option value="author">Author</option>
          <option value="year">Year</option>
          <option value="rating">Rating</option>
        </select>

        <select value={filters.order} onChange={(e) => handleField("order", e.target.value)}>
          <option value="asc">Ascending</option>
          <option value="desc">Descending</option>
        </select>
      </div>
    </section>
  );
}