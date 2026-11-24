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

function validateBookPayload(raw) {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return { error: "Request body must be a JSON object" };
  }

  if (typeof raw.title !== "string") {
    return { error: "Title must be a string" };
  }
  const title = raw.title.trim();
  if (title.length < 1 || title.length > 100) {
    return { error: "Title must be 1 to 100 characters after trimming" };
  }

  if (typeof raw.author !== "string") {
    return { error: "Author must be a string" };
  }
  const author = raw.author.trim();
  if (author.length < 1 || author.length > 100) {
    return { error: "Author must be 1 to 100 characters after trimming" };
  }

  const currentYear = new Date().getFullYear();
  if (typeof raw.year !== "number" || !Number.isInteger(raw.year) || raw.year < 1000 || raw.year > currentYear) {
    return { error: `Year must be an integer between 1000 and ${currentYear}` };
  }

  if (typeof raw.genre !== "string" || !VALID_GENRES.includes(raw.genre)) {
    return { error: `Genre must be one of: ${VALID_GENRES.join(", ")}` };
  }

  let read = false;
  if (raw.read !== undefined) {
    if (typeof raw.read !== "boolean") {
      return { error: "Read must be a boolean" };
    }
    read = raw.read;
  }

  let rating = null;
  if (raw.rating !== undefined && raw.rating !== null) {
    if (typeof raw.rating !== "number" || !Number.isInteger(raw.rating) || raw.rating < 1 || raw.rating > 5) {
      return { error: "Rating must be an integer from 1 to 5, or null" };
    }
    rating = raw.rating;
  }

  if (rating !== null && !read) {
    return { error: "Rating is allowed only when read is true" };
  }

  return {
    value: {
      title,
      author,
      year: raw.year,
      genre: raw.genre,
      read,
      rating
    }
  };
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

// POST /api/books
app.post("/api/books", async (req, res, next) => {
  try {
    const { error, value } = validateBookPayload(req.body);
    if (error) {
      return res.status(400).json({ error });
    }

    const allBooks = await getAllBooks();
    const duplicate = allBooks.some(
      (b) =>
        b.title.toLowerCase() === value.title.toLowerCase() &&
        b.author.toLowerCase() === value.author.toLowerCase()
    );
    if (duplicate) {
      return res.status(409).json({ error: "A book with the same title and author already exists" });
    }

    const created = await createBook(value);
    return res
      .status(201)
      .location(`/api/books/${created.id}`)
      .json(created);
  } catch (err) {
    next(err);
  }
});

// PUT /api/books/:id
app.put("/api/books/:id", async (req, res, next) => {
  try {
    const id = parsePositiveInt(req.params.id);
    if (!id) {
      return res.status(400).json({ error: "Book id must be a positive integer" });
    }

    const existing = await getBookById(id);
    if (!existing) {
      return res.status(404).json({ error: "Book not found" });
    }

    const { error, value } = validateBookPayload(req.body);
    if (error) {
      return res.status(400).json({ error });
    }

    const allBooks = await getAllBooks();
    const duplicate = allBooks.some(
      (b) =>
        b.id !== id &&
        b.title.toLowerCase() === value.title.toLowerCase() &&
        b.author.toLowerCase() === value.author.toLowerCase()
    );
    if (duplicate) {
      return res.status(409).json({ error: "Another book with the same title and author already exists" });
    }

    const replaced = await replaceBook(id, value);
    return res.status(200).json(replaced);
  } catch (err) {
    next(err);
  }
});

// PATCH /api/books/:id
app.patch("/api/books/:id", async (req, res, next) => {
  try {
    const id = parsePositiveInt(req.params.id);
    if (!id) {
      return res.status(400).json({ error: "Book id must be a positive integer" });
    }

    if (!req.body || typeof req.body !== "object" || Array.isArray(req.body)) {
      return res.status(400).json({ error: "Request body must be a JSON object" });
    }

    const existing = await getBookById(id);
    if (!existing) {
      return res.status(404).json({ error: "Book not found" });
    }

    const mergedCandidate = {
      title: req.body.title !== undefined ? req.body.title : existing.title,
      author: req.body.author !== undefined ? req.body.author : existing.author,
      year: req.body.year !== undefined ? req.body.year : existing.year,
      genre: req.body.genre !== undefined ? req.body.genre : existing.genre,
      read: req.body.read !== undefined ? req.body.read : existing.read,
      rating: req.body.rating !== undefined ? req.body.rating : existing.rating
    };

    if (req.body.read === false && req.body.rating === undefined) {
      mergedCandidate.rating = null;
    }

    const { error, value } = validateBookPayload(mergedCandidate);
    if (error) {
      return res.status(400).json({ error });
    }

    const allBooks = await getAllBooks();
    const duplicate = allBooks.some(
      (b) =>
        b.id !== id &&
        b.title.toLowerCase() === value.title.toLowerCase() &&
        b.author.toLowerCase() === value.author.toLowerCase()
    );
    if (duplicate) {
      return res.status(409).json({ error: "Another book with the same title and author already exists" });
    }

    const updated = await replaceBook(id, value);
    return res.status(200).json(updated);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/books/:id
app.delete("/api/books/:id", async (req, res, next) => {
  try {
    const id = parsePositiveInt(req.params.id);
    if (!id) {
      return res.status(400).json({ error: "Book id must be a positive integer" });
    }

    const deleted = await deleteBook(id);
    if (!deleted) {
      return res.status(404).json({ error: "Book not found" });
    }

    return res.status(204).send();
  } catch (err) {
    next(err);
  }
});

// Deliberate async crash route for testing 500 error middleware
app.get("/api/crash", async (req, res, next) => {
  try {
    throw new Error("Simulated asynchronous failure");
  } catch (err) {
    next(err);
  }
});

// Express 5 compatible 404 fallback
app.use("/api", (req, res) => {
  return res.status(404).json({ error: "Not found" });
});

app.use((req, res) => {
  return res.status(404).json({ error: "Not found" });
});

// 4-parameter error-handling middleware
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return res.status(400).json({ error: "Malformed JSON in request body" });
  }
  console.error("[Server Error]:", err.message);
  return res.status(500).json({ error: "Something went wrong" });
});

app.listen(PORT, () => {
  console.log(`Reading List API running at http://localhost:${PORT} (CORS allowed: ${CLIENT_ORIGIN})`);
});