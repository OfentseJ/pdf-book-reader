import { Github, Linkedin, Heart } from "lucide-react";
import { Link } from "react-router-dom";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-white dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-800 transition-colors mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Column */}
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-4">
              PDF Reader
            </h3>
            <p className="text-neutral-500 dark:text-neutral-400 text-sm max-w-xs mb-6">
              Your personal digital library. Upload, organize, and read your
              favorite books anywhere, anytime.
            </p>
            <div className="flex space-x-4">
              <SocialLink
                href="https://github.com/OfentseJ"
                icon={<Github className="w-5 h-5" />}
                label="GitHub"
              />
              <SocialLink
                href="https://linkedin.comwww.linkedin.com/in/ofentse-makhutja-13b4112a2"
                icon={<Linkedin className="w-5 h-5" />}
                label="LinkedIn"
              />
            </div>
          </div>

          {/* Links Column 1 */}
          <div>
            <h4 className="text-sm font-semibold text-neutral-900 dark:text-white uppercase tracking-wider mb-4">
              Product
            </h4>
            <ul className="space-y-3">
              <FooterLink to="/library">Library</FooterLink>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-neutral-100 dark:border-neutral-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-neutral-500 dark:text-neutral-400 text-sm">
            © {currentYear} PDF Book Reader. All rights reserved.
          </p>

          <p className="flex items-center text-sm text-neutral-500 dark:text-neutral-400">
            Made with{" "}
            <Heart className="w-4 h-4 text-red-500 mx-1.5 fill-current" /> by
            Ofentse
          </p>
        </div>
      </div>
    </footer>
  );
}

// Helper Components for cleaner code
function SocialLink({ href, icon, label }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="p-2 bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
      aria-label={label}
    >
      {icon}
    </a>
  );
}

function FooterLink({ to, children }) {
  return (
    <li>
      <Link
        to={to}
        className="text-neutral-500 dark:text-neutral-400 hover:text-blue-600 dark:hover:text-blue-400 text-sm transition-colors"
      >
        {children}
      </Link>
    </li>
  );
}
