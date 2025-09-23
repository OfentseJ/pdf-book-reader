import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import BookCard from "../components/BookCard";
import {
  addBook,
  getBooks,
  removeBook,
  updateBookThumbnail,
} from "../utils/db";
import * as pdfjsLib from "pdfjs-dist";
import pdfjsWorker from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import { generateThumbnailsForLibrary } from "../utils/generateThumbnail";
import { Plus } from "lucide-react";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

export default function LibraryPage() {
  const [books, setBooks] = useState([]);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadBooks() {
      setLoading(true);
      await generateThumbnailsForLibrary();
      const updatedBooks = await getBooks();
      setBooks(updatedBooks);
      setLoading(false);
    }
    loadBooks();
  }, []);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);

    const fileUrl = URL.createObjectURL(file);

    const newBook = {
      id: crypto.randomUUID(),
      name: file.name,
      fileUrl,
      bookmarks: [],
      file,
      thumbnail: null,
    };

    await addBook(newBook);
    setBooks((prev) => [...prev, newBook]);

    // Generate thumbnail
    const updatedBooks = await generateThumbnailsForLibrary();
    setBooks(updatedBooks);

    setLoading(false);
  };

  const handleRemove = async (id) => {
    const bookToRemove = books.find((b) => b.id === id);
    if (!bookToRemove) return;

    // Revoke object URL to free memory
    if (bookToRemove.fileUrl) {
      URL.revokeObjectURL(bookToRemove.fileUrl);
    }

    // Optional: revoke thumbnail URL if you used object URLs for thumbnails
    if (bookToRemove.thumbnail) {
      URL.revokeObjectURL(bookToRemove.thumbnail);
    }

    // Remove from IndexedDB
    await removeBook(id);

    setBooks((prev) => prev.filter((b) => b.id !== id));
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl mb-4">📚 My Library</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
        <label className="flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg h-40 cursor-pointer hover:bg-gray-50 transition">
          <input
            type="file"
            accept="application/pdf"
            onChange={handleUpload}
            className="hidden"
          />
          <Plus className="w-10 h-10 text-gray-500" />
        </label>
      </div>

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          {books.map((book) => (
            <div key={book.id} className="relative">
              <BookCard
                book={book}
                onOpen={() => navigate(`/reader/${book.id}`)}
                onRemove={() => handleRemove(book.id)}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
