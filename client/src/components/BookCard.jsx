export function BookCard({ book, onToggleRead, onRate, onEdit, onDelete, busyId }) {
  const isBusy = busyId === book.id;

  return (
    <article className="book-card">
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span className="badge">{book.genre}</span>
          <span style={{ fontSize: "0.85rem", color: "#64748b" }}>{book.year}</span>
        </div>
        <h3 style={{ margin: "0.6rem 0 0.25rem" }}>{book.title}</h3>
        <p style={{ margin: "0 0 0.75rem", color: "#475569" }}>by {book.author}</p>
      </div>

      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
          <label style={{ display: "flex", alignItems: "center", gap: "0.3rem", fontSize: "0.9rem" }}>
            <input
              type="checkbox"
              checked={book.read}
              disabled={isBusy}
              onChange={() => onToggleRead(book)}
            />
            {book.read ? "Read" : "Unread"}
          </label>

          <select
            value={book.rating !== null ? String(book.rating) : ""}
            disabled={!book.read || isBusy}
            onChange={(e) => {
              const val = e.target.value === "" ? null : Number(e.target.value);
              onRate(book.id, val);
            }}
          >
            <option value="">Unrated</option>
            {[1, 2, 3, 4, 5].map((n) => (
              <option key={n} value={n}>
                {n} ★
              </option>
            ))}
          </select>
        </div>

        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button type="button" className="secondary" disabled={isBusy} onClick={() => onEdit(book)}>
            Edit
          </button>
          <button type="button" className="danger" disabled={isBusy} onClick={() => onDelete(book.id)}>
            Delete
          </button>
        </div>
      </div>
    </article>
  );
}