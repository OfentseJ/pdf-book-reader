import { LogOut } from "lucide-react";
import { logout, getUserFromToken } from "../utils/auth";

export default function LibraryHeader() {
  const user = getUserFromToken();

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 rounded-2xl mb-2 shadow-sm transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center flex-col gap-3">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            📚 My Library
          </h1>
          {user && (
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Welcome, {user.username}!
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={logout}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
