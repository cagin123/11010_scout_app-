import { useEffect, useState } from "react";
import { ClipboardList, Search, Loader2, User, ChevronRight, Trash2, Download, FileText } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import AppLayout from "@/components/AppLayout";
import PageTransition from "@/components/PageTransition";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useRegional } from "@/contexts/RegionalContext";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface MatchEntry {
  id: string;
  match_number: number;
  team_number: string;
  alliance: string;
  scouted_by: string;
  auto_fuel_total: number;
  teleop_fuel_total: number;
  left_starting_zone: boolean;
  climb_result: string;
  defense: string;
  driver_skill_rating: number;
  cycles_completed: number;
  broke_down: boolean;
  tipped_over: boolean;
  lost_comms: boolean;
  notes: string | null;
  created_at: string;
}

interface GroupedMatch {
  matchNumber: number;
  red: MatchEntry[];
  blue: MatchEntry[];
}

const MatchHistory = () => {
  const [entries, setEntries] = useState<MatchEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedMatches, setExpandedMatches] = useState<Set<number>>(new Set());
  const [expandedAlliances, setExpandedAlliances] = useState<Set<string>>(new Set());
  const { user, isAdmin } = useAuth();
  const { t } = useLanguage();
  const { regional } = useRegional();

  useEffect(() => {
    fetchEntries();
  }, [user, regional]);

  const fetchEntries = async () => {
    if (!user) return;
    setIsLoading(true);
    let query = supabase
      .from("match_entries")
      .select("*")
      .eq("scouted_by_team", user.teamNumber);
    
    if (regional) {
      query = query.eq("regional", regional);
    }
    
    const { data, error } = await query.order("match_number", { ascending: true });

    if (!error && data) {
      setEntries(data as unknown as MatchEntry[]);
    }
    setIsLoading(false);
  };

  const handleDeleteEntry = async (entryId: string) => {
    const { error } = await supabase
      .from("match_entries")
      .delete()
      .eq("id", entryId);

    if (!error) {
      setEntries((prev) => prev.filter((e) => e.id !== entryId));
      toast.success(t("history.deleted"));
    } else {
      toast.error(t("history.deleteFailed"));
    }
  };

  const filtered = entries.filter(
    (e) =>
      e.team_number.includes(searchQuery) ||
      e.match_number.toString().includes(searchQuery) ||
      e.scouted_by.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const exportCSV = () => {
    if (entries.length === 0) return;
    const headers = ["Match", "Team", "Alliance", "Auto Fuel", "Teleop Fuel", "Cycles", "Climb", "Defense", "Driver Skill", "Broke Down", "Tipped", "Lost Comms", "Notes", "Scouted By"];
    const rows = entries.map((e) => [
      e.match_number, e.team_number, e.alliance, e.auto_fuel_total, e.teleop_fuel_total,
      e.cycles_completed, e.climb_result,
      e.defense, e.driver_skill_rating, e.broke_down, e.tipped_over, e.lost_comms,
      `"${(e.notes || "").replace(/"/g, '""')}"`, e.scouted_by,
    ]);
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `scouting_data_${regional || "all"}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(t("history.exported"));
  };

  const exportPDF = () => {
    if (entries.length === 0) return;
    const doc = new jsPDF({ orientation: "landscape" });
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Title
    doc.setFontSize(16);
    doc.text(t("history.title"), 14, 15);
    doc.setFontSize(10);
    doc.text(`${entries.length} ${t("history.entries")}${regional ? ` — ${regional}` : ""}`, 14, 22);

    // === CHARTS SECTION ===
    const chartY = 30;
    const chartH = 50;
    const chartGap = 15;

    // Chart 1: Auto vs Teleop scores per match (bar chart)
    const matchNumbers = [...new Set(entries.map(e => e.match_number))].sort((a, b) => a - b);
    const matchAutoAvg = matchNumbers.map(mn => {
      const me = entries.filter(e => e.match_number === mn);
      // Auto: total auto fuel + cycles
      return me.reduce((s, e) => s + (e.auto_fuel_total || 0) + (e.cycles_completed || 0), 0) / me.length;
    });
    const matchTeleopAvg = matchNumbers.map(mn => {
      const me = entries.filter(e => e.match_number === mn);
      // Teleop: only teleop fuel
      return me.reduce((s, e) => s + (e.teleop_fuel_total || 0), 0) / me.length;
    });

    const chart1X = 14;
    const chart1W = (pageWidth - 42) / 2;
    const maxScore = Math.max(...matchAutoAvg, ...matchTeleopAvg, 1);

    // Chart 1 title
    doc.setFontSize(9);
    doc.setTextColor(100);
    doc.text("Auto vs Teleop (per match avg)", chart1X, chartY - 2);
    doc.setTextColor(0);

    // Draw bars
    const barGroupW = Math.min(12, (chart1W - 10) / matchNumbers.length);
    const barW = barGroupW * 0.4;
    matchNumbers.forEach((mn, i) => {
      const x = chart1X + 5 + i * barGroupW;
      const autoH = (matchAutoAvg[i] / maxScore) * chartH;
      const teleopH = (matchTeleopAvg[i] / maxScore) * chartH;
      // Auto bar (blue)
      doc.setFillColor(59, 130, 246);
      doc.rect(x, chartY + chartH - autoH, barW, autoH, "F");
      // Teleop bar (orange)
      doc.setFillColor(249, 115, 22);
      doc.rect(x + barW, chartY + chartH - teleopH, barW, teleopH, "F");
      // Label
      doc.setFontSize(5);
      doc.text(`Q${mn}`, x, chartY + chartH + 4);
    });

    // Legend for chart 1
    doc.setFontSize(6);
    doc.setFillColor(59, 130, 246);
    doc.rect(chart1X, chartY + chartH + 8, 4, 3, "F");
    doc.text("Auto", chart1X + 6, chartY + chartH + 10.5);
    doc.setFillColor(249, 115, 22);
    doc.rect(chart1X + 20, chartY + chartH + 8, 4, 3, "F");
    doc.text("Teleop", chart1X + 26, chartY + chartH + 10.5);

    // Chart 2: Climb distribution (pie chart)
    const chart2X = chart1X + chart1W + chartGap;
    doc.setFontSize(9);
    doc.setTextColor(100);
    doc.text("Climb Distribution", chart2X, chartY - 2);
    doc.setTextColor(0);

    const climbCounts: Record<string, number> = { none: 0, low: 0, mid: 0, high: 0 };
    entries.forEach(e => { climbCounts[e.climb_result] = (climbCounts[e.climb_result] || 0) + 1; });
    const total = entries.length;
    const pieColors: Record<string, [number, number, number]> = {
      none: [156, 163, 175],
      low: [59, 130, 246],
      mid: [234, 179, 8],
      high: [34, 197, 94],
    };
    const pieCX = chart2X + 30;
    const pieCY = chartY + chartH / 2 + 2;
    const pieR = 22;
    let startAngle = -Math.PI / 2;

    Object.entries(climbCounts).forEach(([key, count]) => {
      if (count === 0) return;
      const sliceAngle = (count / total) * 2 * Math.PI;
      const endAngle = startAngle + sliceAngle;
      const [r, g, b] = pieColors[key] || [150, 150, 150];
      doc.setFillColor(r, g, b);
      
      // Draw pie slice as filled triangle fan
      const steps = Math.max(Math.ceil(sliceAngle / 0.1), 2);
      const points: number[][] = [[pieCX, pieCY]];
      for (let s = 0; s <= steps; s++) {
        const a = startAngle + (sliceAngle * s) / steps;
        points.push([pieCX + pieR * Math.cos(a), pieCY + pieR * Math.sin(a)]);
      }
      // Draw using triangles
      for (let s = 1; s < points.length - 1; s++) {
        doc.triangle(
          points[0][0], points[0][1],
          points[s][0], points[s][1],
          points[s + 1][0], points[s + 1][1],
          "F"
        );
      }
      startAngle = endAngle;
    });

    // Pie legend
    let legendY = chartY + 5;
    Object.entries(climbCounts).forEach(([key, count]) => {
      if (count === 0) return;
      const [r, g, b] = pieColors[key] || [150, 150, 150];
      doc.setFillColor(r, g, b);
      doc.rect(chart2X + 60, legendY, 4, 3, "F");
      doc.setFontSize(7);
      doc.text(`${key.charAt(0).toUpperCase() + key.slice(1)}: ${count} (${Math.round(count / total * 100)}%)`, chart2X + 66, legendY + 2.5);
      legendY += 6;
    });

    // === DATA TABLE ===
    autoTable(doc, {
      startY: chartY + chartH + 18,
      head: [["Match", "Team", "Alliance", "Auto Fuel", "Teleop Fuel", "Cycles", "Climb", "Defense", "Driver", "Issues", "Scout"]],
      body: entries.map((e) => {
        const issues = [e.broke_down && "BD", e.tipped_over && "TIP", e.lost_comms && "LC"].filter(Boolean).join(", ") || "—";
        return [e.match_number, e.team_number, e.alliance, e.auto_fuel_total, e.teleop_fuel_total, e.cycles_completed, e.climb_result, e.defense, e.driver_skill_rating, issues, e.scouted_by];
      }),
      styles: { fontSize: 8 },
      headStyles: { fillColor: [30, 30, 30] },
    });

    doc.save(`scouting_data_${regional || "all"}.pdf`);
    toast.success(t("history.exported"));
  };

  const groupedMatches: GroupedMatch[] = [];
  const matchMap = new Map<number, GroupedMatch>();

  filtered.forEach((entry) => {
    if (!matchMap.has(entry.match_number)) {
      const group: GroupedMatch = { matchNumber: entry.match_number, red: [], blue: [] };
      matchMap.set(entry.match_number, group);
      groupedMatches.push(group);
    }
    const group = matchMap.get(entry.match_number)!;
    if (entry.alliance === "red") {
      group.red.push(entry);
    } else {
      group.blue.push(entry);
    }
  });

  groupedMatches.sort((a, b) => b.matchNumber - a.matchNumber);

  const toggleMatch = (matchNumber: number) => {
    setExpandedMatches((prev) => {
      const next = new Set(prev);
      if (next.has(matchNumber)) next.delete(matchNumber);
      else next.add(matchNumber);
      return next;
    });
  };

  const toggleAlliance = (key: string) => {
    setExpandedAlliances((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  return (
    <AppLayout>
      <PageTransition>
        <div className="max-w-4xl mx-auto px-4 py-4 lg:py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div className="flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-primary" />
              <h1 className="text-xl font-bold">{t("history.title")}</h1>
              <span className="text-sm text-muted-foreground font-mono">({entries.length} {t("history.entries")})</span>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder={t("history.searchPlaceholder")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-10 bg-input border-border"
              />
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={exportCSV} disabled={entries.length === 0}>
                <Download className="w-4 h-4 mr-1.5" />
                CSV
              </Button>
              <Button variant="outline" size="sm" onClick={exportPDF} disabled={entries.length === 0}>
                <FileText className="w-4 h-4 mr-1.5" />
                PDF
              </Button>
            </div>
            </div>
          </div>

          {isLoading ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center justify-center min-h-[40vh]"
            >
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </motion.div>
          ) : groupedMatches.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="text-center py-16 text-muted-foreground"
            >
              <ClipboardList className="w-10 h-10 mx-auto mb-3 opacity-40" />
              <p className="text-sm">{t("history.noEntries")}</p>
            </motion.div>
          ) : (
            <div className="space-y-2">
              {groupedMatches.map((match, i) => {
                const isExpanded = expandedMatches.has(match.matchNumber);
                const totalEntries = match.red.length + match.blue.length;

                return (
                  <motion.div
                    key={match.matchNumber}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: i * 0.04, ease: [0.22, 1, 0.36, 1] }}
                    className="card-data overflow-hidden"
                  >
                    <motion.button
                      onClick={() => toggleMatch(match.matchNumber)}
                      className="w-full flex items-center justify-between px-4 py-3 hover:bg-card-elevated/50 transition-colors"
                      whileTap={{ scale: 0.985 }}
                    >
                      <div className="flex items-center gap-3">
                        <motion.div
                          animate={{ rotate: isExpanded ? 90 : 0 }}
                          transition={{ duration: 0.2, ease: "easeOut" }}
                        >
                          <ChevronRight className="w-4 h-4 text-muted-foreground" />
                        </motion.div>
                        <span className="font-mono font-bold text-lg">Q{match.matchNumber}</span>
                        <span className="text-sm text-muted-foreground">{totalEntries} {totalEntries === 1 ? t("history.entry") : t("history.entries")}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {match.red.length > 0 && (
                          <span className="px-2 py-0.5 rounded text-xs font-semibold bg-alliance-red-bg text-alliance-red">
                            {match.red.length} Red
                          </span>
                        )}
                        {match.blue.length > 0 && (
                          <span className="px-2 py-0.5 rounded text-xs font-semibold bg-alliance-blue-bg text-alliance-blue">
                            {match.blue.length} Blue
                          </span>
                        )}
                      </div>
                    </motion.button>

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                          className="overflow-hidden border-t border-border"
                        >
                          {match.red.length > 0 && (
                            <AllianceSection
                              alliance="red"
                              entries={match.red}
                              matchNumber={match.matchNumber}
                              isExpanded={expandedAlliances.has(`${match.matchNumber}-red`)}
                              onToggle={() => toggleAlliance(`${match.matchNumber}-red`)}
                              isAdmin={isAdmin}
                              onDelete={handleDeleteEntry}
                              t={t}
                            />
                          )}
                          {match.blue.length > 0 && (
                            <AllianceSection
                              alliance="blue"
                              entries={match.blue}
                              matchNumber={match.matchNumber}
                              isExpanded={expandedAlliances.has(`${match.matchNumber}-blue`)}
                              onToggle={() => toggleAlliance(`${match.matchNumber}-blue`)}
                              isAdmin={isAdmin}
                              onDelete={handleDeleteEntry}
                              t={t}
                            />
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </PageTransition>
    </AppLayout>
  );
};

interface AllianceSectionProps {
  alliance: "red" | "blue";
  entries: MatchEntry[];
  matchNumber: number;
  isExpanded: boolean;
  onToggle: () => void;
  isAdmin: boolean;
  onDelete: (id: string) => void;
  t: (key: string) => string;
}

const AllianceSection = ({ alliance, entries, isExpanded, onToggle, isAdmin, onDelete, t }: AllianceSectionProps) => {
  const isRed = alliance === "red";

  return (
    <div className={cn("border-b border-border last:border-b-0")}>
      <motion.button
        onClick={onToggle}
        className={cn(
          "w-full flex items-center justify-between px-4 py-2.5 transition-colors",
          isRed ? "hover:bg-alliance-red-bg/30" : "hover:bg-alliance-blue-bg/30"
        )}
        whileTap={{ scale: 0.985 }}
      >
        <div className="flex items-center gap-2">
          <motion.div
            animate={{ rotate: isExpanded ? 90 : 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
          </motion.div>
          <span className={cn(
            "px-2 py-0.5 rounded text-xs font-bold uppercase",
            isRed ? "bg-alliance-red-bg text-alliance-red" : "bg-alliance-blue-bg text-alliance-blue"
          )}>
            {isRed ? t("history.redAlliance") : t("history.blueAlliance")}
          </span>
          <span className="text-xs text-muted-foreground">{entries.length} {entries.length === 1 ? t("history.team") : t("history.teams")}</span>
        </div>
      </motion.button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-3 space-y-2">
              {entries.map((entry, i) => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.25, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] }}
                  className={cn(
                    "rounded-lg p-3 border transition-colors",
                    isRed ? "bg-alliance-red-bg/20 border-alliance-red/10 hover:bg-alliance-red-bg/30" : "bg-alliance-blue-bg/20 border-alliance-blue/10 hover:bg-alliance-blue-bg/30"
                  )}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono font-bold text-base">{entry.team_number}</span>
                    <div className="flex items-center gap-2">
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <User className="w-3 h-3" />
                        {entry.scouted_by}
                      </span>
                      {isAdmin && (
                        <button
                          onClick={(e) => { e.stopPropagation(); onDelete(entry.id); }}
                          className="w-6 h-6 flex items-center justify-center rounded text-muted-foreground hover:text-status-danger hover:bg-status-danger-bg transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 text-xs">
                    <StatBox label={t("history.auto")} value={entry.auto_fuel_total} />
                    <StatBox label={t("history.teleop")} value={entry.teleop_fuel_total} />
                    <StatBox label={t("history.cycles")} value={entry.cycles_completed} />
                    <StatBox
                      label={t("history.climb")}
                      value={entry.climb_result === "none" ? "—" : entry.climb_result}
                      textColor={
                        entry.climb_result === "high" ? "text-status-success" :
                        entry.climb_result === "mid" ? "text-status-warning" :
                        entry.climb_result === "low" ? "text-status-info" :
                        "text-muted-foreground"
                      }
                    />
                    <StatBox label={t("history.driver")} value={`${entry.driver_skill_rating}/5`} />
                  </div>

                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {entry.left_starting_zone && <FlagBadge label={t("history.leftZone")} variant="success" />}
                    {entry.defense !== "none" && <FlagBadge label={`${entry.defense} ${t("history.defense")}`} variant="warning" />}
                    {entry.broke_down && <FlagBadge label={t("history.brokeDown")} variant="danger" />}
                    {entry.tipped_over && <FlagBadge label={t("history.tipped")} variant="danger" />}
                    {entry.lost_comms && <FlagBadge label={t("history.lostComms")} variant="danger" />}
                  </div>

                  {entry.notes && (
                    <p className="mt-2 text-xs text-muted-foreground italic">"{entry.notes}"</p>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const StatBox = ({ label, value, textColor }: { label: string; value: string | number; textColor?: string }) => (
  <div className="text-center bg-background/50 rounded px-2 py-1.5">
    <div className={cn("font-mono font-semibold capitalize", textColor || "text-foreground")}>{value}</div>
    <div className="text-muted-foreground text-2xs">{label}</div>
  </div>
);

const FlagBadge = ({ label, variant }: { label: string; variant: "success" | "warning" | "danger" }) => (
  <span className={cn(
    "px-1.5 py-0.5 rounded text-2xs font-medium capitalize",
    variant === "success" && "bg-status-success-bg text-status-success",
    variant === "warning" && "bg-status-warning-bg text-status-warning",
    variant === "danger" && "bg-status-danger-bg text-status-danger",
  )}>
    {label}
  </span>
);

export default MatchHistory;
