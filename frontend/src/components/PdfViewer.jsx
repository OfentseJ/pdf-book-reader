import { useEffect, useState, useRef, useMemo } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import {
  getBook,
  updateBookBookmarks,
  updateBookLastPage,
  updateBookNumPages,
  updateBookLastOpened,
  addBook,
} from "../utils/db";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";
import { useParams, useNavigate } from "react-router-dom";
import {
  Edit3,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Bookmark,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  PanelLeft, // Changed from Menu for clarity
  X,
  ArrowLeft,
  Loader2, // Better spinner
  Maximize,
} from "lucide-react";
import { v4 as uuidv4 } from "uuid";

// Ensure this worker path is correct for your setup
pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

export default function PdfViewer() {
  const { id } = useParams();
  const navigate = useNavigate();
  const pageRef = useRef(null);
  const scrollContainerRef = useRef(null);

  const [book, setBook] = useState(null);
  const [numPages, setNumPages] = useState(null);
  const [pageNum, setPageNum] = useState(1);
  const [error, setError] = useState(null);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [scale, setScale] = useState(1.0);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);
  const hideControlsTimeoutRef = useRef(null);

  // --- LOGIC (Identical to your original code) ---
  useEffect(() => {
    if (!id) return;
    async function loadBook() {
      try {
        const bookId = isNaN(id) ? id : Number(id);
        const b = await getBook(bookId);
        if (!b) throw new Error("Book not found");
        setBook(b);
        updateBookLastOpened(bookId);

        let fileToOpen = b.file;
        if (!fileToOpen && b.fileUrl) {
          const response = await fetch(b.fileUrl);
          const blob = await response.blob();
          fileToOpen = new File([blob], b.title || "book.pdf", {
            type: "application/pdf",
          });
          const bookWithFile = { ...b, file: fileToOpen };
          await addBook(bookWithFile);
          setBook(bookWithFile);
        }

        if (fileToOpen) {
          const arrayBuffer = await fileToOpen.arrayBuffer();
          setPdfUrl({ data: arrayBuffer });
        }
        if (b.lastPage) setPageNum(b.lastPage);
      } catch (err) {
        console.error(err);
        setBook(null);
      }
    }
    loadBook();
    return () => {
      if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    };
  }, [id]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      const scrollContainer = scrollContainerRef.current;

      // If we are typing in an input (like the page number box), ignore shortcuts
      if (e.target.tagName === "INPUT") return;

      if (!scrollContainer) return;

      switch (e.key) {
        // Page Navigation
        case "ArrowLeft":
          e.preventDefault();
          handlePageChange(pageNum - 1);
          break;
        case "ArrowRight":
          e.preventDefault();
          handlePageChange(pageNum + 1);
          break;

        // Vertical Scrolling
        case "ArrowUp":
          e.preventDefault();
          scrollContainer.scrollBy({ top: -150, behavior: "smooth" });
          break;
        case "ArrowDown":
          e.preventDefault();
          scrollContainer.scrollBy({ top: 150, behavior: "smooth" });
          break;

        // Fast Scrolling
        case "PageUp":
          e.preventDefault();
          scrollContainer.scrollBy({
            top: -scrollContainer.clientHeight * 0.8,
            behavior: "smooth",
          });
          break;
        case "PageDown":
          e.preventDefault();
          scrollContainer.scrollBy({
            top: scrollContainer.clientHeight * 0.8,
            behavior: "smooth",
          });
          break;

        // Top / Bottom
        case "Home":
          e.preventDefault();
          scrollContainer.scrollTo({ top: 0, behavior: "smooth" });
          break;
        case "End":
          e.preventDefault();
          scrollContainer.scrollTo({
            top: scrollContainer.scrollHeight,
            behavior: "smooth",
          });
          break;

        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [pageNum, numPages]); // Dependencies
  // Sync Last Page
  useEffect(() => {
    if (!book) return;
    if (Number(book.lastPage) !== Number(pageNum)) {
      updateBookLastPage(book.id, pageNum).catch(console.error);
      setBook((prev) => ({ ...prev, lastPage: pageNum }));
    }
  }, [pageNum, book]);

  // Mouse Move to show controls
  useEffect(() => {
    const handleMouseMove = () => {
      setControlsVisible(true);
      if (hideControlsTimeoutRef.current)
        clearTimeout(hideControlsTimeoutRef.current);
      hideControlsTimeoutRef.current = setTimeout(() => {
        setControlsVisible(false);
      }, 3000);
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      if (hideControlsTimeoutRef.current)
        clearTimeout(hideControlsTimeoutRef.current);
    };
  }, []);

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
    if (book) {
      const current = Number(book.numPages) || 0;
      if (current !== numPages) {
        updateBookNumPages(book.id, numPages)
          .then(() => setBook((b) => ({ ...b, numPages })))
          .catch(console.error);
      } else {
        setBook((b) => (b ? { ...b, numPages } : b));
      }
    }
  };

  const bookmarkPage = async () => {
    if (!book) return;
    if (book.bookmarks?.some((b) => b.page === pageNum)) {
      alert(`Page ${pageNum} is already bookmarked!`);
      return;
    }
    const newBookmark = { id: uuidv4(), page: pageNum, label: "" };
    const newBookmarks = [...(book.bookmarks || []), newBookmark];
    await updateBookBookmarks(book.id, newBookmarks);
    setBook({ ...book, bookmarks: newBookmarks });
  };

  const removeBookmark = async (bookmarkId) => {
    if (!book) return;
    const updatedBookmarks = book.bookmarks.filter((b) => b.id !== bookmarkId);
    await updateBookBookmarks(book.id, updatedBookmarks);
    setBook({ ...book, bookmarks: updatedBookmarks });
  };

  const updateBookmarkLabel = async (bookmarkId, newLabel) => {
    if (!book) return;
    const updatedBookmarks = book.bookmarks.map((b) =>
      b.id === bookmarkId ? { ...b, label: newLabel } : b
    );
    await updateBookBookmarks(book.id, updatedBookmarks);
    setBook({ ...book, bookmarks: updatedBookmarks });
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= numPages) {
      setPageNum(newPage);
      if (pageRef.current) {
        pageRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  };

  // --- LOADING STATE ---
  if (!book) {
    return (
      <div className="min-h-screen bg-neutral-100 dark:bg-neutral-900 flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
        <p className="text-neutral-500 animate-pulse">Opening your book...</p>
      </div>
    );
  }

  // --- MAIN RENDER ---
  return (
    <div className="flex h-screen bg-neutral-100 dark:bg-neutral-900 overflow-hidden relative">
      {/* 1. SIDEBAR (Bookmarks) */}
      <aside
        className={`${
          sidebarOpen ? "w-80 translate-x-0" : "w-0 -translate-x-full"
        } fixed inset-y-0 left-0 z-50 bg-white/95 dark:bg-neutral-800/95 backdrop-blur-xl border-r border-neutral-200 dark:border-neutral-700 transition-all duration-300 ease-in-out shadow-2xl flex flex-col`}
      >
        {sidebarOpen && (
          <>
            <div className="p-5 border-b border-neutral-100 dark:border-neutral-700 flex justify-between items-center bg-white/50 dark:bg-neutral-800/50">
              <h3 className="font-semibold text-neutral-800 dark:text-neutral-200 flex items-center">
                <Bookmark className="w-4 h-4 mr-2 text-blue-500 fill-blue-500" />
                Bookmarks
              </h3>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-neutral-500" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {!book.bookmarks?.length ? (
                <div className="flex flex-col items-center justify-center h-48 text-neutral-400">
                  <Bookmark className="w-12 h-12 mb-3 opacity-20" />
                  <p className="text-sm">No bookmarks yet</p>
                </div>
              ) : (
                book.bookmarks.map((bm) => (
                  <div
                    key={bm.id}
                    onClick={() => setPageNum(bm.page)}
                    className={`group cursor-pointer p-3 rounded-xl border transition-all duration-200 ${
                      bm.page === pageNum
                        ? "bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800 shadow-xs"
                        : "bg-transparent border-transparent hover:bg-neutral-100 dark:hover:bg-neutral-700"
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                          Page {bm.page}
                        </span>
                        <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mt-1">
                          {bm.label || "Untitled Bookmark"}
                        </p>
                      </div>
                      <div className="flex opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            const l = prompt("Label:", bm.label);
                            if (l !== null) updateBookmarkLabel(bm.id, l);
                          }}
                          className="p-1.5 hover:text-blue-600"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeBookmark(bm.id);
                          }}
                          className="p-1.5 hover:text-red-600"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </aside>

      {/* 2. MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col relative h-full transition-all duration-300">
        {/* Top Header (Floating, Transparent) */}
        <header
          className={`absolute top-0 left-0 right-0 h-16 z-40 flex items-center justify-between px-6 transition-transform duration-300 ${
            controlsVisible ? "translate-y-0" : "-translate-y-full"
          }`}
        >
          {/* Back & Title */}
          <div className="flex items-center space-x-4 bg-white/80 dark:bg-black/50 backdrop-blur-md py-2 px-4 rounded-full shadow-sm border border-white/20">
            <button
              onClick={() => navigate("/library")}
              className="p-1.5 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-neutral-700 dark:text-neutral-200" />
            </button>
            <h1 className="text-sm font-semibold text-neutral-800 dark:text-neutral-200 max-w-[200px] truncate">
              {book.name}
            </h1>
          </div>

          {/* Sidebar Toggle */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className={`p-2 rounded-full backdrop-blur-md transition-all shadow-sm border border-white/20 ${
              sidebarOpen
                ? "bg-blue-600 text-white"
                : "bg-white/80 dark:bg-black/50 text-neutral-700 dark:text-neutral-200 hover:bg-white dark:hover:bg-black/70"
            }`}
          >
            <PanelLeft className="w-5 h-5" />
          </button>
        </header>

        {/* PDF Scroll Area */}
        <div
          ref={scrollContainerRef}
          className="flex-1 overflow-auto flex justify-center p-8 pb-32"
          onClick={() => setSidebarOpen(false)} // Close sidebar when clicking content
        >
          {error ? (
            <div className="flex flex-col items-center justify-center text-red-500">
              <span className="text-3xl mb-2">⚠️</span>
              <p>{error}</p>
            </div>
          ) : pdfUrl ? (
            <div className="relative shadow-2xl shadow-neutral-500/20 dark:shadow-black/50 transition-transform duration-200 ease-out origin-top">
              <Document
                file={pdfUrl}
                onLoadSuccess={onDocumentLoadSuccess}
                loading={
                  <div className="h-[800px] w-[600px] bg-white dark:bg-neutral-800 animate-pulse rounded shadow-sm" />
                }
              >
                <Page
                  pageNumber={pageNum}
                  renderMode="canvas"
                  width={Math.min(1000, window.innerWidth - 40)} // Slightly larger default
                  scale={scale}
                  className="bg-white" // Paper white background
                  loading=""
                />
              </Document>
            </div>
          ) : null}
        </div>

        {/* 3. FLOATING DOCK CONTROLS (The main UI upgrade) */}
        <div
          className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-50 transition-all duration-500 cubic-bezier(0.4, 0, 0.2, 1) ${
            controlsVisible
              ? "translate-y-0 opacity-100"
              : "translate-y-20 opacity-0 pointer-events-none"
          }`}
        >
          <div className="flex items-center space-x-1 p-2 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-xl border border-neutral-200 dark:border-neutral-700 rounded-2xl shadow-2xl shadow-black/10">
            {/* Page Navigation Group */}
            <div className="flex items-center space-x-1 pr-2 border-r border-neutral-200 dark:border-neutral-700">
              <button
                onClick={() => handlePageChange(pageNum - 1)}
                disabled={pageNum <= 1}
                className="p-2.5 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-30 transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-neutral-700 dark:text-neutral-200" />
              </button>

              <div className="flex items-center relative group">
                <input
                  type="number"
                  value={pageNum}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    if (val >= 1 && val <= numPages) handlePageChange(val);
                  }}
                  className="w-12 text-center bg-transparent font-semibold text-neutral-800 dark:text-neutral-100 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <span className="text-neutral-400 text-sm select-none">
                  / {numPages}
                </span>
              </div>

              <button
                onClick={() => handlePageChange(pageNum + 1)}
                disabled={pageNum >= numPages}
                className="p-2.5 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-30 transition-colors"
              >
                <ChevronRight className="w-5 h-5 text-neutral-700 dark:text-neutral-200" />
              </button>
            </div>

            {/* Zoom Group */}
            <div className="flex items-center space-x-1 px-2 border-r border-neutral-200 dark:border-neutral-700">
              <button
                onClick={() => setScale((s) => Math.max(s - 0.2, 0.5))}
                className="p-2.5 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              >
                <ZoomOut className="w-4 h-4 text-neutral-600 dark:text-neutral-300" />
              </button>
              <span className="text-xs font-medium text-neutral-500 w-12 text-center">
                {Math.round(scale * 100)}%
              </span>
              <button
                onClick={() => setScale((s) => Math.min(s + 0.2, 3.0))}
                className="p-2.5 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              >
                <ZoomIn className="w-4 h-4 text-neutral-600 dark:text-neutral-300" />
              </button>
            </div>

            {/* Actions Group */}
            <div className="flex items-center space-x-1 pl-1">
              <button
                onClick={() => setScale(1)}
                className="p-2.5 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                title="Reset Zoom"
              >
                <Maximize className="w-4 h-4 text-neutral-600 dark:text-neutral-300" />
              </button>

              <button
                onClick={bookmarkPage}
                className="p-2.5 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400 transition-colors"
                title="Add Bookmark"
              >
                {book.bookmarks?.some((b) => b.page === pageNum) ? (
                  <Bookmark className="w-5 h-5 fill-current" />
                ) : (
                  <Bookmark className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
