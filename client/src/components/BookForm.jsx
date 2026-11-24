import { useState, useEffect } from "react";

const GENRES = ["fiction", "non-fiction", "science", "history", "fantasy", "other"];

export function BookForm({ editingBook, onSubmitBook, onCancelEdit, submitting }) {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [year, setYear] = useState(new Date().getFullYear());
  const [genre, setGenre] = useState("fiction");
  const [read, setRead] = useState(false);
  const [rating, setRating] = useState("");

  useEffect(() => {
    if (editingBook) {
      setTitle(editingBook.title);
      setAuthor(editingBook.author);
      setYear(editingBook.year);
      setGenre(editingBook.genre);
      setRead(editingBook.read);
      setRating(editingBook.rating !== null ? String(editingBook.rating) : "");
    } else {
      setTitle("");
      setAuthor("");
      setYear(new Date().getFullYear());
      setGenre("fiction");
      setRead(false);
      setRating("");
    }
  }, [editingBook]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      title,
      author,
      year: Number(year),
      genre,
      read,
      rating: read && rating !== "" ? Number(rating) : null
    };
    const success = await onSubmitBook(payload, editingBook?.id);
    if (success && !editingBook) {
      setTitle("");
      setAuthor("");
      setYear(new Date().getFullYear());
      setGenre("fiction");
      setRead(false);
      setRating("");
    }
  };

  return (
    <section className="panel">
      <h2 style={{ marginTop: 0 }}>{editingBook ? `Edit Book #${editingBook.id}` : "Add New Book"}</h2>
      <form onSubmit={handleSubmit} className="controls-row">
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Author"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          required
        />
        <input
          type="number"
          placeholder="Year"
          value={year}
          onChange={(e) => setYear(e.target.value)}
          style={{ width: "95px" }}
          required
        />
        <select value={genre} onChange={(e) => setGenre(e.target.value)}>
          {GENRES.map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </select>

        <label style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
          <input
            type="checkbox"
            checked={read}
            onChange={(e) => {
              const checked = e.target.checked;
              setRead(checked);
              if (!checked) setRating("");
            }}
          />
          Read
        </label>

        <select
          value={rating}
          disabled={!read}
          onChange={(e) => setRating(e.target.value)}
        >
          <option value="">No Rating</option>
          {[1, 2, 3, 4, 5].map((n) => (
            <option key={n} value={n}>
              {n} ★
            </option>
          ))}
        </select>

        <button type="submit" disabled={submitting}>
          {submitting ? "Saving..." : editingBook ? "Save Changes (PUT)" : "Add Book (POST)"}
        </button>

        {editingBook && (
          <button type="button" className="secondary" onClick={onCancelEdit} disabled={submitting}>
            Cancel
          </button>
        )}
      </form>
    </section>
  );
}