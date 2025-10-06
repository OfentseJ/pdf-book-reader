import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import BookCard from "../components/BookCard";
import { addBook, getBooks, removeBook, updateBookName } from "../utils/db";
import * as pdfjsLib from "pdfjs-dist";
import pdfjsWorker from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import { generateThumbnailsForLibrary } from "../utils/generateThumbnail";
import { Plus, Search } from "lucide-react";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

export default function LibraryPage() {
  const navigate = useNavigate();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState("alphabetical");

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

  const sortedBooks = [...books].sort((a, b) => {
    switch (sortOption) {
      case "alphabetical":
        return a.name.localeCompare(b.name);
      case "reverse-alphabetical":
        return b.name.localeCompare(a.name);
      case "recently-added":
        return b.addedAt - a.addedAt;
      case "last-opened":
        return a.lastOpened - a.lastOpened;
      default:
        return 0;
    }
  });

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

    const updatedBooks = await generateThumbnailsForLibrary();
    setBooks(updatedBooks);

    setLoading(false);
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
    setBooks((prev) => prev.filter((b) => b.id !== id));
  };

  const handleRename = async (id, newName) => {
    const updatedBook = await updateBookName(id, newName);
    setBooks((prev) =>
      prev.map((b) => (b.id === id ? { ...b, name: updatedBook.name } : b))
    );
  };

  const filteredBooks = sortedBooks.filter((book) =>
    book.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            📚 My Library
          </h1>
          <p className="text-gray-600">
            {books.length} {books.length === 1 ? "book" : "books"} in your
            collection
          </p>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search your library..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>

            {/* Sort */}
            <div className="md:w-48">
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-white cursor-pointer"
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
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
              <p className="text-gray-600">Loading your library...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Books Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {/* Upload Card */}
              <label className="group flex flex-col items-center justify-center bg-white border-2 border-dashed border-gray-300 rounded-xl h-64 cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all duration-200">
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={handleUpload}
                  className="hidden"
                />
                <div className="flex flex-col items-center space-y-3">
                  <div className="w-16 h-16 rounded-full bg-gray-100 group-hover:bg-blue-100 flex items-center justify-center transition-colors">
                    <Plus className="w-8 h-8 text-gray-400 group-hover:text-blue-600 transition-colors" />
                  </div>
                  <div className="text-center px-4">
                    <p className="text-sm font-medium text-gray-700 group-hover:text-blue-600 transition-colors">
                      Add Book
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Upload PDF</p>
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
                <div className="inline-block p-6 bg-gray-100 rounded-full mb-4">
                  <Search className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {searchTerm ? "No books found" : "Your library is empty"}
                </h3>
                <p className="text-gray-600 mb-6">
                  {searchTerm
                    ? "Try adjusting your search terms"
                    : "Upload your first PDF to get started"}
                </p>
                {!searchTerm && (
                  <label className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition-colors">
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
