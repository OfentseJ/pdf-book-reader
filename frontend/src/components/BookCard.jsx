export default function BookCard({ book, onOpen }) {
  return (
    <div
      className="border rounded-lg p-2 shadow cursor-pointer hover:shadow-lg transition"
      onClick={onOpen}
    >
      <p className="font-semibold truncate">{book.name}</p>
    </div>
  );
}
