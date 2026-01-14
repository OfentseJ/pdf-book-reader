import { LogOut, User } from "lucide-react";
import { logout, getUserFromToken } from "../utils/auth";

export default function LibraryHeader() {
  const user = getUserFromToken();

  // Generate initials for avatar
  const getInitials = (name) => {
    return name ? name.substring(0, 2).toUpperCase() : "??";
  };

  return (
    <header className="flex items-center justify-between py-4">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-sm">
          {user ? getInitials(user.username) : <User className="w-5 h-5" />}
        </div>
        <div>
          <h1 className="text-lg font-bold text-neutral-900 dark:text-white leading-tight">
            My Library
          </h1>
          {user && (
            <p className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">
              Welcome back, {user.username}
            </p>
          )}
        </div>
      </div>

      <button
        onClick={logout}
        className="group flex items-center gap-2 px-3 py-2 text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-full transition-all duration-200"
        title="Sign out"
      >
        <span className="hidden sm:block">Sign out</span>
        <LogOut className="w-4 h-4 transition-transform group-hover:translate-x-1" />
      </button>
    </header>
  );
}
