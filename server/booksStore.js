const delay = (ms = 40) => new Promise((resolve) => setTimeout(resolve, ms));

const INITIAL_SEED = [
  {
    id: 1,
    title: "Dune",
    author: "Frank Herbert",
    year: 1965,
    genre: "science",
    read: true,
    rating: 5
  },
  {
    id: 2,
    title: "1984",
    author: "George Orwell",
    year: 1949,
    genre: "fiction",
    read: true,
    rating: 5
  },
  {
    id: 3,
    title: "Sapiens: A Brief History of Humankind",
    author: "Yuval Noah Harari",
    year: 2011,
    genre: "history",
    read: true,
    rating: 4
  },
  {
    id: 4,
    title: "The Hobbit",
    author: "J.R.R. Tolkien",
    year: 1937,
    genre: "fantasy",
    read: false,
    rating: null
  },
  {
    id: 5,
    title: "Atomic Habits",
    author: "James Clear",
    year: 2018,
    genre: "non-fiction",
    read: true,
    rating: 4
  },
  {
    id: 6,
    title: "Project Hail Mary",
    author: "Andy Weir",
    year: 2021,
    genre: "science",
    read: false,
    rating: null
  }
];

let books = INITIAL_SEED.map((b) => ({ ...b }));
let nextId = 7;

export async function getAllBooks() {
  await delay();
  return books.map((b) => ({ ...b }));
}

export async function getBookById(id) {
  await delay();
  const found = books.find((b) => b.id === id);
  return found ? { ...found } : null;
}

export async function createBook(data) {
  await delay();
  const newBook = {
    id: nextId++,
    title: data.title,
    author: data.author,
    year: data.year,
    genre: data.genre,
    read: data.read,
    rating: data.rating
  };
  books = [...books, newBook];
  return { ...newBook };
}

export async function replaceBook(id, data) {
  await delay();
  const exists = books.some((b) => b.id === id);
  if (!exists) return null;

  const updated = {
    id,
    title: data.title,
    author: data.author,
    year: data.year,
    genre: data.genre,
    read: data.read,
    rating: data.rating
  };
  books = books.map((b) => (b.id === id ? updated : b));
  return { ...updated };
}

export async function deleteBook(id) {
  await delay();
  const exists = books.some((b) => b.id === id);
  if (!exists) return false;

  books = books.filter((b) => b.id !== id);
  return true;
}