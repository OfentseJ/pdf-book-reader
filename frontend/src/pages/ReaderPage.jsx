import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import PdfViewer from "../components/PdfViewer";
import { getBook, updateBookBookmarks } from "../utils/db";

export default function ReaderPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);

  useEffect(() => {
    getBook(id).then(setBook);
  }, [id]);

  const updateBookmarks = (newBookmarks) => {
    if (book) {
      updateBookBookmarks(book.id, newBookmarks).then(() => {
        setBook((prev) => ({ ...prev, bookmarks: newBookmarks }));
      });
    }
  };

  if (!book) {
    return <p className="p-6 text-gray-600">Loading...</p>;
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
        file={book.file}
        bookmarks={book.bookmarks}
        onAddBookmark={updateBookmarks}
      />
    </div>
  );
}
