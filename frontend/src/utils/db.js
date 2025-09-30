import { openDB } from "idb";

// Initialize IndexedDB
export const dbPromise = openDB("pdfBooksDB", 1, {
  upgrade(db) {
    if (!db.objectStoreNames.contains("books")) {
      db.createObjectStore("books", { keyPath: "id" });
    }
  },
});

export async function addBook(book) {
  const db = await dbPromise;
  await db.put("books", book);
}

export async function getBooks() {
  const db = await dbPromise;
  return await db.getAll("books");
}

export async function getBook(id) {
  const db = await dbPromise;
  return await db.get("books", id);
}

export async function updateBookBookmarks(id, bookmarks) {
  const db = await dbPromise;
  const book = await db.get("books", id);
  if (!book) throw new Error("Book not found");

  book.bookmarks = bookmarks;
  await db.put("books", book);
  return book;
}

export async function removeBookBookmark(id, pageNum) {
  const db = await dbPromise;
  const book = await db.get("books", id);
  if (!book) throw new Error("Book not found");

  book.bookmarks = (book.bookmarks || []).filter((p) => p !== pageNum);
  await db.put("books", book);
  return book;
}

export async function removeBook(id) {
  const db = await dbPromise;
  await db.delete("books", id);
}

export async function updateBookLastPage(id, lastPage) {
  const db = await dbPromise;
  const tx = db.transaction("books", "readwrite");
  const store = tx.objectStore("books");
  const book = await store.get(id);
  if (book) {
    book.lastPage = lastPage;
    await store.put(book);
  }
  await tx.done;
}

export async function updateBookThumbnail(bookId, thumbnail) {
  if (!dbPromise) throw new Error("Database not initialized");

  const db = await dbPromise;
  const tx = db.transaction("books", "readwrite");
  const store = tx.objectStore("books");

  const book = await store.get(bookId);
  if (!book) throw new Error(`Book with id ${bookId} not found`);

  book.thumbnail = thumbnail;
  await store.put(book);

  await tx.done;
  return book;
}

export async function updateBookName(id, newName) {
  const db = await dbPromise;
  const tx = db.transaction("books", "readwrite");
  const store = tx.objectStore("books");
  const book = await store.get(id);
  if (book) {
    book.name = newName;
    await store.put(book);
  }
  await tx.done;
  return book;
}

export async function updateBookNumPages(id, numPages) {
  const db = await dbPromise;
  const tx = db.transaction("books", "readwrite");
  const store = tx.objectStore("books");
  const book = await store.get(id);
  if (!book) throw new Error(`Book ${id} not found`);
  book.numPages = Number(numPages);
  await store.put(book);
  await tx.done;
  return book;
}
