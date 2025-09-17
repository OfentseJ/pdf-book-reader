import { useState } from "react";
import { Document, Page } from "react-pdf";
import { pdfjs } from "react-pdf";
import pdfWorkerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

export default function PdfViewer({ file, bookmarks = [], onAddBookmark }) {
  const [numPages, setNumPages] = useState(null);
  const [pageNum, setPageNum] = useState(1);
  const [error, setError] = useState(null);

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };

  const onDocumentLoadError = (error) => {
    setError("Failed to load PDF: " + error.message);
  };

  const handleBookmark = () => {
    onAddBookmark(pageNum);
  };

  return (
    <div>
      <div className="w-40 border-l pl-2">
        <h3 className="font-bold mb-2">Bookmarks</h3>
        {bookmarks.length === 0 && (
          <p className="text-sm text-gray-500">No bookmarks</p>
        )}
        <ul className="space-y-1">
          {bookmarks.map((p) => (
            <li key={p}>
              <button
                onClick={() => setPageNum(p)}
                className="text-blue-500 underline"
              >
                Page {p}
              </button>
            </li>
          ))}
        </ul>
      </div>
      <div className="max-w-4xl mx-auto p-6 bg-gray-50 min-h-screen">
        <div className="bg-white rounded-lg shadow-lg p-6">
          {/* Error Display */}
          {error && (
            <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          {/* PDF Display */}
          {file && !error && (
            <div className="space-y-6">
              {/* PDF Document */}
              <div className="flex justify-center items-center">
                <div className="border p-2 border-gray-300 rounded-lg shadow-md">
                  {" "}
                  <Document
                    file={file}
                    onLoadSuccess={onDocumentLoadSuccess}
                    onLoadError={onDocumentLoadError}
                    loading={
                      <div className="p-8 text-center text-gray-600">
                        Loading PDF...
                      </div>
                    }
                  >
                    <Page
                      pageNumber={pageNum}
                      width={Math.min(600, window.innerWidth - 100)} // Slightly smaller
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
                  onClick={() => setPageNum((p) => Math.max(p - 1, 1))}
                  disabled={pageNum <= 1}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
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
                        setPageNum(page);
                      }
                    }}
                    min={1}
                    max={numPages || 1}
                    className="w-16 px-2 py-1 text-center border border-gray-300 rounded"
                  />
                  <span className="text-gray-600">of {numPages || "?"}</span>
                </div>

                <button
                  onClick={() => setPageNum((p) => Math.min(p + 1, numPages))}
                  disabled={pageNum >= numPages}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  Next →
                </button>

                <button
                  onClick={handleBookmark}
                  className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                >
                  🔖 Bookmark
                </button>
              </div>
              {/* Page Info */}
              <div className="text-center text-gray-600">
                <p className="text-sm">
                  File: {file.name} • Page {pageNum} of {numPages}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
