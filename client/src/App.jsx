import { useState, useEffect, useCallback } from "react";
import {
  fetchBooks,
  fetchStats,
  createBook,
  updateBook,
  patchBook,
  deleteBook
} from "./api/books";
import { StatsPanel } from "./components/StatsPanel";
import { FilterBar } from "./components/FilterBar";
import { BookForm } from "./components/BookForm";
import { BookCard } from "./components/BookCard";

export default function App() {
  const [books, setBooks] = useState([]);
  const [stats, setStats] = useState(null);
  const [filters, setFilters] = useState({
    q: "",
    genre: "",
    read: "",
    sort: "",
    order: "asc"
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [busyId, setBusyId] = useState(null);
  const [editingBook, setEditingBook] = useState(null);

  const loadData = useCallback(
    async (signal) => {
      setLoading(true);
      setError("");
      try {
        const [booksData, statsData] = await Promise.all([
          fetchBooks(filters, signal),
          fetchStats(signal)
        ]);
        setBooks(booksData);
        setStats(statsData);
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(err.message || "Failed to load reading list");
        }
      } finally {
        if (!signal?.aborted) {
          setLoading(false);
        }
      }
    },
    [filters]
  );

  useEffect(() => {
    const controller = new AbortController();
    loadData(controller.signal);
    return () => controller.abort();
  }, [loadData]);

  const refreshAfterMutation = async () => {
    const [booksData, statsData] = await Promise.all([
      fetchBooks(filters),
      fetchStats()
    ]);
    setBooks(booksData);
    setStats(statsData);
  };

  const handleSubmitBook = async (payload, editId) => {
    setSubmitting(true);
    setActionError("");
    try {
      if (editId) {
        await updateBook(editId, payload);
        setEditingBook(null);
      } else {
        await createBook(payload);
      }
      await refreshAfterMutation();
      return true;
    } catch (err) {
      setActionError(err.message);
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleRead = async (book) => {
    setBusyId(book.id);
    setActionError("");
    try {
      const nextRead = !book.read;
      const patchPayload = nextRead ? { read: true } : { read: false, rating: null };
      await patchBook(book.id, patchPayload);
      await refreshAfterMutation();
    } catch (err) {
      setActionError(err.message);
    } finally {
      setBusyId(null);
    }
  };

  const handleRate = async (id, rating) => {
    setBusyId(id);
    setActionError("");
    try {
      await patchBook(id, { rating });
      await refreshAfterMutation();
    } catch (err) {
      setActionError(err.message);
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (id) => {
    setBusyId(id);
    setActionError("");
    try {
      await deleteBook(id);
      if (editingBook?.id === id) {
        setEditingBook(null);
      }
      await refreshAfterMutation();
    } catch (err) {
      setActionError(err.message);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="app-container">
      <header>
        <h1>Reading List Manager</h1>
      </header>

      <StatsPanel stats={stats} />

      {actionError && <div className="error-banner">{actionError}</div>}

      <BookForm
        editingBook={editingBook}
        onSubmitBook={handleSubmitBook}
        onCancelEdit={() => setEditingBook(null)}
        submitting={submitting}
      />

      <FilterBar filters={filters} onChange={setFilters} />

      {error && <div className="error-banner">{error}</div>}

      {loading ? (
        <p>Loading books...</p>
      ) : books.length === 0 ? (
        <div className="panel">
          <p style={{ margin: 0 }}>No books match the current filters.</p>
        </div>
      ) : (
        <div className="book-list">
          {books.map((book) => (
            <BookCard
              key={book.id}
              book={book}
              busyId={busyId}
              onToggleRead={handleToggleRead}
              onRate={handleRate}
              onEdit={setEditingBook}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}