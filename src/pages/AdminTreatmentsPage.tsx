import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Pill,
  Users,
  LogOut,
  Menu,
  X,
  Search,
  ChevronDown,
  Activity,
  BarChart3,
  Layers,
  AlertCircle,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useIsMobile } from "@/hooks/use-mobile";
import "@/styles/mobile-responsive.css";

interface Medicine {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
}

interface Treatment {
  id: string;
  patient_id: string;
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  status: string;
  patient_name?: string;
  medicines: Medicine[];
}

const AdminTreatmentsPage = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const [loading, setLoading] = useState(true);
  const [adminEmail, setAdminEmail] = useState("");
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [expandedTreatment, setExpandedTreatment] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredTreatments, setFilteredTreatments] = useState<Treatment[]>([]);

  useEffect(() => {
    // Check if admin is logged in
    const adminId = localStorage.getItem("admin_id");
    const adminEmailLS = localStorage.getItem("admin_email");

    if (!adminId || !adminEmailLS) {
      navigate("/admin-login");
      return;
    }

    setAdminEmail(adminEmailLS);
    fetchAllTreatments();
  }, [navigate]);

  // Filter treatments based on search term
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredTreatments(treatments);
    } else {
      const term = searchTerm.toLowerCase();
      setFilteredTreatments(
        treatments.filter(
          (treatment) =>
            treatment.name.toLowerCase().includes(term) ||
            treatment.patient_name?.toLowerCase().includes(term) ||
            treatment.description.toLowerCase().includes(term)
        )
      );
    }
  }, [searchTerm, treatments]);

  const fetchAllTreatments = async () => {
    try {
      setLoading(true);

      // Fetch all treatments
      const { data: treatmentsData, error: treatmentsError } = await (supabase as any)
        .from("treatments")
        .select("id, patient_id, name, description, start_date, end_date, status");

      if (treatmentsError) {
        console.error("Error fetching treatments:", treatmentsError);
        console.error("Error details:", {
          message: treatmentsError.message,
          code: treatmentsError.code,
          details: treatmentsError.details,
          hint: treatmentsError.hint,
        });
        return;
      }

      console.log("Treatments fetched:", treatmentsData);

      // For each treatment, fetch patient name and medicines
      const treatmentsWithDetails: Treatment[] = [];

      for (const treatment of treatmentsData || []) {
        // Fetch patient name
        const { data: patientData } = await (supabase as any)
          .from("profiles")
          .select("full_name")
          .eq("id", treatment.patient_id)
          .single();

        // Fetch medicines for this treatment
        const { data: medicinesData, error: medicinesError } = await (supabase as any)
          .from("medicines")
          .select("id, name, dosage, frequency")
          .eq("treatment_id", treatment.id);

        if (medicinesError) {
          console.error("Error fetching medicines for treatment:", medicinesError);
        }

        treatmentsWithDetails.push({
          ...treatment,
          patient_name: patientData?.full_name || "Unknown Patient",
          medicines: medicinesData || [],
        });
      }

      console.log("All treatments with medicines:", treatmentsWithDetails);
      setTreatments(treatmentsWithDetails);
    } catch (err) {
      console.error("Exception fetching treatments:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("admin_id");
    localStorage.removeItem("admin_email");
    localStorage.removeItem("admin_login_time");
    navigate("/admin-login");
  };

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
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                <Pill className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-bold text-lg">MediFlow</span>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          <div
            className={`text-xs font-semibold text-foreground/60 ${
              sidebarOpen ? "px-3 mb-3" : "hidden"
            }`}
          >
            ADMIN
          </div>

          <button 
            onClick={() => navigate("/admin-dashboard")}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-foreground hover:bg-accent transition-colors font-medium"
          >
            <Activity className="w-5 h-5 flex-shrink-0" />
            {sidebarOpen && <span>Dashboard</span>}
          </button>
          <button
            className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-foreground hover:bg-accent transition-colors font-medium"
            onClick={() => navigate("/admin-patients")}
          >
            <Users className="w-5 h-5 flex-shrink-0" />
            {sidebarOpen && <span>Patients</span>}
          </button>
          <button
            className="w-full flex items-center gap-3 px-3 py-3 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors font-medium"
            onClick={() => navigate("/admin-treatments")}
          >
            <Layers className="w-5 h-5 flex-shrink-0" />
            {sidebarOpen && <span>Treatments</span>}
          </button>
          <button
            className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-foreground hover:bg-accent transition-colors font-medium"
            onClick={() => navigate("/admin-reports")}
          >
            <BarChart3 className="w-5 h-5 flex-shrink-0" />
            {sidebarOpen && <span>Reports</span>}
          </button>
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-border/50">
          <button
            className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-destructive hover:bg-destructive/10 transition-colors font-medium"
            onClick={handleLogout}
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className={`flex-1 ${isMobile ? 'ml-0' : sidebarOpen ? "ml-64" : "ml-20"} transition-all duration-300`}>
        {/* Top Navigation */}
        <nav className="bg-card border-b border-border/50 px-4 sm:px-6 md:px-8 py-3 sm:py-4 sticky top-0 z-30 flex items-center justify-between gap-2 sm:gap-4">
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
              <h1 className="text-lg sm:text-xl lg:text-2xl font-bold truncate">All Treatments</h1>
              <p className="text-xs sm:text-sm text-muted-foreground line-clamp-1 hidden sm:block">View all treatments and their medicines</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              Admin: <span className="font-medium">{adminEmail}</span>
            </span>
            <Button
              variant="outline"
              size="sm"
              className="text-destructive"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </nav>

        {/* Content */}
        <div className="p-3 sm:p-4 md:p-6 lg:p-8 mobile-content mobile-text-container max-w-full overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading treatments...</p>
              </div>
            </div>
          ) : (
            <>
              {/* Search Bar */}
              <div className="mb-4 sm:mb-6 max-w-full">
                <div className="relative w-full">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 sm:w-5 h-4 sm:h-5 text-muted-foreground flex-shrink-0" />
                  <Input
                    placeholder="Search treatments..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 sm:pl-10 w-full text-sm sm:text-base"
                  />
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground mt-2 mobile-text-fix">
                  Found {filteredTreatments.length} treatment{filteredTreatments.length !== 1 ? "s" : ""}
                </p>
              </div>

              {/* Treatments List */}
              <div className="space-y-3 sm:space-y-4 max-w-full">
                {filteredTreatments.length > 0 ? (
                  filteredTreatments.map((treatment) => (
                    <Card key={treatment.id} className="border-l-4 border-l-primary hover:shadow-lg transition-all w-full max-w-full overflow-hidden mobile-card-spacing">
                      <CardHeader
                        className="pb-3 cursor-pointer hover:bg-secondary/30 transition-colors"
                        onClick={() =>
                          setExpandedTreatment(
                            expandedTreatment === treatment.id ? null : treatment.id
                          )
                        }
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <CardTitle className="text-base sm:text-lg mobile-header truncate">
                                {treatment.name}
                              </CardTitle>
                              <Badge
                                variant={
                                  treatment.status === "active"
                                    ? "default"
                                    : "secondary"
                                }
                                className="text-xs"
                              >
                                {treatment.status}
                              </Badge>
                            </div>
                            <CardDescription className="mt-2 mobile-text-fix truncate">
                              <span className="font-medium">Patient:</span> {treatment.patient_name}
                            </CardDescription>
                            <CardDescription className="mt-1 mobile-text-fix line-clamp-2">
                              {treatment.description}
                            </CardDescription>
                          </div>
                          <ChevronDown
                            className={`w-5 h-5 text-primary transition-transform flex-shrink-0 ${
                              expandedTreatment === treatment.id ? "rotate-180" : ""
                            }`}
                          />
                        </div>
                      </CardHeader>

                      {/* Treatment Details */}
                      {expandedTreatment === treatment.id && (
                        <CardContent className="border-t pt-4 sm:pt-6 space-y-4 sm:space-y-6 max-w-full overflow-hidden">
                          {/* Treatment Info */}
                          <div className="max-w-full">
                            <h3 className="font-semibold text-base sm:text-lg mb-3 mobile-header">Treatment Information</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 max-w-full">
                              <div className="min-w-0">
                                <label className="text-xs sm:text-sm font-medium text-muted-foreground mobile-text-fix">
                                  Start Date
                                </label>
                                <p className="text-sm sm:text-base lg:text-lg font-semibold mt-1 mobile-text-fix">
                                  {new Date(treatment.start_date).toLocaleDateString()}
                                </p>
                              </div>
                              <div className="min-w-0">
                                <label className="text-xs sm:text-sm font-medium text-muted-foreground mobile-text-fix">
                                  End Date
                                </label>
                                <p className="text-sm sm:text-base lg:text-lg font-semibold mt-1 mobile-text-fix">
                                  {treatment.end_date
                                    ? new Date(treatment.end_date).toLocaleDateString()
                                    : "Ongoing"}
                                </p>
                              </div>
                              <div className="sm:col-span-2 min-w-0">
                                <label className="text-xs sm:text-sm font-medium text-muted-foreground mobile-text-fix">
                                  Treatment ID
                                </label>
                                <p className="text-xs sm:text-sm font-mono mt-1 break-all mobile-text-fix">
                                  {treatment.id}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Medicines Section */}
                          <div className="border-t pt-4 max-w-full overflow-hidden">
                            <h3 className="font-semibold text-base sm:text-lg mb-3 flex items-center gap-2 mobile-header">
                              <Pill className="w-4 sm:w-5 h-4 sm:h-5 text-primary flex-shrink-0" />
                              <span className="truncate">Medicines for this Treatment</span>
                            </h3>

                            {treatment.medicines.length > 0 ? (
                              <div className="space-y-2 sm:space-y-3 max-w-full">
                                {treatment.medicines.map((medicine, idx) => (
                                  <Card
                                    key={medicine.id}
                                    className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20 w-full max-w-full overflow-hidden"
                                  >
                                    <CardContent className="p-3 sm:p-4 max-w-full overflow-hidden">
                                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-4 max-w-full">
                                        <div className="min-w-0">
                                          <label className="text-xs font-medium text-muted-foreground mobile-text-fix">
                                            #{idx + 1} Medicine Name
                                          </label>
                                          <p className="text-xs sm:text-sm font-semibold mt-1 mobile-text-fix truncate">
                                            {medicine.name}
                                          </p>
                                        </div>
                                        <div className="min-w-0">
                                          <label className="text-xs font-medium text-muted-foreground mobile-text-fix">
                                            Dosage
                                          </label>
                                          <p className="text-xs sm:text-sm font-semibold mt-1 mobile-text-fix truncate">
                                            {medicine.dosage}
                                          </p>
                                        </div>
                                        <div className="min-w-0">
                                          <label className="text-xs font-medium text-muted-foreground mobile-text-fix">
                                            Frequency
                                          </label>
                                          <p className="text-xs sm:text-sm font-semibold mt-1 mobile-text-fix truncate">
                                            {medicine.frequency}
                                          </p>
                                        </div>
                                        <div className="min-w-0">
                                          <label className="text-xs font-medium text-muted-foreground mobile-text-fix">
                                            Medicine ID
                                          </label>
                                          <p className="text-xs font-mono mt-1 truncate mobile-text-fix">
                                            {medicine.id}
                                          </p>
                                        </div>
                                      </div>
                                    </CardContent>
                                  </Card>
                                ))}
                              </div>
                            ) : (
                              <Card className="bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-900">
                                <CardContent className="p-4 flex items-center gap-2">
                                  <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-500" />
                                  <p className="text-yellow-700 dark:text-yellow-400">
                                    No medicines assigned to this treatment yet
                                  </p>
                                </CardContent>
                              </Card>
                            )}
                          </div>
                        </CardContent>
                      )}
                    </Card>
                  ))
                ) : (
                  <Card>
                    <CardContent className="p-12 text-center">
                      <Layers className="w-16 h-16 mx-auto text-muted-foreground mb-4 opacity-30" />
                      <p className="text-lg text-muted-foreground mb-2">
                        {searchTerm ? "No treatments found" : "No treatments registered yet"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {searchTerm
                          ? "Try adjusting your search criteria"
                          : "Create a treatment to get started"}
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Summary Stats */}
              {filteredTreatments.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mt-6 sm:mt-8 max-w-full">
                  <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border-blue-500/20 w-full max-w-full overflow-hidden">
                    <CardContent className="p-4 sm:p-6">
                      <label className="text-xs sm:text-sm font-medium text-muted-foreground mobile-text-fix">
                        Total Treatments
                      </label>
                      <p className="text-2xl sm:text-3xl font-bold mt-2">
                        {filteredTreatments.length}
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="bg-gradient-to-br from-green-500/10 to-green-600/10 border-green-500/20 w-full max-w-full overflow-hidden">
                    <CardContent className="p-4 sm:p-6">
                      <label className="text-xs sm:text-sm font-medium text-muted-foreground mobile-text-fix">
                        Active Treatments
                      </label>
                      <p className="text-2xl sm:text-3xl font-bold mt-2">
                        {filteredTreatments.filter((t) => t.status === "active").length}
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border-purple-500/20 w-full max-w-full overflow-hidden">
                    <CardContent className="p-4 sm:p-6">
                      <label className="text-xs sm:text-sm font-medium text-muted-foreground mobile-text-fix">
                        Total Medicines
                      </label>
                      <p className="text-2xl sm:text-3xl font-bold mt-2">
                        {filteredTreatments.reduce((acc, t) => acc + t.medicines.length, 0)}
                      </p>
                    </CardContent>
                  </Card>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminTreatmentsPage;
