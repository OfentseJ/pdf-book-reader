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
import {
  Plus,
  Search,
  Loader2,
  SlidersHorizontal,
  ArrowUpFromLine,
} from "lucide-react";
import {
  deleteBook,
  fetchMyBooks,
  normalizeBook,
  renameBook,
  uploadBook,
} from "../utils/books";
import LibraryHeader from "../components/LibraryHeader";
import { getToken } from "../utils/auth";

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export default function LibraryPage() {
  const navigate = useNavigate();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState("alphabetical");
  const [token, setToken] = useState(getToken());
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
    try {
      const bookToRemove = books.find((b) => b.id === id);
      if (!bookToRemove) return;

      await deleteBook(id, token);
      await removeBook(id);

      if (bookToRemove.fileUrl?.startsWith("blob:"))
        URL.revokeObjectURL(bookToRemove.fileUrl);
      if (bookToRemove.thumbnail?.startsWith("blob:"))
        URL.revokeObjectURL(bookToRemove.thumbnail);

      setBooks((prev) => prev.filter((b) => b.id !== id));
    } catch (err) {
      console.err("Failed to delete book:", err);
      alert(
        "Failed to delete the book. Please check your connection and try again.",
      );
    }
  };

  const handleRename = async (id, newName) => {
    const updatedBook = await updateBookName(id, newName);
    await renameBook(id, newName, token);
    setBooks((prev) =>
      prev.map((b) => (b.id === id ? { ...b, name: updatedBook.name } : b)),
    );
  };

  const filteredBooks = sortedBooks.filter((book) => {
    const name = book.name || book.title || "";
    return name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 transition-colors">
      {/* Sticky Header Section */}
      <div
        className={`sticky top-0 z-30 transition-all duration-200 ${
          isScrolled
            ? "bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md border-b border-neutral-200 dark:border-neutral-800 shadow-sm"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <LibraryHeader />

          {/* Controls Bar */}
          <div className="py-4 flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="relative w-full md:max-w-md group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 group-focus-within:text-blue-500 transition-colors" />
              <input
                type="text"
                placeholder="Search library..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:focus:ring-blue-400/50 focus:border-blue-500 transition-all text-sm font-medium text-neutral-700 dark:text-neutral-200 placeholder-neutral-400"
              />
            </div>

            {/* Sort & Stats */}
            <div className="flex items-center space-x-3 w-full md:w-auto">
              <div className="hidden md:block text-xs font-semibold text-neutral-400 uppercase tracking-wider mr-2">
                {filteredBooks.length} Books
              </div>

              <div className="relative flex-1 md:flex-none">
                <SlidersHorizontal className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                <select
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                  className="w-full md:w-48 pl-10 pr-8 py-2.5 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-full focus:outline-none focus:ring-2 appearance-none text-sm font-medium text-neutral-700 dark:text-neutral-200 cursor-pointer dark:hover:bg-neutral-750  transition-colors"
                >
                  <option value="alphabetical">Name (A–Z)</option>
                  <option value="reverse-alphabetical">Name (Z–A)</option>
                  <option value="recently-added">Recently Added</option>
                  <option value="last-opened">Last Opened</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-96">
            <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-4" />
            <p className="text-neutral-500 animate-pulse font-medium">
              Syncing library...
            </p>
          </div>
        ) : (
          <>
            {/* Books Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
              {/* Modern Upload Card */}
              <label className="group relative flex flex-col items-center justify-center bg-white dark:bg-neutral-800 border-2 border-dashed border-neutral-300 dark:border-neutral-700 rounded-2xl aspect-2/3 cursor-pointer hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-all duration-300 overflow-hidden">
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={handleUpload}
                  className="hidden"
                />
                <div className="absolute inset-0 bg-blue-500/5 dark:bg-blue-400/5 scale-0 group-hover:scale-100 transition-transform rounded-2xl" />

                <div className="flex flex-col items-center space-y-3 z-10 transform group-hover:-translate-y-1 transition-transform">
                  <div className="w-14 h-14 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Plus className="w-7 h-7 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="text-center px-2">
                    <p className="text-sm font-bold text-neutral-700 dark:text-neutral-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      New Book
                    </p>
                    <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-1">
                      PDF only
                    </p>
                  </div>
                </div>
              </label>

              {/* Book Cards */}
              {filteredBooks.map((book) => (
                <div key={book.id} className="relative group">
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
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-24 h-24 bg-neutral-100 dark:bg-neutral-800 rounded-full flex items-center justify-center mb-6">
                  {searchTerm ? (
                    <Search className="w-10 h-10 text-neutral-400" />
                  ) : (
                    <ArrowUpFromLine className="w-10 h-10 text-neutral-400" />
                  )}
                </div>
                <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">
                  {searchTerm ? "No books found" : "Your library is empty"}
                </h3>
                <p className="text-neutral-500 dark:text-neutral-400 max-w-sm mb-8">
                  {searchTerm
                    ? `We couldn't find anything matching "${searchTerm}". Try a different keyword.`
                    : "Ready to start reading? Upload your first PDF book to get started."}
                </p>

                {!searchTerm && (
                  <label className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-full cursor-pointer transition-transform active:scale-95 shadow-lg shadow-blue-500/30">
                    <input
                      type="file"
                      accept="application/pdf"
                      onChange={handleUpload}
                      className="hidden"
                    />
                    <Plus className="w-5 h-5 mr-2" />
                    Upload PDF
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
