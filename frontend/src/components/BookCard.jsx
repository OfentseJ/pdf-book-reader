import { useState, useRef, useEffect } from "react";
import {
  MoreVertical,
  BookOpen,
  Edit3,
  Trash2,
  FileText,
  Clock,
} from "lucide-react";

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
      className="group relative flex flex-col bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 overflow-hidden hover:shadow-xl hover:shadow-neutral-200/50 dark:hover:shadow-black/50 hover:-translate-y-1 transition-all duration-300 ease-[cubic-bezier(0.25,0.8,0.25,1)]"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Thumbnail Section */}
      <div
        onClick={onOpen}
        className="relative aspect-[3/4] cursor-pointer overflow-hidden bg-neutral-100 dark:bg-neutral-900 border-b border-neutral-100 dark:border-neutral-700"
      >
        {book.thumbnail ? (
          <img
            src={book.thumbnail}
            alt={book.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center">
            <div className="w-16 h-16 bg-neutral-200 dark:bg-neutral-800 rounded-full flex items-center justify-center mb-3">
              <FileText className="w-8 h-8 text-neutral-400 dark:text-neutral-500" />
            </div>
            <span className="text-xs text-neutral-400 dark:text-neutral-500 font-medium">
              No Preview Available
            </span>
          </div>
        )}

        {/* Hover Overlay */}
        <div
          className={`absolute inset-0 bg-black/20 dark:bg-black/40 backdrop-blur-[2px] flex items-center justify-center transition-opacity duration-300 ${
            isHovered ? "opacity-100" : "opacity-0"
          }`}
        >
          <button className="flex items-center space-x-2 px-5 py-2.5 bg-white dark:bg-neutral-800 rounded-full shadow-lg transform scale-95 group-hover:scale-100 transition-all duration-200">
            <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-bold text-neutral-900 dark:text-white">
              Read Now
            </span>
          </button>
        </div>

        {/* Menu Button - Only visible on hover/active */}
        <div
          ref={menuRef}
          className={`absolute top-2 right-2 transition-opacity duration-200 z-10 ${
            isHovered || menuOpen ? "opacity-100" : "opacity-0 md:opacity-0"
          }`}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              setMenuOpen((prev) => !prev);
            }}
            className={`p-1.5 rounded-full shadow-sm transition-colors ${
              menuOpen
                ? "bg-white text-neutral-900 dark:bg-neutral-700 dark:text-white"
                : "bg-white/80 dark:bg-black/50 text-neutral-700 dark:text-neutral-200 hover:bg-white dark:hover:bg-neutral-800"
            }`}
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {/* Dropdown Menu */}
          {menuOpen && (
            <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl shadow-xl py-1 animate-in fade-in zoom-in-95 duration-100 origin-top-right">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onOpen();
                  setMenuOpen(false);
                }}
                className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700/50"
              >
                <BookOpen className="w-4 h-4" />
                <span>Open</span>
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleRename();
                }}
                className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700/50"
              >
                <Edit3 className="w-4 h-4" />
                <span>Rename</span>
              </button>

              <div className="h-px bg-neutral-100 dark:bg-neutral-700 my-1" />

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirm(`Delete "${book.name}"?`)) onRemove();
                  setMenuOpen(false);
                }}
                className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Book Info Section */}
      <div className="flex flex-col flex-1 p-4">
        <h3
          className="text-sm font-bold text-neutral-900 dark:text-neutral-100 line-clamp-1 mb-1"
          title={book.name}
        >
          {book.name}
        </h3>

        {/* Date / Metadata */}
        <div className="flex items-center text-xs text-neutral-400 dark:text-neutral-500 mb-3">
          <Clock className="w-3 h-3 mr-1" />
          <span>
            Added {new Date(book.addedAt || Date.now()).toLocaleDateString()}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="mt-auto">
          {total > 0 ? (
            <div className="space-y-1.5">
              <div className="flex justify-between items-end text-xs">
                <span
                  className={`font-medium ${
                    progress === 100
                      ? "text-green-600 dark:text-green-400"
                      : "text-neutral-500"
                  }`}
                >
                  {progress === 100 ? "Completed" : `${progress}%`}
                </span>
                <span className="text-neutral-400">
                  {last}/{total}
                </span>
              </div>

              <div className="h-1.5 w-full bg-neutral-100 dark:bg-neutral-700 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    progress === 100 ? "bg-green-500" : "bg-blue-500"
                  }`}
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          ) : (
            <div className="text-xs text-neutral-400 italic">Not started</div>
          )}
        </div>
      </div>
    </div>
  );
}
