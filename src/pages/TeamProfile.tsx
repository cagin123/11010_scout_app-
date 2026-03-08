import { useParams, Link } from "react-router-dom";
import { ArrowLeft, TrendingUp, TrendingDown, Minus, Shield, Zap, AlertTriangle, CheckCircle, Loader2 } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import AppLayout from "@/components/AppLayout";
import PageTransition from "@/components/PageTransition";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useRegional } from "@/contexts/RegionalContext";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
} from "recharts";

const DEFENSE_MAP: Record<string, number> = { none: 1, some: 2, moderate: 3, heavy: 4, full: 5 };

const TeamProfile = () => {
  const { teamNumber } = useParams();
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { t } = useLanguage();
  const { regional } = useRegional();

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      let query = supabase
        .from("match_entries")
        .select("*")
        .eq("team_number", teamNumber || "")
        .eq("scouted_by_team", user.teamNumber);
      
      if (regional) {
        query = query.eq("regional", regional);
      }
      
      const { data } = await query;
      setEntries(data || []);
      setLoading(false);
    };
    fetchData();
  }, [teamNumber, user, regional]);

  const stats = useMemo(() => {
    if (entries.length === 0) return null;
    const n = entries.length;
    // Auto: total auto fuel + cycles
    const avgAuto = entries.reduce((s, m) => s + (m.auto_fuel_total || 0) + (m.cycles_completed || 0), 0) / n;
    // Teleop: only teleop fuel
    const avgTeleop = entries.reduce((s, m) => s + (m.teleop_fuel_total || 0), 0) / n;
    const avgTotal = avgAuto + avgTeleop;
    const climbPct = (entries.filter((m) => ["success", "high", "mid", "low"].includes(m.climb_result)).length / n) * 100;
    const reliability = ((n - entries.filter((m) => m.broke_down || m.lost_comms || m.tipped_over).length) / n) * 100;
    const defense = entries.reduce((s, m) => s + (DEFENSE_MAP[m.defense] || 1), 0) / n;
    const avgCycles = entries.reduce((s, m) => s + m.cycles_completed, 0) / n;

    const sorted = [...entries].sort((a, b) => a.match_number - b.match_number);
    const last5 = sorted.slice(-5).map((m) => ({
      match: `Q${m.match_number}`,
      auto: (m.auto_fuel_total || 0) + (m.cycles_completed || 0),
      teleop: m.teleop_fuel_total || 0,
    }));

    const totalAuto = entries.reduce((s, m) => s + (m.auto_fuel_total || 0) + (m.cycles_completed || 0), 0);
    const totalTeleop = entries.reduce((s, m) => s + (m.teleop_fuel_total || 0), 0);
    const totalAll = totalAuto + totalTeleop || 1;
    const autoPct = Math.round((totalAuto / totalAll) * 100);
    const teleopPct = 100 - autoPct;

    const climbCounts = { high: 0, mid: 0, low: 0, none: 0 };
    entries.forEach((m) => {
      if (m.climb_result === "success" || m.climb_result === "high") climbCounts.high++;
      else if (m.climb_result === "mid") climbCounts.mid++;
      else if (m.climb_result === "low") climbCounts.low++;
      else climbCounts.none++;
    });

    const tags: string[] = [];
    if (reliability >= 85) tags.push("reliable");
    if (reliability < 60) tags.push("failure-risk");
    if (defense >= 3.5) tags.push("strong-defender");
    if (avgCycles >= 4) tags.push("fast-cycler");

    return {
      avgAuto, avgTeleop, avgTotal, climbPct, reliability, defense, avgCycles,
      last5, autoPct, teleopPct, climbCounts, tags, matchCount: n,
    };
  }, [entries]);

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

  if (!stats) {
    return (
      <AppLayout>
        <PageTransition>
          <div className="max-w-6xl mx-auto px-4 py-4 lg:py-6">
            <Link to="/teams" className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4">
              <ArrowLeft className="w-5 h-5" /> {t("profile.back")}
            </Link>
            <p className="text-muted-foreground">{t("profile.noData").replace("{team}", teamNumber || "")}</p>
          </div>
        </PageTransition>
      </AppLayout>
    );
  }

  const getTagStyle = (tag: string) => {
    switch (tag) {
      case "reliable": return "status-reliable";
      case "failure-risk": return "status-danger";
      case "strong-defender": return "status-warning";
      case "fast-cycler": return "status-info";
      default: return "bg-secondary text-foreground";
    }
  };

  const getTagIcon = (tag: string) => {
    switch (tag) {
      case "reliable": return <CheckCircle className="w-3 h-3" />;
      case "failure-risk": return <AlertTriangle className="w-3 h-3" />;
      case "strong-defender": return <Shield className="w-3 h-3" />;
      case "fast-cycler": return <Zap className="w-3 h-3" />;
      default: return null;
    }
  };

  const getTagLabel = (tag: string) => {
    switch (tag) {
      case "reliable": return t("profile.reliable");
      case "failure-risk": return t("profile.failureRisk");
      case "strong-defender": return t("profile.strongDefender");
      case "fast-cycler": return t("profile.fastCycler");
      default: return tag;
    }
  };

  const autoTeleopSplit = [
    { name: "Auto", value: stats.autoPct },
    { name: "Teleop", value: stats.teleopPct },
  ];

  const climbData = [
    { result: t("scout.climbHigh"), count: stats.climbCounts.high },
    { result: t("scout.climbMid"), count: stats.climbCounts.mid },
    { result: t("scout.climbLow"), count: stats.climbCounts.low },
    { result: t("scout.climbNone"), count: stats.climbCounts.none },
  ];

  return (
    <AppLayout>
      <PageTransition>
      <div className="max-w-6xl mx-auto px-4 py-4 lg:py-6">
        <div className="flex items-center gap-4 mb-6">
          <Link
            to="/teams"
            className="flex items-center justify-center w-10 h-10 rounded-lg bg-secondary text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold font-mono">{teamNumber}</h1>
              <div className="flex gap-1.5">
                {stats.tags.map((tag) => (
                  <span key={tag} className={cn("status-tag", getTagStyle(tag))}>
                    {getTagIcon(tag)}
                    {getTagLabel(tag)}
                  </span>
                ))}
              </div>
            </div>
            <p className="text-sm text-muted-foreground">{stats.matchCount} {t("profile.matchRecords")}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 mb-6">
          <MetricCard label={t("teams.avgAuto")} value={stats.avgAuto.toFixed(1)} />
          <MetricCard label={t("teams.avgTeleop")} value={stats.avgTeleop.toFixed(1)} />
          <MetricCard label={t("teams.avgTotal")} value={stats.avgTotal.toFixed(1)} />
          <MetricCard label={t("teams.climbPct")} value={`${stats.climbPct.toFixed(0)}%`} />
          <MetricCard label={t("teams.reliability")} value={`${stats.reliability.toFixed(0)}%`} highlight={stats.reliability >= 85} />
          <MetricCard label={t("teams.defense")} value={stats.defense.toFixed(1)} />
          <MetricCard label={t("profile.avgCycles")} value={stats.avgCycles.toFixed(1)} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 card-data p-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">
              {t("profile.lastMatches").replace("{count}", stats.last5.length.toString())}
            </h3>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.last5} barCategoryGap="20%">
                  <XAxis
                    dataKey="match"
                    tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                    axisLine={{ stroke: "hsl(var(--border))" }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    width={30}
                  />
                  <Bar dataKey="auto" stackId="a" fill="hsl(var(--primary))" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="teleop" stackId="a" fill="hsl(var(--alliance-blue))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-4 mt-2">
              <div className="flex items-center gap-2 text-xs">
                <div className="w-3 h-3 rounded bg-primary" />
                <span className="text-muted-foreground">Auto</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <div className="w-3 h-3 rounded bg-alliance-blue" />
                <span className="text-muted-foreground">Teleop</span>
              </div>
            </div>
          </div>

          <div className="card-data p-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">
              {t("profile.autoVsTeleop")}
            </h3>
            <div className="h-48 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={autoTeleopSplit}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    <Cell fill="hsl(var(--primary))" />
                    <Cell fill="hsl(var(--alliance-blue))" />
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-4">
              <div className="text-center">
                <div className="text-lg font-bold font-mono text-primary">{stats.autoPct}%</div>
                <div className="text-2xs text-muted-foreground">Auto</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold font-mono text-alliance-blue">{stats.teleopPct}%</div>
                <div className="text-2xs text-muted-foreground">Teleop</div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 card-data p-4">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">
            {t("profile.climbConsistency")}
          </h3>
          <div className="grid grid-cols-4 gap-3">
            {climbData.map((item) => (
              <div
                key={item.result}
                className={cn(
                  "p-3 rounded-lg text-center",
                  item.count > 0 ? "bg-status-success-bg" : "bg-secondary"
                )}
              >
                <div className={cn(
                  "text-2xl font-bold font-mono",
                  item.count > 0 ? "text-status-success" : "text-muted-foreground"
                )}>
                  {item.count}
                </div>
                <div className="text-2xs text-muted-foreground uppercase tracking-wide">
                  {item.result}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      </PageTransition>
    </AppLayout>
  );
};

interface MetricCardProps {
  label: string;
  value: string;
  highlight?: boolean;
}

const MetricCard = ({ label, value, highlight = false }: MetricCardProps) => (
  <div className={cn(
    "metric-card",
    highlight && "ring-1 ring-status-success/30 bg-status-success-bg"
  )}>
    <div className={cn("metric-value", highlight && "text-status-success")}>
      {value}
    </div>
    <div className="metric-label">{label}</div>
  </div>
);

export default TeamProfile;
