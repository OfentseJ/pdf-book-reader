import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import BookCard from "../components/BookCard";
import { addBook, getBooks, removeBook, updateBookName } from "../utils/db";
import * as pdfjsLib from "pdfjs-dist";
import pdfjsWorker from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import { generateThumbnailsForLibrary } from "../utils/generateThumbnail";
import { Plus } from "lucide-react";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

export default function LibraryPage() {
  const navigate = useNavigate();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

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

  const handleRename = async (id, newName) => {
    const updatedBook = await updateBookName(id, newName);
    setBooks((prev) =>
      prev.map((b) => (b.id === id ? { ...b, name: updatedBook.name } : b))
    );
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl mb-4 font-bold ">📚 Library</h1>
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring focus:border-blue-300 "
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
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
        <div className="w-full h-screen flex items-center justify-center">
          <p className="text-gray-500">Loading...</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          {books
            .filter((book) =>
              book.name.toLowerCase().includes(searchTerm.toLowerCase())
            )
            .map((book) => (
              <div key={book.id} className="relative">
                <BookCard
                  book={book}
                  onOpen={() => navigate(`/reader/${book.id}`)}
                  onRemove={() => handleRemove(book.id)}
                  onRename={handleRename}
                />
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
