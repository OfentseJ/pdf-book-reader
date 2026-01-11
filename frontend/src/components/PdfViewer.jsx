import { useEffect, useState, useRef, useMemo, useCallback } from "react";
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
  Menu,
  X,
  ArrowLeft,
} from "lucide-react";
import { v4 as uuidv4 } from "uuid";

pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

export default function PdfViewer() {
  const { id } = useParams();
  const navigate = useNavigate();
  const pageRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const pdfWrapperRef = useRef(null); // New ref for width calculation

  const [book, setBook] = useState(null);
  const [numPages, setNumPages] = useState(null);
  const [pageNum, setPageNum] = useState(1);
  const [error, setError] = useState(null);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [scale, setScale] = useState(1.0);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isNavOpen, setIsNavOpen] = useState(true);
  const [containerWidth, setContainerWidth] = useState(null); // Track container width

  const navRef = useRef(null);
  const hideNavTimeoutRef = useRef(null);

  // Swipe state
  const touchStart = useRef(null);
  const touchEnd = useRef(null);
  const minSwipeDistance = 50;

  // --- Resizing Logic ---
  useEffect(() => {
    if (!pdfWrapperRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        // Subtract padding (e.g., 32px for mobile padding, 48px for desktop)
        const width = entry.contentRect.width;
        setContainerWidth(width > 600 ? width - 60 : width - 30);
      }
    });

    resizeObserver.observe(pdfWrapperRef.current);

    return () => resizeObserver.disconnect();
  }, [sidebarOpen]); // Re-measure when sidebar toggles

  // --- Book Loading Logic ---
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

  // --- Navigation & Controls ---
  const handlePageChange = useCallback(
    (newPage) => {
      if (newPage >= 1 && newPage <= (numPages || 1)) {
        setPageNum(newPage);
        // Scroll to top of the page smoothly
        if (scrollContainerRef.current) {
          scrollContainerRef.current.scrollTo({ top: 0, behavior: "smooth" });
        }
      }
    },
    [numPages]
  );

  // --- Keyboard & Swipe Support ---
  useEffect(() => {
    const handleKeyDown = (e) => {
      const scrollContainer = scrollContainerRef.current;
      if (!scrollContainer) return;

      switch (e.key) {
        case "ArrowLeft":
          e.preventDefault();
          handlePageChange(pageNum - 1);
          break;
        case "ArrowRight":
          e.preventDefault();
          handlePageChange(pageNum + 1);
          break;
        case "ArrowUp":
          e.preventDefault();
          scrollContainer.scrollBy({ top: -100, behavior: "smooth" });
          break;
        case "ArrowDown":
          e.preventDefault();
          scrollContainer.scrollBy({ top: 100, behavior: "smooth" });
          break;
        default:
          break;
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [pageNum, numPages, handlePageChange]);

  const onTouchStart = (e) => {
    touchStart.current = null;
    touchEnd.current = null;
    touchStart.current = e.targetTouches[0].clientX;
  };

  const onTouchMove = (e) => {
    touchEnd.current = e.targetTouches[0].clientX;
  };

  const onTouchEnd = () => {
    if (!touchStart.current || !touchEnd.current) return;
    const distance = touchStart.current - touchEnd.current;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) handlePageChange(pageNum + 1);
    if (isRightSwipe) handlePageChange(pageNum - 1);
  };

  // --- Updates & Bookmarks ---
  useEffect(() => {
    if (!book) return;
    if (Number(book.lastPage) !== Number(pageNum)) {
      updateBookLastPage(book.id, pageNum).catch(console.error);
      setBook((prev) => ({ ...prev, lastPage: pageNum }));
    }
  }, [pageNum, book]);

  useEffect(() => {
    const handleMouseMove = () => showNavTemporarily();
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("touchstart", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("touchstart", handleMouseMove);
      if (hideNavTimeoutRef.current) clearTimeout(hideNavTimeoutRef.current);
    };
  }, []);

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
    if (book && Number(book.numPages) !== numPages) {
      updateBookNumPages(book.id, numPages)
        .then(() => setBook((b) => ({ ...b, numPages })))
        .catch(console.error);
    }
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

  const showNavTemporarily = () => {
    setIsNavOpen(true);
    if (hideNavTimeoutRef.current) clearTimeout(hideNavTimeoutRef.current);
    hideNavTimeoutRef.current = setTimeout(() => setIsNavOpen(false), 3000);
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
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400 mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading book...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden relative">
      {/* Mobile Sidebar Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Responsive Drawer */}
      <div
        className={`fixed md:relative z-50 h-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 shadow-xl transition-transform duration-300 ease-in-out 
          ${
            sidebarOpen
              ? "translate-x-0"
              : "-translate-x-full md:translate-x-0 md:w-0 md:overflow-hidden"
          }
          w-80 flex flex-col`}
      >
        <div className="flex-1 flex flex-col h-full w-80">
          {/* Sidebar Header */}
          <div className="p-4 md:p-6 border-b border-gray-200 dark:border-gray-700 bg-linear-to-r from-blue-100 to-indigo-950 dark:from-gray-800 dark:to-gray-750">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center">
                <Bookmark className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" />
                Bookmarks
              </h3>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-1 rounded-lg hover:bg-white/50 dark:hover:bg-gray-700 transition-colors"
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
                <Bookmark className="w-8 h-8 text-gray-400 dark:text-gray-500 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No bookmarks yet</p>
              </div>
            ) : (
              <ul className="space-y-2">
                {book.bookmarks.map((bm) => (
                  <li
                    key={bm.id}
                    className="group bg-white dark:bg-gray-800 border rounded-lg hover:shadow-sm"
                  >
                    <button
                      onClick={() => {
                        setPageNum(bm.page);
                        if (window.innerWidth < 768) setSidebarOpen(false); // Close on mobile select
                      }}
                      className="w-full text-left p-3"
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium dark:text-white truncate flex-1">
                          {bm.label || `Page ${bm.page}`}
                        </span>
                        <div className="flex space-x-1">
                          <span
                            onClick={(e) => {
                              e.stopPropagation();
                              const l = prompt("Label:", bm.label);
                              if (l) updateBookmarkLabel(bm.id, l);
                            }}
                          >
                            <Edit3 className="w-4 h-4 text-blue-500" />
                          </span>
                          <span
                            onClick={(e) => {
                              e.stopPropagation();
                              removeBookmark(bm.id);
                            }}
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </span>
                        </div>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col w-full min-w-0">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm z-30">
          <div className="px-4 py-3 md:px-6 md:py-4 flex items-center justify-between">
            <div className="flex items-center space-x-2 md:space-x-4">
              <button
                onClick={() => navigate("/library")}
                className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg"
              >
                <ArrowLeft className="w-4 h-4 text-gray-700 dark:text-gray-200" />
              </button>
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="flex items-center space-x-2 px-3 py-2 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-lg"
              >
                <Menu className="w-4 h-4" />
                <span className="hidden sm:inline text-sm font-medium">
                  Bookmarks
                </span>
              </button>
            </div>

            <h1 className="text-sm md:text-lg font-semibold text-gray-900 dark:text-white truncate mx-4 flex-1 text-center md:text-left">
              {book.name}
            </h1>

            <div className="hidden sm:block text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
              Page {pageNum} of {numPages || "-"}
            </div>
          </div>
        </div>

        {/* PDF Area */}
        <div
          ref={scrollContainerRef}
          className="flex-1 overflow-y-auto bg-gray-100 dark:bg-gray-900 pb-20 md:pb-32 relative touch-pan-y"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          <div
            ref={pdfWrapperRef}
            className="min-h-full py-4 md:py-8 flex justify-center"
          >
            {error ? (
              <div className="text-red-500 p-8 text-center">{error}</div>
            ) : pdfUrl && containerWidth ? (
              <div className="shadow-2xl rounded-sm overflow-hidden bg-white dark:bg-gray-800 transition-all duration-200">
                <Document
                  file={pdfUrl}
                  onLoadSuccess={onDocumentLoadSuccess}
                  onLoadError={(e) => setError(e.message)}
                  options={documentOptions}
                >
                  <Page
                    pageNumber={pageNum}
                    scale={scale}
                    width={containerWidth} // Dynamic responsive width
                    renderTextLayer={true}
                    renderAnnotationLayer={true}
                    className="transition-opacity duration-200"
                  />
                </Document>
              </div>
            ) : (
              <div className="flex items-center justify-center h-64 text-gray-400">
                Loading PDF...
              </div>
            )}
          </div>
        </div>

        {/* Responsive Bottom Controls */}
        <div
          ref={navRef}
          className={`fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-40 transition-all duration-300 ${
            isNavOpen ? "translate-y-0" : "translate-y-full"
          }`}
        >
          <div className="max-w-4xl mx-auto px-4 py-3 md:py-4">
            {/* Mobile: Grid Layout, Desktop: Flex Row */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-3 md:gap-6">
              {/* Navigation Group */}
              <div className="flex items-center justify-between w-full md:w-auto md:justify-start space-x-2 md:space-x-4">
                <button
                  onClick={() => handlePageChange(pageNum - 1)}
                  disabled={pageNum <= 1}
                  className="p-3 md:p-2 rounded-lg bg-blue-600 dark:bg-blue-500 text-white disabled:opacity-50"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                {/* Page Input */}
                <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg px-3 py-1">
                  <input
                    type="number"
                    value={pageNum}
                    onChange={(e) => handlePageChange(Number(e.target.value))}
                    className="w-12 bg-transparent text-center focus:outline-none dark:text-white font-medium"
                  />
                  <span className="text-gray-500 text-sm border-l border-gray-300 dark:border-gray-600 pl-2 ml-2">
                    {numPages}
                  </span>
                </div>

                <button
                  onClick={() => handlePageChange(pageNum + 1)}
                  disabled={pageNum >= numPages}
                  className="p-3 md:p-2 rounded-lg bg-blue-600 dark:bg-blue-500 text-white disabled:opacity-50"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              {/* Tools Group (Zoom & Bookmark) */}
              <div className="flex items-center justify-between w-full md:w-auto space-x-2 md:border-l md:border-gray-200 md:dark:border-gray-700 md:pl-6">
                <div className="flex items-center space-x-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                  <button
                    onClick={() => setScale((s) => Math.max(0.5, s - 0.1))}
                    className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                  >
                    <ZoomOut className="w-4 h-4 dark:text-white" />
                  </button>
                  <span className="text-xs font-mono w-12 text-center dark:text-gray-300 hidden sm:block">
                    {(scale * 100).toFixed(0)}%
                  </span>
                  <button
                    onClick={() => setScale((s) => Math.min(3, s + 0.1))}
                    className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                  >
                    <ZoomIn className="w-4 h-4 dark:text-white" />
                  </button>
                </div>

                <button
                  onClick={bookmarkPage}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  <Bookmark className="w-4 h-4" />
                  <span className="hidden sm:inline text-sm font-medium">
                    Save
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
