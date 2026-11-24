import express from "express";
import cors from "cors";
import {
  getAllBooks,
  getBookById,
  createBook,
  replaceBook,
  deleteBook
} from "./booksStore.js";

const app = express();
const PORT = process.env.PORT || 3000;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:5173";

const VALID_GENRES = ["fiction", "non-fiction", "science", "history", "fantasy", "other"];
const VALID_SORT_FIELDS = ["title", "author", "year", "rating"];

app.use(
  cors({
    origin: CLIENT_ORIGIN
  })
);
app.use(express.json());

function parsePositiveInt(raw) {
  if (!/^[1-9]\d*$/.test(String(raw))) return null;
  const num = Number(raw);
  return Number.isSafeInteger(num) && num > 0 ? num : null;
}

// GET /api/books
app.get("/api/books", async (req, res, next) => {
  try {
    const { genre, read, q, sort, order, limit, page } = req.query;

    for (const [key, val] of Object.entries(req.query)) {
      if (Array.isArray(val)) {
        return res.status(400).json({ error: `Repeated query parameter is not allowed: ${key}` });
      }
    }

    if (genre !== undefined && !VALID_GENRES.includes(genre)) {
      return res.status(400).json({ error: `Invalid genre filter. Allowed: ${VALID_GENRES.join(", ")}` });
    }

    let readFilter = null;
    if (read !== undefined) {
      if (read !== "true" && read !== "false") {
        return res.status(400).json({ error: "Query parameter 'read' must be 'true' or 'false'" });
      }
      readFilter = read === "true";
    }

    if (sort !== undefined && !VALID_SORT_FIELDS.includes(sort)) {
      return res.status(400).json({ error: `Invalid sort field. Allowed: ${VALID_SORT_FIELDS.join(", ")}` });
    }

    const sortOrder = order === undefined ? "asc" : order;
    if (sortOrder !== "asc" && sortOrder !== "desc") {
      return res.status(400).json({ error: "Query parameter 'order' must be 'asc' or 'desc'" });
    }

    let pageSize = 50;
    if (limit !== undefined) {
      const parsedLimit = parsePositiveInt(limit);
      if (!parsedLimit || parsedLimit > 50) {
        return res.status(400).json({ error: "Query parameter 'limit' must be an integer between 1 and 50" });
      }
      pageSize = parsedLimit;
    }

    let pageNum = 1;
    if (page !== undefined) {
      const parsedPage = parsePositiveInt(page);
      if (!parsedPage) {
        return res.status(400).json({ error: "Query parameter 'page' must be a positive integer" });
      }
      pageNum = parsedPage;
    }

    let result = await getAllBooks();

    if (genre !== undefined) {
      result = result.filter((b) => b.genre === genre);
    }
    if (readFilter !== null) {
      result = result.filter((b) => b.read === readFilter);
    }
    if (q !== undefined && q.trim() !== "") {
      const needle = q.trim().toLowerCase();
      result = result.filter(
        (b) =>
          b.title.toLowerCase().includes(needle) ||
          b.author.toLowerCase().includes(needle)
      );
    }

    const dir = sortOrder === "desc" ? -1 : 1;
    const sorted = [...result].sort((a, b) => {
      if (!sort) return (a.id - b.id) * dir;
      if (sort === "rating") {
        if (a.rating === null && b.rating === null) return 0;
        if (a.rating === null) return 1;
        if (b.rating === null) return -1;
        return (a.rating - b.rating) * dir;
      }
      if (sort === "year") return (a.year - b.year) * dir;
      return a[sort].localeCompare(b[sort], undefined, { sensitivity: "base" }) * dir;
    });

    const startIndex = (pageNum - 1) * pageSize;
    const paginated = sorted.slice(startIndex, startIndex + pageSize);

    return res.status(200).json(paginated);
  } catch (err) {
    next(err);
  }
});

// GET /api/stats
app.get("/api/stats", async (req, res, next) => {
  try {
    const allBooks = await getAllBooks();
    const total = allBooks.length;
    const readCount = allBooks.filter((b) => b.read).length;
    const unreadCount = total - readCount;

    const ratedBooks = allBooks.filter((b) => b.rating !== null);
    const averageRating =
      ratedBooks.length > 0
        ? Number((ratedBooks.reduce((sum, b) => sum + b.rating, 0) / ratedBooks.length).toFixed(2))
        : null;

    const byGenre = {};
    for (const book of allBooks) {
      byGenre[book.genre] = (byGenre[book.genre] || 0) + 1;
    }

    return res.status(200).json({
      total,
      readCount,
      unreadCount,
      averageRating,
      byGenre
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/books/:id
app.get("/api/books/:id", async (req, res, next) => {
  try {
    const id = parsePositiveInt(req.params.id);
    if (!id) {
      return res.status(400).json({ error: "Book id must be a positive integer" });
    }
    const book = await getBookById(id);
    if (!book) {
      return res.status(404).json({ error: "Book not found" });
    }
    return res.status(200).json(book);
  } catch (err) {
    next(err);
  }
});

app.listen(PORT, () => {
  console.log(`Reading List API running at http://localhost:${PORT} (CORS allowed: ${CLIENT_ORIGIN})`);
});