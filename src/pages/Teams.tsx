import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { Search, ChevronUp, ChevronDown, ExternalLink, Loader2, Users } from "lucide-react";
import { Input } from "@/components/ui/input";
import AppLayout from "@/components/AppLayout";
import PageTransition from "@/components/PageTransition";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useRegional } from "@/contexts/RegionalContext";

interface TeamStats {
  teamNumber: string;
  matchCount: number;
  avgTotal: number;
  avgAuto: number;
  avgTeleop: number;
  climbPct: number;
  reliability: number;
  defense: number;
}

type SortKey = "avgTotal" | "avgAuto" | "avgTeleop" | "climbPct" | "reliability" | "defense";

const DEFENSE_MAP: Record<string, number> = { none: 1, some: 2, moderate: 3, heavy: 4, full: 5 };

const Teams = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("avgTotal");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { t } = useLanguage();
  const { regional } = useRegional();

  useEffect(() => {
    const fetchEntries = async () => {
      if (!user) return;
      let query = supabase
        .from("match_entries")
        .select("*")
        .eq("scouted_by_team", user.teamNumber);
      
      if (regional) {
        query = query.eq("regional", regional);
      }
      
      const { data } = await query;
      setEntries(data || []);
      setLoading(false);
    };
    fetchEntries();
  }, [user, regional]);

  const teams = useMemo<TeamStats[]>(() => {
    const grouped: Record<string, any[]> = {};
    entries.forEach((e) => {
      if (!grouped[e.team_number]) grouped[e.team_number] = [];
      grouped[e.team_number].push(e);
    });

    return Object.entries(grouped).map(([teamNumber, matches]) => {
      const n = matches.length;
      // Auto: total auto fuel + cycles
      const avgAuto = matches.reduce((s, m) => s + (m.auto_fuel_total || 0) + (m.cycles_completed || 0), 0) / n;
      // Teleop: only teleop fuel
      const avgTeleop = matches.reduce((s, m) => s + (m.teleop_fuel_total || 0), 0) / n;
      const climbPct = (matches.filter((m) => m.climb_result === "success" || m.climb_result === "high" || m.climb_result === "mid" || m.climb_result === "low").length / n) * 100;
      const reliability = ((n - matches.filter((m) => m.broke_down || m.lost_comms || m.tipped_over).length) / n) * 100;
      const defense = matches.reduce((s, m) => s + (DEFENSE_MAP[m.defense] || 1), 0) / n;

      return {
        teamNumber,
        matchCount: n,
        avgTotal: avgAuto + avgTeleop,
        avgAuto,
        avgTeleop,
        climbPct,
        reliability,
        defense,
      };
    });
  }, [entries]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDirection("desc");
    }
  };

  const filteredTeams = teams
    .filter(
      (team) =>
        team.teamNumber.includes(searchQuery)
    )
    .sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      return sortDirection === "asc" ? aVal - bVal : bVal - aVal;
    });

  if (loading) {
    return (
      <AppLayout>
        <PageTransition>
          <div className="flex items-center justify-center min-h-[60vh]">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        </PageTransition>
      </AppLayout>
    );
  }

  const SortHeader = ({ label, sortKeyName }: { label: string; sortKeyName: SortKey }) => (
    <th
      className="data-cell-header cursor-pointer hover:text-foreground transition-colors whitespace-nowrap"
      onClick={() => handleSort(sortKeyName)}
    >
      <div className="flex items-center gap-1">
        {label}
        {sortKey === sortKeyName && (
          sortDirection === "desc" ? (
            <ChevronDown className="w-3 h-3" />
          ) : (
            <ChevronUp className="w-3 h-3" />
          )
        )}
      </div>
    </th>
  );

  return (
    <AppLayout>
      <PageTransition>
      <div className="max-w-6xl mx-auto px-4 py-4 lg:py-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            <h1 className="text-xl font-bold">{t("teams.title")}</h1>
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder={t("teams.searchPlaceholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-10 bg-input border-border"
            />
          </div>
        </div>

        <div className="hidden md:block card-data overflow-hidden">
          <div className="overflow-x-auto scrollbar-thin">
            <table className="dense-table">
              <thead>
                <tr>
                  <th className="data-cell-header">{t("teams.title")}</th>
                  <SortHeader label={t("teams.avgTotal")} sortKeyName="avgTotal" />
                  <SortHeader label={t("teams.avgAuto")} sortKeyName="avgAuto" />
                  <SortHeader label={t("teams.avgTeleop")} sortKeyName="avgTeleop" />
                  <SortHeader label={t("teams.climbPct")} sortKeyName="climbPct" />
                  <SortHeader label={t("teams.reliability")} sortKeyName="reliability" />
                  <SortHeader label={t("teams.defense")} sortKeyName="defense" />
                  <th className="data-cell-header"></th>
                </tr>
              </thead>
              <tbody>
                {filteredTeams.map((team, index) => (
                  <tr key={team.teamNumber}>
                    <td className="data-cell">
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground text-xs w-5">{index + 1}</span>
                        <span className="font-mono font-semibold">{team.teamNumber}</span>
                        <span className="text-muted-foreground text-sm hidden lg:inline">{team.matchCount} {t("teams.matches")}</span>
                      </div>
                    </td>
                    <td className="data-cell font-mono font-semibold">{team.avgTotal.toFixed(1)}</td>
                    <td className="data-cell font-mono">{team.avgAuto.toFixed(1)}</td>
                    <td className="data-cell font-mono">{team.avgTeleop.toFixed(1)}</td>
                    <td className="data-cell">
                      <span className={cn(
                        "font-mono",
                        team.climbPct >= 70 ? "text-status-success" : team.climbPct >= 50 ? "text-status-warning" : "text-status-danger"
                      )}>
                        {team.climbPct}%
                      </span>
                    </td>
                    <td className="data-cell">
                      <span className={cn(
                        "font-mono",
                        team.reliability >= 85 ? "text-status-success" : team.reliability >= 70 ? "text-status-warning" : "text-status-danger"
                      )}>
                        {team.reliability}%
                      </span>
                    </td>
                    <td className="data-cell font-mono">{team.defense.toFixed(1)}</td>
                    <td className="data-cell">
                      <Link
                        to={`/teams/${team.teamNumber}`}
                        className="text-primary hover:text-primary/80 transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="md:hidden mobile-card-list">
          {filteredTeams.map((team, index) => (
            <Link
              key={team.teamNumber}
              to={`/teams/${team.teamNumber}`}
              className="mobile-card-item block"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground text-xs w-5">{index + 1}</span>
                  <span className="font-mono font-bold text-lg">{team.teamNumber}</span>
                </div>
                <span className="font-mono text-xl font-bold">{team.avgTotal.toFixed(1)}</span>
              </div>
              <div className="text-sm text-muted-foreground mb-2">{team.matchCount} {t("teams.matches")}</div>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div>
                  <span className="text-muted-foreground">{t("history.auto")}: </span>
                  <span className="font-mono">{team.avgAuto.toFixed(1)}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">{t("history.teleop")}: </span>
                  <span className="font-mono">{team.avgTeleop.toFixed(1)}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">{t("history.climb")}: </span>
                  <span className={cn(
                    "font-mono",
                    team.climbPct >= 70 ? "text-status-success" : team.climbPct >= 50 ? "text-status-warning" : "text-status-danger"
                  )}>
                    {team.climbPct}%
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
      </PageTransition>
    </AppLayout>
  );
};

export default Teams;
