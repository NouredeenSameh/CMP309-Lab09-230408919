export function StatsPanel({ stats }) {
  if (!stats) return null;

  const genreEntries = Object.entries(stats.byGenre || {});

  return (
    <section className="panel">
      <h2 style={{ marginTop: 0 }}>Library Statistics</h2>
      <div className="stats-grid">
        <div className="stat-box">
          <strong>Total Books</strong>
          <div>{stats.total}</div>
        </div>
        <div className="stat-box">
          <strong>Read</strong>
          <div>{stats.readCount}</div>
        </div>
        <div className="stat-box">
          <strong>Unread</strong>
          <div>{stats.unreadCount}</div>
        </div>
        <div className="stat-box">
          <strong>Average Rating</strong>
          <div>{stats.averageRating !== null ? `${stats.averageRating} / 5` : "N/A"}</div>
        </div>
      </div>
      {genreEntries.length > 0 && (
        <p style={{ marginBottom: 0, marginTop: "0.75rem", fontSize: "0.9rem", color: "#475569" }}>
          <strong>By Genre:</strong>{" "}
          {genreEntries.map(([g, count]) => `${g} (${count})`).join(" • ")}
        </p>
      )}
    </section>
  );
}