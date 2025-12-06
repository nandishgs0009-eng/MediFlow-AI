import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Pill, 
  Clock, 
  Bell, 
  BarChart3, 
  Shield, 
  Smartphone,
  CheckCircle2,
  ArrowRight,
  Heart,
  Calendar,
  Users
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const Landing = () => {
  const { user } = useAuth();
  const features = [
    {
      icon: Pill,
      title: "MediFlow (Medication Tracking)",
      description: "Never miss a dose with intelligent scheduling and reminders for all your medications."
    },
    {
      icon: Clock,
      title: "Smart Scheduling",
      description: "Set up complex medication schedules with ease, including multiple daily doses."
    },
    {
      icon: Bell,
      title: "Timely Reminders",
      description: "Get notified at the right time to take your medications, every single time."
    },
    {
      icon: BarChart3,
      title: "Adherence Analytics",
      description: "Track your medication adherence over time with beautiful charts and insights."
    },
    {
      icon: Shield,
      title: "Secure & Private",
      description: "Your health data is encrypted and protected with enterprise-grade security."
    },
    {
      icon: Smartphone,
      title: "Access Anywhere",
      description: "Manage your medications from any device, anytime, anywhere in the world."
    }
  ];

  const stats = [
    { value: "99.9%", label: "Uptime" },
    { value: "50K+", label: "Active Users" },
    { value: "2M+", label: "Doses Tracked" },
    { value: "4.9★", label: "User Rating" }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation - Mobile optimized */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/50">
        <div className="container mx-auto px-4 sm:px-6 md:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center flex-shrink-0">
              <Pill className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="hidden sm:inline text-lg md:text-xl font-bold">MediFlow</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <Link to="/dashboard">
                <Button variant="hero" size="default">Go to Dashboard</Button>
              </Link>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" size="default">Sign In</Button>
                </Link>
                <Link to="/admin-login">
                  <Button variant="outline" size="default">Admin</Button>
                </Link>
                <Link to="/signup">
                  <Button variant="hero" size="default">Get Started</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden flex items-center gap-1 sm:gap-2">
            {user ? (
              <Link to="/dashboard">
                <Button variant="hero" size="sm">Dashboard</Button>
              </Link>
            ) : (
              <>
                <Link to="/admin-login">
                  <Button variant="outline" size="sm" className="text-xs sm:text-sm px-2 sm:px-3">Admin</Button>
                </Link>
                <Link to="/signup">
                  <Button variant="hero" size="sm">Start</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section - Mobile optimized */}
      <section className="pt-20 sm:pt-24 md:pt-32 pb-12 sm:pb-16 md:pb-20 px-4 sm:px-6 md:px-8 overflow-hidden">
        <div className="container mx-auto max-w-7xl">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="secondary" className="mb-4 sm:mb-6 px-3 sm:px-4 py-1.5 text-xs sm:text-sm inline-flex items-center gap-1.5">
              <Heart className="w-3 h-3 sm:w-3.5 h-3.5 text-destructive" />
              Trusted by 50,000+ patients
            </Badge>
            
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-4 sm:mb-6 lg:mb-8 leading-tight">
              Your Health,{" "}
              <span className="gradient-text">Simplified</span>
            </h1>
            
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-8 sm:mb-10 max-w-2xl mx-auto leading-relaxed">
              The smart medication tracker that helps you stay on top of your health. 
              Never miss a dose again with intelligent reminders and beautiful insights.
            </p>
            
            {/* CTA Buttons - Stack on mobile */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <Link to="/signup" className="w-full sm:w-auto">
                <Button variant="hero" size="xl" className="w-full sm:w-auto">
                  Start Free Trial
                  <ArrowRight className="w-4 h-4 sm:w-5 h-5 ml-1.5 sm:ml-2" />
                </Button>
              </Link>
              <Button variant="outline" size="xl" className="w-full sm:w-auto">
                Watch Demo
              </Button>
            </div>
          </div>

          {/* Hero Visual - Responsive card layout */}
          <div className="mt-8 sm:mt-12 md:mt-16 relative">
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10 pointer-events-none" />
            <div className="relative mx-auto max-w-5xl px-2 sm:px-4">
              <Card variant="glass" className="p-4 sm:p-6 md:p-8 animate-slide-up">
                {/* Responsive grid: 1 col mobile, 2 col tablet, 3 col desktop */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
                  {/* Today's Schedule Preview */}
                  <Card variant="elevated" className="p-4 sm:p-5 md:p-6">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                      <div className="w-9 h-9 sm:w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Calendar className="w-4 h-4 sm:w-5 h-5 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-sm sm:text-base">Today's Schedule</p>
                        <p className="text-xs sm:text-sm text-muted-foreground">3 medications</p>
                      </div>
                    </div>
                    <div className="space-y-2 sm:space-y-3">
                      {[
                        { name: "Vitamin D", time: "8:00 AM", status: "taken" },
                        { name: "Metformin", time: "12:00 PM", status: "pending" },
                        { name: "Aspirin", time: "8:00 PM", status: "pending" }
                      ].map((med, i) => (
                        <div key={i} className="flex items-center justify-between p-2 sm:p-3 rounded-lg bg-secondary/50 text-xs sm:text-sm">
                          <div className="flex items-center gap-2 min-w-0">
                            <div className={`w-2 h-2 flex-shrink-0 rounded-full ${med.status === 'taken' ? 'bg-success' : 'bg-warning'}`} />
                            <span className="font-medium truncate">{med.name}</span>
                          </div>
                          <span className="text-muted-foreground whitespace-nowrap ml-2">{med.time}</span>
                        </div>
                      ))}
                    </div>
                  </Card>

                  {/* Adherence Score */}
                  <Card variant="elevated" className="p-4 sm:p-5 md:p-6">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                      <div className="w-9 h-9 sm:w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center flex-shrink-0">
                        <BarChart3 className="w-4 h-4 sm:w-5 h-5 text-success" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-sm sm:text-base">Adherence Score</p>
                        <p className="text-xs sm:text-sm text-muted-foreground">This week</p>
                      </div>
                    </div>
                    <div className="text-center py-3 sm:py-4">
                      <div className="text-4xl sm:text-5xl font-bold text-success mb-1 sm:mb-2">94%</div>
                      <p className="text-xs sm:text-sm text-muted-foreground">Excellent! Keep it up!</p>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground px-1">
                      <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
                    </div>
                    <div className="flex justify-between mt-2 gap-0.5 sm:gap-1">
                      {[95, 100, 90, 100, 85, 95, 92].map((val, i) => (
                        <div key={i} className="flex-1 bg-secondary rounded-full h-12 sm:h-16 relative overflow-hidden">
                          <div 
                            className="absolute bottom-0 left-0 right-0 bg-success/70 rounded-full transition-all"
                            style={{ height: `${val}%` }}
                          />
                        </div>
                      ))}
                    </div>
                  </Card>

                  {/* Quick Actions */}
                  <Card variant="elevated" className="p-4 sm:p-5 md:p-6">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                      <div className="w-9 h-9 sm:w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                        <Bell className="w-4 h-4 sm:w-5 h-5 text-accent" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-sm sm:text-base">Notifications</p>
                        <p className="text-xs sm:text-sm text-muted-foreground">2 unread</p>
                      </div>
                    </div>
                    <div className="space-y-2 sm:space-y-3">
                      <div className="p-2 sm:p-3 rounded-lg bg-accent/10 border border-accent/20">
                        <p className="text-xs sm:text-sm font-medium">Time for Metformin</p>
                        <p className="text-xs text-muted-foreground">Scheduled for 12:00 PM</p>
                      </div>
                      <div className="p-2 sm:p-3 rounded-lg bg-secondary/50">
                        <p className="text-xs sm:text-sm font-medium">Refill Reminder</p>
                        <p className="text-xs text-muted-foreground">Aspirin - 5 pills left</p>
                      </div>
                    </div>
                    <Button variant="accent" className="w-full mt-3 sm:mt-4" size="sm">
                      <CheckCircle2 className="w-3 h-3 sm:w-4 h-4 mr-2" />
                      Mark as Taken
                    </Button>
                  </Card>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section - Mobile optimized */}
      <section className="py-12 sm:py-16 md:py-20 bg-secondary/30 px-4 sm:px-6 md:px-8">
        <div className="container mx-auto max-w-7xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
            {stats.map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-primary mb-1 sm:mb-2">{stat.value}</div>
                <div className="text-xs sm:text-sm md:text-base text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section - Mobile optimized */}
      <section className="py-12 sm:py-16 md:py-24 px-4 sm:px-6 md:px-8">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-8 sm:mb-12 md:mb-16">
            <Badge variant="secondary" className="mb-3 sm:mb-4 text-xs sm:text-sm">Features</Badge>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 md:mb-6">Everything you need to stay healthy</h2>
            <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Powerful features designed to make medication management effortless and stress-free.
            </p>
          </div>
          {/* Responsive grid: 1 col mobile, 2 col tablet, 3 col desktop */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            {features.map((feature, i) => (
              <Card key={i} variant="interactive" className="p-4 sm:p-6 md:p-8">
                <div className="w-10 h-10 sm:w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-3 sm:mb-4">
                  <feature.icon className="w-5 h-5 sm:w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold mb-2 md:mb-3">{feature.title}</h3>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section - Mobile optimized */}
      <section className="py-12 sm:py-16 md:py-24 px-4 sm:px-6 md:px-8">
        <div className="container mx-auto max-w-7xl">
          <Card variant="glass" className="p-6 sm:p-10 md:p-12 md:p-16 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
            <div className="relative z-10">
              <div className="w-12 h-12 sm:w-16 h-16 rounded-2xl bg-primary mx-auto flex items-center justify-center mb-4 sm:mb-6">
                <Users className="w-6 h-6 sm:w-8 h-8 text-primary-foreground" />
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 md:mb-6">Ready to take control of your health?</h2>
              <p className="text-sm sm:text-base md:text-lg text-muted-foreground mb-6 sm:mb-8 md:mb-10 max-w-xl mx-auto leading-relaxed">
                Join thousands of users who trust MediFlow to manage their medications and improve their health outcomes.
              </p>
              <Link to="/signup" className="inline-block">
                <Button variant="hero" size="xl" className="text-base sm:text-lg md:text-base">
                  Get Started for Free
                  <ArrowRight className="w-4 h-4 sm:w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </section>

      {/* Footer - Mobile optimized */}
      <footer className="py-8 sm:py-10 md:py-12 px-4 sm:px-6 md:px-8 border-t border-border/50">
        <div className="container mx-auto max-w-7xl">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-center sm:text-left">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
                <Pill className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-semibold text-sm sm:text-base">MediFlow</span>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground">
              © 2025 MediFlow. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
