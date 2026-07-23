"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "@/lib/auth-client";
import { Eye, EyeOff } from "lucide-react";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function GoogleIcon(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" {...props}>
      <path
        fill="#4285F4"
        d="M23.52 12.27c0-.79-.07-1.54-.2-2.27H12v4.51h6.47c-.28 1.5-1.13 2.77-2.4 3.62v3.01h3.88c2.27-2.09 3.57-5.17 3.57-8.87z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.07 7.94-2.9l-3.88-3.01c-1.08.72-2.45 1.15-4.06 1.15-3.13 0-5.78-2.11-6.73-4.95H1.27v3.11C3.25 21.3 7.31 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.27 14.29A7.2 7.2 0 0 1 4.89 12c0-.79.14-1.56.38-2.29V6.6H1.27A11.98 11.98 0 0 0 0 12c0 1.94.46 3.77 1.27 5.4l4-3.11z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.76 0 3.35.61 4.6 1.8l3.44-3.44C17.94 1.19 15.24 0 12 0 7.31 0 3.25 2.7 1.27 6.6l4 3.11C6.22 6.86 8.87 4.75 12 4.75z"
      />
    </svg>
  );
}

export default function LoginPage() {
  const router = useRouter();

  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
    setServerError("");
  };

  const validate = () => {
    const nextErrors = {};
    if (!form.email.trim()) {
      nextErrors.email = "Email is required.";
    } else if (!EMAIL_REGEX.test(form.email)) {
      nextErrors.email = "Enter a valid email address.";
    }
    if (!form.password) {
      nextErrors.password = "Password is required.";
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");

    if (!validate()) return;

    setLoading(true);
    try {
      const { error } = await signIn.email({
        email: form.email,
        password: form.password,
      });

      if (error) {
        if (
          error.code === "INVALID_EMAIL_OR_PASSWORD" ||
          /invalid|not found|incorrect/i.test(error.message || "")
        ) {
          setServerError("Incorrect email or password. Please try again.");
        } else {
          setServerError(error.message || "Something went wrong. Please try again.");
        }
        setLoading(false);
        return;
      }

      router.push("/dashboard");
    } catch (err) {
      setServerError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setServerError("");
    try {
      await signIn.social({
        provider: "google",
        callbackURL: `/dashboard`,
      });
    } catch (err) {
      setServerError("Google sign-in failed. Please try again.");
      setGoogleLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <main className="min-h-screen bg-[#14171F] flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-md">
        <p
          className="text-[#D8A13B] text-xs tracking-[0.2em] mb-3 text-center"
          style={{ fontFamily: "'IBM Plex Mono', monospace" }}
        >
          WELCOME BACK
        </p>
        <h1
          className="text-3xl md:text-4xl text-[#F3EFE4] text-center mb-8"
          style={{ fontFamily: "'Fraunces', serif", fontWeight: 600 }}
        >
          Log in to your account
        </h1>

        <div className="bg-[#1B1F2A] border border-white/5 rounded-md p-6 md:p-8 space-y-5">
          {serverError && (
            <div
              className="bg-[#B23A2E]/10 border border-[#B23A2E]/40 text-[#E88A7E] text-sm rounded-sm px-4 py-3"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              {serverError}
            </div>
          )}

          {/* Google Sign-In */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={googleLoading}
            className="w-full flex items-center justify-center gap-3 bg-[#F3EFE4] text-[#14171F] font-medium py-3 rounded-sm hover:bg-white transition-colors disabled:opacity-60"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            <GoogleIcon />
            {googleLoading ? "Redirecting..." : "Continue with Google"}
          </button>

          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-white/10" />
            <span
              className="text-[#9AA1AE] text-xs"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              OR
            </span>
            <div className="h-px flex-1 bg-white/10" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label
                className="block text-[#F3EFE4] text-sm mb-2"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                Email
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className="w-full bg-[#14171F] border border-white/10 focus:border-[#D8A13B] outline-none rounded-sm px-4 py-2.5 text-[#F3EFE4] placeholder:text-[#9AA1AE]/50 text-sm"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              />
              {errors.email && (
                <p className="text-[#E88A7E] text-xs mt-1.5">{errors.email}</p>
              )}
            </div>

            {/* Password with Eye Button */}
            <div>
              <label
                className="block text-[#F3EFE4] text-sm mb-2"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Your password"
                  className="w-full bg-[#14171F] border border-white/10 focus:border-[#D8A13B] outline-none rounded-sm px-4 py-2.5 text-[#F3EFE4] placeholder:text-[#9AA1AE]/50 text-sm pr-10"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9AA1AE] hover:text-[#F3EFE4] transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-[#E88A7E] text-xs mt-1.5">{errors.password}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#D8A13B] text-[#14171F] font-medium py-3 rounded-sm hover:bg-[#c99530] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              {loading ? "Logging in..." : "Log in"}
            </button>
          </form>
        </div>

        <p
          className="text-center text-[#9AA1AE] text-sm mt-6"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          Don't have an account?{" "}
          <Link href="/register" className="text-[#D8A13B] hover:text-[#c99530]">
            Register
          </Link>
        </p>
      </div>
    </main>
  );
}