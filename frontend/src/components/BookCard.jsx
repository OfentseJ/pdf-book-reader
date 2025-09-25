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

      {/* Ellipsis and dropdown */}
      <div ref={menuRef} className="absolute top-2 right-2">
        <button
          onClick={() => setMenuOpen((prev) => !prev)}
          className="p-1 bg-gray-200 rounded-full"
        >
          <EllipsisVertical />
        </button>

        {menuOpen && (
          <div className="absolute right-0 mt-2 w-32 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
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
        )}
      </div>
    </div>
  );
}
