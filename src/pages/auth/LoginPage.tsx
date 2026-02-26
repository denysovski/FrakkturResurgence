import PageLayout from "@/pages/PageLayout";
import { useEffect, useState } from "react";
import { Mail, Lock, Eye, EyeOff, ArrowRight, Loader2 } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import SEO from "@/components/SEO";
import { fetchCurrentUser, isAuthenticated, loginUser, registerUser } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const NAME_RE = /^[a-zA-ZÀ-ž' -]{2,120}$/;
const PASSWORD_POLICY_RE = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,72}$/;

const LoginPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoginMode, setIsLoginMode] = useState(searchParams.get("mode") !== "signup");
  const [isFormVisible, setIsFormVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsFormVisible(true), 40);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isAuthenticated()) {
      return;
    }

    let cancelled = false;

    const redirectIfSessionIsValid = async () => {
      try {
        await fetchCurrentUser();
        if (!cancelled) {
          navigate("/", { replace: true });
        }
      } catch {
      }
    };

    void redirectIfSessionIsValid();

    return () => {
      cancelled = true;
    };
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setIsSubmitting(true);

      if (isLoginMode) {
        await loginUser({ email: email.trim().toLowerCase(), password });
        toast({
          title: "Welcome back",
          description: "Signed in successfully.",
        });
        navigate("/");
      } else {
        const trimmedName = name.trim();
        const trimmedEmail = email.trim().toLowerCase();

        if (!NAME_RE.test(trimmedName)) {
          throw new Error("Name must be 2-120 characters and use only letters, spaces, apostrophes, or hyphens.");
        }

        if (!EMAIL_RE.test(trimmedEmail)) {
          throw new Error("Please enter a valid email address.");
        }

        if (!PASSWORD_POLICY_RE.test(password)) {
          throw new Error("Password must be 8-72 characters and include 1 uppercase letter, 1 number, and 1 special character.");
        }

        await registerUser({ fullName: trimmedName, email: trimmedEmail, password });
        toast({
          title: "Account created",
          description: "You are now signed in.",
        });
        navigate("/");
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

  const toggleMode = () => {
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
        <div
          className={`w-full max-w-md mx-auto transition-all duration-500 ease-out ${
            isFormVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
          }`}
        >
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

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-background text-muted-foreground">
                Continue with email
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
              {!isLoginMode && (
                <p className="mt-2 text-xs text-muted-foreground">
                  Use 8+ characters with 1 uppercase letter, 1 number, and 1 special character.
                </p>
              )}
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
              className="group w-full bg-foreground text-background py-3 text-sm font-normal hover:bg-foreground/90 transition-colors rounded-sm mt-6 disabled:opacity-70"
            >
              <span className="inline-flex items-center justify-center gap-2">
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Please wait...
                  </>
                ) : (
                  <>
                    {isLoginMode ? "Sign In" : "Create Account"}
                    <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
                  </>
                )}
              </span>
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
        </div>
      </div>
    </PageLayout>
  );
};

export default LoginPage;
