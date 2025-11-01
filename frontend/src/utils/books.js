const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";
export async function fetchMyBooks(token) {
  const response = await fetch(`${API_BASE_URL}/my-books`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch books");
  }

  return await response.json();
}

export async function uploadBook(file, token) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_BASE_URL}/upload`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Upload failed");
  }

  return await response.json();
}

export async function renameBook(bookId, newName, token) {
  const response = await fetch(`${API_BASE_URL}/books/${bookId}/rename`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ newName }),
  });

  if (!response.ok) throw new Error("Failed to rename book");
  return await response.json();
}

export async function deleteBook(bookId, token) {
  const response = await fetch(`${API_BASE_URL}/books/${bookId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) throw new Error("Failed to delete book");
  return await response.json();
}

export function normalizeBook(rawBook) {
  return {
    // Local unique ID for IndexedDB
    id: rawBook.book_id || rawBook.id || crypto.randomUUID(),

    // Backend ID (for sync/delete later)
    book_id: rawBook.book_id || null,

    // Basic book info
    name: rawBook.title || rawBook.name || "Untitled",
    fileUrl: rawBook.url || rawBook.cloudinary_url || null,

    // PDF file (Blob) — only present for locally uploaded books
    file: rawBook.file || null,

    // Other data
    bookmarks: rawBook.bookmarks || [],
    thumbnail: rawBook.thumbnail || null,
    addedAt: rawBook.addedAt || Date.now(),
    lastOpened: rawBook.lastOpened || 0,
    uploaded: rawBook.uploaded ?? true,
  };
}
