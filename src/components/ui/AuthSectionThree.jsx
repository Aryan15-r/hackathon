import { useState } from "react";
import { FlutedGlass } from "@paper-design/shaders-react";
import { Eye, EyeOff, Loader2, AlertCircle } from "lucide-react";
import { motion } from "motion/react";
import { supabase } from "../../lib/supabase";

const termsText = (
  <>
    By creating an account, you agree to our{" "}
    <a
      href="#"
      className="font-medium text-black/55 underline underline-offset-2 "
    >
      Terms of Service
    </a>{" "}
    and{" "}
    <a
      href="#"
      className="font-medium text-black/55 underline underline-offset-2 "
    >
      Privacy Policy
    </a>
  </>
);

export default function AuthSectionThree() {
  const [view, setView] = useState("signup"); // 'signup', 'signin', 'forgot-password', 'otp'
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [otp, setOtp] = useState("");

  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const clearMessages = () => {
    setError("");
    setSuccess("");
  };

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    clearMessages();
    setLoading(true);

    if (view === "signup") {
      if (!fullName.trim() || !email || !password) {
        setError("Please fill in all fields.");
        setLoading(false);
        return;
      }
      if (password.length < 6) {
        setError("Password must be at least 6 characters.");
        setLoading(false);
        return;
      }
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName },
        },
      });
      if (signUpError) {
        setError(signUpError.message);
      } else {
        setSuccess("Account created! We've sent you a verification code.");
        setView("otp");
      }
    } else if (view === "signin") {
      if (!email || !password) {
        setError("Please fill in all fields.");
        setLoading(false);
        return;
      }
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (signInError) {
        setError(signInError.message);
      }
    } else if (view === "forgot-password") {
      if (!email) {
        setError("Please enter your email.");
        setLoading(false);
        return;
      }
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        email,
        {
          redirectTo: window.location.origin,
        }
      );
      if (resetError) {
        setError(resetError.message);
      } else {
        setSuccess("Password reset email sent! Check your inbox.");
      }
    } else if (view === "otp") {
      if (!otp || !email) {
        setError("Please enter the OTP.");
        setLoading(false);
        return;
      }
      const { error: verifyError } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: "signup",
      });
      if (verifyError) {
        setError(verifyError.message);
      } else {
        setSuccess("Account verified successfully!");
        // The session will update automatically and redirect
      }
    }
    setLoading(false);
  };

  const handleGoogleSignIn = async () => {
    clearMessages();
    setGoogleLoading(true);
    const { error: googleError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin,
      },
    });
    if (googleError) {
      setError(googleError.message);
      setGoogleLoading(false);
    }
  };

  return (
    <section className="min-h-screen w-full bg-white text-[#1A1A2E] antialiased [font-synthesis:none] overflow-x-hidden">
      <div className="grid min-h-screen w-full lg:grid-cols-2">
        {/* Left Side - Auth Form */}
        <div className="flex min-h-screen w-full flex-col justify-center items-center bg-white px-6 py-10 sm:px-10 lg:px-12 xl:px-16">
          <div className="w-full max-w-[420px] mx-auto">
            <div>
              <h1 className="text-3xl font-medium tracking-tight sm:text-4xl text-black">
                {view === "signup" && "Create an account"}
                {view === "signin" && "Welcome back"}
                {view === "forgot-password" && "Reset Password"}
                {view === "otp" && "Verify Email"}
              </h1>
              <p className="mt-2 text-sm text-black/60">
                {view === "signup" && "Join StudySpace to organize your academic life."}
                {view === "signin" && "Sign in to access your dashboard."}
                {view === "forgot-password" && "Enter your email and we'll send you a link to reset your password."}
                {view === "otp" && "Enter the 6-digit code sent to your email."}
              </p>
            </div>

            {/* Social Signup Buttons (hidden in forgot-password/otp) */}
            {(view === "signup" || view === "signin") && (
              <>
                <div className="mt-8 grid gap-3 sm:grid-cols-2 sm:gap-4">
                  <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    disabled={googleLoading || loading}
                    className="flex h-11 w-full min-w-0 items-center justify-center gap-2 rounded-lg border border-black/15 bg-white px-4 text-sm font-medium text-black transition-colors hover:bg-black/[0.03] disabled:opacity-50 cursor-pointer"
                  >
                    {googleLoading ? <Loader2 className="animate-spin size-4" /> : <GoogleIcon />}
                    <span className="whitespace-nowrap">
                      {view === "signup" ? "Sign up" : "Sign in"} with Google
                    </span>
                  </button>
                  {/* Apple disabled / visual only as requested to match UI */}
                  <button
                    type="button"
                    disabled
                    className="flex h-11 w-full min-w-0 items-center justify-center gap-2 rounded-lg border border-black/15 bg-white px-4 text-sm font-medium text-black transition-colors opacity-50 cursor-not-allowed"
                  >
                    <AppleIcon />
                    <span className="whitespace-nowrap">Sign in with Apple</span>
                  </button>
                </div>

                <div className="my-6 flex items-center gap-4 text-xs font-medium text-black/40">
                  <div className="h-px flex-1 bg-black/10" />
                  or
                  <div className="h-px flex-1 bg-black/10" />
                </div>
              </>
            )}

            {/* Error / Success Messages */}
            {error && (
              <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-600">
                <AlertCircle size={16} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}
            {success && (
              <div className="mb-4 flex items-center gap-2 rounded-lg bg-green-50 p-3 text-sm text-green-600">
                <CheckIcon className="size-4 shrink-0" />
                <span>{success}</span>
              </div>
            )}

            <form onSubmit={handleEmailAuth} className="space-y-4 mt-6">
              {view === "signup" && (
                <InputField
                  label="Full name"
                  value={fullName}
                  setValue={setFullName}
                  placeholder="Aryan Sharma"
                  type="text"
                />
              )}

              {view !== "otp" && (
                <InputField
                  label="Email"
                  value={email}
                  setValue={setEmail}
                  placeholder="email@university.edu"
                  type="email"
                />
              )}

              {(view === "signup" || view === "signin") && (
                <InputField
                  label="Password"
                  value={password}
                  setValue={setPassword}
                  placeholder="Enter password"
                  type="password"
                />
              )}

              {view === "otp" && (
                <InputField
                  label="Verification Code (OTP)"
                  value={otp}
                  setValue={setOtp}
                  placeholder="123456"
                  type="text"
                />
              )}

              {view === "signin" && (
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setView("forgot-password");
                      clearMessages();
                    }}
                    className="text-xs font-medium text-black/60 hover:text-black  "
                  >
                    Forgot password?
                  </button>
                </div>
              )}

              {view === "signup" && (
                <div className="space-y-3 pt-2 text-xs leading-5 text-black/45  sm:text-[13px]">
                  <CheckboxLine>
                    I don't want to receive emails about StudySpace feature
                    updates and best practices.
                  </CheckboxLine>
                  <CheckboxLine>{termsText}</CheckboxLine>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="mt-8 flex h-11 w-full items-center justify-center gap-2 rounded-lg border border-black/40 bg-black text-sm font-medium text-white transition-colors hover:bg-black/85     disabled:opacity-70"
              >
                {loading && <Loader2 className="animate-spin size-4" />}
                {view === "signup" && "Submit"}
                {view === "signin" && "Sign In"}
                {view === "forgot-password" && "Send Reset Link"}
                {view === "otp" && "Verify"}
              </button>
            </form>

            <div className="mt-8 text-center text-sm text-black/60 ">
              {view === "signup" && (
                <>
                  Already have an account?{" "}
                  <button
                    onClick={() => {
                      setView("signin");
                      clearMessages();
                    }}
                    className="font-medium text-black  hover:underline"
                  >
                    Sign In
                  </button>
                </>
              )}
              {view === "signin" && (
                <>
                  Don't have an account?{" "}
                  <button
                    onClick={() => {
                      setView("signup");
                      clearMessages();
                    }}
                    className="font-medium text-black  hover:underline"
                  >
                    Sign Up
                  </button>
                </>
              )}
              {(view === "forgot-password" || view === "otp") && (
                <button
                  onClick={() => {
                    setView("signin");
                    clearMessages();
                  }}
                  className="font-medium text-black  hover:underline"
                >
                  Back to Sign In
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right Side - Marketing Testimonial and Mockup */}
        <div className="relative hidden lg:flex min-h-screen flex-col justify-between overflow-hidden bg-gradient-to-b from-[#1E3A5F] to-[#0d1e34] p-10 text-white xl:p-16">
          {/* Background Shader */}
          <div className="absolute inset-0 z-0 pointer-events-none opacity-40">
            <FlutedGlass
              size={0.89}
              shape="lines"
              angle={0}
              distortionShape="prism"
              distortion={0.5}
              shift={0}
              blur={0}
              edges={0.25}
              stretch={0}
              scale={1.11}
              fit="cover"
              highlights={0.1}
              shadows={0.2}
              grainMixer={0.1}
              grainOverlay={0.1}
              colorBack="#1E3A5F"
              colorHighlight="#ffffff"
              colorShadow="#0a1220"
              className="w-full h-full"
            />
          </div>

          <div className="relative z-10 w-full max-w-[500px] pt-4 lg:pt-8">
            <motion.div
              initial={{ opacity: 0, y: 12, filter: "blur(6px)" }}
              whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="flex items-center gap-4"
            >
              <img
                src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&q=80"
                alt="Student"
                className="size-11 shrink-0 rounded-full border border-white/25 object-cover shadow-sm"
              />
              <div>
                <div className="font-semibold leading-tight text-white">
                  Sarah L.
                </div>
                <div className="mt-0.5 text-xs text-white/60">
                  Computer Science Student
                </div>
              </div>
            </motion.div>
            <motion.blockquote
              initial={{ opacity: 0, y: 18, filter: "blur(8px)" }}
              whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              viewport={{ once: true }}
              transition={{
                duration: 0.8,
                delay: 0.12,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="mt-6 text-2xl font-light leading-snug tracking-tight text-white/95 lg:text-[28px] xl:text-[32px]"
            >
              “StudySpace consolidates everything I need. I stopped switching between Notion, ChatGPT, and Discord.”
            </motion.blockquote>
          </div>

          {/* Cleanly contained, responsive mockup with no negative overflow */}
          <div className="relative z-10 mt-8 w-full max-w-[540px] overflow-hidden rounded-2xl border border-white/15 bg-black/60 p-2 shadow-2xl backdrop-blur-xl">
            <motion.div
              initial={{ opacity: 0, y: 30, filter: "blur(8px)" }}
              whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              viewport={{ once: true }}
              transition={{
                duration: 0.8,
                delay: 0.15,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="overflow-hidden rounded-xl border border-white/10 bg-black"
            >
              <div className="flex items-center gap-1.5 border-b border-white/10 bg-black/50 px-4 py-3 select-none">
                <div className="size-2 rounded-full bg-white/35" />
                <div className="size-2 rounded-full bg-white/25" />
                <div className="size-2 rounded-full bg-white/15" />
                <span className="ml-4 text-[9px] font-mono tracking-wider text-white/40">
                  studyspace.app/dashboard
                </span>
              </div>
              <img
                src="https://images.unsplash.com/photo-1555099962-4199c345e5dd?q=80&w=2070&auto=format&fit=crop"
                alt="StudySpace Dashboard Mockup"
                className="h-56 lg:h-64 xl:h-72 w-full object-cover object-top opacity-95"
              />
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

function InputField({
  label,
  placeholder,
  type = "text",
  value,
  setValue,
}) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="space-y-1.5 text-left w-full">
      <label className="text-xs font-semibold text-black/70 block">
        {label}
      </label>
      <div
        className="relative flex h-11 items-center rounded-lg border border-black/15 bg-white focus-within:border-black/50 transition-colors"
        style={{ paddingLeft: '0.85rem', paddingRight: '0.85rem' }}
      >
        <input
          type={
            type === "password" ? (showPassword ? "text" : "password") : type
          }
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-transparent text-sm text-black outline-none placeholder:text-black/40"
          style={{ paddingLeft: '0.25rem', paddingRight: type === 'password' ? '2.5rem' : '0.25rem' }}
        />
        {type === "password" && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3.5 text-black/40 hover:text-black cursor-pointer transition-colors"
          >
            {showPassword ? (
              <EyeOff className="size-4" />
            ) : (
              <Eye className="size-4" />
            )}
          </button>
        )}
      </div>
    </div>
  );
}

function CheckboxLine({ children }) {
  return (
    <label className="flex items-start gap-3 cursor-pointer">
      <span className="relative mt-1 size-3.5 shrink-0">
        <input
          type="checkbox"
          className="peer size-full cursor-pointer appearance-none rounded-[3px] border border-black/25 bg-white checked:border-black checked:bg-black    "
        />
        <svg
          viewBox="0 0 12 12"
          className="pointer-events-none absolute inset-0 hidden size-full p-0.5 text-white peer-checked:block "
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M3 6.2 5 8.1 9 3.9"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      <span>{children}</span>
    </label>
  );
}

function CheckIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="shrink-0"
    >
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09Z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23Z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84Z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84C6.71 7.3 9.14 5.38 12 5.38Z"
        fill="#EB4335"
      />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className="shrink-0"
    >
      <path d="M17.05 12.54c-.03-3.02 2.47-4.47 2.58-4.54-1.41-2.06-3.6-2.34-4.38-2.37-1.86-.19-3.64 1.1-4.58 1.1-.95 0-2.42-1.07-3.98-1.04-2.05.03-3.94 1.19-4.99 3.02-2.13 3.69-.54 9.16 1.53 12.15 1.01 1.46 2.22 3.1 3.81 3.04 1.53-.06 2.11-.99 3.96-.99s2.37.99 3.99.96c1.65-.03 2.69-1.49 3.69-2.96 1.16-1.69 1.64-3.33 1.66-3.41-.04-.02-3.2-1.23-3.24-4.87ZM14.03 3.66c.84-1.02 1.41-2.43 1.25-3.84-1.21.05-2.68.81-3.55 1.83-.78.9-1.46 2.34-1.28 3.72 1.35.1 2.73-.69 3.58-1.71Z" />
    </svg>
  );
}
