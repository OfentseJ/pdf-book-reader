import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import PdfViewer from "../components/PdfViewer";

export default function ReaderPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem("library");
    if (stored) {
      const books = JSON.parse(stored);
      const found = books.find((b) => b.id === id);
      if (found) {
        setBook(found);
      } else {
        navigate("/");
      }
    }
  }, [id, navigate]);

  const updateBookmarks = (pageNum) => {
    if (!book) return;
    const updatedBook = {
      ...book,
      bookmarks: book.bookmarks.includes(pageNum)
        ? book.bookmarks
        : [...book.bookmarks, pageNum].sort((a, b) => a - b),
    };

    setBook(updatedBook);

    const stored = JSON.parse(localStorage.getItem("library")) || [];
    const updatedLibrary = stored.map((b) =>
      b.id === book.id ? updatedBook : b
    );
    localStorage.setItem("library", JSON.stringify(updatedLibrary));
  };

  if (!book) {
    return <p className="p-6 text-gray-600">Loading book...</p>;
  }

  return (
    <div className="p-4">
      <button
        onClick={() => navigate("/")}
        className="mb-4 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition-colors"
      >
        ← Back to Library
      </button>
      <h2 className="text-xl font-bold mb-4">📖 {book.name}</h2>
      <PdfViewer
        file={book.fileUrl}
        bookmarks={book.bookmarks}
        onAddBookmark={updateBookmarks}
      />
    </div>
  );
}
