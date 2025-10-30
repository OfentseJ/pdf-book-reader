import { useEffect, useState, useRef, useMemo } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import pdfWorkerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import {
  getBook,
  updateBookBookmarks,
  updateBookLastPage,
  updateBookNumPages,
  updateBookLastOpened,
  addBook,
} from "../utils/db";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
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
  Menu,
  X,
  ArrowLeft,
} from "lucide-react";
import { v4 as uuidv4 } from "uuid";

pdfjs.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

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

        if (fileToOpen) setPdfUrl(URL.createObjectURL(fileToOpen));
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
      if (!scrollContainer) return;

      if (e.key === "ArrowLeft") {
        e.preventDefault();
        handlePageChange(pageNum - 1);
      }
      if (e.key === "ArrowRight") {
        e.preventDefault();
        handlePageChange(pageNum + 1);
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        scrollContainer.scrollBy({ top: -100, behavior: "smooth" });
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        scrollContainer.scrollBy({ top: 100, behavior: "smooth" });
      }
      if (e.key === "PageUp") {
        e.preventDefault();
        scrollContainer.scrollBy({
          top: -scrollContainer.clientHeight * 0.8,
          behavior: "smooth",
        });
      }
      if (e.key === "PageDown") {
        e.preventDefault();
        scrollContainer.scrollBy({
          top: scrollContainer.clientHeight * 0.8,
          behavior: "smooth",
        });
      }
      if (e.key === "Home") {
        e.preventDefault();
        scrollContainer.scrollTo({ top: 0, behavior: "smooth" });
      }
      if (e.key === "End") {
        e.preventDefault();
        scrollContainer.scrollTo({
          top: scrollContainer.scrollHeight,
          behavior: "smooth",
        });
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [pageNum, numPages]);

  useEffect(() => {
    if (!book) return;

    if (Number(book.lastPage) !== Number(pageNum)) {
      updateBookLastPage(book.id, pageNum).catch(console.error);
      setBook((prev) => ({ ...prev, lastPage: pageNum }));
    }
  }, [pageNum, book]);

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

  const onDocumentLoadError = (error) => {
    setError("Failed to load PDF: " + error.message);
  };

  const documentOptions = useMemo(
    () => ({
      cMapUrl: "cmaps/",
      standardFontDataUrl: "standard_fonts/",
    }),
    []
  );

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

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= numPages) {
      setPageNum(newPage);
    }

    if (pageRef.current) {
      pageRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  const updateBookmarkLabel = async (bookmarkId, newLabel) => {
    if (!book) return;
    const updatedBookmarks = book.bookmarks.map((b) =>
      b.id === bookmarkId ? { ...b, label: newLabel } : b
    );
    await updateBookBookmarks(book.id, updatedBookmarks);
    setBook({ ...book, bookmarks: updatedBookmarks });
  };

  if (!book) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center transition-colors">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400 mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading book...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? "w-80" : "w-0"
        } transition-all duration-300 ease-in-out overflow-hidden bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 shadow-lg flex flex-col`}
      >
        {sidebarOpen && (
          <div className="flex-1 flex flex-col h-full">
            {/* Sidebar Header */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-750">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center">
                  <Bookmark className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" />
                  Bookmarks
                </h3>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-1 rounded-lg hover:bg-white/50 dark:hover:bg-gray-700 transition-colors"
                  title="Close sidebar"
                >
                  <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {book.bookmarks?.length || 0} saved
              </p>
            </div>

            {/* Bookmarks List */}
            <div className="flex-1 overflow-y-auto p-4 bg-gray-50 dark:bg-gray-900">
              {!book?.bookmarks || book.bookmarks.length === 0 ? (
                <div className="text-center py-12">
                  <div className="inline-block p-4 bg-gray-100 dark:bg-gray-800 rounded-full mb-3">
                    <Bookmark className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                    No bookmarks yet
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    Click the bookmark button to save pages
                  </p>
                </div>
              ) : (
                <ul className="space-y-2">
                  {book.bookmarks.map((bm) => (
                    <li
                      key={bm.id}
                      className={`group bg-white dark:bg-gray-800 border rounded-lg hover:shadow-md transition-all ${
                        bm.page === pageNum
                          ? "border-blue-500 dark:border-blue-400 ring-2 ring-blue-100 dark:ring-blue-900"
                          : "border-gray-200 dark:border-gray-700"
                      }`}
                    >
                      <button
                        onClick={() => setPageNum(bm.page)}
                        className="w-full text-left p-3"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                              {bm.label || `Page ${bm.page}`}
                            </p>
                            {bm.label && (
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                Page {bm.page}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center space-x-1 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                const newLabel = prompt(
                                  "Enter bookmark name:",
                                  bm.label || ""
                                );
                                if (newLabel !== null) {
                                  updateBookmarkLabel(bm.id, newLabel);
                                }
                              }}
                              className="p-1.5 rounded hover:bg-blue-50 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                              title="Rename"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                removeBookmark(bm.id);
                              }}
                              className="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm transition-colors">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => navigate("/library")}
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors text-gray-700 dark:text-gray-200 font-medium"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Library</span>
                </button>
                {!sidebarOpen && (
                  <button
                    onClick={() => setSidebarOpen(true)}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-400 rounded-lg transition-colors font-medium"
                  >
                    <Menu className="w-4 h-4" />
                    <span>Bookmarks</span>
                  </button>
                )}
              </div>
              <div className="flex-1 mx-6 max-w-md">
                <h1 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                  📖 {book.name}
                </h1>
              </div>
              <div className="flex items-center space-x-3">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Page {pageNum} of {numPages || "?"}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* PDF Content */}
        <div
          ref={scrollContainerRef}
          className="flex-1 overflow-y-auto bg-gray-100 dark:bg-gray-900 pb-32 transition-colors"
        >
          {error ? (
            <div className="max-w-2xl mx-auto mt-8 p-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-10 h-10 bg-red-100 dark:bg-red-900/40 rounded-full flex items-center justify-center">
                  <span className="text-red-600 dark:text-red-400 text-xl">
                    ⚠
                  </span>
                </div>
                <div>
                  <h3 className="text-red-900 dark:text-red-300 font-semibold mb-1">
                    Error Loading PDF
                  </h3>
                  <p className="text-red-700 dark:text-red-400 text-sm">
                    {error}
                  </p>
                </div>
              </div>
            </div>
          ) : pdfUrl ? (
            <div className="py-8">
              <div
                ref={pageRef}
                className="flex justify-center items-center mb-6"
              >
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl overflow-hidden">
                  <Document
                    file={pdfUrl}
                    onLoadSuccess={onDocumentLoadSuccess}
                    onLoadError={onDocumentLoadError}
                    options={documentOptions}
                    loading={
                      <div className="p-12 text-center">
                        <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 dark:border-blue-400 mb-3"></div>
                        <p className="text-gray-600 dark:text-gray-400">
                          Loading document...
                        </p>
                      </div>
                    }
                  >
                    <Page
                      pageNumber={pageNum}
                      renderMode="canvas"
                      width={Math.min(800, window.innerWidth - 100)}
                      scale={scale}
                      loading={
                        <div className="p-12 text-center">
                          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400 mb-2"></div>
                          <p className="text-gray-600 dark:text-gray-400 text-sm">
                            Loading page...
                          </p>
                        </div>
                      }
                    />
                  </Document>
                </div>
              </div>
            </div>
          ) : null}
        </div>

        {/* Fixed Bottom Controls */}
        <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-lg z-50 transition-colors">
          <div className="max-w-4xl mx-auto px-6 py-4">
            {/* Navigation Controls */}
            <div className="flex items-center justify-center space-x-4 mb-3">
              <button
                onClick={() => handlePageChange(pageNum - 1)}
                disabled={pageNum <= 1}
                className="p-2 rounded-lg bg-blue-600 dark:bg-blue-500 text-white hover:bg-blue-700 dark:hover:bg-blue-600 disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:cursor-not-allowed transition-colors"
                title="Previous page"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <div className="flex items-center space-x-3 bg-gray-50 dark:bg-gray-700 px-4 py-2 rounded-lg">
                <input
                  type="number"
                  value={pageNum}
                  onChange={(e) => {
                    const page = parseInt(e.target.value);
                    if (page >= 1 && page <= numPages) {
                      handlePageChange(page);
                    }
                  }}
                  min={1}
                  max={numPages || 1}
                  className="w-16 px-2 py-1 text-center border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
                <span className="text-gray-600 dark:text-gray-400 font-medium">
                  / {numPages || "?"}
                </span>
              </div>

              <button
                onClick={() => handlePageChange(pageNum + 1)}
                disabled={pageNum >= numPages}
                className="p-2 rounded-lg bg-blue-600 dark:bg-blue-500 text-white hover:bg-blue-700 dark:hover:bg-blue-600 disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:cursor-not-allowed transition-colors"
                title="Next page"
              >
                <ChevronRight className="w-5 h-5" />
              </button>

              <div className="w-px h-8 bg-gray-300 dark:bg-gray-600"></div>

              <button
                onClick={bookmarkPage}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 dark:bg-green-500 text-white rounded-lg hover:bg-green-700 dark:hover:bg-green-600 transition-colors font-medium"
              >
                <Bookmark className="w-4 h-4" />
                <span>Bookmark</span>
              </button>
            </div>

            {/* Zoom Controls */}
            <div className="flex items-center justify-center space-x-2">
              <button
                onClick={() => setScale((s) => Math.max(s - 0.2, 0.5))}
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                title="Zoom out"
              >
                <ZoomOut className="w-4 h-4 text-gray-700 dark:text-gray-300" />
              </button>
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400 min-w-[80px] text-center">
                {(scale * 100).toFixed(0)}% zoom
              </span>
              <button
                onClick={() => setScale((s) => Math.min(s + 0.2, 3.0))}
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                title="Zoom in"
              >
                <ZoomIn className="w-4 h-4 text-gray-700 dark:text-gray-300" />
              </button>
              <button
                onClick={() => setScale(1.0)}
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                title="Reset zoom"
              >
                <RotateCcw className="w-4 h-4 text-gray-700 dark:text-gray-300" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
