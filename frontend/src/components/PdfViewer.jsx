import { useEffect, useState, useRef } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import pdfWorkerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import {
  getBook,
  updateBookBookmarks,
  removeBookBookmark,
  updateBookLastPage,
} from "../utils/db";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { useParams } from "react-router-dom";

pdfjs.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

export default function PdfViewer() {
  const { id } = useParams();
  const pageRef = useRef(null);

  const [book, setBook] = useState(null);
  const [numPages, setNumPages] = useState(null);
  const [pageNum, setPageNum] = useState(1);
  const [error, setError] = useState(null);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [scale, setScale] = useState(1.0);

  useEffect(() => {
    if (!id) return;
    getBook(id)
      .then((b) => {
        setBook(b);

        if (b?.file) {
          setPdfUrl(URL.createObjectURL(b.file));
        }

        if (b?.lastPage) {
          setPageNum(b.lastPage);
        }
      })
      .catch(console.error);

    return () => {
      if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    };
  }, [id]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "ArrowLeft") handlePageChange(pageNum - 1);
      if (e.key === "ArrowRight") handlePageChange(pageNum + 1);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [pageNum, numPages]);

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };

  const onDocumentLoadError = (error) => {
    setError("Failed to load PDF: " + error.message);
  };

  const bookmarkPage = async () => {
    if (!book) return;

    if (book.bookmarks?.includes(pageNum)) {
      alert(`Page ${pageNum} is already bookmarked!`);
      return;
    }

    const newBookmarks = [...(book.bookmarks || []), pageNum];
    await updateBookBookmarks(book.id, newBookmarks);

    setBook({ ...book, bookmarks: newBookmarks }); // update local state
    alert(`Bookmarked page ${pageNum}`);
  };

  const removeBookmark = async (page) => {
    if (!book) return;

    const updatedBook = await removeBookBookmark(book.id, page);
    setBook(updatedBook);

    if (pageNum === page && updatedBook.bookmarks.length > 0) {
      setPageNum(updatedBook.bookmarks[0]);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= numPages) {
      setPageNum(newPage);
      updateBookLastPage(id, newPage);
    }

    if (pageRef.current) {
      pageRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  return (
    <div className="flex">
      {/* Bookmarks sidebar */}
      <div className="w-48 border-r pr-2 p-4 bg-gray-50">
        <h3 className="font-bold mb-2">Bookmarks</h3>
        {(!book?.bookmarks || book.bookmarks.length === 0) && (
          <p className="text-sm text-gray-500">No bookmarks</p>
        )}

        <ul className="space-y-1">
          {book?.bookmarks?.map((p) => (
            <li key={p} className="flex justify-between items-center">
              <button
                onClick={() => setPageNum(p)}
                className="text-blue-500 underline text-sm"
              >
                Page {p}
              </button>
              <button
                onClick={() => removeBookmark(p)}
                className="ml-2 text-red-500 hover:text-red-700 text-xs"
              >
                ✖
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* PDF Reader */}
      <div className="flex-1 max-w-4xl mx-auto p-6 bg-gray-50 min-h-screen">
        <div className="bg-white rounded-lg shadow-lg p-6">
          {error && (
            <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          {pdfUrl && !error && (
            <div className="space-y-6">
              <div ref={pageRef} className="flex justify-center items-center">
                <div className="border p-2 border-gray-300 rounded-lg shadow-md">
                  <Document
                    file={pdfUrl}
                    onLoadSuccess={onDocumentLoadSuccess}
                    onLoadError={onDocumentLoadError}
                    options={{
                      cMapUrl: "cmaps/",
                      standardFontDataUrl: "standard_fonts/",
                    }}
                    loading={
                      <div className="p-8 text-center text-gray-600">
                        Loading PDF...
                      </div>
                    }
                  >
                    <Page
                      pageNumber={pageNum}
                      renderMode="canvas"
                      width={Math.min(600, window.innerWidth - 100)}
                      scale={scale}
                      loading={
                        <div className="p-8 text-center text-gray-600">
                          Loading page...
                        </div>
                      }
                    />
                  </Document>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center justify-center space-x-4 bg-gray-100 p-4 rounded-lg">
                <button
                  onClick={() => handlePageChange(pageNum - 1)}
                  disabled={pageNum <= 1}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  ← Previous
                </button>

                <div className="flex items-center space-x-2">
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
                    className="w-16 px-2 py-1 text-center border border-gray-300 rounded"
                  />
                  <span className="text-gray-600">of {numPages || "?"}</span>
                </div>

                <button
                  onClick={() => handlePageChange(pageNum + 1)}
                  disabled={pageNum >= numPages}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Next →
                </button>

                <button
                  onClick={bookmarkPage}
                  className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                >
                  🔖 Bookmark
                </button>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <button
                  onClick={() => setScale((s) => Math.max(s - 0.2, 0.5))}
                  className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                >
                  ➖
                </button>
                <span className="text-sm">
                  Zoom: {(scale * 100).toFixed(0)}%
                </span>
                <button
                  onClick={() => setScale((s) => Math.min(s + 0.2, 3.0))}
                  className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                >
                  ➕
                </button>
                <button
                  onClick={() => setScale(1.0)}
                  className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                >
                  Reset
                </button>
              </div>
              {/* Page Info */}
              <div className="text-center text-gray-600">
                <p className="text-sm">
                  File: {book.name} • Page {pageNum} of {numPages}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
