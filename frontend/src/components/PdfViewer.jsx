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
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { useParams, useNavigate } from "react-router-dom";
import {
  Trash2,
  ChevronLeft,
  ChevronRight,
  Bookmark,
  ZoomIn,
  ZoomOut,
  PanelLeft,
  X,
  ArrowLeft,
  Loader2,
  Pencil,
} from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import pdfWorker from "pdfjs-dist/build/pdf.worker.min.mjs?url";

pdfjs.GlobalWorkerOptions.workerSrc = pdfWorker;

export default function PdfViewer() {
  const { id } = useParams();
  const navigate = useNavigate();
  const pageRef = useRef(null);
  const scrollContainerRef = useRef(null);

  // Layout State
  const [pdfWidth, setPdfWidth] = useState(window.innerWidth);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);

  // Data State
  const [book, setBook] = useState(null);
  const [numPages, setNumPages] = useState(null);
  const [pageNum, setPageNum] = useState(1);
  const [error, setError] = useState(null);

  // ✅ FIX 1: Store raw data instead of an object in state
  const [pdfData, setPdfData] = useState(null);

  const [scale, setScale] = useState(1.0);

  const hideControlsTimeoutRef = useRef(null);

  // Touch State for Swiping
  const touchStart = useRef(null);
  const touchEnd = useRef(null);
  const minSwipeDistance = 50;

  // --- 1. RESPONSIVE WIDTH LOGIC ---
  useEffect(() => {
    const handleResize = () => {
      // On mobile, take full width minus small padding
      // On desktop, limit to 1000px or available space
      const newWidth = Math.min(
        1000,
        window.innerWidth - (window.innerWidth < 768 ? 20 : 80),
      );
      setPdfWidth(newWidth);
    };

    window.addEventListener("resize", handleResize);
    handleResize(); // Init

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // --- DATA LOADING ---
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
          // ✅ FIX 2: Set raw ArrayBuffer data
          setPdfData(arrayBuffer);
        }
        if (b.lastPage) setPageNum(b.lastPage);
      } catch (err) {
        console.error(err);
        setBook(null);
      }
    }
    loadBook();
    // Removed cleanup function since we aren't using createObjectURL anymore
  }, [id]);

  // ✅ FIX 3: Memoize the file object to prevent reloads
  const fileObject = useMemo(() => {
    if (!pdfData) return null;
    return { data: pdfData };
  }, [pdfData]);

  // --- KEYBOARD & TOUCH LOGIC ---

  const handlePageChange = useCallback(
    (newPage) => {
      if (newPage >= 1 && newPage <= (numPages || 9999)) {
        setPageNum(newPage);
        if (pageRef.current) {
          pageRef.current.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }
      }
    },
    [numPages],
  );

  // Keyboard
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === "INPUT") return;
      const scrollContainer = scrollContainerRef.current;

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
          if (scrollContainer) {
            e.preventDefault();
            scrollContainer.scrollBy({ top: -150, behavior: "smooth" });
          }
          break;
        case "ArrowDown":
          if (scrollContainer) {
            e.preventDefault();
            scrollContainer.scrollBy({ top: 150, behavior: "smooth" });
          }
          break;
        default:
          break;
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [pageNum, handlePageChange]);

  // Touch / Swipe Handlers
  const onTouchStart = (e) => {
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

    if (isLeftSwipe) {
      handlePageChange(pageNum + 1);
    }
    if (isRightSwipe) {
      handlePageChange(pageNum - 1);
    }
  };

  // Sync Last Page
  useEffect(() => {
    if (!book) return;
    if (Number(book.lastPage) !== Number(pageNum)) {
      updateBookLastPage(book.id, pageNum).catch(console.error);
      setBook((prev) => ({ ...prev, lastPage: pageNum }));
    }
  }, [pageNum, book]);

  // Toggle Controls on Interaction
  useEffect(() => {
    const showControls = () => {
      setControlsVisible(true);
      if (hideControlsTimeoutRef.current)
        clearTimeout(hideControlsTimeoutRef.current);
      hideControlsTimeoutRef.current = setTimeout(
        () => setControlsVisible(false),
        3000,
      );
    };

    window.addEventListener("mousemove", showControls);
    window.addEventListener("touchstart", showControls); // Show on touch too
    return () => {
      window.removeEventListener("mousemove", showControls);
      window.removeEventListener("touchstart", showControls);
      if (hideControlsTimeoutRef.current)
        clearTimeout(hideControlsTimeoutRef.current);
    };
  }, []);

  // --- BOOKMARK LOGIC ---
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
    const updatedBookmarks = book.bookmarks.filter((b) => b.id !== bookmarkId);
    await updateBookBookmarks(book.id, updatedBookmarks);
    setBook({ ...book, bookmarks: updatedBookmarks });
  };

  const updateBookmarkLabel = async (bookmarkId) => {
    const newLabel = window.prompt("Enter bookmark label:");
    const updatedBookmarks = book.bookmarks.map((b) =>
      b.id === bookmarkId ? { ...b, label: newLabel } : b,
    );
    await updateBookBookmarks(book.id, updatedBookmarks);
    setBook({ ...book, bookmarks: updatedBookmarks });
  };

  if (!book) {
    return (
      <div className="min-h-screen bg-neutral-100 dark:bg-neutral-900 flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
        <p className="text-neutral-500 animate-pulse">Opening your book...</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-neutral-100 dark:bg-neutral-900 overflow-hidden relative">
      {/* 1. SIDEBAR (Full width on Mobile) */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 bg-white/95 dark:bg-neutral-800/95 backdrop-blur-xl border-r border-neutral-200 dark:border-neutral-700 transition-transform duration-300 ease-in-out shadow-2xl flex flex-col ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } w-full md:w-80`} // Changed width here
      >
        {sidebarOpen && (
          <>
            <div className="p-4 md:p-5 border-b border-neutral-100 dark:border-neutral-700 flex justify-between items-center">
              <h3 className="font-semibold text-neutral-800 dark:text-neutral-200 flex items-center">
                <Bookmark className="w-4 h-4 mr-2 text-blue-500 fill-blue-500" />
                Bookmarks
              </h3>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-2 bg-neutral-100 dark:bg-neutral-700 rounded-full"
              >
                <X className="w-5 h-5 text-neutral-600 dark:text-neutral-300" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {!book.bookmarks?.length ? (
                <div className="flex flex-col items-center justify-center h-48 text-neutral-400">
                  <p className="text-sm">No bookmarks yet</p>
                </div>
              ) : (
                book.bookmarks.map((bm) => (
                  <div
                    key={bm.id}
                    onClick={() => {
                      setPageNum(bm.page);
                      setSidebarOpen(false);
                    }}
                    className="p-3 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 flex justify-between items-center"
                  >
                    <div>
                      <span className="text-xs font-bold text-blue-600 uppercase">
                        Page {bm.page}
                      </span>
                      <p className="text-sm text-neutral-700 dark:text-neutral-300 truncate max-w-37.5">
                        {bm.label || "Untitled"}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          updateBookmarkLabel(bm.id);
                        }}
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeBookmark(bm.id);
                        }}
                        className="text-red-500 p-2"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </aside>

      {/* 2. MAIN CONTENT */}
      <main className="flex-1 flex flex-col relative h-full w-full">
        {/* Header */}
        <header
          className={`absolute top-0 left-0 right-0 h-16 z-40 flex items-center justify-between px-4 md:px-6 transition-transform duration-300 pointer-events-none ${
            controlsVisible ? "translate-y-0" : "-translate-y-full"
          }`}
        >
          <div className="pointer-events-auto flex items-center space-x-2 bg-white/90 dark:bg-black/60 backdrop-blur-md py-2 px-3 rounded-full shadow-sm border border-white/20 mt-2">
            <button
              onClick={() => navigate("/library")}
              className="p-1.5 rounded-full hover:bg-black/10 dark:hover:bg-white/10"
            >
              <ArrowLeft className="w-5 h-5 text-neutral-800 dark:text-neutral-200" />
            </button>
            {/* Truncate text heavily on mobile */}
            <h1 className="text-xs md:text-sm font-semibold text-neutral-800 dark:text-neutral-200 max-w-30 md:max-w-50 truncate">
              {book.name}
            </h1>
          </div>

          <button
            onClick={() => setSidebarOpen(true)}
            className="pointer-events-auto mt-2 p-2 rounded-full bg-white/90 dark:bg-black/60 backdrop-blur-md shadow-sm border border-white/20 text-neutral-700 dark:text-neutral-200"
          >
            <PanelLeft className="w-5 h-5" />
          </button>
        </header>

        {/* PDF Area with Touch Handlers */}
        <div
          ref={scrollContainerRef}
          className="flex-1 overflow-auto flex justify-center pt-20 pb-32 touch-pan-y" // touch-pan-y allows vertical scroll but captures horizontal swipes
          onClick={() => setSidebarOpen(false)}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          {error ? (
            <div className="text-red-500 p-8 text-center">{error}</div>
          ) : pdfData ? (
            <div className="relative shadow-xl shadow-neutral-500/20 dark:shadow-black/50 transition-transform duration-200 ease-out origin-top">
              <Document
                file={fileObject}
                onLoadSuccess={({ numPages }) => {
                  setNumPages(numPages);

                  if (book && (!book.numPages || book.numPages !== numPages)) {
                    updateBookNumPages(book.id, numPages).catch(console.error);
                    setBook((prev) => ({ ...prev, numPages }));
                  }
                }}
                loading={
                  <div className="h-96 w-full animate-pulse bg-neutral-200 dark:bg-neutral-800 rounded-lg" />
                }
              >
                <Page
                  pageNumber={pageNum}
                  renderMode="canvas"
                  width={pdfWidth} // Dynamic Width
                  scale={scale}
                  className="bg-white"
                  loading=""
                />
              </Document>
            </div>
          ) : null}
        </div>

        {/* 3. MOBILE OPTIMIZED DOCK */}
        <div
          className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-40 transition-all duration-500 cubic-bezier(0.4, 0, 0.2, 1) w-[90%] md:w-auto ${
            controlsVisible
              ? "translate-y-0 opacity-100"
              : "translate-y-24 opacity-0 pointer-events-none"
          }`}
        >
          <div className="flex items-center justify-between md:justify-center p-2 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-xl border border-neutral-200 dark:border-neutral-700 rounded-2xl shadow-2xl">
            {/* Page Nav */}
            <div className="flex items-center space-x-1 pr-2 border-r border-neutral-200 dark:border-neutral-700">
              <button
                onClick={() => handlePageChange(pageNum - 1)}
                disabled={pageNum <= 1}
                className="p-3 md:p-2.5 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-30"
              >
                <ChevronLeft className="w-5 h-5 md:w-5 md:h-5 text-neutral-700 dark:text-neutral-200" />
              </button>

              <div className="flex flex-col md:flex-row items-center relative px-2">
                <span className="text-sm font-bold text-neutral-800 dark:text-neutral-100">
                  {pageNum}
                </span>
                <span className="text-[10px] md:text-sm text-neutral-400 md:ml-1">
                  / {numPages}
                </span>
              </div>

              <button
                onClick={() => handlePageChange(pageNum + 1)}
                disabled={pageNum >= numPages}
                className="p-3 md:p-2.5 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-30"
              >
                <ChevronRight className="w-5 h-5 md:w-5 md:h-5 text-neutral-700 dark:text-neutral-200" />
              </button>
            </div>

            {/* Zoom Group - Hidden on very small screens, simpler on mobile */}
            <div className="flex items-center space-x-1 px-1 md:px-2 border-r border-neutral-200 dark:border-neutral-700">
              <button
                onClick={() => setScale((s) => Math.max(s - 0.2, 0.5))}
                className="p-3 md:p-2.5 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800"
              >
                <ZoomOut className="w-4 h-4 text-neutral-600 dark:text-neutral-300" />
              </button>
              {/* Hide percentage on mobile to save space */}
              <span className="hidden md:block text-xs font-medium text-neutral-500 w-10 text-center">
                {Math.round(scale * 100)}%
              </span>
              <button
                onClick={() => setScale((s) => Math.min(s + 0.2, 3.0))}
                className="p-3 md:p-2.5 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800"
              >
                <ZoomIn className="w-4 h-4 text-neutral-600 dark:text-neutral-300" />
              </button>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-1 pl-1">
              <button
                onClick={bookmarkPage}
                className="p-3 md:p-2.5 rounded-xl hover:bg-blue-50 text-blue-600"
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
