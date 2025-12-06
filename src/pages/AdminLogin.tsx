import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Pill, Mail, Lock, ArrowLeft, Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import bcryptjs from "bcryptjs";

const AdminLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Get client IP and user agent
  const getClientInfo = async () => {
    const userAgent = navigator.userAgent;
    let ipAddress = "Unknown";
    
    try {
      const response = await fetch("https://api.ipify.org?format=json");
      const data = await response.json();
      ipAddress = data.ip;
    } catch (err) {
      console.log("Could not fetch IP address");
    }
    
    return { ipAddress, userAgent };
  };

  const logAdminLogin = async (adminId: string, email: string, status: string, failureReason?: string) => {
    const { ipAddress, userAgent } = await getClientInfo();
    
    try {
      const logData = {
        admin_id: adminId || null,
        email,
        ip_address: ipAddress,
        login_time: new Date().toISOString(),
      };
      
      console.log("Attempting to log admin login:", logData);
      
      const { data, error } = await (supabase as any)
        .from("admin_logins")
        .insert([logData])
        .select();
      
      if (error) {
        console.error("Database error while logging admin login:", {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint,
        });
      } else {
        console.log("Admin login logged successfully:", data);
      }
    } catch (err) {
      console.error("Failed to log admin login - Exception:", err);
    }
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Check admin credentials from database
      const { data: admin, error: adminError } = await (supabase as any)
        .from("admin_credentials")
        .select("id, email, password_hash, is_active")
        .eq("email", email)
        .single();

      if (adminError || !admin) {
        await logAdminLogin("", email, "failed", "Email not found");
        setError("Invalid email or password");
        setLoading(false);
        return;
      }

      if (!admin.is_active) {
        await logAdminLogin(admin.id, email, "failed", "Admin account is inactive");
        setError("Your admin account is inactive. Please contact support.");
        setLoading(false);
        return;
      }

      // Use bcrypt to compare passwords securely
      const isPasswordValid = await bcryptjs.compare(password, admin.password_hash);
      
      if (!isPasswordValid) {
        await logAdminLogin(admin.id, email, "failed", "Invalid password");
        setError("Invalid email or password");
        setLoading(false);
        return;
      }

      // Admin login successful - Log successful login
      await logAdminLogin(admin.id, email, "active");
      
      // Store admin info in localStorage
      localStorage.setItem("admin_id", admin.id);
      localStorage.setItem("admin_email", email);
      localStorage.setItem("admin_login_time", new Date().toISOString());

      // Update last login timestamp
      await (supabase as any)
        .from("admin_credentials")
        .update({ last_login: new Date().toISOString() })
        .eq("id", admin.id);

      // Redirect to admin dashboard
      navigate("/admin-dashboard");
    } catch (err: any) {
      await logAdminLogin("", email, "failed", err.message);
      setError(err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top Navigation */}
      <nav className="border-b border-border/50 px-3 sm:px-4 py-3 sm:py-4 bg-card/50">
        <div className="container mx-auto">
          <Link to="/" className="flex items-center gap-2 w-fit">
            <div className="w-8 sm:w-10 h-8 sm:h-10 rounded-xl bg-primary flex items-center justify-center">
              <Pill className="w-4 sm:w-5 h-4 sm:h-5 text-primary-foreground" />
            </div>
            <span className="text-lg sm:text-xl font-bold">MediFlow</span>
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-3 sm:px-4 py-6 sm:py-8">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-6 sm:mb-8">
            <Badge variant="secondary" className="mb-3 sm:mb-4 mx-auto text-xs sm:text-sm">
              Admin Access
            </Badge>
            <h1 className="text-2xl sm:text-3xl font-bold mb-2 sm:mb-3">Admin Login</h1>
            <p className="text-xs sm:text-sm text-muted-foreground px-2">
              Sign in to access the admin dashboard and manage the platform
            </p>
          </div>

          {/* Login Card */}
          <Card className="border-primary/10">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-lg sm:text-xl">Sign In</CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Enter your admin credentials to continue
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <form onSubmit={handleAdminLogin} className="space-y-5">
                {/* Error Alert */}
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-xs sm:text-sm">{error}</AlertDescription>
                  </Alert>
                )}

                {/* Email Field */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">
                    Email Address
                  </Label>
                  <div className="relative">
                    <Mail className="input-icon" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="admin@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="input-with-icon h-12 text-base"
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium">
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="input-icon" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="input-with-icon h-12 text-base"
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

                {/* Login Button */}
                <Button
                  type="submit"
                  className="w-full h-12 text-base font-medium mt-6"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      <span className="hidden sm:inline">Signing in...</span>
                      <span className="sm:hidden">Signing in</span>
                    </>
                  ) : (
                    <>
                      <span className="hidden sm:inline">Sign In as Admin</span>
                      <span className="sm:hidden">Sign In</span>
                    </>
                  )}
                </Button>
              </form>

              {/* Help Text */}
              <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-border/50 text-center text-xs sm:text-sm text-muted-foreground">
                <p>
                  Not an admin?{" "}
                  <Link to="/login" className="text-primary hover:underline font-medium">
                    Patient Login
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="mt-6 sm:mt-8 text-center">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-xs sm:text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              <ArrowLeft className="w-3 sm:w-4 h-3 sm:h-4" />
              <span className="hidden sm:inline">Back to Home</span>
              <span className="sm:hidden">Back</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
