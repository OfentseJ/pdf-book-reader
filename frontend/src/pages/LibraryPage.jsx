import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import BookCard from "../components/BookCard";
import { addBook, getBooks, removeBook } from "../utils/db";

export default function LibraryPage() {
  const [books, setBooks] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    getBooks().then(setBooks);
  }, []);

  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const fileUrl = URL.createObjectURL(file);

    const newBook = {
      id: crypto.randomUUID(),
      name: file.name,
      fileUrl,
      bookmarks: [],
      file,
    };

    addBook(newBook).then(() => {
      setBooks((prev) => [...prev, newBook]);
    });
  };

  const handleRemove = async (id) => {
    await removeBook(id);
    setBooks((prev) => prev.filter((b) => b.id !== id));
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl mb-4">📚 My Library</h1>

      <input
        type="file"
        accept="application/pdf"
        onChange={handleUpload}
        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
        {books.map((book) => (
          <div key={book.id} className="relative">
            <BookCard
              book={book}
              onOpen={() => navigate(`/reader/${book.id}`)}
            />
            <button
              onClick={() => handleRemove(book.id)}
              className="absolute top-2 right-2 px-2 py-1 text-xs text-white rounded hover:bg-red-600"
            >
              ✖
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
