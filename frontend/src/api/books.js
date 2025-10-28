const API_BASE_URL = "http://localhost:8000/api";
export async function fetchMyBooks(token) {
  const response = await fetch(`${API_BASE_URL}/my-books`, {
    headers: {
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

export function normalizeBook(rawBook) {
  return {
    id: rawBook.book_id || rawBook.id || crypto.randomUUID(),
    name: rawBook.title || rawBook.name || "Untitled",
    fileUrl: rawBook.url || rawBook.cloudinary_url || null,
    bookmarks: rawBook.bookmarks || [],
    thumbnail: rawBook.thumbnail || null,
    uploaded: rawBook.uploaded || false,
    cloudinaryId: rawBook.book_id || rawBook.cloudinaryId || null,
    addedAt: rawBook.addedAt || Date.now(),
    lastOpened: rawBook.lastOpened || 0,
  };
}
