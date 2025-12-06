import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Pill,
  Home,
  Stethoscope,
  FileText,
  Menu,
  X,
  Clock,
  LogOut,
  Settings,
  ChevronDown,
  User,
  Heart,
  FileCheck,
  Bell,
  Download,
  Eye,
  Trash2,
  Upload,
  Calendar,
  File,
  AlertCircle,
  Search,
  Filter,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { useToast } from "@/hooks/use-toast";
import "@/styles/mobile-responsive.css";

interface MedicalRecord {
  id: string;
  title: string;
  type: "lab_report" | "scan" | "prescription" | "diagnosis" | "other";
  date: string;
  doctor: string;
  description: string;
  fileUrl?: string;
  fileName?: string;
}

const MedicalRecords = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Mock medical records
  const [records, setRecords] = useState<MedicalRecord[]>([
    {
      id: "1",
      title: "Blood Test Report",
      type: "lab_report",
      date: "2025-11-20",
      doctor: "Dr. Priya Sharma",
      description: "Routine blood work including CBC, lipid panel, and glucose levels",
      fileName: "blood_test_nov_2025.pdf",
    },
    {
      id: "2",
      title: "Chest X-Ray",
      type: "scan",
      date: "2025-11-15",
      doctor: "Dr. Rajesh Kumar",
      description: "Chest X-ray for routine checkup - No abnormalities detected",
      fileName: "chest_xray_nov_2025.pdf",
    },
    {
      id: "3",
      title: "Prescription - Hypertension",
      type: "prescription",
      date: "2025-11-10",
      doctor: "Dr. Amit Patel",
      description: "Prescribed medications for blood pressure management",
      fileName: "prescription_nov_2025.pdf",
    },
    {
      id: "4",
      title: "Diabetes Diagnosis Report",
      type: "diagnosis",
      date: "2025-10-05",
      doctor: "Dr. Neha Gupta",
      description: "Diabetes Type 2 diagnosis with initial treatment plan",
      fileName: "diabetes_report_oct_2025.pdf",
    },
    {
      id: "5",
      title: "Thyroid Function Test",
      type: "lab_report",
      date: "2025-09-28",
      doctor: "Dr. Vikram Singh",
      description: "TSH and T3/T4 levels within normal range",
      fileName: "thyroid_test_sept_2025.pdf",
    },
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const handleDeleteRecord = (id: string) => {
    setRecords((prev) => prev.filter((record) => record.id !== id));
    toast({
      title: "Deleted",
      description: "Medical record has been removed.",
    });
  };

  const handleDownload = (record: MedicalRecord) => {
    toast({
      title: "Download Started",
      description: `Downloading ${record.fileName}...`,
    });
  };

  const handleUpload = () => {
    toast({
      title: "Coming Soon",
      description: "File upload feature will be available soon.",
    });
  };

  const getRecordIcon = (type: string) => {
    switch (type) {
      case "lab_report":
        return <FileCheck className="w-5 h-5 text-blue-500" />;
      case "scan":
        return <Eye className="w-5 h-5 text-purple-500" />;
      case "prescription":
        return <Pill className="w-5 h-5 text-green-500" />;
      case "diagnosis":
        return <AlertCircle className="w-5 h-5 text-orange-500" />;
      default:
        return <File className="w-5 h-5 text-gray-500" />;
    }
  };

  const getRecordTypeBadge = (type: string) => {
    switch (type) {
      case "lab_report":
        return <Badge className="bg-blue-500/20 text-blue-700 border-blue-500/20">Lab Report</Badge>;
      case "scan":
        return <Badge className="bg-purple-500/20 text-purple-700 border-purple-500/20">Scan</Badge>;
      case "prescription":
        return <Badge className="bg-green-500/20 text-green-700 border-green-500/20">Prescription</Badge>;
      case "diagnosis":
        return <Badge className="bg-orange-500/20 text-orange-700 border-orange-500/20">Diagnosis</Badge>;
      default:
        return <Badge variant="outline">Other</Badge>;
    }
  };

  const filteredRecords = records.filter((record) => {
    const matchesSearch =
      record.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.doctor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = selectedType === "all" || record.type === selectedType;

    return matchesSearch && matchesType;
  });

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "w-64" : "w-20"
        } ${isMobile && !sidebarOpen ? '-translate-x-full' : ''} bg-card border-r border-border/50 transition-all duration-300 flex flex-col fixed left-0 top-0 h-screen z-40`}
      >
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
          <div
            className={`text-xs font-semibold text-muted-foreground ${
              sidebarOpen ? "px-3 mb-3" : "hidden"
            }`}
          >
            MAIN
          </div>

          <Link
            to="/dashboard"
            className="flex items-center gap-3 px-3 py-3 rounded-lg text-muted-foreground hover:bg-secondary/50 transition-colors"
          >
            <Home className="w-5 h-5 flex-shrink-0" />
            {sidebarOpen && <span className="font-medium">Dashboard</span>}
          </Link>

          <div
            className={`text-xs font-semibold text-muted-foreground ${
              sidebarOpen ? "px-3 mt-6 mb-3" : "hidden"
            }`}
          >
            MENU
          </div>

          <Link
            to="/mytreatments"
            className="flex items-center gap-3 px-3 py-3 rounded-lg text-muted-foreground hover:bg-secondary/50 transition-colors"
          >
            <Stethoscope className="w-5 h-5 flex-shrink-0" />
            {sidebarOpen && <span>My Treatments</span>}
          </Link>

          <Link
            to="/history"
            className="flex items-center gap-3 px-3 py-3 rounded-lg text-muted-foreground hover:bg-secondary/50 transition-colors"
          >
            <Clock className="w-5 h-5 flex-shrink-0" />
            {sidebarOpen && <span>History</span>}
          </Link>

          <Link
            to="/recovery-reports"
            className="flex items-center gap-3 px-3 py-3 rounded-lg text-muted-foreground hover:bg-secondary/50 transition-colors"
          >
            <FileText className="w-5 h-5 flex-shrink-0" />
            {sidebarOpen && <span>Recovery Reports</span>}
          </Link>

          <div
            className={`text-xs font-semibold text-muted-foreground ${
              sidebarOpen ? "px-3 mt-6 mb-3" : "hidden"
            }`}
          >
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
                    className={`w-4 h-4 ml-auto transition-transform ${
                      settingsOpen ? "rotate-180" : ""
                    }`}
                  />
                </>
              )}
            </button>

            {/* Settings Submenu */}
            {settingsOpen && sidebarOpen && (
              <div className="mt-2 space-y-1 pl-4">
                <Link
                  to="/profile"
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-muted-foreground hover:bg-secondary/50 transition-colors text-sm"
                >
                  <User className="w-4 h-4 flex-shrink-0" />
                  <span>Profile</span>
                </Link>
                <Link
                  to="/notifications"
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-muted-foreground hover:bg-secondary/50 transition-colors text-sm"
                >
                  <Bell className="w-4 h-4 flex-shrink-0" />
                  <span>Notifications</span>
                </Link>
                <Link
                  to="/medical-records"
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg bg-primary/10 text-primary transition-colors text-sm"
                >
                  <FileCheck className="w-4 h-4 flex-shrink-0" />
                  <span>Medical Records</span>
                </Link>
                <Link
                  to="/health-summary"
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-muted-foreground hover:bg-secondary/50 transition-colors text-sm"
                >
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
      <main
        className={`flex-1 ${isMobile ? 'ml-0' : sidebarOpen ? "ml-64" : "ml-20"} transition-all duration-300`}
      >
        {/* Top Bar */}
        <nav className="sticky top-0 z-40 bg-card/80 backdrop-blur-lg border-b border-border/50 px-4 sm:px-6 md:px-8 py-3 sm:py-4 flex items-center justify-between gap-2 sm:gap-4">
          <div className="flex items-center gap-2 min-w-0">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className={`${isMobile ? 'flex' : 'md:hidden'} flex-shrink-0`}
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
            <div className="min-w-0">
              <h2 className="text-lg sm:text-xl lg:text-2xl font-bold truncate">Medical Records</h2>
              <p className="text-xs sm:text-sm text-muted-foreground line-clamp-1 hidden sm:block">
                View and manage your medical documents and reports
              </p>
            </div>
          </div>
          <Button onClick={handleUpload} className="gap-1 sm:gap-2 text-xs sm:text-sm whitespace-nowrap">
            <Upload className="w-3 sm:w-4 h-3 sm:h-4" />
            <span className="hidden sm:inline">Upload Record</span>
            <span className="sm:hidden">Upload</span>
          </Button>
        </nav>

        {/* Content */}
        <div className="p-3 sm:p-4 md:p-6 lg:p-8 mobile-content mobile-text-container max-w-full overflow-hidden">
          <div className="space-y-6 max-w-full">
            {/* Filters */}
            <Card className="w-full max-w-full overflow-hidden">
              <CardHeader>
                <CardTitle className="mobile-header">Filters</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 max-w-full overflow-hidden">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="text-sm font-semibold mb-2 block mobile-text-fix">
                      Search Records
                    </label>
                    <div className="relative flex items-center border border-input rounded-md bg-background hover:border-primary/50 transition-colors focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary">
                      <Search className="w-5 h-5 text-foreground/70 ml-3 flex-shrink-0" />
                      <Input
                        placeholder="Title, doctor, description..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="border-0 bg-transparent pl-2 focus:ring-0 focus:outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-semibold mb-2 block flex items-center gap-2 mobile-text-fix">
                      <Filter className="w-4 h-4 text-primary" />
                      Record Type
                    </label>
                    <select
                      value={selectedType}
                      onChange={(e) => setSelectedType(e.target.value)}
                      className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground hover:border-primary/50 transition-colors"
                    >
                      <option value="all">All Types</option>
                      <option value="lab_report">Lab Reports</option>
                      <option value="scan">Scans & Imaging</option>
                      <option value="prescription">Prescriptions</option>
                      <option value="diagnosis">Diagnosis</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground flex items-center gap-2 mobile-text-fix">
                  <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary/10 text-primary text-xs font-semibold">
                    {filteredRecords.length}
                  </span>
                  record{filteredRecords.length !== 1 ? "s" : ""} found
                </p>
              </CardContent>
            </Card>

            {/* Medical Records List */}
            <Card className="w-full max-w-full overflow-hidden">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 mobile-header">
                  <FileText className="w-5 h-5 text-primary" />
                  <span className="mobile-text-fix">Your Medical Records</span>
                </CardTitle>
                <CardDescription className="mobile-text-fix">
                  A complete history of your medical documents and reports
                </CardDescription>
              </CardHeader>
              <CardContent className="max-w-full overflow-hidden">
                {filteredRecords.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                    <p className="text-muted-foreground mb-4">
                      No medical records found.
                    </p>
                    <Button onClick={handleUpload} variant="outline">
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Your First Record
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3 max-w-full">
                    {filteredRecords.map((record) => (
                      <div
                        key={record.id}
                        className="p-3 sm:p-4 rounded-lg border border-border/50 hover:bg-secondary/30 transition-colors mobile-card-spacing w-full max-w-full overflow-hidden"
                      >
                        <div className="flex items-start gap-4">
                          <div className="flex-shrink-0 mt-1">
                            {getRecordIcon(record.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold mobile-header">{record.title}</h3>
                              {getRecordTypeBadge(record.type)}
                            </div>
                            <p className="text-sm text-muted-foreground mb-2 mobile-text-fix">
                              {record.description}
                            </p>
                            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1 mobile-text-fix">
                                <Calendar className="w-3 h-3" />
                                {new Date(record.date).toLocaleDateString()}
                              </span>
                              <span className="flex items-center gap-1 mobile-text-fix">
                                <Stethoscope className="w-3 h-3" />
                                {record.doctor}
                              </span>
                            </div>
                          </div>
                          <div className="flex flex-col sm:flex-row items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDownload(record)}
                            >
                              <Download className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteRecord(record.id)}
                            >
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Record Statistics */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4 max-w-full overflow-hidden">
              <Card className="mobile-card-spacing w-full max-w-full overflow-hidden">
                <CardContent className="p-3 sm:p-4 lg:p-6">
                  <div className="text-center">
                    <p className="text-lg sm:text-xl lg:text-2xl font-bold text-primary mb-1 mobile-header">
                      {records.length}
                    </p>
                    <p className="text-xs text-muted-foreground mobile-text-fix truncate">Total</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="mobile-card-spacing w-full max-w-full overflow-hidden">
                <CardContent className="p-3 sm:p-4 lg:p-6">
                  <div className="text-center">
                    <p className="text-lg sm:text-xl lg:text-2xl font-bold text-blue-500 mb-1 mobile-header">
                      {records.filter((r) => r.type === "lab_report").length}
                    </p>
                    <p className="text-xs text-muted-foreground mobile-text-fix truncate">Lab Reports</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default MedicalRecords;
