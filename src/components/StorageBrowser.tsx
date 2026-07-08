import React, { useState, useEffect, useCallback } from "react";
import ReactDOM from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import { supabase } from "@/lib/supabase";
import { Trash2, X, FileImage, FileVideo, File, RefreshCw, Eye, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

interface StorageFile {
  name: string;
  id: string;
  updated_at: string;
  created_at: string;
  last_accessed_at: string;
  metadata: {
    size: number;
    mimetype: string;
    cacheControl: string;
  };
}

interface StorageBrowserProps {
  open: boolean;
  onClose: () => void;
}

function formatBytes(bytes: number): string {
  if (!bytes) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

function FileIcon({ mime }: { mime: string }) {
  if (mime?.startsWith("image/")) return <FileImage className="w-5 h-5 text-neon-blue" />;
  if (mime?.startsWith("video/")) return <FileVideo className="w-5 h-5 text-neon-purple" />;
  return <File className="w-5 h-5 text-white/40" />;
}

export function StorageBrowser({ open, onClose }: StorageBrowserProps) {
  const [files, setFiles] = useState<StorageFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewMime, setPreviewMime] = useState<string>("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const BUCKET = "club_assets";
  const FOLDER = "uploads";

  const fetchFiles = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.storage.from(BUCKET).list(FOLDER, {
      limit: 200,
      offset: 0,
      sortBy: { column: "created_at", order: "desc" },
    });
    if (!error && data) {
      setFiles(data.filter((f) => f.name !== ".emptyFolderPlaceholder") as StorageFile[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (open) fetchFiles();
  }, [open, fetchFiles]);

  // Close on Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (previewUrl) { setPreviewUrl(null); return; }
        onClose();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose, previewUrl]);

  const getPublicUrl = (name: string) =>
    supabase.storage.from(BUCKET).getPublicUrl(`${FOLDER}/${name}`).data.publicUrl;

  const handleDelete = async (file: StorageFile) => {
    setDeletingIds((prev) => new Set(prev).add(file.id));
    const { error } = await supabase.storage.from(BUCKET).remove([`${FOLDER}/${file.name}`]);
    if (!error) {
      setFiles((prev) => prev.filter((f) => f.id !== file.id));
    } else {
      alert(error.message);
    }
    setDeletingIds((prev) => { const s = new Set(prev); s.delete(file.id); return s; });
    setConfirmDeleteId(null);
  };

  const handleCopy = (file: StorageFile) => {
    navigator.clipboard.writeText(getPublicUrl(file.name));
    setCopiedId(file.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const totalSize = files.reduce((acc, f) => acc + (f.metadata?.size || 0), 0);

  const portal = ReactDOM.createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          style={{ position: "fixed", inset: 0, zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}
          onClick={onClose}
        >
          {/* Backdrop */}
          <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.85)", backdropFilter: "blur(20px)" }} />

          {/* Panel */}
          <motion.div
            initial={{ scale: 0.92, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0, y: 30 }}
            transition={{ type: "spring", stiffness: 280, damping: 26 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-5xl glass-dark border border-white/10 rounded-[32px] overflow-hidden shadow-2xl flex flex-col"
            style={{ maxHeight: "88vh" }}
          >
            {/* Glow */}
            <div className="absolute -inset-1 rounded-[34px] bg-neon-purple/10 blur-2xl -z-10 pointer-events-none" />

            {/* Header */}
            <div className="flex items-center justify-between px-8 py-6 border-b border-white/10 shrink-0">
              <div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-7 bg-linear-to-b from-neon-purple to-neon-blue rounded-full shadow-[0_0_12px_rgba(168,85,247,0.6)]" />
                  <h2 className="text-2xl font-display uppercase tracking-widest">Storage Uploads</h2>
                </div>
                <p className="text-white/30 text-xs mt-1 ml-5">
                  club_assets / uploads &nbsp;·&nbsp; {files.length} files &nbsp;·&nbsp; {formatBytes(totalSize)} total
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={fetchFiles}
                  className="glass border-white/10 w-10 h-10 rounded-xl hover:bg-white/10"
                  title="Refresh"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={onClose}
                  className="glass border-white/10 w-10 h-10 rounded-xl hover:bg-red-500/20 hover:border-red-500/30"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Body */}
            <div className="overflow-y-auto flex-1 custom-scrollbar">
              {loading ? (
                <div className="flex items-center justify-center py-32">
                  <div className="w-10 h-10 border-4 border-neon-purple border-t-transparent rounded-full animate-spin" />
                </div>
              ) : files.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-32 text-white/20">
                  <File className="w-12 h-12 mb-4" />
                  <p className="text-lg">No uploads found</p>
                </div>
              ) : (
                <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {files.map((file) => {
                    const mime = file.metadata?.mimetype || "";
                    const isImage = mime.startsWith("image/");
                    const isVideo = mime.startsWith("video/");
                    const publicUrl = getPublicUrl(file.name);
                    const isDeleting = deletingIds.has(file.id);
                    const isConfirming = confirmDeleteId === file.id;

                    return (
                      <motion.div
                        key={file.id}
                        layout
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: isDeleting ? 0.4 : 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="group relative glass border border-white/10 rounded-2xl overflow-hidden hover:border-white/20 transition-colors"
                      >
                        {/* Preview thumbnail */}
                        <div className="relative w-full h-36 bg-white/5 flex items-center justify-center overflow-hidden">
                          {isImage && (
                            <img src={publicUrl} alt={file.name} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                          )}
                          {isVideo && (
                            <video src={publicUrl} className="w-full h-full object-cover opacity-70 group-hover:opacity-90 transition-opacity" muted playsInline />
                          )}
                          {!isImage && !isVideo && (
                            <File className="w-10 h-10 text-white/20" />
                          )}
                          {/* Overlay actions */}
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                            {(isImage || isVideo) && (
                              <button
                                onClick={() => { setPreviewUrl(publicUrl); setPreviewMime(mime); }}
                                className="w-9 h-9 rounded-full bg-white/15 hover:bg-white/30 backdrop-blur border border-white/20 flex items-center justify-center transition-colors"
                                title="Preview"
                              >
                                <Eye className="w-4 h-4 text-white" />
                              </button>
                            )}
                            <button
                              onClick={() => handleCopy(file)}
                              className="w-9 h-9 rounded-full bg-white/15 hover:bg-neon-blue/40 backdrop-blur border border-white/20 flex items-center justify-center transition-colors"
                              title="Copy URL"
                            >
                              {copiedId === file.id ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 text-white" />}
                            </button>
                          </div>
                        </div>

                        {/* Info */}
                        <div className="px-4 py-3">
                          <div className="flex items-start gap-2">
                            <FileIcon mime={mime} />
                            <p className="text-xs text-white/70 truncate flex-1 font-mono" title={file.name}>{file.name}</p>
                          </div>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-[10px] text-white/30">{formatBytes(file.metadata?.size)} · {formatDate(file.created_at)}</span>
                            {isConfirming ? (
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => handleDelete(file)}
                                  disabled={isDeleting}
                                  className="text-[10px] px-2 py-1 rounded-md bg-red-500/20 text-red-400 hover:bg-red-500/40 transition-colors font-bold"
                                >
                                  {isDeleting ? "..." : "Confirm"}
                                </button>
                                <button
                                  onClick={() => setConfirmDeleteId(null)}
                                  className="text-[10px] px-2 py-1 rounded-md bg-white/5 text-white/40 hover:bg-white/10 transition-colors"
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setConfirmDeleteId(file.id)}
                                disabled={isDeleting}
                                className="opacity-0 group-hover:opacity-100 transition-opacity w-7 h-7 rounded-lg bg-red-500/10 hover:bg-red-500/30 flex items-center justify-center"
                                title="Delete"
                              >
                                <Trash2 className="w-3.5 h-3.5 text-red-400" />
                              </button>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>

          {/* Preview lightbox */}
          <AnimatePresence>
            {previewUrl && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{ position: "fixed", inset: 0, zIndex: 10000, display: "flex", alignItems: "center", justifyContent: "center", padding: "32px", background: "rgba(0,0,0,0.92)" }}
                onClick={() => setPreviewUrl(null)}
              >
                <button
                  onClick={() => setPreviewUrl(null)}
                  className="absolute top-5 right-5 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
                <motion.div
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0.9 }}
                  onClick={(e) => e.stopPropagation()}
                  className="max-w-4xl w-full"
                >
                  {previewMime.startsWith("image/") ? (
                    <img src={previewUrl} className="w-full max-h-[80vh] object-contain rounded-2xl" />
                  ) : (
                    <video src={previewUrl} controls autoPlay className="w-full max-h-[80vh] rounded-2xl" />
                  )}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );

  return portal;
}
