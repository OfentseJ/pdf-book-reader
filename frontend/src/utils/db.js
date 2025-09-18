// src/utils/db.js
import { openDB } from "idb";

// Initialize IndexedDB
export const dbPromise = openDB("pdfBooksDB", 1, {
  upgrade(db) {
    if (!db.objectStoreNames.contains("books")) {
      db.createObjectStore("books", { keyPath: "id" });
    }
  },
});

// Add a new book
export async function addBook(book) {
  const db = await dbPromise;
  await db.put("books", book);
}

// Get all books
export async function getBooks() {
  const db = await dbPromise;
  return await db.getAll("books");
}

// Get a single book by ID
export async function getBook(id) {
  const db = await dbPromise;
  return await db.get("books", id);
}

// Update the bookmarks for a book
export async function updateBookBookmarks(id, bookmarks) {
  const db = await dbPromise;
  const book = await db.get("books", id);
  if (!book) throw new Error("Book not found");

  book.bookmarks = bookmarks;
  await db.put("books", book);
  return book;
}

// Remove a single bookmark from a book
export async function removeBookBookmark(id, pageNum) {
  const db = await dbPromise;
  const book = await db.get("books", id);
  if (!book) throw new Error("Book not found");

  book.bookmarks = (book.bookmarks || []).filter((p) => p !== pageNum);
  await db.put("books", book);
  return book;
}

// Remove a book entirely
export async function removeBook(id) {
  const db = await dbPromise;
  await db.delete("books", id);
}
