"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signUp } from "@/lib/auth-client";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function getPasswordError(password) {
  if (password.length < 8) return "Password must be at least 8 characters.";
  if (!/[a-zA-Z]/.test(password)) return "Password must include at least one letter.";
  if (!/[0-9]/.test(password)) return "Password must include at least one number.";
  return null;
}

export default function RegisterPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    email: "",
    image: "",
    password: "",
    role: "supporter",
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
    setServerError("");
  };

  const validate = () => {
    const nextErrors = {};

    if (!form.name.trim()) nextErrors.name = "Name is required.";

    if (!form.email.trim()) {
      nextErrors.email = "Email is required.";
    } else if (!EMAIL_REGEX.test(form.email)) {
      nextErrors.email = "Enter a valid email address.";
    }

    const passwordError = getPasswordError(form.password);
    if (passwordError) nextErrors.password = passwordError;

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");

    if (!validate()) return;

    setLoading(true);
    try {
      const { error } = await signUp.email({
        name: form.name,
        email: form.email,
        password: form.password,
        image: form.image || undefined,
        role: form.role,
      });

      if (error) {
        if (
          error.code === "USER_ALREADY_EXISTS" ||
          /already exists|already registered/i.test(error.message || "")
        ) {
          setServerError("An account with this email already exists. Try logging in instead.");
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

  return (
    <main className="min-h-screen bg-[#14171F] flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-md">
        <p
          className="text-[#D8A13B] text-xs tracking-[0.2em] mb-3 text-center"
          style={{ fontFamily: "'IBM Plex Mono', monospace" }}
        >
          JOIN CROWDFUND
        </p>
        <h1
          className="text-3xl md:text-4xl text-[#F3EFE4] text-center mb-2"
          style={{ fontFamily: "'Fraunces', serif", fontWeight: 600 }}
        >
          Create your account
        </h1>
        <p
          className="text-[#9AA1AE] text-sm text-center mb-8"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          Supporters start with 50 credits. Creators start with 20.
        </p>

        <form
          onSubmit={handleSubmit}
          className="bg-[#1B1F2A] border border-white/5 rounded-md p-6 md:p-8 space-y-5"
        >
          {serverError && (
            <div
              className="bg-[#B23A2E]/10 border border-[#B23A2E]/40 text-[#E88A7E] text-sm rounded-sm px-4 py-3"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              {serverError}
            </div>
          )}

          {/* Name */}
          <div>
            <label
              className="block text-[#F3EFE4] text-sm mb-2"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Full name
            </label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Nusrat Jahan"
              className="w-full bg-[#14171F] border border-white/10 focus:border-[#D8A13B] outline-none rounded-sm px-4 py-2.5 text-[#F3EFE4] placeholder:text-[#9AA1AE]/50 text-sm"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            />
            {errors.name && (
              <p className="text-[#E88A7E] text-xs mt-1.5">{errors.name}</p>
            )}
          </div>

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

          {/* Profile Picture URL */}
          <div>
            <label
              className="block text-[#F3EFE4] text-sm mb-2"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Profile picture URL <span className="text-[#9AA1AE]">(optional)</span>
            </label>
            <input
              type="url"
              name="image"
              value={form.image}
              onChange={handleChange}
              placeholder="https://example.com/photo.jpg"
              className="w-full bg-[#14171F] border border-white/10 focus:border-[#D8A13B] outline-none rounded-sm px-4 py-2.5 text-[#F3EFE4] placeholder:text-[#9AA1AE]/50 text-sm"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            />
          </div>

          {/* Password */}
          <div>
            <label
              className="block text-[#F3EFE4] text-sm mb-2"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Password
            </label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="At least 8 characters"
              className="w-full bg-[#14171F] border border-white/10 focus:border-[#D8A13B] outline-none rounded-sm px-4 py-2.5 text-[#F3EFE4] placeholder:text-[#9AA1AE]/50 text-sm"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            />
            {errors.password && (
              <p className="text-[#E88A7E] text-xs mt-1.5">{errors.password}</p>
            )}
          </div>

          {/* Role */}
          <div>
            <label
              className="block text-[#F3EFE4] text-sm mb-2"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              I want to join as
            </label>
            <select
              name="role"
              value={form.role}
              onChange={handleChange}
              className="w-full bg-[#14171F] border border-white/10 focus:border-[#D8A13B] outline-none rounded-sm px-4 py-2.5 text-[#F3EFE4] text-sm"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              <option value="supporter">Supporter — back campaigns (50 credits)</option>
              <option value="creator">Creator — launch campaigns (20 credits)</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#D8A13B] text-[#14171F] font-medium py-3 rounded-sm hover:bg-[#c99530] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p
          className="text-center text-[#9AA1AE] text-sm mt-6"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          Already have an account?{" "}
          <Link href="/login" className="text-[#D8A13B] hover:text-[#c99530]">
            Log in
          </Link>
        </p>
      </div>
    </main>
  );
}