import PageLayout from "@/pages/PageLayout";
import { useState } from "react";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import SEO from "@/components/SEO";
import { loginUser, registerUser, verifyRegistrationCode } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";

const LoginPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [pendingVerificationEmail, setPendingVerificationEmail] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoginMode, setIsLoginMode] = useState(searchParams.get("mode") !== "signup");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setIsSubmitting(true);

      if (isLoginMode) {
        await loginUser({ email, password });
        toast({
          title: "Welcome back",
          description: "Signed in successfully.",
        });
        navigate("/");
      } else {
        await registerUser({ fullName: name, email, password });
        setPendingVerificationEmail(email);
        toast({
          title: "Verification code sent",
          description: "Check your email and enter the 6-digit code.",
        });
      }
    } catch (error) {
      toast({
        title: "Authentication failed",
        description: error instanceof Error ? error.message : "Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pendingVerificationEmail) {
      return;
    }

    try {
      setIsSubmitting(true);
      await verifyRegistrationCode({
        email: pendingVerificationEmail,
        code: verificationCode,
      });
      toast({
        title: "Account verified",
        description: "Your account is now active.",
      });
      navigate("/");
    } catch (error) {
      toast({
        title: "Verification failed",
        description: error instanceof Error ? error.message : "Invalid code.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleMode = () => {
    setPendingVerificationEmail(null);
    setVerificationCode("");
    const nextIsLogin = !isLoginMode;
    setIsLoginMode(nextIsLogin);
    setSearchParams(nextIsLogin ? {} : { mode: "signup" });
  };

  return (
    <PageLayout forceBlackNavbar={true}>
      <SEO
        title={isLoginMode ? "Sign In" : "Create Account"}
        description={isLoginMode ? "Sign in to your Frakktur account to access exclusive luxury streetwear and manage your orders." : "Create a new Frakktur account to shop premium luxury streetwear and join our community."}
        canonicalUrl="https://frakktur.com/auth/login"
      />
      <div className="pt-32 pb-24 px-6 md:px-10 min-h-[calc(100vh-200px)] flex items-center">
        <div className="w-full max-w-md mx-auto">
          <div className="mb-12">
            <h1 className="text-3xl font-light mb-2 tracking-tight">
              {isLoginMode ? "Sign In" : "Create Account"}
            </h1>
            <p className="text-muted-foreground text-sm">
              {isLoginMode
                ? "Enter your credentials to access your account"
                : "Join us and start your journey with Frakktur"}
            </p>
          </div>

          {pendingVerificationEmail ? (
            <form onSubmit={handleVerifyCode} className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Enter the 6-digit code sent to <strong>{pendingVerificationEmail}</strong>
              </p>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={verificationCode}
                onChange={(event) => setVerificationCode(event.target.value.replace(/\D/g, ""))}
                placeholder="123456"
                className="w-full border border-border bg-background px-4 py-3 text-sm outline-none focus:border-foreground/40 transition-colors rounded-sm tracking-[0.35em] text-center"
                required
              />
              <button
                type="submit"
                disabled={isSubmitting || verificationCode.length !== 6}
                className="w-full bg-foreground text-background py-3 text-sm font-normal hover:bg-foreground/90 transition-colors rounded-sm disabled:opacity-50"
              >
                {isSubmitting ? "Verifying..." : "Verify Account"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setPendingVerificationEmail(null);
                  setVerificationCode("");
                }}
                className="w-full border border-border py-3 text-sm hover:bg-secondary transition-colors rounded-sm"
              >
                Back
              </button>
            </form>
          ) : (
            <>
          {/* Google OAuth Button */}
          <button
            className="w-full border border-border hover:bg-secondary transition-colors px-4 py-3 rounded-sm mb-6 flex items-center justify-center gap-3 text-sm font-normal"
            type="button"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-5 h-5"
            >
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continue with Google
          </button>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-background text-muted-foreground">
                Or with email
              </span>
            </div>
          </div>

          {/* Email & Password Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLoginMode && (
              <div>
                <label className="block text-sm font-normal mb-2">Name</label>
                <div className="relative">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    className="w-full border border-border bg-background px-4 py-3 text-sm outline-none focus:border-foreground/40 transition-colors rounded-sm"
                    required
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-normal mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full border border-border bg-background pl-10 pr-4 py-3 text-sm outline-none focus:border-foreground/40 transition-colors rounded-sm"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-normal mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full border border-border bg-background pl-10 pr-10 py-3 text-sm outline-none focus:border-foreground/40 transition-colors rounded-sm"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {isLoginMode && (
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    className="w-4 h-4 border border-border accent-foreground"
                  />
                  <span>Remember me</span>
                </label>
                <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                  Forgot password?
                </a>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-foreground text-background py-3 text-sm font-normal hover:bg-foreground/90 transition-colors rounded-sm mt-6"
            >
              {isSubmitting ? "Please wait..." : isLoginMode ? "Sign In" : "Create Account"}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-border text-center text-sm">
            <p className="text-muted-foreground">
              {isLoginMode
                ? "Don't have an account? "
                : "Already have an account? "}
              <button
                onClick={toggleMode}
                className="text-foreground font-normal hover:opacity-70 transition-opacity"
              >
                {isLoginMode ? "Create one" : "Sign in"}
              </button>
            </p>
          </div>
            </>
          )}
        </div>
      </div>
    </PageLayout>
  );
};

export default LoginPage;
