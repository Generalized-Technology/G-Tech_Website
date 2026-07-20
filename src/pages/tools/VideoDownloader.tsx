import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Download,
  Music,
  Video,
  Link2,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Youtube,
  Instagram,
  RefreshCw,
  Scissors,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GlassCard } from "@/components/UIElements";
import { ToolHeader } from "@/components/ToolHeader";

export type DownloadMode = "video" | "audio";

export type Status = "idle" | "loading" | "success" | "error";

export interface DownloadResult {
  url: string;

  filename: string;

  type: DownloadMode;
}

export function detectPlatform(
  url: string,
): "youtube" | "instagram" | "unknown" {
  if (/(youtube\.com|youtu\.be)/i.test(url)) return "youtube";

  if (/instagram\.com/i.test(url)) return "instagram";

  return "unknown";
}

export async function fetchDownloadLink(
  url: string,
  mode: DownloadMode,
): Promise<DownloadResult> {
  const endpoints = [
    "https://co.wuk.sh",
    "https://cobalt.owo.vc",
    "https://api.cobalt.best",
    "https://cobalt.kwiatekm.me",
    "https://cobalt.q0.is",
    "https://dl.imput.net"
  ];

  const fetchUrls: string[] = [];
  for (const base of endpoints) {
    fetchUrls.push(`${base}/api/json`);
    fetchUrls.push(`${base}/`);
    // Fallbacks using a CORS proxy in case the instances block third-party browser requests
    fetchUrls.push(`https://corsproxy.io/?${encodeURIComponent(base + '/api/json')}`);
    fetchUrls.push(`https://corsproxy.io/?${encodeURIComponent(base + '/')}`);
  }

  const body = {
    url,
    // v9 params
    downloadMode: mode === "audio" ? "audio" : "auto",
    audioFormat: "mp3",
    filenameStyle: "pretty",
    // v10 params
    isAudioOnly: mode === "audio",
    aFormat: "mp3",
    filenamePattern: "pretty",
  };

  let lastError = "Could not connect to any free download server. They might be temporarily offline or blocking requests.";

  for (const fetchUrl of fetchUrls) {
    try {
      const res = await fetch(fetchUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(body),
      });

      const text = await res.text();

      if (!res.ok) {
        try {
          const data = JSON.parse(text);
          if (data?.error?.code) {
            lastError = data.error.code;
          } else if (data?.error) {
            lastError = typeof data.error === 'string' ? data.error : JSON.stringify(data.error);
          }
        } catch (e) {
           // Ignored
        }
        continue; // Try next endpoint
      }

      const data = JSON.parse(text);

      if (
        data.status === "redirect" ||
        data.status === "stream" ||
        data.status === "tunnel" ||
        (data.url && !data.status)
      ) {
        return {
          url: data.url,
          filename: `download-${Date.now()}.${mode === "audio" ? "mp3" : "mp4"}`,
          type: mode,
        };
      }

      if (data.status === "picker" && data.picker?.length) {
        return {
          url: data.picker[0].url,
          filename: `download-${Date.now()}.mp4`,
          type: mode,
        };
      }
    } catch (e: any) {
      // Network error, CORS, etc., just continue
    }
  }

  throw new Error(lastError);
}

export default function VideoDownloader() {
  const [url, setUrl] = useState("");

  const [mode, setMode] = useState<DownloadMode>("video");

  const [status, setStatus] = useState<Status>("idle");

  const [result, setResult] = useState<DownloadResult | null>(null);

  const [error, setError] = useState<string>("");

  const platform = detectPlatform(url);

  const handleDownload = async () => {
    if (!url.trim()) return;

    if (platform === "unknown") {
      setError("Please enter a valid YouTube or Instagram link.");

      setStatus("error");

      return;
    }

    setStatus("loading");

    setResult(null);

    setError("");

    try {
      const res = await fetchDownloadLink(url.trim(), mode);

      setResult(res);

      setStatus("success");

      // Trigger download automatically

      const a = document.createElement("a");

      a.href = res.url;

      a.download = res.filename;

      a.target = "_blank";

      a.rel = "noopener noreferrer";

      document.body.appendChild(a);

      a.click();

      document.body.removeChild(a);
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Download failed. Try again.";

      setError(
        msg.includes("nsig")
          ? "YouTube is blocking this request. Try a different video or try again later."
          : msg.includes("private") || msg.includes("not available")
            ? "This content is private or unavailable."
            : `Download failed: ${msg}`,
      );

      setStatus("error");
    }
  };

  const reset = () => {
    setUrl("");

    setStatus("idle");

    setResult(null);

    setError("");
  };

  return (
    <main className="min-h-screen bg-mesh pb-20 pt-16">
      <ToolHeader title="Video Downloader" />
      <div className="container mx-auto px-6 py-12">
        {/* Platform Badges */}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-12 flex items-center justify-center gap-4"
        >
          <div className="flex items-center gap-2 glass px-4 py-2 rounded-full border border-white/10">
            <Youtube className="w-4 h-4 text-red-400" />

            <span className="text-xs font-bold uppercase tracking-widest text-white/60">
              YouTube
            </span>
          </div>

          <div className="flex items-center gap-2 glass px-4 py-2 rounded-full border border-white/10">
            <Instagram className="w-4 h-4 text-pink-400" />

            <span className="text-xs font-bold uppercase tracking-widest text-white/60">
              Instagram
            </span>
          </div>
        </motion.div>

        <div className="max-w-2xl mx-auto space-y-6">
          {/* Main Card */}

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <GlassCard className="p-8 space-y-8">
              {/* URL Input */}

              <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-widest text-white/50 ml-1">
                  Paste Your Link
                </label>

                <div className="relative group">
                  <Link2
                    className={`absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${
                      platform === "youtube"
                        ? "text-red-400"
                        : platform === "instagram"
                          ? "text-pink-400"
                          : "text-white/30 group-focus-within:text-neon-purple"
                    }`}
                  />

                  <Input
                    value={url}
                    onChange={(e) => {
                      setUrl(e.target.value);

                      if (status !== "idle") {
                        setStatus("idle");

                        setError("");
                      }
                    }}
                    onKeyDown={(e) => e.key === "Enter" && handleDownload()}
                    placeholder="https://youtube.com/watch?v=... or https://instagram.com/reel/..."
                    className="glass border-white/10 h-16 pl-14 pr-6 rounded-2xl text-base focus:ring-neon-purple/20 focus:border-neon-purple transition-all text-white placeholder:text-white/30"
                  />
                </div>

                {/* Platform indicator */}

                <AnimatePresence>
                  {platform !== "unknown" && url && (
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className="flex items-center gap-2 ml-1"
                    >
                      {platform === "youtube" ? (
                        <Youtube className="w-4 h-4 text-red-400" />
                      ) : (
                        <Instagram className="w-4 h-4 text-pink-400" />
                      )}

                      <span className="text-xs font-bold uppercase tracking-widest text-white/40">
                        {platform === "youtube" ? "YouTube" : "Instagram"} link
                        detected
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Mode Selector */}

              <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-widest text-white/50 ml-1">
                  Download Mode
                </label>

                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setMode("video")}
                    className={`flex flex-col items-center gap-3 p-6 rounded-2xl border transition-all duration-300 cursor-pointer ${
                      mode === "video"
                        ? "border-neon-purple bg-neon-purple/10 shadow-[0_0_20px_rgba(168,85,247,0.2)]"
                        : "border-white/10 glass hover:border-white/20"
                    }`}
                  >
                    <Video
                      className={`w-8 h-8 transition-colors ${
                        mode === "video" ? "text-neon-purple" : "text-white/40"
                      }`}
                    />

                    <span
                      className={`text-sm font-bold uppercase tracking-widest transition-colors ${
                        mode === "video" ? "text-white" : "text-white/40"
                      }`}
                    >
                      Video
                    </span>

                    <span className="text-xs text-white/30 text-center">
                      Download full video with audio
                    </span>
                  </button>

                  <button
                    onClick={() => setMode("audio")}
                    className={`flex flex-col items-center gap-3 p-6 rounded-2xl border transition-all duration-300 cursor-pointer ${
                      mode === "audio"
                        ? "border-pink-500 bg-pink-500/10 shadow-[0_0_20px_rgba(236,72,153,0.2)]"
                        : "border-white/10 glass hover:border-white/20"
                    }`}
                  >
                    <Music
                      className={`w-8 h-8 transition-colors ${
                        mode === "audio" ? "text-pink-400" : "text-white/40"
                      }`}
                    />

                    <span
                      className={`text-sm font-bold uppercase tracking-widest transition-colors ${
                        mode === "audio" ? "text-white" : "text-white/40"
                      }`}
                    >
                      BGM / Audio
                    </span>

                    <span className="text-xs text-white/30 text-center">
                      Extract audio as MP3
                    </span>
                  </button>
                </div>
              </div>

              {/* Action Buttons */}

              <div className="flex gap-4">
                <Button
                  onClick={handleDownload}
                  disabled={!url.trim() || status === "loading"}
                  className="btn-primary grow py-7 rounded-xl text-lg uppercase tracking-widest group disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {status === "loading" ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Download className="w-5 h-5 mr-3 group-hover:translate-y-1 transition-transform" />

                      {mode === "audio" ? "Extract BGM" : "Download Video"}
                    </>
                  )}
                </Button>

                <Button
                  onClick={reset}
                  variant="outline"
                  className="glass border-white/10 py-7 rounded-xl px-6 hover:border-white/30 transition-colors"
                >
                  <RefreshCw className="w-5 h-5" />
                </Button>
              </div>
            </GlassCard>
          </motion.div>

          {/* Status Feedback */}

          <AnimatePresence>
            {status === "success" && result && (
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.95 }}
              >
                <GlassCard className="p-6 border border-green-500/30 bg-green-500/5">
                  <div className="flex items-start gap-4">
                    <CheckCircle2 className="w-6 h-6 text-green-400 shrink-0 mt-0.5" />

                    <div className="grow space-y-3">
                      <div>
                        <p className="font-bold text-green-400 uppercase tracking-widest text-sm">
                          Download Started!
                        </p>

                        <p className="text-white/50 text-sm mt-1">
                          Your {result.type === "audio" ? "BGM/audio" : "video"}{" "}
                          download has begun. If it didn't start automatically,
                          use the button below.
                        </p>
                      </div>

                      <a
                        href={result.url}
                        download={result.filename}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 glass px-5 py-3 rounded-xl border border-green-500/30 text-green-400 text-sm font-bold uppercase tracking-widest hover:border-green-500/60 transition-colors"
                      >
                        <Download className="w-4 h-4" />
                        Manual Download
                      </a>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            )}

            {status === "error" && (
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.95 }}
              >
                <GlassCard className="p-6 border border-red-500/30 bg-red-500/5">
                  <div className="flex items-start gap-4">
                    <AlertCircle className="w-6 h-6 text-red-400 shrink-0 mt-0.5" />

                    <div>
                      <p className="font-bold text-red-400 uppercase tracking-widest text-sm">
                        Error
                      </p>

                      <p className="text-white/60 text-sm mt-1">{error}</p>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Tips */}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <GlassCard className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Scissors className="w-5 h-5 text-neon-purple" />

                <h3 className="text-sm font-bold uppercase tracking-widest text-white/70">
                  Tips for Video Editors
                </h3>
              </div>

              <ul className="space-y-2 text-sm text-white/50">
                <li className="flex items-start gap-2">
                  <span className="text-neon-purple mt-0.5">→</span>
                  Use <strong className="text-white/70">
                    BGM / Audio
                  </strong>{" "}
                  mode to extract background music as MP3 for your edits.
                </li>

                <li className="flex items-start gap-2">
                  <span className="text-neon-purple mt-0.5">→</span>
                  <strong className="text-white/70">Video</strong> mode
                  downloads the highest available quality (up to 1080p).
                </li>

                <li className="flex items-start gap-2">
                  <span className="text-neon-purple mt-0.5">→</span>
                  For Instagram Reels, paste the full reel URL (e.g.,{" "}
                  <code className="text-white/40 text-xs bg-white/5 px-1 rounded">
                    instagram.com/reel/ABC123
                  </code>
                  ).
                </li>

                <li className="flex items-start gap-2">
                  <span className="text-pink-400 mt-0.5">→</span>
                  Private or age-restricted content cannot be downloaded.
                </li>
              </ul>
            </GlassCard>
          </motion.div>
        </div>
      </div>
    </main>
  );
}
