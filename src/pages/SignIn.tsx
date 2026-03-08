import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Eye, EyeOff, Loader2, Instagram } from "lucide-react";
import bobcatsLogo from "@/assets/bobcats-logo.png";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";

const SignIn = () => {
  const navigate = useNavigate();
  const { user, signIn } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [showAgreement, setShowAgreement] = useState(false);
  const [formData, setFormData] = useState({
    teamNumber: "",
    username: "",
    password: "",
  });

  // Load persisted agreement + last used credentials
  useEffect(() => {
    const agreedStored = localStorage.getItem("bobcats_agreed");
    if (agreedStored === "true") {
      setAgreed(true);
    }
    const lastLoginRaw = localStorage.getItem("bobcats_last_login");
    if (lastLoginRaw) {
      try {
        const last = JSON.parse(lastLoginRaw) as { teamNumber?: string; username?: string };
        setFormData((prev) => ({
          ...prev,
          teamNumber: last.teamNumber || "",
          username: last.username || "",
        }));
      } catch {
        localStorage.removeItem("bobcats_last_login");
      }
    }
  }, []);

  // If already signed in, skip the sign-in page
  useEffect(() => {
    if (user) {
      navigate("/scout");
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const { error } = await signIn(formData.teamNumber, formData.username, formData.password);

    if (error) {
      toast.error(error);
      setIsLoading(false);
    } else {
      // Persist last used team + username so form can be prefilled next time
      localStorage.setItem(
        "bobcats_last_login",
        JSON.stringify({ teamNumber: formData.teamNumber, username: formData.username })
      );
      toast.success(language === "en" ? "Signed in successfully!" : "Giriş başarılı!");
      navigate("/scout");
    }
  };

  const toggleLanguage = () => {
    setLanguage(language === "en" ? "tr" : "en");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8">
      <div className="fixed inset-0 -z-10 bg-background" />

      {/* Language Toggle */}
      <div className="fixed top-4 right-4 z-50">
        <button
          onClick={toggleLanguage}
          className="flex items-center justify-center w-10 h-10 rounded-xl bg-card text-muted-foreground hover:text-foreground hover:bg-card-elevated transition-all duration-200"
          title={language === "en" ? "Türkçe" : "English"}
        >
          <span className="text-xs font-bold uppercase">{language === "en" ? "EN" : "TR"}</span>
        </button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="text-center mb-8"
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="mb-4"
        >
          <img src={bobcatsLogo} alt="Logo" className="w-20 h-20 object-contain mx-auto" />
        </motion.div>
        <h1 className="text-2xl font-bold tracking-tight">{t("signIn.title")}</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {t("signIn.subtitle")}
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-sm card-data p-6"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="teamNumber" className="text-xs uppercase tracking-wide text-muted-foreground">
              {t("signIn.teamNumber")}
            </Label>
            <Input
              id="teamNumber"
              type="text"
              placeholder="11010"
              value={formData.teamNumber}
              onChange={(e) => setFormData({ ...formData, teamNumber: e.target.value.replace(/\D/g, "").slice(0, 5) })}
              className="h-11 bg-input border-border font-mono"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="username" className="text-xs uppercase tracking-wide text-muted-foreground">
              {t("signIn.username")}
            </Label>
            <Input
              id="username"
              type="text"
              placeholder="scout1"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              className="h-11 bg-input border-border"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-xs uppercase tracking-wide text-muted-foreground">
              {t("signIn.password")}
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="h-11 bg-input border-border pr-10"
                required
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-start space-x-2">
            <Checkbox
              id="agreement"
              checked={agreed}
              onCheckedChange={(checked) => {
                const value = checked === true;
                setAgreed(value);
                if (value) {
                  localStorage.setItem("bobcats_agreed", "true");
                } else {
                  localStorage.removeItem("bobcats_agreed");
                }
              }}
              className="mt-0.5"
            />
            <label htmlFor="agreement" className="text-xs text-muted-foreground leading-tight cursor-pointer">
              {t("signIn.agreementCheck")}{" "}
              <button
                type="button"
                onClick={() => setShowAgreement(true)}
                className="text-primary hover:underline font-medium"
              >
                {t("signIn.agreementLink")}
              </button>
            </label>
          </div>

          <Button
            type="submit"
            className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
            disabled={isLoading || !agreed}
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : t("signIn.button")}
          </Button>

        </form>
      </motion.div>

      {/* User Agreement Dialog */}
      <Dialog open={showAgreement} onOpenChange={setShowAgreement}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{t("signIn.agreementTitle")}</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh]">
            <div className="prose prose-sm text-muted-foreground whitespace-pre-wrap p-1">
              {t("signIn.agreementContent")}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      <p className="mt-6 text-sm text-muted-foreground text-center max-w-sm">
        {t("signIn.contact")}{" "}
        <a href="mailto:hasalrobotics@gmail.com" className="text-primary hover:underline font-medium">
         hasalrobotics@gmail.com
        </a>
      </p>

      <div className="mt-4 flex items-center gap-3">
        <a
          href="https://www.instagram.com/bobcats11010?igsh=MTFidTNzZ2Jxcjgzeg=="
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center w-9 h-9 rounded-xl bg-card text-muted-foreground hover:text-foreground hover:bg-card-elevated transition-all duration-200"
          title="Instagram"
        >
          <Instagram className="w-4 h-4" />
        </a>
      </div>

      <p className="mt-4 text-2xs text-muted-foreground/60 text-center">
        {t("signIn.footer")}
      </p>
    </div>
  );
};

export default SignIn;
