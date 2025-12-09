import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Pill,
  Plus,
  Bell,
  Calendar,
  CheckCircle2,
  Clock,
  TrendingUp,
  AlertCircle,
  ChevronRight,
  ChevronDown,
  LogOut,
  User,
  Settings,
  BarChart3,
  Home,
  Stethoscope,
  FileText,
  Menu,
  X,
  Loader2,
  Heart,
  FileCheck,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { supabase } from "@/integrations/supabase/client";
import { AIRecommendationDemo } from "@/components/AIRecommendationDemo";
import "@/styles/mobile-responsive.css";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

// Empty initial state - users start with no medications
const Dashboard = () => {
  const { toast } = useToast();
  const { profile, user, signOut } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalTreatments: 0,
    totalMedicines: 0,
    takenToday: 0,
    pendingToday: 0,
    lowStockMedicines: 0,
    totalStock: 0,
  });
  const [todaysMedicines, setTodaysMedicines] = useState<any[]>([]);
  const [intakeLogs, setIntakeLogs] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [dailyMedicationData, setDailyMedicationData] = useState<any[]>([]);
  const [weeklyAdherenceData, setWeeklyAdherenceData] = useState<any[]>([
    { day: "Mon", adherence: 0 },
    { day: "Tue", adherence: 0 },
    { day: "Wed", adherence: 0 },
    { day: "Thu", adherence: 0 },
    { day: "Fri", adherence: 0 },
    { day: "Sat", adherence: 0 },
    { day: "Sun", adherence: 0 },
  ]);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [reminderAlert, setReminderAlert] = useState<any | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [displayTime, setDisplayTime] = useState(new Date());
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [isPlayingSound, setIsPlayingSound] = useState(false);

  // Initialize audio context
  useEffect(() => {
    const initAudio = () => {
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        setAudioContext(audioCtx);
      } catch (error) {
        console.warn("AudioContext not available:", error);
      }
    };
    
    initAudio();
  }, []);

  // Update display time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setDisplayTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  // Fetch statistics from backend
  useEffect(() => {
    if (user?.id) {
      fetchStatistics();
    }
  }, [user?.id]);

  // Refresh data when user returns to the page
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && user?.id) {
        // Page became visible, refresh the data
        fetchStatistics();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [user?.id]);

  // Real-time clock and reminder checking
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setCurrentTime(now);
      
      // Check for medicine reminders
      checkMedicineReminders(now);
    }, 10000); // Check every 10 seconds for more frequent checks

    return () => clearInterval(interval);
  }, [todaysMedicines, intakeLogs]);

  // Handle service worker messages for background alarms
  const confirmMedicineTakenFromNotification = async (messageData: any) => {
    try {
      if (!user?.id) {
        throw new Error("User not authenticated");
      }

      const { medicineId, medicineName, dosage, time } = messageData;
      
      if (!medicineId) {
        throw new Error("Medicine ID not provided");
      }

      // Fetch medicine stock directly from database
      const { data: medicineData, error: fetchError } = await supabase
        .from("medicines")
        .select("id, stock")
        .eq("id", medicineId)
        .single();

      if (fetchError || !medicineData) {
        throw new Error("Failed to fetch medicine details");
      }

      // Check if medicine has stock
      if (medicineData.stock === null || medicineData.stock === undefined || medicineData.stock === 0) {
        toast({
          title: "⚠️ Out of Stock",
          description: `${medicineName} has no stock available. Please add stock before marking as taken.`,
          variant: "destructive",
        });
        return;
      }

      // Properly convert schedule_time (HH:MM format) to today's timestamp
      const todayAtScheduledTime = new Date();
      const [hours, minutes] = time.split(':');
      todayAtScheduledTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      const scheduleTime = todayAtScheduledTime.toISOString();

      console.log('Confirming medicine from notification:', {
        medicineId,
        medicineName,
        dosage,
        time,
        scheduleTime,
        userId: user.id,
        stock: medicineData.stock,
      });

      const { data, error } = await supabase
        .from("intake_logs")
        .insert([
          {
            medicine_id: medicineId,
            user_id: user.id,
            scheduled_time: scheduleTime,
            taken_time: new Date().toISOString(),
            status: "taken",
          },
        ]);

      if (error) {
        console.error("Database error:", error);
        throw error;
      }

      // Update stock
      if (medicineData.stock > 0) {
        await supabase
          .from("medicines")
          .update({ stock: medicineData.stock - 1 })
          .eq("id", medicineId);
      }

      console.log('Medicine marked as taken successfully:', data);
      setIsPlayingSound(false);
      setReminderAlert(null);
      
      toast({
        title: "✓ Medication Logged",
        description: `${medicineName} marked as taken`,
      });

      fetchStatistics();
    } catch (error) {
      console.error("Error logging medication:", error);
      toast({
        title: "Error",
        description: (error as any).message || "Failed to log medication",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      const handleMessage = (event: any) => {
        console.log('Message from service worker:', event.data);
        
        if (event.data.type === 'PLAY_ALARM_SOUND') {
          playAlertSound();
        } else if (event.data.type === 'CONFIRM_TAKEN') {
          console.log('Confirming medicine taken from notification');
          confirmMedicineTakenFromNotification(event.data);
        } else if (event.data.type === 'DISMISS_ALARM') {
          console.log('Dismissing alarm');
          handleSkipReminder();
        }
      };

      navigator.serviceWorker.addEventListener('message', handleMessage);
      
      return () => {
        navigator.serviceWorker.removeEventListener('message', handleMessage);
      };
    }
  }, [user?.id]);

  const playAlertSound = () => {
    if (!audioContext) return;

    try {
      const ctx = audioContext;
      const now = ctx.currentTime;
      
      // Create a much louder alert sound with multiple oscillators for a siren effect
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      osc1.connect(gainNode);
      osc2.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      // First oscillator - main siren sound
      osc1.type = "square"; // Square wave for louder, more attention-grabbing sound
      osc1.frequency.setValueAtTime(900, now);
      osc1.frequency.exponentialRampToValueAtTime(1200, now + 0.2);
      osc1.frequency.exponentialRampToValueAtTime(900, now + 0.4);
      
      // Second oscillator - harmonic
      osc2.type = "sine";
      osc2.frequency.setValueAtTime(600, now);
      osc2.frequency.exponentialRampToValueAtTime(800, now + 0.2);
      osc2.frequency.exponentialRampToValueAtTime(600, now + 0.4);
      
      // Much louder volume
      gainNode.gain.setValueAtTime(0.6, now); // Increased from 0.3
      gainNode.gain.setValueAtTime(0.5, now + 0.4);
      
      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.5);
      osc2.stop(now + 0.5);
    } catch (error) {
      console.warn("Could not play sound:", error);
    }
  };

  // Play alert sound repeatedly while reminder is active
  useEffect(() => {
    if (reminderAlert && !isPlayingSound && audioContext) {
      setIsPlayingSound(true);
      const soundInterval = setInterval(() => {
        playAlertSound();
      }, 1000); // Play sound every 1 second (more frequent and continuous)
      
      return () => {
        setIsPlayingSound(false);
        clearInterval(soundInterval);
      };
    }
  }, [reminderAlert, audioContext]);

  const checkMedicineReminders = (now: Date) => {
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTimeStr = `${String(currentHour).padStart(2, '0')}:${String(currentMinute).padStart(2, '0')}`;

    // Check each medicine
    for (const medicine of todaysMedicines) {
      // Skip if already taken
      const alreadyTaken = intakeLogs.some(
        (log) => log.medicine_id === medicine.id && log.status === "taken"
      );
      
      if (alreadyTaken) continue;

      // Check if it's time to take the medicine (within 5 minute window)
      const scheduleTime = medicine.schedule_time; // HH:MM format
      const scheduledMinutes = parseInt(scheduleTime.split(":")[0]) * 60 + parseInt(scheduleTime.split(":")[1]);
      const currentMinutes = currentHour * 60 + currentMinute;
      
      // Show reminder if within 5 minute window and not already shown
      if (Math.abs(currentMinutes - scheduledMinutes) <= 5 && !reminderAlert) {
        const medicineData = {
          id: medicine.id,
          name: medicine.name,
          dosage: medicine.dosage,
          frequency: medicine.frequency,
          time: medicine.schedule_time, // Store schedule_time as is (HH:MM format)
          instructions: medicine.instructions,
        };
        
        setReminderAlert(medicineData);
        
        // Also notify service worker for background notifications
        if ('serviceWorker' in navigator) {
          navigator.serviceWorker.ready.then(registration => {
            if (registration.active) {
              registration.active.postMessage({
                type: 'START_ALARM',
                medicine: medicineData,
                time: medicine.schedule_time // Use schedule_time (HH:MM format)
              });
            }
          });
        }
        
        break;
      }
    }
  };

  const handleConfirmTaken = async () => {
    if (!reminderAlert || !user?.id) return;

    try {
      // Fetch medicine stock directly from database
      const { data: medicineData, error: fetchError } = await supabase
        .from("medicines")
        .select("id, stock")
        .eq("id", reminderAlert.id)
        .single();

      if (fetchError || !medicineData) {
        throw new Error("Failed to fetch medicine details");
      }

      // Check if medicine has stock
      if (medicineData.stock === null || medicineData.stock === undefined || medicineData.stock === 0) {
        toast({
          title: "⚠️ Out of Stock",
          description: `${reminderAlert.name} has no stock available. Please add stock before marking as taken.`,
          variant: "destructive",
        });
        return;
      }

      // Properly convert schedule_time (HH:MM format) to today's timestamp
      const todayAtScheduledTime = new Date();
      const [hours, minutes] = reminderAlert.time.split(':');
      todayAtScheduledTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      const scheduleTime = todayAtScheduledTime.toISOString();

      console.log("handleConfirmTaken - Logging medication:", {
        medicine_id: reminderAlert.id,
        user_id: user.id,
        scheduled_time: scheduleTime,
        taken_time: new Date().toISOString(),
        status: "taken",
        stock: medicineData.stock,
      });

      const { error } = await supabase
        .from("intake_logs")
        .insert([
          {
            medicine_id: reminderAlert.id,
            user_id: user.id,
            scheduled_time: scheduleTime,
            taken_time: new Date().toISOString(),
            status: "taken",
          },
        ]);

      if (error) throw error;

      // Update stock
      if (medicineData.stock && medicineData.stock > 0) {
        await supabase
          .from("medicines")
          .update({ stock: medicineData.stock - 1 })
          .eq("id", reminderAlert.id);
      }
      if (reminderAlert.stock && reminderAlert.stock > 0) {
        await supabase
          .from("medicines")
          .update({ stock: reminderAlert.stock - 1 })
          .eq("id", reminderAlert.id);
      }

      // Stop the alert sound
      setIsPlayingSound(false);

      // Notify service worker to stop alarm
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.ready.then(registration => {
          if (registration.active) {
            registration.active.postMessage({
              type: 'STOP_ALARM',
              medicineId: reminderAlert.id
            });
          }
        });
      }

      toast({
        title: "✓ Medication Logged",
        description: `${reminderAlert.name} marked as taken`,
      });

      setReminderAlert(null);
      fetchStatistics(); // Refresh stats
    } catch (error) {
      console.error("Error logging medication:", error);
      toast({
        title: "Error",
        description: "Failed to log medication",
        variant: "destructive",
      });
    }
  };

  const handleSkipReminder = () => {
    setIsPlayingSound(false);
    
    // Notify service worker to stop alarm
    if (reminderAlert && 'serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(registration => {
        if (registration.active) {
          registration.active.postMessage({
            type: 'STOP_ALARM',
            medicineId: reminderAlert.id
          });
        }
      });
    }
    
    setReminderAlert(null);
  };

  const fetchStatistics = async () => {
    try {
      setLoading(true);

      // Fetch treatments
      const { data: treatments, error: treatmentsError } = await supabase
        .from("treatments")
        .select("*")
        .eq("patient_id", user?.id);

      if (treatmentsError) throw treatmentsError;

      // Fetch medicines
      const { data: medicines, error: medicinesError } = await supabase
        .from("medicines")
        .select("*")
        .in(
          "treatment_id",
          treatments?.map((t) => t.id) || []
        );

      if (medicinesError && treatments && treatments.length > 0) {
        throw medicinesError;
      }

      // Fetch today's intake logs
      const today = new Date().toISOString().split("T")[0];
      const { data: logs, error: logsError } = await supabase
        .from("intake_logs")
        .select("*")
        .eq("user_id", user?.id)
        .gte("taken_time", `${today}T00:00:00`)
        .lte("taken_time", `${today}T23:59:59`);

      if (logsError) throw logsError;

      // Fetch past 7 days of intake logs for weekly adherence
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const sevenDaysAgoStr = sevenDaysAgo.toISOString().split("T")[0];

      const { data: weeklyLogs, error: weeklyLogsError } = await supabase
        .from("intake_logs")
        .select("*")
        .eq("user_id", user?.id)
        .gte("taken_time", `${sevenDaysAgoStr}T00:00:00`)
        .lte("taken_time", `${today}T23:59:59`);

      if (weeklyLogsError) throw weeklyLogsError;

      // Calculate statistics
      const totalMedicines = medicines?.length || 0;
      
      // Count unique medicines that have been taken today (not duplicate logs)
      const takenMedicineIds = new Set(
        logs
          ?.filter((log) => log.status === "taken")
          .map((log) => log.medicine_id) || []
      );
      const takenToday = takenMedicineIds.size;
      const pendingToday = totalMedicines - takenToday;
      
      console.log("📊 Dashboard Statistics Debug:", {
        totalMedicines,
        takenToday,
        pendingToday,
        logsCount: logs?.length,
        takenMedicineIds: Array.from(takenMedicineIds),
        allLogs: logs?.map(log => ({ id: log.id, medicine_id: log.medicine_id, status: log.status, time: log.taken_time })),
      });
      
      const lowStockMedicines = medicines?.filter((m) => m.stock && m.stock < 5).length || 0;
      const totalStock = medicines?.reduce((sum, m) => sum + (m.stock || 0), 0) || 0;

      // Fetch today's notifications
      const { data: notificationsData, error: notificationsError } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false })
        .limit(10);

      if (!notificationsError && notificationsData) {
        setNotifications(notificationsData);
      }

      setStats({
        totalTreatments: treatments?.length || 0,
        totalMedicines,
        takenToday,
        pendingToday,
        lowStockMedicines,
        totalStock,
      });

      // Calculate weekly adherence data from past 7 days
      const weeklyAdherenceMap = new Map<string, { day: string; taken: number; total: number }>();
      const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

      // Initialize map for each day of the week
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split("T")[0];
        const dayName = dayNames[date.getDay()];
        weeklyAdherenceMap.set(dateStr, { day: dayName, taken: 0, total: 0 });
      }

      // Count taken and total for each day
      weeklyLogs?.forEach((log) => {
        const dateStr = log.taken_time.split("T")[0];
        const dayData = weeklyAdherenceMap.get(dateStr);
        if (dayData) {
          dayData.total += 1;
          if (log.status === "taken") {
            dayData.taken += 1;
          }
        }
      });

      // Calculate adherence percentage for each day
      const weeklyData = Array.from(weeklyAdherenceMap.values()).map((dayData) => ({
        day: dayData.day,
        adherence: dayData.total > 0 ? Math.round((dayData.taken / dayData.total) * 100) : 0,
      }));

      setWeeklyAdherenceData(weeklyData);

      // Calculate daily medication data for today
      const todayDate = new Date().toISOString().split("T")[0];
      const takenCount = logs?.filter((log) => log.status === "taken").length || 0;
      
      // Pending = medicines not yet logged or marked as pending
      const loggedMedicineIds = new Set(logs?.map((log) => log.medicine_id) || []);
      const totalMedicinesToday = medicines?.length || 0;
      const pendingCount = totalMedicinesToday - takenCount;

      // Log for debugging
      console.log("Daily Medication Status Debug:", {
        todayDate,
        totalMedicines: totalMedicinesToday,
        takenCount,
        pendingCount,
        logsCount: logs?.length,
        loggedMedicineIds: loggedMedicineIds.size,
      });

      const dailyData = [
        {
          date: todayDate,
          taken: takenCount,
          pending: pendingCount,
          name: "Today",
        },
      ];
      setDailyMedicationData(dailyData);

      // Store medicines and logs for display
      setTodaysMedicines(medicines || []);
      setIntakeLogs(logs || []);
    } catch (error) {
      console.error("Error fetching statistics:", error);
      toast({
        title: "Error",
        description: "Failed to load statistics",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const displayName = profile?.full_name || "User";

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-card border-r border-border/50 transition-all duration-300 flex flex-col fixed left-0 top-0 h-screen`}>
        {/* Logo */}
        <div className="p-6 border-b border-border/50 flex items-center justify-between">
          {sidebarOpen && (
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                <Pill className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-bold text-lg">MediFlow</span>
            </Link>
          )}
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="ml-auto"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          <div className={`text-xs font-semibold text-muted-foreground ${sidebarOpen ? 'px-3 mb-3' : 'hidden'}`}>
            MAIN
          </div>
          
          <Link to="/dashboard" className="flex items-center gap-3 px-3 py-3 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
            <Home className="w-5 h-5 flex-shrink-0" />
            {sidebarOpen && <span className="font-medium">Dashboard</span>}
          </Link>

          <div className={`text-xs font-semibold text-muted-foreground ${sidebarOpen ? 'px-3 mt-6 mb-3' : 'hidden'}`}>
            MENU
          </div>

          <Link to="/mytreatments" className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-muted-foreground hover:bg-secondary/50 transition-colors">
            <Stethoscope className="w-5 h-5 flex-shrink-0" />
            {sidebarOpen && <span>My Treatments</span>}
          </Link>

          <Link to="/history" className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-muted-foreground hover:bg-secondary/50 transition-colors">
            <Clock className="w-5 h-5 flex-shrink-0" />
            {sidebarOpen && <span>History</span>}
          </Link>

          <Link to="/recovery-reports" className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-muted-foreground hover:bg-secondary/50 transition-colors">
            <FileText className="w-5 h-5 flex-shrink-0" />
            {sidebarOpen && <span>Recovery Reports</span>}
          </Link>

          <div className={`text-xs font-semibold text-muted-foreground ${sidebarOpen ? 'px-3 mt-6 mb-3' : 'hidden'}`}>
            SETTINGS
          </div>

          {/* Settings Dropdown */}
          <div className="w-full">
            <button 
              onClick={() => setSettingsOpen(!settingsOpen)}
              className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-muted-foreground hover:bg-secondary/50 transition-colors"
            >
              <Settings className="w-5 h-5 flex-shrink-0" />
              {sidebarOpen && (
                <>
                  <span>Settings</span>
                  <ChevronDown 
                    className={`w-4 h-4 ml-auto transition-transform ${settingsOpen ? 'rotate-180' : ''}`} 
                  />
                </>
              )}
            </button>

            {/* Settings Submenu */}
            {settingsOpen && sidebarOpen && (
              <div className="mt-2 space-y-1 pl-4">
                <Link to="/profile" className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-muted-foreground hover:bg-secondary/50 transition-colors text-sm">
                  <User className="w-4 h-4 flex-shrink-0" />
                  <span>Profile</span>
                </Link>
                <Link to="/notifications" className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-muted-foreground hover:bg-secondary/50 transition-colors text-sm">
                  <Bell className="w-4 h-4 flex-shrink-0" />
                  <span>Notifications</span>
                </Link>
                <Link to="/medical-records" className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-muted-foreground hover:bg-secondary/50 transition-colors text-sm">
                  <FileCheck className="w-4 h-4 flex-shrink-0" />
                  <span>Medical Records</span>
                </Link>
                <Link to="/health-summary" className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-muted-foreground hover:bg-secondary/50 transition-colors text-sm">
                  <Heart className="w-4 h-4 flex-shrink-0" />
                  <span>Health Summary</span>
                </Link>
              </div>
            )}
          </div>
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-border/50">
          <Button 
            variant="ghost" 
            className="w-full justify-start gap-3" 
            onClick={handleSignOut}
          >
            <LogOut className="w-5 h-5" />
            {sidebarOpen && <span>Logout</span>}
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 ${sidebarOpen ? 'ml-64' : 'ml-20'} transition-all duration-300`}>
        {/* Top Bar */}
        <nav className="sticky top-0 z-40 bg-card/80 backdrop-blur-lg border-b border-border/50 px-4 sm:px-6 md:px-8 py-3 sm:py-4 flex items-center justify-between gap-2 sm:gap-4">
          <div className="min-w-0">
            <h2 className="text-lg sm:text-2xl font-bold truncate">Dashboard</h2>
            <p className="text-xs sm:text-sm text-muted-foreground line-clamp-1">Overview of your medication and health statistics</p>
          </div>
          <div className="flex items-center gap-2 sm:gap-4 md:gap-6 flex-shrink-0">
            {/* 12-Hour Time Display - Compact with Seconds - Now Visible on Mobile */}
            <div className="flex items-center gap-1 sm:gap-2 px-2 sm:px-5 py-1 sm:py-1.5 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800 backdrop-blur-sm">
              <div className="flex flex-col items-start">
                <div className="text-[10px] sm:text-xs font-medium text-blue-600 dark:text-blue-400 hidden sm:block">Current Time</div>
                <div className="flex items-center gap-0.5 sm:gap-1">
                  <div className="text-xs sm:text-base md:text-lg font-bold text-blue-600 dark:text-blue-400 font-mono">
                    {(displayTime.getHours() % 12 || 12).toString().padStart(2, '0')}:
                    {displayTime.getMinutes().toString().padStart(2, '0')}
                    <span className="hidden sm:inline">:{displayTime.getSeconds().toString().padStart(2, '0')}</span>
                  </div>
                  <div className="text-[10px] sm:text-xs font-semibold text-blue-600 dark:text-blue-400">
                    {displayTime.getHours() >= 12 ? 'PM' : 'AM'}
                  </div>
                </div>
              </div>
              <div className="w-px h-6 sm:h-8 bg-blue-200 dark:bg-blue-800 hidden sm:block" />
              <div className="text-[10px] sm:text-xs font-semibold text-blue-700 dark:text-blue-300 hidden sm:block">
                {displayTime.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </div>
            </div>

            {/* Notification Bell */}
            <Button variant="ghost" size="icon" className="relative flex-shrink-0">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-accent rounded-full" />
            </Button>
          </div>
        </nav>

        {/* Content */}
        <div className="p-4 sm:p-6 md:p-8">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
                <p className="text-muted-foreground">Loading statistics...</p>
              </div>
            </div>
          ) : (
            <>
              {/* Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
                {/* Total Medicines */}
                <Card className="bg-gradient-to-br from-purple-500 to-purple-600 border-0 text-white p-4 sm:p-5 lg:p-6">
                  <div className="flex items-center justify-between mb-3 sm:mb-4 lg:mb-5">
                    <Pill className="w-5 sm:w-6 lg:w-7 h-5 sm:h-6 lg:h-7 opacity-80" />
                    <span className="text-lg sm:text-xl lg:text-2xl">💊</span>
                  </div>
                  <p className="text-xs sm:text-sm opacity-90 mb-2 sm:mb-3">Total Medicines</p>
                  <p className="text-2xl sm:text-3xl lg:text-4xl font-bold">{stats.totalMedicines}</p>
                </Card>

                {/* Active Treatments */}
                <Card className="bg-gradient-to-br from-blue-500 to-blue-600 border-0 text-white p-4 sm:p-5 lg:p-6">
                  <div className="flex items-center justify-between mb-3 sm:mb-4 lg:mb-5">
                    <Stethoscope className="w-5 sm:w-6 lg:w-7 h-5 sm:h-6 lg:h-7 opacity-80" />
                    <span className="text-lg sm:text-xl lg:text-2xl">🏥</span>
                  </div>
                  <p className="text-xs sm:text-sm opacity-90 mb-2 sm:mb-3">Active Treatments</p>
                  <p className="text-2xl sm:text-3xl lg:text-4xl font-bold">{stats.totalTreatments}</p>
                </Card>

                {/* Taken Today */}
                <Card className="bg-gradient-to-br from-green-500 to-green-600 border-0 text-white p-4 sm:p-5 lg:p-6">
                  <div className="flex items-center justify-between mb-3 sm:mb-4 lg:mb-5">
                    <CheckCircle2 className="w-5 sm:w-6 lg:w-7 h-5 sm:h-6 lg:h-7 opacity-80" />
                    <span className="text-lg sm:text-xl lg:text-2xl">✓</span>
                  </div>
                  <p className="text-xs sm:text-sm opacity-90 mb-2 sm:mb-3">Taken Today</p>
                  <p className="text-2xl sm:text-3xl lg:text-4xl font-bold">
                    {stats.takenToday}/{stats.totalMedicines}
                  </p>
                </Card>

                {/* Pending Tablets */}
                <Card className="bg-gradient-to-br from-orange-500 to-orange-600 border-0 text-white p-4 sm:p-5 lg:p-6">
                  <div className="flex items-center justify-between mb-3 sm:mb-4 lg:mb-5">
                    <Clock className="w-5 sm:w-6 lg:w-7 h-5 sm:h-6 lg:h-7 opacity-80" />
                    <span className="text-lg sm:text-xl lg:text-2xl">⏱️</span>
                  </div>
                  <p className="text-xs sm:text-sm opacity-90 mb-2 sm:mb-3">Pending</p>
                  <p className="text-2xl sm:text-3xl lg:text-4xl font-bold">{stats.pendingToday}</p>
                </Card>
              </div>

              {/* Low Stock and Total Stock Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
                {/* Low Stock Alert */}
                <Card className="bg-gradient-to-br from-red-500 to-red-600 border-0 text-white p-4 sm:p-5 lg:p-6">
                  <div className="flex items-center justify-between mb-3 sm:mb-4 lg:mb-5">
                    <AlertCircle className="w-5 sm:w-6 lg:w-7 h-5 sm:h-6 lg:h-7 opacity-80" />
                    <span className="text-lg sm:text-xl lg:text-2xl">⚠️</span>
                  </div>
                  <p className="text-xs sm:text-sm opacity-90 mb-2 sm:mb-3">Low Stock Items</p>
                  <p className="text-2xl sm:text-3xl lg:text-4xl font-bold">{stats.lowStockMedicines}</p>
                  <p className="text-xs opacity-75 mt-2 sm:mt-3">Medicines with less than 5 tablets</p>
                </Card>

                {/* Total Stock */}
                <Card className="bg-gradient-to-br from-indigo-500 to-indigo-600 border-0 text-white p-4 sm:p-5 lg:p-6">
                  <div className="flex items-center justify-between mb-3 sm:mb-4 lg:mb-5">
                    <TrendingUp className="w-5 sm:w-6 lg:w-7 h-5 sm:h-6 lg:h-7 opacity-80" />
                    <span className="text-lg sm:text-xl lg:text-2xl">📊</span>
                  </div>
                  <p className="text-xs sm:text-sm opacity-90 mb-2 sm:mb-3">Total Stock</p>
                  <p className="text-2xl sm:text-3xl lg:text-4xl font-bold">{stats.totalStock}</p>
                  <p className="text-xs opacity-75 mt-2 sm:mt-3">tablets available</p>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
              {/* Today's Schedule */}
              <div className="lg:col-span-2">
                <Card variant="elevated">
                  <CardHeader className="pb-3 sm:pb-4 lg:pb-5 p-4 sm:p-5 lg:p-6">
                    <div>
                      <CardTitle className="text-base sm:text-lg lg:text-xl">Today's Schedule</CardTitle>
                      <CardDescription className="text-xs sm:text-sm">Your medications for today</CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 sm:p-5 lg:p-6">
                    {stats.totalMedicines === 0 ? (
                      <div className="flex flex-col items-center justify-center py-8 sm:py-12 text-center">
                        <div className="w-14 sm:w-16 h-14 sm:h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-3 sm:mb-4">
                          <Pill className="w-6 sm:w-8 h-6 sm:h-8 text-primary" />
                        </div>
                        <h3 className="text-base sm:text-lg font-semibold mb-2">No medications added yet</h3>
                        <p className="text-xs sm:text-sm text-muted-foreground mb-4 sm:mb-6">Start by adding your first medication to track your health</p>
                        <Link to="/mytreatments">
                          <Button variant="default" className="gap-2 text-xs sm:text-sm h-9 sm:h-10">
                            <Plus className="w-4 h-4" />
                            Add Your First Medication
                          </Button>
                        </Link>
                      </div>
                    ) : (
                      <div className="space-y-3 sm:space-y-4">
                        {todaysMedicines.map((medicine) => {
                          const isTaken = intakeLogs.some(
                            (log) => log.medicine_id === medicine.id && log.status === "taken"
                          );
                          return (
                            <div
                              key={medicine.id}
                              className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 lg:p-5 rounded-lg border border-border/50 bg-secondary/20 hover:bg-secondary/40 transition-colors gap-2 sm:gap-3"
                            >
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1.5 sm:mb-2 flex-wrap">
                                  <p className="font-semibold text-sm sm:text-base">
                                    {medicine.name}
                                  </p>
                                  <Badge variant="outline" className="text-xs whitespace-nowrap">
                                    {medicine.frequency}
                                  </Badge>
                                </div>
                                <p className="text-xs sm:text-sm text-muted-foreground mb-1">
                                  <Clock className="w-3 h-3 inline mr-1" />
                                  {medicine.schedule_time} • Dosage: {medicine.dosage}
                                </p>
                                {medicine.instructions && (
                                  <p className="text-xs text-muted-foreground italic">
                                    {medicine.instructions}
                                  </p>
                                )}
                              </div>
                              <div className="flex-shrink-0">
                                {isTaken ? (
                                  <div className="flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-full bg-green-500/20 text-green-700 dark:text-green-400 whitespace-nowrap text-xs sm:text-sm font-semibold">
                                    <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                                    <span>Taken</span>
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-full bg-orange-500/20 text-orange-700 dark:text-orange-400 whitespace-nowrap text-xs sm:text-sm font-semibold">
                                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                    <span>Pending</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Adherence Chart */}
                <Card variant="elevated" className="mt-4 sm:mt-6 lg:mt-8">
                  <CardHeader className="pb-2 sm:pb-3 lg:pb-4 p-4 sm:p-5 lg:p-6">
                    <CardTitle className="text-base sm:text-lg lg:text-xl flex items-center gap-2">
                      <BarChart3 className="w-5 sm:w-5 h-5 sm:h-5 text-primary" />
                      Weekly Adherence
                    </CardTitle>
                    <CardDescription className="text-xs sm:text-sm">Your medication adherence over the past week</CardDescription>
                  </CardHeader>
                  <CardContent className="p-2 sm:p-3 lg:p-4">
                    <div className="h-48 sm:h-56 lg:h-64 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={weeklyAdherenceData}>
                          <defs>
                        <linearGradient id="adherenceGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} domain={[0, 100]} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                        formatter={(value: number) => [`${value}%`, "Adherence"]}
                      />
                      <Area
                        type="monotone"
                        dataKey="adherence"
                        stroke="hsl(var(--primary))"
                        strokeWidth={2}
                        fill="url(#adherenceGradient)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                {/* Daily Medication Status Chart */}
                <Card variant="elevated" className="mt-4 sm:mt-6 lg:mt-8">
                  <CardHeader className="pb-2 sm:pb-3 lg:pb-4 p-4 sm:p-5 lg:p-6">
                    <CardTitle className="text-base sm:text-lg lg:text-xl flex items-center gap-2">
                      <BarChart3 className="w-5 sm:w-5 h-5 sm:h-5 text-primary" />
                      Daily Medication Status
                    </CardTitle>
                    <CardDescription className="text-xs sm:text-sm">Medicines taken vs pending today</CardDescription>
                  </CardHeader>
                  <CardContent className="p-2 sm:p-3 lg:p-4">
                    <div className="h-48 sm:h-56 lg:h-64 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={dailyMedicationData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                          <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                          <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "hsl(var(--card))",
                              border: "1px solid hsl(var(--border))",
                              borderRadius: "8px",
                            }}
                          />
                          <Legend />
                          <Bar dataKey="taken" stackId="a" fill="#10b981" name="Taken" />
                          <Bar dataKey="pending" stackId="a" fill="#f59e0b" name="Pending" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Right Sidebar */}
              <div className="space-y-4 sm:space-y-6 lg:space-y-8">
                {/* Progress Card */}
                <Card variant="glass" className="p-4 sm:p-5 lg:p-6">
                  <div className="text-center mb-4 sm:mb-5 lg:mb-6">
                    <div className="relative inline-flex items-center justify-center mb-4">
                      <svg className="w-32 sm:w-28 lg:w-32 h-32 sm:h-28 lg:h-32 transform -rotate-90">
                        <circle
                          cx="64"
                          cy="64"
                          r="56"
                          stroke="hsl(var(--muted))"
                          strokeWidth="8"
                          fill="none"
                        />
                        <circle
                          cx="64"
                          cy="64"
                          r="56"
                          stroke="hsl(var(--primary))"
                          strokeWidth="8"
                          fill="none"
                          strokeDasharray={`${stats.totalMedicines > 0 ? (stats.takenToday / stats.totalMedicines) * 352 : 0} 352`}
                          strokeLinecap="round"
                          className="transition-all duration-500"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-3xl sm:text-3xl lg:text-4xl font-bold text-primary">
                          {stats.totalMedicines > 0 ? Math.round((stats.takenToday / stats.totalMedicines) * 100) : 0}%
                        </span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-lg sm:text-lg lg:text-xl font-semibold">Today's Progress</p>
                      <p className="text-sm sm:text-sm lg:text-base text-muted-foreground">
                        {stats.takenToday} of {stats.totalMedicines} medications taken
                      </p>
                    </div>
                  </div>
                  <Progress 
                    value={stats.totalMedicines > 0 ? (stats.takenToday / stats.totalMedicines) * 100 : 0} 
                    className="h-3 sm:h-2 lg:h-3 rounded-full" 
                  />
                </Card>

            {/* Notifications */}
            <Card variant="elevated">
              <CardHeader className="pb-2 sm:pb-3 p-4 sm:p-5 lg:p-6">
                <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                  <Bell className="w-5 h-5 text-accent" />
                  Notifications
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-5 lg:p-6">
                {notifications.length === 0 ? (
                  <div className="text-center py-6 sm:py-8">
                    <p className="text-xs sm:text-sm text-muted-foreground">No new notifications</p>
                  </div>
                ) : (
                  notifications.map((notif) => {
                    const notificationTime = new Date(notif.created_at || notif.scheduled_for);
                    const timeString = notificationTime.toLocaleTimeString('en-US', { 
                      hour: '2-digit', 
                      minute: '2-digit',
                      hour12: true 
                    });
                    
                    return (
                      <div
                        key={notif.id}
                        className={`p-3 sm:p-4 rounded-lg border text-xs sm:text-sm ${
                          notif.type === "reminder"
                            ? "bg-blue-500/5 border-blue-500/20"
                            : notif.type === "warning"
                            ? "bg-orange-500/5 border-orange-500/20"
                            : "bg-green-500/5 border-green-500/20"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                          <p className="font-semibold text-xs sm:text-sm">{notif.title}</p>
                          <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">{timeString}</span>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2">{notif.message}</p>
                      </div>
                    );
                  })
                )}
                <Button variant="ghost" className="w-full gap-2 text-xs sm:text-sm h-9 sm:h-10 mt-2 sm:mt-3" size="sm">
                  View all notifications
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card variant="flat" className="p-4 sm:p-5 lg:p-6">
              <p className="text-xs sm:text-sm font-semibold mb-3 sm:mb-4">Quick Actions</p>
              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                <Button variant="secondary" size="sm" className="justify-start text-xs sm:text-sm h-9 sm:h-10">
                  <Plus className="w-4 h-4 mr-2 flex-shrink-0" />
                  <span className="hidden sm:inline">Add Med</span>
                  <span className="sm:hidden">Add</span>
                </Button>
                <Button variant="secondary" size="sm" className="justify-start text-xs sm:text-sm h-9 sm:h-10">
                  <Calendar className="w-4 h-4 mr-2 flex-shrink-0" />
                  <span className="hidden sm:inline">Schedule</span>
                  <span className="sm:hidden">Plan</span>
                </Button>
                <Button variant="secondary" size="sm" className="justify-start text-xs sm:text-sm h-9 sm:h-10">
                  <BarChart3 className="w-4 h-4 mr-2 flex-shrink-0" />
                  <span className="hidden sm:inline">Reports</span>
                  <span className="sm:hidden">Report</span>
                </Button>
                <Button variant="secondary" size="sm" className="justify-start text-xs sm:text-sm h-9 sm:h-10">
                  <User className="w-4 h-4 mr-2 flex-shrink-0" />
                  <span>Profile</span>
                </Button>
              </div>
            </Card>

            {/* AI Recommendation Demo */}
            <AIRecommendationDemo />
              </div>
            </div>

            {/* Medicine Reminder Alert Dialog */}
            <AlertDialog open={reminderAlert !== null} onOpenChange={(open) => {
              if (!open) handleSkipReminder();
            }}>
              <AlertDialogContent className={isPlayingSound ? 'ring-4 ring-red-500/50' : ''}>
                <AlertDialogHeader>
                  <AlertDialogTitle className="flex flex-col items-center gap-3 text-sm sm:text-base lg:text-lg py-2">
                    <Bell className={`w-6 sm:w-7 h-6 sm:h-7 text-red-500 flex-shrink-0 ${isPlayingSound ? 'animate-bounce' : ''}`} />
                    <span className="text-center text-base sm:text-lg font-bold">🚨 Time to Take Your Medicine! 🚨</span>
                    {isPlayingSound && <span className="text-xs sm:text-sm bg-red-500 text-white px-3 py-1 rounded-full font-bold animate-pulse">ALARM</span>}
                  </AlertDialogTitle>
                </AlertDialogHeader>
                
                {reminderAlert && (
                  <div className="space-y-3 sm:space-y-4">
                    {/* Alert Pulsing Animation - only when sound is playing */}
                    {isPlayingSound && (
                      <div className="relative h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-red-500 via-orange-500 to-red-500 rounded-full animate-pulse" />
                      </div>
                    )}

                    {/* Large Medicine Details */}
                    <div className={`p-3 sm:p-4 lg:p-5 rounded-lg border-2 transition-all text-center ${
                      isPlayingSound 
                        ? 'bg-red-50 dark:bg-red-950 border-red-300 dark:border-red-700' 
                        : 'bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border-blue-300 dark:border-blue-700'
                    }`}>
                      <h3 className={`font-bold text-base sm:text-lg lg:text-xl mb-2 sm:mb-3 ${
                        isPlayingSound 
                          ? 'text-red-900 dark:text-red-100' 
                          : 'text-blue-900 dark:text-blue-100'
                      }`}>
                        💊 {reminderAlert.name}
                      </h3>
                      <p className={`text-xs sm:text-sm lg:text-base font-semibold ${
                        isPlayingSound 
                          ? 'text-red-700 dark:text-red-300' 
                          : 'text-blue-700 dark:text-blue-300'
                      }`}>
                        Dosage: <span className="text-sm sm:text-base lg:text-lg">{reminderAlert.dosage}</span>
                      </p>
                    </div>

                    {/* Time and Frequency - Large and Prominent */}
                    <div className="grid grid-cols-2 gap-2 sm:gap-3">
                      <div className={`p-3 sm:p-4 lg:p-5 rounded-lg border-2 flex flex-col items-center justify-center ${
                        isPlayingSound 
                          ? 'bg-red-100 dark:bg-red-900 border-red-300' 
                          : 'bg-blue-100 dark:bg-blue-900 border-blue-300'
                      }`}>
                        <Clock className={`w-5 sm:w-6 h-5 sm:h-6 mb-1.5 sm:mb-2 ${isPlayingSound ? 'text-red-600' : 'text-blue-600'}`} />
                        <p className="text-xs sm:text-sm font-bold hidden sm:block mb-0.5">Scheduled</p>
                        <p className={`font-bold text-base sm:text-lg lg:text-xl ${isPlayingSound ? 'text-red-700' : 'text-blue-700'}`}>
                          {reminderAlert.time}
                        </p>
                      </div>
                      <div className={`p-3 sm:p-4 lg:p-5 rounded-lg border-2 flex flex-col items-center justify-center ${
                        isPlayingSound 
                          ? 'bg-red-100 dark:bg-red-900 border-red-300' 
                          : 'bg-blue-100 dark:bg-blue-900 border-blue-300'
                      }`}>
                        <Pill className={`w-5 sm:w-6 h-5 sm:h-6 mb-1.5 sm:mb-2 ${isPlayingSound ? 'text-red-600' : 'text-blue-600'}`} />
                        <p className="text-xs sm:text-sm font-bold hidden sm:block mb-0.5">Frequency</p>
                        <p className={`font-bold text-base sm:text-lg lg:text-xl ${isPlayingSound ? 'text-red-700' : 'text-blue-700'}`}>
                          {reminderAlert.frequency}
                        </p>
                      </div>
                    </div>

                    {/* Instructions if available */}
                    {reminderAlert.instructions && (
                      <div className="bg-amber-50 dark:bg-amber-950 p-3 sm:p-4 lg:p-5 rounded-lg border-2 border-amber-300 dark:border-amber-700">
                        <p className="text-xs sm:text-sm font-bold text-amber-900 dark:text-amber-100 mb-1.5 sm:mb-2">
                          📋 INSTRUCTIONS:
                        </p>
                        <p className="text-xs sm:text-sm lg:text-base font-semibold text-amber-800 dark:text-amber-200">
                          {reminderAlert.instructions}
                        </p>
                      </div>
                    )}

                    {/* Alert Status Message - Bold and Prominent */}
                    {isPlayingSound && (
                      <div className="bg-red-500 dark:bg-red-600 border-2 border-red-700 p-2 sm:p-3 lg:p-4 rounded-lg animate-pulse">
                        <p className="text-xs sm:text-sm lg:text-base font-bold text-white text-center">
                          ⚠️ ALARM IS ACTIVE - CONFIRM TO STOP! ⚠️
                        </p>
                      </div>
                    )}
                  </div>
                )}

                <AlertDialogFooter className="gap-2 sm:gap-3 mt-4 sm:mt-5 lg:mt-6 flex-col sm:flex-row">
                  <AlertDialogCancel 
                    className={`flex-1 text-xs sm:text-sm font-bold h-9 sm:h-10 lg:h-11 ${
                      isPlayingSound 
                        ? 'opacity-50 cursor-not-allowed' 
                        : ''
                    }`}
                    disabled={isPlayingSound}
                  >
                    {isPlayingSound ? '❌ Cannot Dismiss' : '❌ Dismiss'}
                  </AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={handleConfirmTaken}
                    className={`flex-1 text-xs sm:text-sm lg:text-base font-bold h-9 sm:h-10 lg:h-11 text-white transition-all flex items-center justify-center gap-2 ${
                      isPlayingSound 
                        ? 'bg-red-600 hover:bg-red-700 animate-pulse' 
                        : 'bg-green-600 hover:bg-green-700'
                    }`}
                  >
                    <CheckCircle2 className="w-4 sm:w-5 h-4 sm:h-5 flex-shrink-0" />
                    <span>{isPlayingSound ? '🛑 STOP & CONFIRM' : '✅ Confirm'}</span>
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
