import { LogOut } from "lucide-react";
import { logout, getUserFromToken } from "../utils/auth";

export default function LibraryHeader() {
  const user = getUserFromToken();

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 rounded-2xl mb-2">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center flex-col gap-3">
          <h1 className="text-2xl font-bold text-gray-900"> My Library</h1>
          {user && (
            <span className="text-sm text-gray-600 ">
              Welcome, {user.username}!
            </span>
          )}
        </div>

        <button
          onClick={logout}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </header>
  );
}
