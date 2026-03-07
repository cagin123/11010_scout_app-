import { useState } from "react";
import { Save, Bot, Gamepad2, AlertTriangle, FileText, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import AppLayout from "@/components/AppLayout";
import PageTransition from "@/components/PageTransition";
import CounterControl from "@/components/scouting/CounterControl";
import ToggleControl from "@/components/scouting/ToggleControl";
import StarRating from "@/components/scouting/StarRating";
import SegmentedControl from "@/components/scouting/SegmentedControl";
import AllianceToggle from "@/components/scouting/AllianceToggle";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useRegional } from "@/contexts/RegionalContext";
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

interface MatchData {
  matchNumber: string;
  teamNumber: string;
  alliance: "red" | "blue";
  autoFuelHigh: number;
  autoFuelLow: number;
  leftStartingZone: boolean;
  autoClimbAttempted: boolean;
  teleopFuelHigh: number;
  teleopFuelLow: number;
  cyclesCompleted: number;
  defense: "none" | "light" | "heavy";
  effectiveOverBumps: boolean;
  usedTrenchWell: boolean;
  climbResult: "none" | "low" | "mid" | "high";
  parkedOnly: boolean;
  brokeDown: boolean;
  tippedOver: boolean;
  lostComms: boolean;
  driverSkillRating: number;
  notes: string;
}

const initialMatchData: MatchData = {
  matchNumber: "",
  teamNumber: "",
  alliance: "red",
  autoFuelHigh: 0,
  autoFuelLow: 0,
  leftStartingZone: false,
  autoClimbAttempted: false,
  teleopFuelHigh: 0,
  teleopFuelLow: 0,
  cyclesCompleted: 0,
  defense: "none",
  effectiveOverBumps: false,
  usedTrenchWell: false,
  climbResult: "none",
  parkedOnly: false,
  brokeDown: false,
  tippedOver: false,
  lostComms: false,
  driverSkillRating: 3,
  notes: "",
};

const ScoutMatch = () => {
  const [matchData, setMatchData] = useState<MatchData>(initialMatchData);
  const [isSaving, setIsSaving] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const { user } = useAuth();
  const { t } = useLanguage();
  const { regional } = useRegional();

  const updateField = <K extends keyof MatchData>(field: K, value: MatchData[K]) => {
    setMatchData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveClick = () => {
    if (!matchData.matchNumber || !matchData.teamNumber) {
      toast.error(t("scout.errorMatchTeam"));
      return;
    }
    if (!user) {
      toast.error(t("scout.errorSignIn"));
      return;
    }
    if (!regional) {
      toast.error(t("scout.errorNoRegional"));
      return;
    }
    setShowConfirm(true);
  };

  const handleConfirmSave = async () => {
    setShowConfirm(false);
    if (!matchData.matchNumber || !matchData.teamNumber) {
      toast.error(t("scout.errorMatchTeam"));
      return;
    }

    if (!user) {
      toast.error(t("scout.errorSignIn"));
      return;
    }

    if (!regional) {
      toast.error(t("scout.errorNoRegional"));
      return;
    }

    setIsSaving(true);

    const { error } = await supabase.from("match_entries").insert({
      scouted_by: user.username,
      scouted_by_team: user.teamNumber,
      match_number: parseInt(matchData.matchNumber),
      team_number: matchData.teamNumber,
      alliance: matchData.alliance,
      auto_fuel_high: matchData.autoFuelHigh,
      auto_fuel_low: matchData.autoFuelLow,
      left_starting_zone: matchData.leftStartingZone,
      auto_climb_attempted: matchData.autoClimbAttempted,
      teleop_fuel_high: matchData.teleopFuelHigh,
      teleop_fuel_low: matchData.teleopFuelLow,
      cycles_completed: matchData.cyclesCompleted,
      defense: matchData.defense,
      effective_over_bumps: matchData.effectiveOverBumps,
      used_trench_well: matchData.usedTrenchWell,
      climb_result: matchData.climbResult,
      parked_only: matchData.parkedOnly,
      broke_down: matchData.brokeDown,
      tipped_over: matchData.tippedOver,
      lost_comms: matchData.lostComms,
      driver_skill_rating: matchData.driverSkillRating,
      notes: matchData.notes,
      regional: regional,
    });

    setIsSaving(false);

    if (error) {
      toast.error(t("scout.errorSave") + error.message);
    } else {
      toast.success(t("scout.successSave").replace("{match}", matchData.matchNumber).replace("{team}", matchData.teamNumber));
      setMatchData(initialMatchData);
    }
  };




  return (
    <AppLayout>
      <PageTransition>
      <div className="max-w-lg mx-auto px-4 py-4 lg:py-6 pb-32">
        <div className="mb-6">
          <h1 className="text-xl font-bold mb-4">{t("scout.title")}</h1>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div>
              <label className="text-2xs uppercase tracking-wide text-muted-foreground block mb-1.5">
                {t("scout.matchNumber")}
              </label>
              <Input
                type="text"
                inputMode="numeric"
                placeholder="1"
                value={matchData.matchNumber}
                onChange={(e) => updateField("matchNumber", e.target.value.replace(/\D/g, ""))}
                className="h-12 bg-input border-border font-mono text-lg text-center"
              />
            </div>
            <div>
              <label className="text-2xs uppercase tracking-wide text-muted-foreground block mb-1.5">
                {t("scout.teamNumber")}
              </label>
              <Input
                type="text"
                inputMode="numeric"
                placeholder="1234"
                value={matchData.teamNumber}
                onChange={(e) => updateField("teamNumber", e.target.value.replace(/\D/g, "").slice(0, 5))}
                className="h-12 bg-input border-border font-mono text-lg text-center"
              />
            </div>
          </div>

          <AllianceToggle
            value={matchData.alliance}
            onChange={(value) => updateField("alliance", value)}
          />
        </div>

        <section className="mb-6">
          <div className="section-header">
            <Bot className="w-4 h-4 text-primary" />
            <span>{t("scout.autonomous")}</span>
          </div>
          <div className="card-data p-4 space-y-4">
            <CounterControl label={t("scout.autoFuelHigh")} value={matchData.autoFuelHigh} onChange={(v) => updateField("autoFuelHigh", v)} />
            <CounterControl label={t("scout.autoFuelLow")} value={matchData.autoFuelLow} onChange={(v) => updateField("autoFuelLow", v)} />
            <div className="grid grid-cols-1 gap-2 pt-2">
              <ToggleControl label={t("scout.leftStartingZone")} value={matchData.leftStartingZone} onChange={(v) => updateField("leftStartingZone", v)} />
              <ToggleControl label={t("scout.autoClimbAttempted")} value={matchData.autoClimbAttempted} onChange={(v) => updateField("autoClimbAttempted", v)} />
            </div>
          </div>
        </section>

        <section className="mb-6">
          <div className="section-header">
            <Gamepad2 className="w-4 h-4 text-primary" />
            <span>{t("scout.teleop")}</span>
          </div>
          <div className="card-data p-4 space-y-4">
            <CounterControl label={t("scout.teleopFuelHigh")} value={matchData.teleopFuelHigh} onChange={(v) => updateField("teleopFuelHigh", v)} />
            <CounterControl label={t("scout.teleopFuelLow")} value={matchData.teleopFuelLow} onChange={(v) => updateField("teleopFuelLow", v)} />
            <CounterControl label={t("scout.cyclesCompleted")} value={matchData.cyclesCompleted} onChange={(v) => updateField("cyclesCompleted", v)} />
            <SegmentedControl
              label={t("scout.defense")}
              value={matchData.defense}
              options={[
                { value: "none", label: t("scout.defenseNone") },
                { value: "light", label: t("scout.defenseLight") },
                { value: "heavy", label: t("scout.defenseHeavy") },
              ]}
              onChange={(v) => updateField("defense", v)}
            />
            <div className="grid grid-cols-1 gap-2 pt-2">
              <ToggleControl label={t("scout.effectiveOverBumps")} value={matchData.effectiveOverBumps} onChange={(v) => updateField("effectiveOverBumps", v)} />
              <ToggleControl label={t("scout.usedTrenchWell")} value={matchData.usedTrenchWell} onChange={(v) => updateField("usedTrenchWell", v)} />
            </div>
          </div>
        </section>

        <section className="mb-6">
          <div className="section-header">
            <AlertTriangle className="w-4 h-4 text-status-warning" />
            <span>{t("scout.reliability")}</span>
          </div>
          <div className="card-data p-4 space-y-4">
            <div className="grid grid-cols-1 gap-2">
              <ToggleControl label={t("scout.brokeDown")} value={matchData.brokeDown} onChange={(v) => updateField("brokeDown", v)} />
              <ToggleControl label={t("scout.tippedOver")} value={matchData.tippedOver} onChange={(v) => updateField("tippedOver", v)} />
              <ToggleControl label={t("scout.lostComms")} value={matchData.lostComms} onChange={(v) => updateField("lostComms", v)} />
            </div>
            <StarRating label={t("scout.driverSkill")} value={matchData.driverSkillRating} onChange={(v) => updateField("driverSkillRating", v)} />
          </div>
        </section>

        <section className="mb-6">
          <div className="section-header">
            <FileText className="w-4 h-4 text-muted-foreground" />
            <span>{t("scout.quickNotes")}</span>
          </div>
          <div className="card-data p-4">
            <Textarea
              placeholder={t("scout.notesPlaceholder")}
              value={matchData.notes}
              onChange={(e) => updateField("notes", e.target.value)}
              className="min-h-[80px] bg-input border-border resize-none"
            />
          </div>
        </section>
      </div>
      </PageTransition>

      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-status-warning" />
              {t("scout.confirmTitle")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("scout.confirmMessage")
                .replace("{match}", matchData.matchNumber)
                .replace("{team}", matchData.teamNumber)}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("scout.confirmCancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmSave}>
              {t("scout.confirmSave")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="sticky-action-bar lg:left-16">
        <Button
          onClick={handleSaveClick}
          disabled={isSaving}
          className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-base active:scale-[0.98] transition-transform"
        >
          <Save className="w-5 h-5 mr-2" />
          {isSaving ? t("scout.saving") : t("scout.saveMatch")}
        </Button>
      </div>
    </AppLayout>
  );
};

export default ScoutMatch;
