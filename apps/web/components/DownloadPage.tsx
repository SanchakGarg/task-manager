"use client";

import { motion } from "framer-motion";
import {
  Monitor, Smartphone, Download, ExternalLink, Zap, CheckCircle2,
  Apple, Chrome, Package
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { useEffect, useState } from "react";

interface ReleaseAsset {
  name: string;
  browser_download_url: string;
  size: number;
}

interface Release {
  tag_name: string;
  published_at: string;
  html_url: string;
  assets: ReleaseAsset[];
}

interface PlatformDownload {
  label: string;
  sublabel: string;
  icon: React.ElementType;
  color: string;
  extensions: string[];
  url?: string;
  size?: number;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function detectPlatform(): "windows" | "macos" | "linux" | "android" | "ios" | null {
  if (typeof navigator === "undefined") return null;
  const ua = navigator.userAgent.toLowerCase();
  if (ua.includes("win")) return "windows";
  if (ua.includes("mac")) return "macos";
  if (ua.includes("linux") && !ua.includes("android")) return "linux";
  if (ua.includes("android")) return "android";
  if (ua.includes("iphone") || ua.includes("ipad")) return "ios";
  return null;
}

function matchAsset(assets: ReleaseAsset[], exts: string[]): ReleaseAsset | undefined {
  return assets.find((a) => exts.some((ext) => a.name.toLowerCase().endsWith(ext)));
}

export function DownloadPage({ release, repo }: { release: Release | null; repo: string }) {
  const [platform, setPlatform] = useState<string | null>(null);

  useEffect(() => {
    setPlatform(detectPlatform());
  }, []);

  const assets = release?.assets ?? [];

  const platforms: PlatformDownload[] = [
    {
      label: "Windows",
      sublabel: "Windows 10 / 11 (64-bit)",
      icon: Monitor,
      color: "bg-blue-100",
      extensions: [".msi", "_x64.exe", "-setup.exe"],
      ...(() => {
        const a = matchAsset(assets, [".msi", "_x64.exe"]);
        return a ? { url: a.browser_download_url, size: a.size } : {};
      })(),
    },
    {
      label: "macOS",
      sublabel: "Universal (Apple Silicon + Intel)",
      icon: Apple,
      color: "bg-gray-100",
      extensions: [".dmg"],
      ...(() => {
        const a = matchAsset(assets, [".dmg"]);
        return a ? { url: a.browser_download_url, size: a.size } : {};
      })(),
    },
    {
      label: "Linux",
      sublabel: "AppImage (all distros)",
      icon: Chrome,
      color: "bg-orange-100",
      extensions: [".appimage"],
      ...(() => {
        const a = matchAsset(assets, [".appimage"]);
        return a ? { url: a.browser_download_url, size: a.size } : {};
      })(),
    },
    {
      label: "Android",
      sublabel: "Android 8.0+ (APK)",
      icon: Smartphone,
      color: "bg-green-100",
      extensions: [".apk"],
      ...(() => {
        const a = matchAsset(assets, [".apk"]);
        return a ? { url: a.browser_download_url, size: a.size } : {};
      })(),
    },
  ];

  const isPlatformId = (p: PlatformDownload) => {
    if (!platform) return false;
    return p.label.toLowerCase() === platform || (platform === "ios" && p.label === "iOS");
  };

  const hasAnyDownload = platforms.some((p) => p.url);

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 border-b-2 border-nb-border bg-card">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-nb-primary rounded-nb border-2 border-nb-border shadow-nb-sm flex items-center justify-center">
            <Zap size={18} className="text-white" strokeWidth={2.5} />
          </div>
          <span className="text-xl font-black tracking-tight">TaskFlow</span>
        </Link>
        <div className="flex items-center gap-3">
          <Link href="/dashboard">
            <Button variant="outline" size="sm">Open Web App</Button>
          </Link>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 bg-nb-accent border-2 border-nb-border rounded-full px-4 py-1.5 text-sm font-bold shadow-nb-sm mb-6">
            <Download size={14} />
            {release ? `Version ${release.tag_name}` : "Desktop & Mobile Apps"}
          </div>
          <h1 className="text-5xl font-black tracking-tighter mb-4">
            TaskFlow for <span className="text-nb-primary">every device</span>
          </h1>
          <p className="text-lg text-muted-foreground font-medium max-w-xl mx-auto">
            Download the native app for your platform. All apps connect to your account and stay in sync.
          </p>
        </motion.div>

        {!hasAnyDownload && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="nb-card p-8 mb-12 text-center border-dashed"
          >
            <Package size={40} className="mx-auto mb-3 text-muted-foreground opacity-40" />
            <p className="font-black text-lg">No releases yet</p>
            <p className="text-sm text-muted-foreground mt-1 mb-4">
              The first release will appear here once the CI build completes.
            </p>
            {repo && (
              <Button variant="outline" size="sm" asChild>
                <a href={`https://github.com/${repo}/releases`} target="_blank" rel="noopener noreferrer">
                  <ExternalLink size={14} />
                  View on GitHub
                </a>
              </Button>
            )}
          </motion.div>
        )}

        {/* Platform cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-16">
          {platforms.map((p, i) => {
            const Icon = p.icon;
            const isDetected = isPlatformId(p);
            return (
              <motion.div
                key={p.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className={`nb-card p-6 flex flex-col gap-4 relative ${isDetected ? "ring-2 ring-nb-primary ring-offset-2" : ""}`}
              >
                {isDetected && (
                  <div className="absolute -top-3 left-4">
                    <Badge variant="default" className="text-xs shadow-nb-sm">
                      <CheckCircle2 size={10} className="mr-1" />
                      Your platform
                    </Badge>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 ${p.color} rounded-nb border-2 border-nb-border flex items-center justify-center shadow-nb-sm flex-shrink-0`}>
                    <Icon size={22} />
                  </div>
                  <div>
                    <p className="font-black text-lg leading-tight">{p.label}</p>
                    <p className="text-xs text-muted-foreground">{p.sublabel}</p>
                  </div>
                </div>

                {p.url ? (
                  <a href={p.url} download className="block">
                    <Button className="w-full gap-2" variant={isDetected ? "default" : "outline"}>
                      <Download size={16} />
                      Download {p.label}
                      {p.size && <span className="opacity-60 text-xs ml-auto">{formatBytes(p.size)}</span>}
                    </Button>
                  </a>
                ) : (
                  <Button className="w-full" variant="outline" disabled>
                    <Download size={16} />
                    Not yet available
                  </Button>
                )}
              </motion.div>
            );
          })}

          {/* iOS card — always "coming soon" since EAS iOS needs Apple credentials */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.32 }}
            className="nb-card p-6 flex flex-col gap-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gray-100 rounded-nb border-2 border-nb-border flex items-center justify-center shadow-nb-sm flex-shrink-0 opacity-60">
                <Apple size={22} />
              </div>
              <div>
                <p className="font-black text-lg leading-tight opacity-60">iOS</p>
                <p className="text-xs text-muted-foreground">iPhone & iPad</p>
              </div>
            </div>
            <Button className="w-full" variant="outline" disabled>
              Coming soon — App Store
            </Button>
          </motion.div>

          {/* Web app card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className={`nb-card p-6 flex flex-col gap-4 ${platform === null || !["windows","macos","linux","android","ios"].includes(platform ?? "") ? "ring-2 ring-nb-primary ring-offset-2" : ""}`}
          >
            {(platform === null || !["windows","macos","linux","android"].includes(platform ?? "")) && (
              <div className="absolute -top-3 left-4">
                <Badge variant="default" className="text-xs shadow-nb-sm">
                  <CheckCircle2 size={10} className="mr-1" />
                  Available now
                </Badge>
              </div>
            )}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-nb-accent rounded-nb border-2 border-nb-border flex items-center justify-center shadow-nb-sm flex-shrink-0">
                <Chrome size={22} />
              </div>
              <div>
                <p className="font-black text-lg leading-tight">Web App</p>
                <p className="text-xs text-muted-foreground">No install needed</p>
              </div>
            </div>
            <Link href="/dashboard">
              <Button className="w-full gap-2">
                <ExternalLink size={16} />
                Open Web App
              </Button>
            </Link>
          </motion.div>
        </div>

        {/* Release info */}
        {release && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="nb-card p-6 flex items-center justify-between gap-4"
          >
            <div>
              <p className="font-black">Latest release: {release.tag_name}</p>
              <p className="text-sm text-muted-foreground">
                Released {new Date(release.published_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
              </p>
            </div>
            <Button variant="outline" size="sm" asChild>
              <a href={release.html_url} target="_blank" rel="noopener noreferrer">
                <ExternalLink size={14} />
                View on GitHub
              </a>
            </Button>
          </motion.div>
        )}
      </main>

      <footer className="border-t-2 border-nb-border bg-card py-6 text-center text-sm text-muted-foreground font-semibold">
        © {new Date().getFullYear()} TaskFlow · All builds are signed and verified
      </footer>
    </div>
  );
}
