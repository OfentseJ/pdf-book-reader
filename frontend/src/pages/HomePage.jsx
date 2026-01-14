import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  BookOpen,
  Lock,
  Mail,
  User,
  Eye,
  EyeOff,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";

export default function HomePage() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Environment variable handling
  const API_BASE_URL =
    import.meta.env.VITE_API_URL || "http://localhost:5000/api";

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const endpoint = isLogin ? "/auth/login" : "/auth/register";
      const payload = isLogin
        ? { email: formData.email, password: formData.password }
        : formData;

      const cleanBaseUrl = API_BASE_URL.replace(/\/$/, "");
      const fullUrl = `${cleanBaseUrl}${endpoint}`;

      const response = await fetch(fullUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const contentType = response.headers.get("content-type");
      let data;

      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
        console.log("5. Data parsed:", data);
      } else {
        const text = await response.text();
        console.log("5. ERROR - Non-JSON response:", text);
        throw new Error("Server sent non-JSON response");
      }

      if (!response.ok) {
        throw new Error(data.message || "Authentication failed");
      }

      if (data.token) {
        localStorage.setItem("token", data.token);
        navigate("/library");
      } else {
        alert("Registration successful! Please login.");
        setIsLogin(true);
      }
    } catch (error) {
      console.error("!!! CAUGHT ERROR !!!", error);
      alert(`Error: ${error.message}`);
    } finally {
      console.log("7. Finally block - stopping loading");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 flex items-center justify-center p-4 transition-colors">
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
        {/* Left Side - Hero Section */}
        <div className="text-center lg:text-left order-2 lg:order-1">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-8 shadow-lg shadow-blue-500/30 rotate-3 transform transition-transform hover:rotate-6">
            <BookOpen className="w-8 h-8 text-white" />
          </div>

          <h1 className="text-4xl lg:text-6xl font-bold text-neutral-900 dark:text-white mb-6 leading-tight">
            Your personal
            <span className="block text-blue-600 dark:text-blue-400">
              Digital Library
            </span>
          </h1>

          <p className="text-lg text-neutral-600 dark:text-neutral-400 mb-10 max-w-lg mx-auto lg:mx-0 leading-relaxed">
            Upload, organize, and read your PDF books anywhere. A beautiful,
            distraction-free reading experience for the modern web.
          </p>

          <div className="space-y-4 max-w-md mx-auto lg:mx-0">
            {[
              { title: "Unlimited Storage", desc: "Upload PDFs of any size" },
              { title: "Smart Bookmarks", desc: "Never lose your place again" },
              {
                title: "Cross-Platform",
                desc: "Read on mobile, tablet, or desktop",
              },
            ].map((feature, idx) => (
              <div
                key={idx}
                className="flex items-center gap-4 p-4 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-neutral-900 dark:text-white">
                    {feature.title}
                  </p>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    {feature.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side - Form Section */}
        <div className="w-full max-w-md mx-auto order-1 lg:order-2">
          <div className="bg-white dark:bg-neutral-800 rounded-3xl shadow-xl shadow-neutral-200/50 dark:shadow-black/50 p-8 border border-neutral-100 dark:border-neutral-700 backdrop-blur-sm">
            {/* Toggle Tabs (Segmented Control) */}
            <div className="relative flex bg-neutral-100 dark:bg-neutral-900 p-1 rounded-xl mb-8">
              <div
                className={`absolute inset-y-1 w-[calc(50%-4px)] bg-white dark:bg-neutral-700 rounded-lg shadow-sm transition-transform duration-200 ease-out ${
                  isLogin ? "translate-x-0" : "translate-x-full ml-1" // ml-1 corrects gap
                }`}
              />
              <button
                onClick={() => setIsLogin(true)}
                className={`relative flex-1 py-2.5 text-sm font-semibold rounded-lg transition-colors z-10 ${
                  isLogin
                    ? "text-neutral-900 dark:text-white"
                    : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-700"
                }`}
              >
                Login
              </button>
              <button
                onClick={() => setIsLogin(false)}
                className={`relative flex-1 py-2.5 text-sm font-semibold rounded-lg transition-colors z-10 ${
                  !isLogin
                    ? "text-neutral-900 dark:text-white"
                    : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-700"
                }`}
              >
                Register
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {!isLogin && (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider ml-1">
                    Full Name
                  </label>
                  <div className="relative group">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400 group-focus-within:text-blue-500 transition-colors" />
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      required={!isLogin}
                      placeholder="John Doe"
                      className="w-full pl-10 pr-4 py-3 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-neutral-900 dark:text-white placeholder-neutral-400"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider ml-1">
                  Email
                </label>
                <div className="relative group">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400 group-focus-within:text-blue-500 transition-colors" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="you@example.com"
                    className="w-full pl-10 pr-4 py-3 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-neutral-900 dark:text-white placeholder-neutral-400"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider ml-1">
                  Password
                </label>
                <div className="relative group">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400 group-focus-within:text-blue-500 transition-colors" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    placeholder="••••••••"
                    className="w-full pl-10 pr-12 py-3 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-neutral-900 dark:text-white placeholder-neutral-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 p-1"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3.5 rounded-xl font-semibold transition-all shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center group"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>{isLogin ? "Sign In" : "Create Account"}</span>
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 flex flex-col items-center gap-4">
              {isLogin && (
                <div className="flex w-full items-center justify-between text-sm">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="mr-2 rounded border-neutral-300 text-blue-600 focus:ring-blue-500"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                    />
                    <span className="text-sm text-neutral-500 dark:text-neutral-400">
                      Remember me
                    </span>
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                  >
                    Forgot password?
                  </Link>
                </div>
              )}

              <div className="w-full border-t border-neutral-100 dark:border-neutral-700 pt-6 text-center">
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  {isLogin ? "New here? " : "Already have an account? "}
                  <button
                    onClick={() => setIsLogin(!isLogin)}
                    className="text-blue-600 dark:text-blue-400 font-bold hover:underline"
                  >
                    {isLogin ? "Create an account" : "Sign in"}
                  </button>
                </p>
              </div>
            </div>
          </div>

          <p className="text-center text-xs text-neutral-400 mt-6 flex items-center justify-center gap-1.5">
            <Lock className="w-3 h-3" />
            End-to-end encrypted connection
          </p>
        </div>
      </div>
    </div>
  );
}
