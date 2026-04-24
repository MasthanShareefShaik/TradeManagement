import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

interface LoginPageProps {
  onLoginSuccess?: () => void;
}

const LoginPage = ({ onLoginSuccess }: LoginPageProps) => {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState<{
    show: boolean;
    message: string;
    type: "success" | "error";
  }>({
    show: false,
    message: "",
    type: "success",
  });
  const [showPassword, setShowPassword] = useState(false);
  // Frontend credentials validation with custom users
  const validateCredentials = (username: string, password: string) => {
    // Custom valid users
    const validUsers = [
      { username: "shareef", password: "8096863055" },
      { username: "saketh", password: "8096863055" },
      { username: "admin", password: "admin123" },
      { username: "user", password: "user123" },
      { username: "trader", password: "trader123" },
    ];

    return validUsers.some(
      (user) =>
        user.username.toLowerCase() === username.toLowerCase() &&
        user.password === password,
    );
  };

  // Show toast message
  const showToast = (message: string, type: "success" | "error") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "success" });
    }, 3000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Simulate API call delay
    setTimeout(() => {
      if (validateCredentials(credentials.username, credentials.password)) {
        // Store login state in localStorage
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("username", credentials.username);

        // Show success toast
        showToast(
          `Welcome back, ${credentials.username}! Login successful! 🎉`,
          "success",
        );

        if (onLoginSuccess) {
          onLoginSuccess();
        }

        // Navigate after a short delay to show toast
        setTimeout(() => {
          navigate("/home");
        }, 1000);
      } else {
        setError("Invalid username or password. Please try again.");
        showToast("Login failed! Invalid credentials ❌", "error");
      }
      setLoading(false);
    }, 1500); // Simulate loading time
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCredentials((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 md:p-8 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-500  to-gray-800 animate-gradient bg-300%"></div>

      {/* Toast Notification */}
      {toast.show && (
        <div
          className={`fixed top-4 sm:top-6 right-4 sm:right-6 z-50 animate-slideInRight max-w-[calc(100%-2rem)] sm:max-w-sm`}
        >
          <div
            className={`rounded-xl shadow-2xl p-4 backdrop-blur-lg border ${
              toast.type === "success"
                ? "bg-green-500/90 border-green-400"
                : "bg-red-500/90 border-red-400"
            }`}
          >
            <div className="flex items-center gap-3">
              {toast.type === "success" ? (
                <svg
                  className="w-6 h-6 text-white flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              ) : (
                <svg
                  className="w-6 h-6 text-white flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              )}
              <p className="text-white font-medium text-sm sm:text-base">
                {toast.message}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Login Card */}
      <div className="relative z-10 bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl max-w-md w-full p-6 sm:p-8 animate-slideUp border border-white/20">
        {/* Logo/Icon */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-r from-gray-800 to-gray-400 rounded-2xl mb-4 shadow-lg ">
            <svg
              className="w-10 h-10 sm:w-12 sm:h-12 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-2">
            Welcome Back
          </h2>
          <p className="text-white/70 text-sm sm:text-base">
            Sign in to your trading account
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
          <div className="space-y-2">
            <label className="block text-white text-sm font-semibold">
              Username
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                  className="h-5 w-5 text-white/50"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
              <input
                type="text"
                name="username"
                value={credentials.username}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 bg-white/50 border border-white/30 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent transition text-sm sm:text-base"
                placeholder="Enter username"
                required
                autoComplete="username"
              />
            </div>
          </div>

          <div className="relative">
            {/* Lock Icon */}
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg
                className="h-5 w-5 text-white/50"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>

            {/* Password Input */}
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={credentials.password}
              onChange={handleChange}
              className="w-full pl-10 pr-10 py-3 bg-white/50 border border-white/30 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent transition text-sm sm:text-base"
              placeholder="Enter password"
              required
              autoComplete="current-password"
            />

            {/* 👁 Eye Icon */}
            <div
              className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <Eye /> : <EyeOff />}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-3 animate-shake">
              <p className="text-red-200 text-xs sm:text-sm text-center">
                {error}
              </p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="relative w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold py-3 px-6 rounded-xl hover:shadow-xl transform transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden group"
          >
            {loading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin"></div>
                <span className="text-sm sm:text-base">Authenticating...</span>
              </div>
            ) : (
              <span className="relative z-10 text-sm sm:text-base">
                Sign In
              </span>
            )}
            {!loading && (
              <div className="absolute inset-0 bg-gradient-to-r from-gray-600 to-gray-400 transform translate-x-full group-hover:translate-x-0 transition-transform duration-300"></div>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
