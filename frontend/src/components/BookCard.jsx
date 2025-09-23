export default function BookCard({ book, onOpen, onRemove, onRename }) {
  const handleRename = () => {
    const newName = prompt("Enter new book name:", book.name);
    if (newName && newName !== book.name) {
      onRename(book.id, newName);
    }
  };

  return (
    <div className="rounded shadow-lg p-4 cursor-pointer relative">
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
      <div className="flex justify-between mt-2">
        <button
          onClick={onRemove}
          className="text-red-500 hover:bg-red-500 hover:text-white hover:rounded-2xl text-xs"
        >
          Remove
        </button>
        <button
          onClick={handleRename}
          className="text-slate-500 hover:bg-slate-500 hover:text-white hover:rounded-2xl text-xs"
        >
          Rename
        </button>
      </div>
    </div>
  );
}
