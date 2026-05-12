"use client";

import { useState } from "react";
import { useTheme } from "next-themes";
import { motion } from "framer-motion";
import {
  User, Bell, Shield, Palette, Link2, Smartphone, Monitor,
  Globe, Check, ChevronRight, LogOut, Zap, Sun, Moon
} from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type Section = "profile" | "notifications" | "appearance" | "integrations" | "account";

const sections: { id: Section; label: string; icon: React.ElementType; desc: string }[] = [
  { id: "profile", label: "Profile", icon: User, desc: "Your name, email, and avatar" },
  { id: "notifications", label: "Notifications", icon: Bell, desc: "Push, email, reminders" },
  { id: "appearance", label: "Appearance", icon: Palette, desc: "Theme, colors, density" },
  { id: "integrations", label: "Integrations", icon: Link2, desc: "Google, Slack, and more" },
  { id: "account", label: "Account & Security", icon: Shield, desc: "Password, 2FA, danger zone" },
];

const ACCENT_COLORS = [
  { name: "Orange", value: "#E84E10", class: "bg-[#E84E10]" },
  { name: "Purple", value: "#7C3AED", class: "bg-[#7C3AED]" },
  { name: "Blue", value: "#2563EB", class: "bg-[#2563EB]" },
  { name: "Green", value: "#059669", class: "bg-[#059669]" },
  { name: "Pink", value: "#DB2777", class: "bg-[#DB2777]" },
  { name: "Teal", value: "#0891B2", class: "bg-[#0891B2]" },
];

export function SettingsView() {
  const [activeSection, setActiveSection] = useState<Section>("profile");
  const [name, setName] = useState("Alex Rivera");
  const [selectedColor, setSelectedColor] = useState("#E84E10");
  const { theme, setTheme } = useTheme();
  const [notifSettings, setNotifSettings] = useState({
    pushEnabled: true,
    emailDigest: false,
    remindersBefore: "15",
    overdueAlerts: true,
    weeklyReport: true,
  });

  const toggle = (key: keyof typeof notifSettings) =>
    setNotifSettings((prev) => ({ ...prev, [key]: !prev[key] }));

  const save = () => toast.success("Settings saved!");

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Header title="Settings" />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar nav */}
        <aside className="w-64 flex-shrink-0 border-r-2 border-nb-border dark:border-border bg-card overflow-y-auto p-3">
          <div className="space-y-1">
            {sections.map(({ id, label, icon: Icon, desc }) => (
              <button
                key={id}
                onClick={() => setActiveSection(id)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-nb text-left transition-all duration-150",
                  activeSection === id
                    ? "bg-nb-primary text-white border-2 border-nb-border shadow-nb-sm"
                    : "hover:bg-muted border-2 border-transparent"
                )}
              >
                <Icon size={16} className="flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-bold leading-tight">{label}</p>
                  <p className={cn("text-xs truncate", activeSection === id ? "text-white/70" : "text-muted-foreground")}>
                    {desc}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </aside>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="max-w-2xl space-y-6"
          >
            {/* ── PROFILE ── */}
            {activeSection === "profile" && (
              <>
                <SectionTitle icon={User} title="Profile" subtitle="How you appear to others" />

                <div className="nb-card p-6 space-y-5">
                  <div className="flex items-center gap-5">
                    <div className="relative">
                      <img
                        src="https://api.dicebear.com/9.x/avataaars/svg?seed=Alex&backgroundColor=b6e3f4"
                        alt="Avatar"
                        className="w-20 h-20 rounded-nb-lg border-2 border-nb-border shadow-nb"
                      />
                      <button className="absolute -bottom-1 -right-1 w-7 h-7 bg-nb-primary border-2 border-nb-border rounded-nb-lg flex items-center justify-center shadow-nb-sm hover:shadow-nb transition-shadow">
                        <Zap size={12} className="text-white" />
                      </button>
                    </div>
                    <div>
                      <p className="font-black text-lg">Alex Rivera</p>
                      <p className="text-sm text-muted-foreground">alex@taskflow.app</p>
                      <Badge variant="accent" className="mt-1 text-xs">Pro Plan</Badge>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label>Display name</Label>
                    <Input value={name} onChange={(e) => setName(e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Email</Label>
                    <Input value="alex@taskflow.app" disabled className="opacity-60" />
                    <p className="text-xs text-muted-foreground">Managed by Google OAuth</p>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Bio</Label>
                    <Input placeholder="Tell your team something about you..." />
                  </div>
                  <Button onClick={save}>Save changes</Button>
                </div>
              </>
            )}

            {/* ── NOTIFICATIONS ── */}
            {activeSection === "notifications" && (
              <>
                <SectionTitle icon={Bell} title="Notifications" subtitle="Control how and when you get notified" />

                <div className="nb-card p-6 space-y-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Push Notifications</p>
                  {[
                    { key: "pushEnabled", label: "Browser push notifications", desc: "Real-time alerts in your browser" },
                    { key: "overdueAlerts", label: "Overdue task alerts", desc: "Get notified when tasks pass their due date" },
                  ].map(({ key, label, desc }) => (
                    <ToggleRow
                      key={key}
                      label={label}
                      desc={desc}
                      checked={notifSettings[key as keyof typeof notifSettings] as boolean}
                      onChange={() => toggle(key as keyof typeof notifSettings)}
                    />
                  ))}
                </div>

                <div className="nb-card p-6 space-y-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Email</p>
                  {[
                    { key: "emailDigest", label: "Daily digest email", desc: "Summary of your tasks every morning" },
                    { key: "weeklyReport", label: "Weekly productivity report", desc: "Your task completion stats each Monday" },
                  ].map(({ key, label, desc }) => (
                    <ToggleRow
                      key={key}
                      label={label}
                      desc={desc}
                      checked={notifSettings[key as keyof typeof notifSettings] as boolean}
                      onChange={() => toggle(key as keyof typeof notifSettings)}
                    />
                  ))}
                </div>

                <div className="nb-card p-6 space-y-3">
                  <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Reminder defaults</p>
                  <div className="space-y-1.5">
                    <Label>Remind me before due date</Label>
                    <div className="flex gap-2">
                      {["5", "15", "30", "60"].map((v) => (
                        <button
                          key={v}
                          onClick={() => setNotifSettings((p) => ({ ...p, remindersBefore: v }))}
                          className={cn(
                            "px-4 py-2 rounded-nb border-2 text-sm font-bold transition-all",
                            notifSettings.remindersBefore === v
                              ? "bg-nb-primary text-white border-nb-border shadow-nb"
                              : "bg-card border-nb-border dark:border-border hover:bg-muted shadow-nb-sm"
                          )}
                        >
                          {v}m
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <Button onClick={save}>Save preferences</Button>
              </>
            )}

            {/* ── APPEARANCE ── */}
            {activeSection === "appearance" && (
              <>
                <SectionTitle icon={Palette} title="Appearance" subtitle="Make TaskFlow yours" />

                <div className="nb-card p-6 space-y-5">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-3">Theme</p>
                    <div className="flex gap-3">
                      {(["light", "dark", "system"] as const).map((t) => (
                        <button
                          key={t}
                          onClick={() => setTheme(t)}
                          className={cn(
                            "flex-1 p-4 rounded-nb border-2 font-bold text-sm flex items-center justify-center gap-2 transition-all",
                            theme === t
                              ? "bg-nb-primary text-white border-nb-border shadow-nb"
                              : "bg-card border-nb-border dark:border-border hover:bg-muted shadow-nb-sm"
                          )}
                        >
                          {t === "light" ? <Sun size={16} /> : t === "dark" ? <Moon size={16} /> : <Monitor size={16} />}
                          {t === "light" ? "Light" : t === "dark" ? "Dark" : "System"}
                          {theme === t && <Check size={14} />}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-3">Accent color</p>
                    <div className="flex gap-3 flex-wrap">
                      {ACCENT_COLORS.map(({ name, value, class: cls }) => (
                        <button
                          key={value}
                          title={name}
                          onClick={() => setSelectedColor(value)}
                          className={cn(
                            "w-10 h-10 rounded-nb border-2 border-nb-border transition-all shadow-nb-sm",
                            cls,
                            selectedColor === value && "shadow-nb scale-110 ring-2 ring-offset-2 ring-nb-border"
                          )}
                        >
                          {selectedColor === value && <Check size={16} className="text-white mx-auto" />}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-3">Density</p>
                    <div className="flex gap-2">
                      {["Compact", "Default", "Spacious"].map((d) => (
                        <button
                          key={d}
                          className={cn(
                            "px-4 py-2 rounded-nb border-2 text-sm font-bold transition-all shadow-nb-sm",
                            d === "Default"
                              ? "bg-nb-primary text-white border-nb-border shadow-nb"
                              : "bg-card border-nb-border dark:border-border hover:bg-muted"
                          )}
                        >
                          {d}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <Button onClick={save}>Apply changes</Button>
              </>
            )}

            {/* ── INTEGRATIONS ── */}
            {activeSection === "integrations" && (
              <>
                <SectionTitle icon={Link2} title="Integrations" subtitle="Connect your favourite tools" />

                <div className="space-y-3">
                  {[
                    { name: "Google Workspace", icon: "🔵", desc: "Drive, Docs, Sheets, Calendar", connected: true, badge: "Connected" },
                    { name: "Slack", icon: "💬", desc: "Task notifications in Slack channels", connected: false, badge: "Coming soon" },
                    { name: "GitHub", icon: "⚫", desc: "Link commits and PRs to tasks", connected: false, badge: "Coming soon" },
                    { name: "Notion", icon: "⬜", desc: "Import pages and databases", connected: false, badge: "Coming soon" },
                    { name: "Linear", icon: "🟣", desc: "Sync issues with Linear projects", connected: false, badge: "Coming soon" },
                  ].map(({ name, icon, desc, connected, badge }) => (
                    <div key={name} className="nb-card p-4 flex items-center gap-4">
                      <div className="w-11 h-11 bg-muted rounded-nb border-2 border-nb-border flex items-center justify-center text-xl shadow-nb-sm flex-shrink-0">
                        {icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-black text-sm">{name}</p>
                        <p className="text-xs text-muted-foreground">{desc}</p>
                      </div>
                      {connected ? (
                        <div className="flex items-center gap-2">
                          <Badge variant="success" className="text-xs">
                            <Check size={10} className="mr-1" />
                            {badge}
                          </Badge>
                          <Button variant="outline" size="sm" onClick={() => toast("Disconnect Google? (demo)")}>
                            Disconnect
                          </Button>
                        </div>
                      ) : (
                        <Badge variant="muted" className="text-xs">{badge}</Badge>
                      )}
                    </div>
                  ))}
                </div>

                <div className="nb-card p-6">
                  <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-4">
                    Available on all platforms
                  </p>
                  <div className="flex gap-4">
                    {[
                      { icon: Globe, label: "Web App", desc: "taskflow.app" },
                      { icon: Smartphone, label: "Mobile", desc: "iOS & Android" },
                      { icon: Monitor, label: "Desktop", desc: "Win / Mac / Linux" },
                    ].map(({ icon: Icon, label, desc }) => (
                      <div key={label} className="flex-1 text-center p-3 bg-muted rounded-nb border-2 border-nb-border">
                        <Icon size={20} className="mx-auto mb-1.5" />
                        <p className="text-xs font-bold">{label}</p>
                        <p className="text-xs text-muted-foreground">{desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* ── ACCOUNT ── */}
            {activeSection === "account" && (
              <>
                <SectionTitle icon={Shield} title="Account & Security" subtitle="Manage your account settings" />

                <div className="nb-card p-6 space-y-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Security</p>
                  {[
                    { label: "Two-factor authentication", desc: "Protect your account with 2FA", action: "Enable" },
                    { label: "Active sessions", desc: "2 active sessions", action: "Manage" },
                    { label: "Login history", desc: "View recent sign-ins", action: "View" },
                  ].map(({ label, desc, action }) => (
                    <div key={label} className="flex items-center justify-between py-2">
                      <div>
                        <p className="font-bold text-sm">{label}</p>
                        <p className="text-xs text-muted-foreground">{desc}</p>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => toast(`${action} (demo)`)}>
                        {action}
                        <ChevronRight size={14} />
                      </Button>
                    </div>
                  ))}
                </div>

                <div className="nb-card p-6 space-y-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Data</p>
                  <div className="flex items-center justify-between py-2">
                    <div>
                      <p className="font-bold text-sm">Export all data</p>
                      <p className="text-xs text-muted-foreground">Download a full JSON export of your tasks</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => toast("Export started (demo)")}>
                      Export
                    </Button>
                  </div>
                </div>

                <div className="nb-card p-6 border-2 border-nb-danger space-y-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-nb-danger">Danger zone</p>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-sm">Delete account</p>
                      <p className="text-xs text-muted-foreground">Permanently delete all your data</p>
                    </div>
                    <Button variant="destructive" size="sm" onClick={() => toast.error("This is a demo — account not deleted")}>
                      Delete
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-sm">Sign out everywhere</p>
                      <p className="text-xs text-muted-foreground">Log out of all active sessions</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => toast("Signed out everywhere (demo)")}>
                      <LogOut size={14} />
                      Sign out all
                    </Button>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function SectionTitle({ icon: Icon, title, subtitle }: { icon: React.ElementType; title: string; subtitle: string }) {
  return (
    <div className="flex items-center gap-3 mb-2">
      <div className="w-10 h-10 bg-nb-accent rounded-nb border-2 border-nb-border shadow-nb-sm flex items-center justify-center flex-shrink-0">
        <Icon size={18} />
      </div>
      <div>
        <h2 className="text-xl font-black leading-tight">{title}</h2>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </div>
    </div>
  );
}

function ToggleRow({ label, desc, checked, onChange }: { label: string; desc: string; checked: boolean; onChange: () => void }) {
  return (
    <div className="flex items-center justify-between gap-4 py-1">
      <div>
        <p className="font-bold text-sm">{label}</p>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
      <button
        onClick={onChange}
        className={cn(
          "relative w-11 h-6 rounded-full border-2 border-nb-border transition-colors duration-200 flex-shrink-0 shadow-nb-sm",
          checked ? "bg-nb-primary" : "bg-muted"
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 w-4 h-4 rounded-full border-2 border-nb-border bg-white shadow-nb-sm transition-all duration-200",
            checked ? "left-5" : "left-0.5"
          )}
        />
      </button>
    </div>
  );
}
