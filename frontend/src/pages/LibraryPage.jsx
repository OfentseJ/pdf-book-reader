import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import BookCard from "../components/BookCard";

export default function LibraryPage() {
  const [books, setBooks] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const stored = localStorage.getItem("library");
    if (stored) setBooks(JSON.parse(stored));
  }, []);

  useEffect(() => {
    localStorage.setItem("library", JSON.stringify(books));
  }, [books]);

  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const newBook = {
      id: crypto.randomUUID(),
      name: file.name,
      fileUrl: URL.createObjectURL(file),
      bookmarks: [],
    };

    setBooks((prev) => [...prev, newBook]);
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
          <BookCard
            key={book.id}
            book={book}
            onOpen={() => navigate(`/reader/${book.id}`)}
          />
        ))}
      </div>
    </div>
  );
}
