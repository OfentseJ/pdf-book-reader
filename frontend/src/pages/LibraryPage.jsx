import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import BookCard from "../components/BookCard";
import {
  addBook,
  getBook,
  getBooks,
  removeBook,
  updateBookName,
} from "../utils/db";
import * as pdfjsLib from "pdfjs-dist";
import { generateThumbnailForBook } from "../utils/generateThumbnail";
import { Plus, Search } from "lucide-react";
import {
  deleteBook,
  fetchMyBooks,
  normalizeBook,
  renameBook,
  uploadBook,
} from "../utils/books";
import LibraryHeader from "../components/LibraryHeader";

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export default function LibraryPage() {
  const navigate = useNavigate();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState("alphabetical");
  const [token, setToken] = useState(localStorage.getItem("token"));

  useEffect(() => {
    if (!token) {
      console.log("⏳ Waiting for token...");
      return;
    }
    async function loadBooks() {
      setLoading(true);

      try {
        const remoteBooks = await fetchMyBooks(token);
        const normalizedBooks = remoteBooks.map(normalizeBook);

        const booksWithFiles = [];

        for (const book of normalizedBooks) {
          const existingBook = await getBook(book.id);

          if (existingBook && existingBook.file) {
            booksWithFiles.push(existingBook);
            continue;
          }

          let fileBlob = existingBook?.file || null;
          if (!fileBlob && book.fileUrl) {
            try {
              const response = await fetch(book.fileUrl);
              fileBlob = await response.blob();
            } catch (fetchErr) {
              console.warn(`Could not fetch file for ${book.name}:`, fetchErr);
            }
          }

          const bookToSave = {
            ...book,
            file: fileBlob
              ? new File([fileBlob], `${book.name}.pdf`, {
                  type: "application/pdf",
                })
              : null,
          };

          await addBook(bookToSave);
          const withThumb = await generateThumbnailForBook(bookToSave);

          booksWithFiles.push(withThumb);
        }

        setBooks(booksWithFiles);
      } catch (err) {
        console.warn("Backend fetch failed, using local IndexedDB:", err);
        const localBooks = await getBooks();
        setBooks(localBooks);
      } finally {
        setLoading(false);
      }
    }

    loadBooks();
  }, [token]);

  const sortedBooks = [...books].sort((a, b) => {
    const nameA = a.name || "";
    const nameB = b.name || "";

    switch (sortOption) {
      case "alphabetical":
        return nameA.localeCompare(nameB);

      case "reverse-alphabetical":
        return nameB.localeCompare(nameA);

      case "recently-added":
        return (b.addedAt || 0) - (a.addedAt || 0);

      case "last-opened":
        return (b.lastOpened || 0) - (a.lastOpened || 0);

      default:
        return 0;
    }
  });

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    try {
      const result = await uploadBook(file, token);
      const uploadedBook = result.book || result;

      const normalized = normalizeBook({
        id: uploadedBook.id,
        book_id: uploadedBook.id,
        name: uploadedBook.name,
        fileUrl: uploadedBook.url,
        file,
        addedAt: Date.now(),
      });

      await addBook(normalized);
      const bookWithThumb = await generateThumbnailForBook(normalized);

      setBooks((prev) => [...prev, bookWithThumb]);
    } catch (err) {
      console.error("Upload failed:", err);
      alert("Failed to upload book");
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (id) => {
    const bookToRemove = books.find((b) => b.id === id);
    if (!bookToRemove) return;

    if (bookToRemove.fileUrl) {
      URL.revokeObjectURL(bookToRemove.fileUrl);
    }

    if (bookToRemove.thumbnail) {
      URL.revokeObjectURL(bookToRemove.thumbnail);
    }

    await removeBook(id);
    await deleteBook(id, token);
    setBooks((prev) => prev.filter((b) => b.id !== id));
  };

  const handleRename = async (id, newName) => {
    const updatedBook = await updateBookName(id, newName);
    await renameBook(id, newName, token);
    setBooks((prev) =>
      prev.map((b) => (b.id === id ? { ...b, name: updatedBook.name } : b))
    );
  };

  const filteredBooks = sortedBooks.filter((book) => {
    const name = book.name || book.title || "";
    return name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <LibraryHeader />

        {/* Controls */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-8 transition-colors">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
              <input
                type="text"
                placeholder="Search your library..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
              />
            </div>

            {/* Sort */}
            <div className="md:w-48">
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition bg-white dark:bg-gray-700 text-gray-900 dark:text-white cursor-pointer"
              >
                <option value="alphabetical">A–Z</option>
                <option value="reverse-alphabetical">Z–A</option>
                <option value="recently-added">Recently Added</option>
                <option value="last-opened">Last Opened</option>
              </select>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400 mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">
                Loading your library...
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Books Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {/* Upload Card */}
              <label className="group flex flex-col items-center justify-center bg-white dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl h-64 cursor-pointer hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-gray-700 transition-all duration-200">
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={handleUpload}
                  className="hidden"
                />
                <div className="flex flex-col items-center space-y-3">
                  <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700 group-hover:bg-blue-100 dark:group-hover:bg-blue-900 flex items-center justify-center transition-colors">
                    <Plus className="w-8 h-8 text-gray-400 dark:text-gray-500 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
                  </div>
                  <div className="text-center px-4">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      Add Book
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Upload PDF
                    </p>
                  </div>
                </div>
              </label>

              {/* Book Cards */}
              {filteredBooks.map((book) => (
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

            {/* Empty State */}
            {filteredBooks.length === 0 && !loading && (
              <div className="text-center py-16">
                <div className="inline-block p-6 bg-gray-100 dark:bg-gray-800 rounded-full mb-4">
                  <Search className="w-12 h-12 text-gray-400 dark:text-gray-500" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {searchTerm ? "No books found" : "Your library is empty"}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  {searchTerm
                    ? "Try adjusting your search terms"
                    : "Upload your first PDF to get started"}
                </p>
                {!searchTerm && (
                  <label className="inline-flex items-center px-6 py-3 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 cursor-pointer transition-colors">
                    <input
                      type="file"
                      accept="application/pdf"
                      onChange={handleUpload}
                      className="hidden"
                    />
                    <Plus className="w-5 h-5 mr-2" />
                    Upload Your First Book
                  </label>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
