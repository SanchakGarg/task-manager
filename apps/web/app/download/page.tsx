import { DownloadPage } from "@/components/DownloadPage";

const GITHUB_REPO = process.env.GITHUB_REPO ?? "";

async function getLatestRelease() {
  if (!GITHUB_REPO) return null;
  try {
    const headers: HeadersInit = { Accept: "application/vnd.github+json" };
    if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
    const res = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/releases/latest`, {
      headers,
      next: { revalidate: 300 },
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export const metadata = {
  title: "Download TaskFlow",
  description: "Download TaskFlow for Windows, macOS, Linux, and Android.",
};

export default async function DownloadRoute() {
  const release = await getLatestRelease();
  return <DownloadPage release={release} repo={GITHUB_REPO} />;
}
