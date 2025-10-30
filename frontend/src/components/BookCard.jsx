import { useState, useRef, useEffect } from "react";
import { MoreVertical, BookOpen, Edit3, Trash2, FileText } from "lucide-react";

export default function BookCard({ book, onOpen, onRemove, onRename }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const menuRef = useRef(null);

  const handleRename = () => {
    const newName = prompt("Enter new book name:", book.name);
    if (newName && newName !== book.name) {
      onRename(book.id, newName);
    }
    setMenuOpen(false);
  };

  const last = Number(book?.lastPage) || 0;
  const total = Number(book?.numPages) || 0;
  const progress =
    total > 0
      ? Math.min(100, Math.max(0, Math.round((last / total) * 100)))
      : 0;

  // Close dropdown if clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div
      className="group relative bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Thumbnail Section */}
      <div
        onClick={onOpen}
        className="relative cursor-pointer overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800"
      >
        {book.thumbnail ? (
          <img
            src={book.thumbnail}
            alt={`${book.name} thumbnail`}
            className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-64 flex flex-col items-center justify-center">
            <FileText className="w-16 h-16 text-gray-400 dark:text-gray-500 mb-2" />
            <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">
              No Preview
            </span>
          </div>
        )}

        {/* Hover Overlay */}
        <div
          className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity duration-300 ${
            isHovered ? "opacity-100" : "opacity-0"
          }`}
        >
          <div className="flex items-center space-x-2 px-4 py-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
            <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-semibold text-gray-900 dark:text-white">
              Open Book
            </span>
          </div>
        </div>

        {/* Options Menu Button */}
        <div
          ref={menuRef}
          className={`absolute top-3 right-3 transition-opacity duration-200 ${
            isHovered || menuOpen ? "opacity-100" : "opacity-0"
          }`}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              setMenuOpen((prev) => !prev);
            }}
            className="p-2 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-lg shadow-lg hover:bg-white dark:hover:bg-gray-700 transition-colors"
          >
            <MoreVertical className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          </button>

          {/* Dropdown Menu */}
          <div
            className={`absolute right-0 mt-2 w-44 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl z-20 transform transition-all duration-200 ease-out origin-top-right ${
              menuOpen
                ? "opacity-100 scale-100 translate-y-0"
                : "opacity-0 scale-95 -translate-y-2 pointer-events-none"
            }`}
          >
            <ul className="py-2">
              <li>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpen();
                    setMenuOpen(false);
                  }}
                  className="w-full flex items-center space-x-3 px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left"
                >
                  <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Open
                  </span>
                </button>
              </li>
              <li>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRename();
                  }}
                  className="w-full flex items-center space-x-3 px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left"
                >
                  <Edit3 className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Rename
                  </span>
                </button>
              </li>
              <li className="border-t border-gray-100 dark:border-gray-700 mt-1 pt-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (
                      confirm(`Are you sure you want to delete "${book.name}"?`)
                    ) {
                      onRemove();
                    }
                    setMenuOpen(false);
                  }}
                  className="w-full flex items-center space-x-3 px-4 py-2.5 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-left"
                >
                  <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                  <span className="text-sm font-medium text-red-600 dark:text-red-400">
                    Delete
                  </span>
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Progress Badge */}
        {total > 0 && progress > 0 && (
          <div className="absolute bottom-3 left-3">
            <div className="px-3 py-1.5 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-lg shadow-lg">
              <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                {progress}%
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Book Info Section */}
      <div className="p-4">
        <h3
          className="text-sm font-semibold text-gray-900 dark:text-white truncate mb-3"
          title={book.name}
        >
          {book.name}
        </h3>

        {/* Progress Bar */}
        {total > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
              <span className="font-medium">
                {last} / {total} pages
              </span>
              <span className="text-gray-500 dark:text-gray-500">
                {progress}%
              </span>
            </div>
            <div className="relative w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-400 dark:to-blue-500 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              >
                <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
              </div>
            </div>
          </div>
        )}

        {/* Status Badge */}
        {total > 0 && (
          <div className="mt-3 flex items-center">
            {progress === 0 ? (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                Not started
              </span>
            ) : progress === 100 ? (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                ✓ Completed
              </span>
            ) : (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400">
                In progress
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
