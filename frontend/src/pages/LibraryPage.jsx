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

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

export default function LibraryPage() {
  const [books, setBooks] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    getBooks().then(setBooks);
    generateThumbnailsForLibrary().then(() => console.log("Done"));
  }, []);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const fileUrl = URL.createObjectURL(file);

    // Generate first-page thumbnail
    let thumbnail = null;
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
      const page = await pdf.getPage(1);
      const viewport = page.getViewport({ scale: 0.5 }); // adjust scale for thumbnail
      const canvas = document.createElement("canvas");
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const context = canvas.getContext("2d");
      await page.render({ canvasContext: context, viewport }).promise;
      thumbnail = canvas.toDataURL(); // base64 thumbnail
    } catch (err) {
      console.error("Failed to generate thumbnail:", err);
    }

    const newBook = {
      id: crypto.randomUUID(),
      name: file.name,
      fileUrl,
      bookmarks: [],
      file,
      thumbnail,
    };

    await addBook(newBook); // save to IndexedDB
    setBooks((prev) => [...prev, newBook]);
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
              onRemove={() => handleRemove(book.id)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
