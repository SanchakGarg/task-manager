"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Zap, CheckCircle2, Bell, FileText, Upload, Smartphone,
  Monitor, Globe, ArrowRight, Star, Play, Download
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const features = [
  {
    icon: CheckCircle2,
    title: "Smart Task Management",
    desc: "Organize tasks with priorities, statuses, tags, and due dates. Drag and drop to reorder.",
    color: "bg-nb-accent",
  },
  {
    icon: FileText,
    title: "Google Docs & Sheets",
    desc: "Create Google Docs and Sheets directly from tasks, or link existing ones.",
    color: "bg-blue-100",
  },
  {
    icon: Upload,
    title: "Drive Integration",
    desc: "Upload files to Google Drive and attach them to your tasks instantly.",
    color: "bg-green-100",
  },
  {
    icon: Bell,
    title: "Smart Reminders",
    desc: "Set reminders and get push notifications when it's time to tackle your tasks.",
    color: "bg-purple-100",
  },
  {
    icon: Smartphone,
    title: "Mobile App",
    desc: "Native iOS and Android apps for managing tasks on the go.",
    color: "bg-pink-100",
  },
  {
    icon: Monitor,
    title: "Desktop App",
    desc: "Full native desktop experience for Windows, Mac, and Linux.",
    color: "bg-orange-100",
  },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export function LandingPage() {
  const router = useRouter();
  return (
    <div className="min-h-screen bg-nb-bg overflow-x-hidden">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 border-b-2 border-nb-border bg-white">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-nb-primary rounded-nb border-2 border-nb-border shadow-nb-sm flex items-center justify-center">
            <Zap size={18} className="text-white" strokeWidth={2.5} />
          </div>
          <span className="text-xl font-black tracking-tight">TaskFlow</span>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="ghost" onClick={() => router.push("/dashboard")}>
            Try Demo
          </Button>
          <Link href="/download">
            <Button variant="outline">
              <Download size={14} />
              Download
            </Button>
          </Link>
          <Button onClick={() => signIn("google", { callbackUrl: "/dashboard" })}>
            Get Started Free
          </Button>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-6 pt-24 pb-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="inline-flex items-center gap-2 bg-nb-accent border-2 border-nb-border rounded-full px-4 py-1.5 text-sm font-bold shadow-nb-sm mb-6">
            <Star size={14} />
            Beautifully bold task management
          </div>

          <h1 className="text-6xl md:text-7xl font-black tracking-tighter leading-none mb-6">
            Get{" "}
            <span className="relative inline-block">
              <span className="relative z-10">things</span>
              <span className="absolute inset-x-0 bottom-1 h-4 bg-nb-accent -z-0" />
            </span>{" "}
            done,{" "}
            <span className="text-nb-primary">beautifully.</span>
          </h1>

          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10 font-medium">
            TaskFlow combines bold neurobrutalist design with powerful productivity features —
            Google Drive integration, smart reminders, and cross-platform sync.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              size="xl"
              variant="accent"
              onClick={() => router.push("/dashboard")}
              className="gap-3 text-base text-nb-border"
            >
              <Play size={18} />
              Try Demo — No Login
            </Button>
            <Button
              size="xl"
              onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
              className="gap-3 text-base"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Sign in with Google
              <ArrowRight size={18} />
            </Button>
            <div className="flex items-center gap-2 text-sm text-muted-foreground font-semibold">
              <Globe size={14} />
              Free forever · No credit card
            </div>
          </div>
        </motion.div>

        {/* Hero visual */}
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="mt-16 relative"
        >
          <div className="bg-white border-2 border-nb-border rounded-nb-xl shadow-nb-xl overflow-hidden max-w-3xl mx-auto">
            <div className="bg-nb-primary p-4 flex items-center gap-3">
              <div className="flex gap-1.5">
                {["bg-red-400", "bg-yellow-400", "bg-green-400"].map((c) => (
                  <div key={c} className={`w-3 h-3 rounded-full ${c} border border-black/20`} />
                ))}
              </div>
              <div className="flex-1 flex items-center justify-center">
                <div className="bg-white/20 rounded-md px-4 py-1 text-white text-sm font-semibold">
                  taskflow.app/dashboard
                </div>
              </div>
            </div>
            <div className="p-6 bg-nb-bg grid grid-cols-3 gap-3">
              {[
                { status: "TODO", tasks: ["Design system setup", "API routes", "DB schema"], color: "border-l-gray-400" },
                { status: "IN PROGRESS", tasks: ["Auth with Google", "Task CRUD"], color: "border-l-blue-500" },
                { status: "DONE", tasks: ["Monorepo setup", "Tailwind config", "Components"], color: "border-l-green-500" },
              ].map((col) => (
                <div key={col.status} className="space-y-2">
                  <div className="text-xs font-black uppercase tracking-wider text-muted-foreground">{col.status}</div>
                  {col.tasks.map((task) => (
                    <div key={task} className={`bg-white border-2 border-nb-border rounded-nb p-2.5 shadow-nb-sm border-l-4 ${col.color}`}>
                      <div className="text-xs font-bold">{task}</div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
          <div className="absolute -z-10 inset-0 bg-nb-accent opacity-20 blur-3xl rounded-full translate-y-8" />
        </motion.div>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-6 pb-24">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-black tracking-tight">Everything you need</h2>
          <p className="text-lg text-muted-foreground mt-2 font-medium">Packed with features that actually matter</p>
        </div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          {features.map(({ icon: Icon, title, desc, color }) => (
            <motion.div key={title} variants={itemVariants} className="nb-card p-6">
              <div className={`w-11 h-11 ${color} rounded-nb border-2 border-nb-border flex items-center justify-center mb-4 shadow-nb-sm`}>
                <Icon size={20} />
              </div>
              <h3 className="font-black text-base mb-1.5">{title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Download */}
      <section className="max-w-5xl mx-auto px-6 pb-24">
        <div className="nb-card p-10 bg-nb-primary text-white border-nb-border shadow-nb-xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div>
              <h2 className="text-3xl font-black mb-2">Available everywhere</h2>
              <p className="opacity-90 font-medium">
                Windows, macOS, Linux, and Android. One account, all your devices.
              </p>
              <div className="flex gap-3 mt-4 flex-wrap">
                {["Windows", "macOS", "Linux", "Android"].map((p) => (
                  <span key={p} className="inline-flex items-center gap-1 bg-white/20 border border-white/30 rounded-full px-3 py-1 text-sm font-bold">
                    {p}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 flex-shrink-0">
              <Link href="/download">
                <Button size="lg" variant="accent" className="gap-2 text-nb-border">
                  <Download size={18} />
                  Download Apps
                </Button>
              </Link>
              <Button size="lg" variant="outline" onClick={() => router.push("/dashboard")}
                className="bg-transparent text-white border-white hover:bg-white hover:text-nb-primary">
                Open Web App
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-2xl mx-auto px-6 pb-24 text-center">
        <div className="nb-card p-10 bg-nb-primary text-white border-nb-border shadow-nb-xl">
          <h2 className="text-4xl font-black mb-4">Ready to flow?</h2>
          <p className="text-lg opacity-90 mb-8 font-medium">
            Sign in with Google and start organizing your work in seconds.
          </p>
          <Button
            size="xl"
            variant="accent"
            onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
            className="text-nb-border"
          >
            Start for Free
            <ArrowRight size={18} />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t-2 border-nb-border bg-white py-6 text-center text-sm text-muted-foreground font-semibold">
        © 2026 TaskFlow · Built with Next.js & ❤️
      </footer>
    </div>
  );
}
