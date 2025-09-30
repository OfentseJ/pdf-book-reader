import { useState, useRef, useEffect } from "react";
import { EllipsisVertical } from "lucide-react";

export default function BookCard({ book, onOpen, onRemove, onRename }) {
  const [menuOpen, setMenuOpen] = useState(false);
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
    <div className="rounded-2xl shadow-lg p-4 cursor-pointer relative">
      {book.thumbnail ? (
        <img
          onClick={onOpen}
          src={book.thumbnail}
          alt={`${book.name} thumbnail`}
          className="w-full h-100 object-cover mb-2 rounded"
        />
      ) : (
        <div className="w-full h-40 bg-gray-200 flex items-center justify-center mb-2">
          <span className="text-gray-500">No Preview</span>
        </div>
      )}
      <h2 className="text-sm font-medium truncate">{book.name}</h2>

      {/* Progress Bar */}
      {book.numPages > 0 && (
        <div className="mt-2">
          <div className="w-full h-2 bg-gray-200 rounded-full">
            <div
              className="h-2 bg-blue-500 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-500 mt-1">{progress}% read</p>
        </div>
      )}

      {/* Ellipsis + dropdown */}
      <div ref={menuRef} className="absolute top-2 right-2">
        <button
          onClick={() => setMenuOpen((prev) => !prev)}
          className="p-1 bg-gray-200 rounded-full cursor-pointer"
        >
          <EllipsisVertical />
        </button>

        {/* Dropdown with animation */}
        <div
          className={`absolute right-0 mt-2 w-32 bg-white border border-gray-200 rounded-lg shadow-lg z-10 transform transition-all duration-200 ease-out origin-top ${
            menuOpen
              ? "opacity-100 scale-100 translate-y-0"
              : "opacity-0 scale-95 -translate-y-2 pointer-events-none"
          }`}
        >
          <ul className="py-1 text-sm text-gray-700">
            <li>
              <button
                onClick={onOpen}
                className="w-full text-left px-4 py-2 hover:bg-gray-100"
              >
                Open
              </button>
            </li>
            <li>
              <button
                onClick={handleRename}
                className="w-full text-left px-4 py-2 hover:bg-gray-100"
              >
                Rename
              </button>
            </li>
            <li>
              <button
                onClick={onRemove}
                className="w-full text-left px-4 py-2 hover:bg-gray-100 text-red-500"
              >
                Delete
              </button>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
