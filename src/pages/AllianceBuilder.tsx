import { useState, useMemo } from "react";
import { Plus, X, Star, Shield, AlertTriangle, Users, Handshake } from "lucide-react";
import { Input } from "@/components/ui/input";
import AppLayout from "@/components/AppLayout";
import PageTransition from "@/components/PageTransition";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { useRegional } from "@/contexts/RegionalContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface TeamStats {
  teamNumber: string;
  avgTotal: number;
  climbPct: number;
  reliability: number;
  autoStrength: string;
  matchCount: number;
}

const AllianceBuilder = () => {
  const [selectedTeams, setSelectedTeams] = useState<TeamStats[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const { t } = useLanguage();
  const { user } = useAuth();
  const { regional } = useRegional();

  const { data: matchEntries = [] } = useQuery({
    queryKey: ["alliance-teams", user?.teamNumber, regional],
    queryFn: async () => {
      if (!user?.teamNumber) return [];
      let query = supabase
        .from("match_entries")
        .select("*")
        .eq("scouted_by_team", user.teamNumber);
      
      if (regional) {
        query = query.eq("regional", regional);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.teamNumber,
  });

  const availableTeams: TeamStats[] = useMemo(() => {
    const teamMap = new Map<string, typeof matchEntries>();
    matchEntries.forEach((entry) => {
      const arr = teamMap.get(entry.team_number) || [];
      arr.push(entry);
      teamMap.set(entry.team_number, arr);
    });

    return Array.from(teamMap.entries()).map(([teamNumber, entries]) => {
      const avgAutoTotal = entries.reduce((s, e) => s + (e.auto_fuel_total || 0) + (e.cycles_completed || 0), 0) / entries.length;
      const avgTeleopTotal = entries.reduce((s, e) => s + (e.teleop_fuel_total || 0), 0) / entries.length;
      const avgTotal = avgAutoTotal + avgTeleopTotal;

      const climbCount = entries.filter((e) => e.climb_result !== "none").length;
      const climbPct = Math.round((climbCount / entries.length) * 100);

      const issueCount = entries.filter((e) => e.broke_down || e.tipped_over || e.lost_comms).length;
      const reliability = Math.round(((entries.length - issueCount) / entries.length) * 100);

      const autoStrength = avgAutoTotal >= 6 ? "high" : avgAutoTotal >= 3 ? "mid" : "low";

      return { teamNumber, avgTotal, climbPct, reliability, autoStrength, matchCount: entries.length };
    });
  }, [matchEntries]);

  const addTeam = (team: TeamStats) => {
    if (selectedTeams.length >= 3) {
      toast.error(t("alliance.maxTeams"));
      return;
    }
    if (selectedTeams.find((t) => t.teamNumber === team.teamNumber)) {
      toast.error(t("alliance.alreadyAdded"));
      return;
    }
    setSelectedTeams([...selectedTeams, team]);
    setSearchQuery("");
  };

  const removeTeam = (teamNumber: string) => {
    setSelectedTeams(selectedTeams.filter((t) => t.teamNumber !== teamNumber));
  };

  const filteredTeams = availableTeams.filter(
    (team) =>
      !selectedTeams.find((t) => t.teamNumber === team.teamNumber) &&
      team.teamNumber.includes(searchQuery)
  );

  const allianceStats = {
    totalProjection: selectedTeams.reduce((sum, t) => sum + t.avgTotal, 0),
    avgClimb: selectedTeams.length > 0
      ? selectedTeams.reduce((sum, t) => sum + t.climbPct, 0) / selectedTeams.length
      : 0,
    avgReliability: selectedTeams.length > 0
      ? selectedTeams.reduce((sum, t) => sum + t.reliability, 0) / selectedTeams.length
      : 0,
    climbCoverage: selectedTeams.filter((t) => t.climbPct >= 60).length,
    autoOverlap: selectedTeams.filter((t) => t.autoStrength === "high").length,
  };

  const getAllianceRating = () => {
    if (selectedTeams.length < 3) return null;
    if (allianceStats.totalProjection >= 150 && allianceStats.avgReliability >= 85) {
      return { label: t("alliance.highScoring"), icon: Star, className: "status-warning" };
    }
    if (allianceStats.avgReliability < 80 || allianceStats.climbCoverage < 2) {
      return { label: t("alliance.risky"), icon: AlertTriangle, className: "status-danger" };
    }
    return { label: t("alliance.balanced"), icon: Shield, className: "status-info" };
  };

  const rating = getAllianceRating();

  const warnings: string[] = [];
  if (selectedTeams.length === 3) {
    if (allianceStats.avgReliability < 80) warnings.push(t("alliance.warnReliability"));
    if (allianceStats.climbCoverage < 2) warnings.push(t("alliance.warnClimb"));
    if (allianceStats.autoOverlap >= 2) warnings.push(t("alliance.warnAutoOverlap"));
  }

  return (
    <AppLayout>
      <PageTransition>
        <div className="max-w-4xl mx-auto px-4 py-4 lg:py-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Handshake className="w-5 h-5 text-primary" />
              <h1 className="text-xl font-bold">{t("alliance.title")}</h1>
            </div>
            {rating && (
              <span className={cn("status-tag text-sm", rating.className)}>
                <rating.icon className="w-4 h-4" />
                {rating.label}
              </span>
            )}
          </div>

          <div className="flex items-start gap-2 text-sm text-status-warning bg-status-warning-bg p-3 rounded-lg mb-6">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{t("alliance.dataWarning")}</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
            {[0, 1, 2].map((slot) => {
              const team = selectedTeams[slot];
              return (
                <div
                  key={slot}
                  className={cn(
                    "card-data p-4 min-h-[120px] flex flex-col",
                    !team && "border-dashed border-2 border-border bg-transparent"
                  )}
                >
                  {team ? (
                    <>
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="font-mono font-bold text-xl">{team.teamNumber}</div>
                          <div className="text-sm text-muted-foreground">{team.matchCount} {t("teams.matches")}</div>
                        </div>
                        <button
                          onClick={() => removeTeam(team.teamNumber)}
                          className="w-6 h-6 flex items-center justify-center rounded bg-secondary text-muted-foreground hover:text-foreground hover:bg-destructive/20 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="mt-auto grid grid-cols-3 gap-2 text-xs">
                        <div>
                          <div className="font-mono font-medium">{team.avgTotal.toFixed(1)}</div>
                          <div className="text-muted-foreground">{t("teams.avgTotal")}</div>
                        </div>
                        <div>
                          <div className={cn("font-mono font-medium", team.climbPct >= 70 ? "text-status-success" : "text-status-warning")}>{team.climbPct}%</div>
                          <div className="text-muted-foreground">{t("teams.climbPct")}</div>
                        </div>
                        <div>
                          <div className={cn("font-mono font-medium", team.reliability >= 85 ? "text-status-success" : "text-status-warning")}>{team.reliability}%</div>
                          <div className="text-muted-foreground">{t("teams.reliability")}</div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
                      <Users className="w-8 h-8 mb-2 opacity-50" />
                      <span className="text-sm">{t("alliance.selectTeam")} {slot + 1}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {selectedTeams.length > 0 && (
            <div className="card-data p-4 mb-6">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                {t("alliance.projection")}
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="metric-card">
                  <div className="metric-value text-primary">{allianceStats.totalProjection.toFixed(1)}</div>
                  <div className="metric-label">{t("alliance.combinedScore")}</div>
                </div>
                <div className="metric-card">
                  <div className="metric-value">{allianceStats.avgClimb.toFixed(0)}%</div>
                  <div className="metric-label">{t("alliance.avgClimb")}</div>
                </div>
                <div className="metric-card">
                  <div className={cn("metric-value", allianceStats.avgReliability >= 85 ? "text-status-success" : "text-status-warning")}>
                    {allianceStats.avgReliability.toFixed(0)}%
                  </div>
                  <div className="metric-label">{t("alliance.avgReliability")}</div>
                </div>
                <div className="metric-card">
                  <div className="metric-value">{allianceStats.climbCoverage}/3</div>
                  <div className="metric-label">{t("alliance.climbCoverage")}</div>
                </div>
              </div>

              {warnings.length > 0 && (
                <div className="mt-4 space-y-2">
                  {warnings.map((warning, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-status-warning bg-status-warning-bg p-2 rounded">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      {warning}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {selectedTeams.length < 3 && (
            <div className="card-data p-4">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                {t("alliance.addTeam")}
              </h3>
              <Input
                type="text"
                placeholder={t("alliance.searchPlaceholder")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-10 bg-input border-border mb-3"
              />
              <div className="space-y-2 max-h-[300px] overflow-y-auto scrollbar-thin">
                {filteredTeams.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">{t("alliance.noTeams")}</p>
                )}
                {filteredTeams.map((team) => (
                  <button
                    key={team.teamNumber}
                    onClick={() => addTeam(team)}
                    className="w-full flex items-center justify-between p-3 bg-secondary rounded-lg hover:bg-secondary/80 transition-colors text-left"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold">{team.teamNumber}</span>
                      <span className="text-sm text-muted-foreground">{team.matchCount} {t("teams.matches")}</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="font-mono">{team.avgTotal.toFixed(1)}</span>
                      <Plus className="w-4 h-4 text-primary" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </PageTransition>
    </AppLayout>
  );
};

export default AllianceBuilder;
