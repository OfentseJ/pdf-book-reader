import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import PdfViewer from "../components/PdfViewer";
import { getBook } from "../utils/db";

export default function ReaderPage() {
  const { id } = useParams();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getBook(id)
      .then((b) => {
        setBook(b);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mb-4"></div>
          <p className="text-lg text-gray-700 font-medium">Loading book...</p>
          <p className="text-sm text-gray-500 mt-2">
            Preparing your reading experience
          </p>
        </div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="inline-block p-6 bg-red-100 rounded-full mb-4">
            <span className="text-4xl">📕</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Book Not Found
          </h2>
          <p className="text-gray-600 mb-6">
            We couldn't find the book you're looking for. It may have been
            removed or doesn't exist.
          </p>
          <a
            href="/"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            ← Back to Library
          </a>
        </div>
      </div>
    );
  }

  return <PdfViewer />;
}
