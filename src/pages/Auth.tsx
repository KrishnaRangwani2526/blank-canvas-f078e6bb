import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { LogIn, Mail, Eye, EyeOff, User, Building2 } from "lucide-react";

export default function Auth() {
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState<"candidate" | "hr" | null>(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [companyName, setCompanyName] = useState("");
  const [fullName, setFullName] = useState("");

  const handleGoogleLogin = async () => {
    // Add OAuth logic if set up later
    toast("Google Auth is not fully configured.", { description: "Use email/password for now." });
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLogin && !role) {
      toast.error("Please select a role");
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        await signIn(email, password);
        toast.success("Welcome back!");
        navigate("/");
      } else {
        await signUp(email, password, role!, { fullName, companyName });
        toast.success("Account created! Check your email to verify.");
        navigate("/");
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-4">
      <div className="onboarding-card bg-card border rounded-2xl shadow-sm p-8 max-w-md w-full max-h-[95vh] overflow-y-auto animate-fade-in scrollbar-hide">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-5">
            <LogIn className="w-7 h-7 text-primary" />
          </div>
          <h1 className="text-2xl font-heading font-bold text-foreground">
            {isLogin ? "Welcome back" : "Create your account"}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {isLogin ? "Sign in to continue" : "Get started by choosing your role"}
          </p>
        </div>

        {!isLogin && (
          <div className="flex gap-3 mb-6">
            <button
              onClick={() => setRole("candidate")}
              className={`flex-1 flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                role === "candidate"
                  ? "border-primary bg-primary/5 text-primary"
                  : "border-border hover:border-muted-foreground/30 text-foreground"
              }`}
            >
              <User className="w-6 h-6" />
              <span className="text-sm font-medium">Candidate</span>
            </button>
            <button
              onClick={() => setRole("hr")}
              className={`flex-1 flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                role === "hr"
                  ? "border-primary bg-primary/5 text-primary"
                  : "border-border hover:border-muted-foreground/30 text-foreground"
              }`}
            >
              <Building2 className="w-6 h-6" />
              <span className="text-sm font-medium">Company</span>
            </button>
          </div>
        )}

        <button
          onClick={handleGoogleLogin}
          type="button"
          className="w-full flex items-center justify-center gap-3 border border-border font-medium py-3 px-6 rounded-xl hover:bg-secondary text-foreground transition-colors text-sm"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        </button>

        <div className="relative my-6 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border"></div>
          </div>
          <span className="relative bg-card px-3 text-sm text-muted-foreground z-10">or</span>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          {!isLogin && role === "hr" && (
            <div>
              <Label htmlFor="companyName" className="text-sm text-foreground/80">Company Name</Label>
              <Input
                id="companyName"
                value={companyName}
                onChange={e => setCompanyName(e.target.value)}
                className="mt-1.5 bg-background border-border"
                placeholder="Acme Inc."
                required
              />
            </div>
          )}

          {!isLogin && role === "candidate" && (
            <div>
              <Label htmlFor="fullName" className="text-sm text-foreground/80">Full Name</Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                className="mt-1.5 bg-background border-border"
                placeholder="John Doe"
                required
              />
            </div>
          )}

          <div>
            <Label htmlFor="email" className="text-sm text-foreground/80">Email</Label>
            <div className="relative mt-1.5">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="pl-10 bg-background border-border"
                placeholder="you@example.com"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="password" className="text-sm text-foreground/80">Password</Label>
            <div className="relative mt-1.5">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="pr-10 bg-background border-border"
                placeholder="••••••••"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading || (!isLogin && !role)}
            className="w-full mt-2 py-6 rounded-xl hover:opacity-90 font-semibold"
          >
            {loading ? "Please wait..." : isLogin ? "Sign In" : "Sign Up"}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-5">
          {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
          <button
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              setRole(null);
            }}
            className="text-primary font-medium hover:underline"
          >
            {isLogin ? "Sign up" : "Sign in"}
          </button>
        </p>
      </div>
    </div>
  );
}
