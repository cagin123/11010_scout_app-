import { NavLink, useLocation } from "react-router-dom";
import { ClipboardList, Users, LogOut, Menu, X, Shield, History, Globe, Handshake, MapPin } from "lucide-react";
import bobcatsLogo from "@/assets/bobcats-logo.png";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useRegional } from "@/contexts/RegionalContext";
import { motion, AnimatePresence } from "framer-motion";


interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout = ({ children }: AppLayoutProps) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [regionalMenuOpen, setRegionalMenuOpen] = useState(false);
  const { signOut, isAdmin, user } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const { regional, setRegional, regionals } = useRegional();
  

  const navItems = [
    { to: "/scout", icon: ClipboardList, label: t("nav.scout") },
    { to: "/history", icon: History, label: t("nav.history") },
    { to: "/teams", icon: Users, label: t("nav.teams") },
    { to: "/alliance", icon: Handshake, label: t("nav.alliance") },
    ...(isAdmin ? [{ to: "/admin/users", icon: Shield, label: t("nav.admin") }] : []),
  ];

  const handleSignOut = () => {
    signOut();
    window.location.href = "/signin";
  };

  const toggleLanguage = () => {
    setLanguage(language === "en" ? "tr" : "en");
  };


  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-50 lg:flex lg:w-16 lg:flex-col bg-sidebar">
        <div className="flex h-16 items-center justify-center">
          <div className="flex items-center justify-center w-10 h-10">
            <img src={bobcatsLogo} alt="Logo" className="w-9 h-9 object-contain" />
          </div>
        </div>

        <nav className="flex flex-1 flex-col items-center gap-2 py-4">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  "relative flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-200",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-[0_0_20px_-4px_hsl(var(--primary)/0.4)]"
                    : "text-muted-foreground hover:text-foreground hover:bg-card-elevated hover:scale-110 active:scale-95"
                )
              }
              title={item.label}
            >
              <item.icon className="w-5 h-5" />
            </NavLink>
          ))}
        </nav>

        <div className="py-4 flex flex-col items-center gap-2">
          <button
            className={cn(
              "flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-200",
              regional
                ? "text-primary bg-primary/10"
                : "text-muted-foreground hover:text-foreground hover:bg-card-elevated hover:scale-110 active:scale-95"
            )}
            title={regional || t("regional.select")}
            onClick={() => setRegionalMenuOpen(!regionalMenuOpen)}
          >
            <MapPin className="w-5 h-5" />
          </button>
          <button
            className="flex items-center justify-center w-10 h-10 rounded-xl text-muted-foreground hover:text-foreground hover:bg-card-elevated hover:scale-110 active:scale-95 transition-all duration-200"
            title={language === "en" ? "Türkçe" : "English"}
            onClick={toggleLanguage}
          >
            <span className="text-xs font-bold uppercase">{language === "en" ? "EN" : "TR"}</span>
          </button>
          <button
            className="flex items-center justify-center w-10 h-10 rounded-xl text-muted-foreground hover:text-foreground hover:bg-card-elevated hover:scale-110 active:scale-95 transition-all duration-200"
            title={t("nav.signOut")}
            onClick={handleSignOut}
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </aside>

      {/* Regional Dropdown (Desktop) */}
      <AnimatePresence>
        {regionalMenuOpen && (
          <>
            <div className="hidden lg:block fixed inset-0 z-[55]" onClick={() => setRegionalMenuOpen(false)} />
            <motion.div
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.2 }}
              className="hidden lg:block fixed left-[72px] bottom-24 z-[60] w-64 bg-card border border-border rounded-xl shadow-xl p-3"
            >
              <RegionalPanel
                regional={regional}
                regionals={regionals}
                setRegional={(r) => { setRegional(r); setRegionalMenuOpen(false); }}
                t={t}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 h-14 bg-background/90 backdrop-blur-xl">
        <div className="flex h-full items-center justify-between px-4">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-8 h-8">
              <img src={bobcatsLogo} alt="Logo" className="w-7 h-7 object-contain" />
            </div>
            <button
              onClick={() => setRegionalMenuOpen(!regionalMenuOpen)}
              className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-secondary text-sm"
            >
              <MapPin className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs font-medium truncate max-w-[120px]">
                {regional || t("regional.select")}
              </span>
            </button>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={toggleLanguage}
              className="flex items-center justify-center w-10 h-10 rounded-xl text-muted-foreground hover:text-foreground hover:bg-card-elevated transition-all"
            >
              <span className="text-xs font-bold uppercase">{language === "en" ? "EN" : "TR"}</span>
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="flex items-center justify-center w-10 h-10 rounded-xl text-muted-foreground hover:text-foreground hover:bg-card-elevated transition-all"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Regional Dropdown - outside header to avoid backdrop-blur containment */}
      <AnimatePresence>
        {regionalMenuOpen && (
          <>
            <div className="lg:hidden fixed inset-0 z-[55]" onClick={() => setRegionalMenuOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="lg:hidden fixed top-14 left-0 right-0 bg-card p-3 z-[60] border-b border-border"
            >
              <RegionalPanel
                regional={regional}
                regionals={regionals}
                setRegional={(r) => { setRegional(r); setRegionalMenuOpen(false); }}
                t={t}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Mobile Menu Dropdown - outside header */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="lg:hidden fixed top-14 left-0 right-0 bg-card p-3 z-[55]"
          >
            <nav className="flex flex-col gap-1">
              {navItems.map((item, i) => (
                <motion.div
                  key={item.to}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2, delay: i * 0.04 }}
                >
                  <NavLink
                    to={item.to}
                    onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      cn(
                        "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 active:scale-[0.97]",
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:text-foreground hover:bg-card-elevated"
                      )
                    }
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </NavLink>
                </motion.div>
              ))}
              <motion.button
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2, delay: navItems.length * 0.04 }}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-muted-foreground hover:text-foreground hover:bg-card-elevated transition-all duration-200 mt-2 pt-3 active:scale-[0.97]"
                onClick={handleSignOut}
              >
                <LogOut className="w-5 h-5" />
                <span className="font-medium">{t("nav.signOut")}</span>
              </motion.button>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Bottom Nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 h-16 bg-background/90 backdrop-blur-xl safe-area-inset-bottom">
        <div className="flex h-full items-center justify-around px-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  "flex flex-col items-center justify-center gap-0.5 px-3 py-1.5 rounded-lg min-w-[60px] transition-all duration-200 active:scale-90",
                  isActive ? "text-primary" : "text-muted-foreground"
                )
              }
            >
              <item.icon className="w-5 h-5" />
              <span className="text-2xs font-medium">{item.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Main Content */}
      <main className="lg:pl-16 pt-14 lg:pt-0 pb-20 lg:pb-0 min-h-screen">
        {children}
      </main>

    </div>
  );
};

interface RegionalPanelProps {
  regional: string;
  regionals: string[];
  setRegional: (r: string) => void;
  t: (key: string) => string;
}

const RegionalPanel = ({
  regional,
  regionals,
  setRegional,
  t,
}: RegionalPanelProps) => (
  <div className="space-y-3">
    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
      <MapPin className="w-4 h-4" />
      {t("regional.select")}
    </h3>

    <div className="space-y-1">
      <button
        onClick={() => setRegional("")}
        className={cn(
          "w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors",
          !regional ? "bg-primary text-primary-foreground" : "hover:bg-secondary text-muted-foreground"
        )}
      >
        <span>{t("regional.noRegional")}</span>
      </button>
      {regionals.map((r) => (
        <button
          key={r}
          onClick={() => setRegional(r)}
          className={cn(
            "w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors text-left",
            regional === r ? "bg-primary text-primary-foreground" : "hover:bg-secondary"
          )}
        >
          <span className="truncate">{r}</span>
          {regional === r && <span className="text-2xs opacity-75">{t("regional.active")}</span>}
        </button>
      ))}
      {regionals.length === 0 && (
        <p className="text-xs text-muted-foreground py-2 px-3">{t("admin.noRegionals")}</p>
      )}
    </div>
  </div>
);

export default AppLayout;
