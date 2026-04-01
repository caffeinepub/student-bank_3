import { CreditCard, Lock, ShieldCheck, User } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "../hooks/useAuth";

export default function LoginPage() {
  const { login } = useAuth();
  const [loginType, setLoginType] = useState<"admin" | "user">("user");
  const [accountNumber, setAccountNumber] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showAdminTab, setShowAdminTab] = useState(false);
  const tapCountRef = useRef(0);
  const tapTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleLogotap = () => {
    tapCountRef.current += 1;
    if (tapTimerRef.current) clearTimeout(tapTimerRef.current);
    tapTimerRef.current = setTimeout(() => {
      tapCountRef.current = 0;
    }, 2000);
    if (tapCountRef.current >= 5) {
      tapCountRef.current = 0;
      setShowAdminTab(true);
      setLoginType("admin");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      if (loginType === "admin") {
        if (!accountNumber.trim() || !password.trim()) {
          setError("Username आणि Password टाका");
          setIsLoading(false);
          return;
        }
        const success = await login(
          accountNumber.trim(),
          password.trim(),
          "admin",
        );
        if (!success) {
          setError("चुकीचे Username किंवा Password. कृपया तपासा.");
        } else {
          toast.success("Admin म्हणून यशस्वीरित्या login झालात!");
        }
      } else {
        if (!accountNumber.trim()) {
          setError("खाते क्रमांक टाका");
          setIsLoading(false);
          return;
        }
        const success = await login(
          accountNumber.trim(),
          password.trim(),
          "user",
        );
        if (!success) {
          setError("खाते क्रमांक किंवा पासवर्ड चुकीचे आहे.");
        } else {
          toast.success("यशस्वीरित्या login झालात!");
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(`Login अयशस्वी: ${msg}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{
        background:
          "linear-gradient(135deg, oklch(0.18 0.08 240) 0%, oklch(0.25 0.1 200) 40%, oklch(0.20 0.08 175) 70%, oklch(0.15 0.06 250) 100%)",
      }}
    >
      {/* Decorative blobs */}
      <div
        className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-20 blur-3xl"
        style={{
          background:
            "radial-gradient(circle, oklch(0.62 0.18 145), transparent)",
        }}
      />
      <div
        className="absolute bottom-0 left-0 w-80 h-80 rounded-full opacity-20 blur-3xl"
        style={{
          background:
            "radial-gradient(circle, oklch(0.62 0.16 195), transparent)",
        }}
      />
      <div
        className="absolute top-1/2 left-1/4 w-64 h-64 rounded-full opacity-10 blur-3xl"
        style={{
          background:
            "radial-gradient(circle, oklch(0.78 0.2 55), transparent)",
        }}
      />

      <div className="w-full max-w-sm relative z-10">
        {/* Logo / Header */}
        <div className="text-center mb-7">
          <button
            type="button"
            onClick={handleLogotap}
            className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-4 shadow-2xl cursor-pointer select-none border-0 p-0"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.62 0.18 145), oklch(0.48 0.14 215))",
            }}
            aria-label="Logo"
          >
            <img
              src="/assets/generated/bank-logo.dim_256x256.png"
              alt="Bank Logo"
              className="w-12 h-12 object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
                (e.target as HTMLImageElement).parentElement!.innerHTML =
                  '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="14" x="2" y="7" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>';
              }}
            />
          </button>
          <h1 className="text-3xl font-bold text-white font-heading drop-shadow">
            विद्यार्थी बँक
          </h1>
          <p className="text-white/60 mt-1 text-sm">
            Student Bank Management System
          </p>
        </div>

        {/* Card */}
        <div
          className="rounded-3xl shadow-2xl p-7 border border-white/10"
          style={{
            background: "rgba(255,255,255,0.07)",
            backdropFilter: "blur(20px)",
          }}
        >
          {/* Tab Toggle — only visible after secret admin unlock */}
          {showAdminTab && (
            <div
              className="flex rounded-xl p-1 mb-6"
              style={{ background: "rgba(255,255,255,0.08)" }}
            >
              <button
                type="button"
                onClick={() => {
                  setLoginType("admin");
                  setError("");
                }}
                data-ocid="login.admin.tab"
                className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                  loginType === "admin"
                    ? "text-white shadow-lg"
                    : "text-white/50 hover:text-white/80"
                }`}
                style={
                  loginType === "admin"
                    ? {
                        background:
                          "linear-gradient(135deg, oklch(0.42 0.14 175), oklch(0.35 0.12 195))",
                      }
                    : {}
                }
              >
                <Lock className="w-3.5 h-3.5" />
                Admin
              </button>
              <button
                type="button"
                onClick={() => {
                  setLoginType("user");
                  setError("");
                }}
                data-ocid="login.user.tab"
                className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                  loginType === "user"
                    ? "text-white shadow-lg"
                    : "text-white/50 hover:text-white/80"
                }`}
                style={
                  loginType === "user"
                    ? {
                        background:
                          "linear-gradient(135deg, oklch(0.72 0.18 55), oklch(0.60 0.20 35))",
                      }
                    : {}
                }
              >
                <User className="w-3.5 h-3.5" />
                विद्यार्थी
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {loginType === "user" && (
              <>
                <div>
                  <label
                    htmlFor="accountNumber"
                    className="block text-sm font-semibold text-white/80 mb-1.5"
                  >
                    खाते क्रमांक
                  </label>
                  <div className="relative">
                    <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                    <input
                      id="accountNumber"
                      type="text"
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                      placeholder="खाते क्रमांक टाका"
                      className="w-full pl-10 pr-4 py-3 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:ring-2 text-sm"
                      style={
                        {
                          background: "rgba(255,255,255,0.1)",
                          border: "1px solid rgba(255,255,255,0.15)",
                          focusRingColor: "oklch(0.62 0.18 145)",
                        } as React.CSSProperties
                      }
                    />
                  </div>
                </div>
                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-semibold text-white/80 mb-1.5"
                  >
                    पासवर्ड (खाते क्रमांक)
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                    <input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="पासवर्ड टाका"
                      className="w-full pl-10 pr-4 py-3 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:ring-2 text-sm"
                      style={{
                        background: "rgba(255,255,255,0.1)",
                        border: "1px solid rgba(255,255,255,0.15)",
                      }}
                    />
                  </div>
                </div>
              </>
            )}

            {loginType === "admin" && (
              <>
                <div>
                  <label
                    htmlFor="adminUsername"
                    className="block text-sm font-semibold text-white/80 mb-1.5"
                  >
                    Username
                  </label>
                  <div className="relative">
                    <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                    <input
                      id="adminUsername"
                      type="text"
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                      placeholder="admin"
                      className="w-full pl-10 pr-4 py-3 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:ring-2 text-sm"
                      style={{
                        background: "rgba(255,255,255,0.1)",
                        border: "1px solid rgba(255,255,255,0.15)",
                      }}
                    />
                  </div>
                </div>
                <div>
                  <label
                    htmlFor="adminPassword"
                    className="block text-sm font-semibold text-white/80 mb-1.5"
                  >
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                    <input
                      id="adminPassword"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••"
                      className="w-full pl-10 pr-4 py-3 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:ring-2 text-sm"
                      style={{
                        background: "rgba(255,255,255,0.1)",
                        border: "1px solid rgba(255,255,255,0.15)",
                      }}
                    />
                  </div>
                </div>
              </>
            )}

            {error && (
              <div
                className="rounded-xl px-4 py-3 text-sm text-white border"
                style={{
                  background: "rgba(220,50,50,0.15)",
                  borderColor: "rgba(220,50,50,0.3)",
                }}
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-xl text-white font-bold text-sm transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg"
              style={{
                background:
                  loginType === "admin"
                    ? "linear-gradient(135deg, oklch(0.42 0.14 175), oklch(0.55 0.16 195))"
                    : "linear-gradient(135deg, oklch(0.72 0.18 55), oklch(0.60 0.20 35))",
              }}
            >
              {isLoading && (
                <svg
                  aria-hidden="true"
                  className="animate-spin h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8H4z"
                  />
                </svg>
              )}
              {isLoading ? "Login होत आहे..." : "Login करा"}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-white/30 mt-6">
          vaibhavgavali · © {new Date().getFullYear()} विद्यार्थी बँक
        </p>
      </div>
    </div>
  );
}
