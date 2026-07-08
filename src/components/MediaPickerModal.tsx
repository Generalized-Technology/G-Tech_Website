import React, { useState, useEffect, useCallback } from "react";
import ReactDOM from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import { supabase } from "@/lib/supabase";
import { X, FileImage, FileVideo, File, UploadCloud, CheckCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface StorageFile {
  name: string;
  id: string;
  created_at: string;
  metadata: {
    size: number;
    mimetype: string;
  };
}

interface MediaPickerModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
}

export function MediaPickerModal({ open, onClose, onSelect }: MediaPickerModalProps) {
  const [tab, setTab] = useState<'device' | 'preuploads'>('device');
  const [files, setFiles] = useState<StorageFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const BUCKET = "club_assets";
  const FOLDER = "uploads";

  const fetchFiles = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.storage.from(BUCKET).list(FOLDER, {
      limit: 200,
      sortBy: { column: "created_at", order: "desc" },
    });
    if (!error && data) {
      setFiles(data.filter((f) => f.name !== ".emptyFolderPlaceholder") as StorageFile[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (open && tab === 'preuploads') {
      fetchFiles();
    }
  }, [open, tab, fetchFiles]);

  const getPublicUrl = (name: string) =>
    supabase.storage.from(BUCKET).getPublicUrl(`${FOLDER}/${name}`).data.publicUrl;

  const handleDeviceUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${FOLDER}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(filePath, file);

    if (uploadError) {
      alert(uploadError.message);
      setUploading(false);
      return;
    }

    const publicUrl = getPublicUrl(fileName);
    setUploading(false);
    onSelect(publicUrl);
    onClose();
  };

  const handleSelectPreupload = (file: StorageFile) => {
    onSelect(getPublicUrl(file.name));
    onClose();
  };

  if (!open) return null;

  return ReactDOM.createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-9999 flex items-center justify-center p-4 sm:p-6"
        onClick={onClose}
      >
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          onClick={e => e.stopPropagation()}
          className="relative w-full max-w-4xl glass-dark border border-white/10 rounded-[32px] overflow-hidden shadow-2xl flex flex-col max-h-[85vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
            <h2 className="text-xl font-display uppercase tracking-widest flex items-center gap-3">
              Select Media
            </h2>
            <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full hover:bg-white/10">
              <X className="w-5 h-5 text-white/70" />
            </Button>
          </div>

          {/* Tabs */}
          <div className="flex px-6 border-b border-white/5">
            <button
              onClick={() => setTab('device')}
              className={`py-4 px-6 text-sm font-bold uppercase tracking-wider transition-colors border-b-2 ${
                tab === 'device' ? 'border-neon-purple text-white' : 'border-transparent text-white/40 hover:text-white/70'
              }`}
            >
              Upload from Device
            </button>
            <button
              onClick={() => setTab('preuploads')}
              className={`py-4 px-6 text-sm font-bold uppercase tracking-wider transition-colors border-b-2 ${
                tab === 'preuploads' ? 'border-neon-purple text-white' : 'border-transparent text-white/40 hover:text-white/70'
              }`}
            >
              Pre-uploads
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
            {tab === 'device' ? (
              <div className="flex flex-col items-center justify-center h-[40vh] min-h-[300px]">
                <div className="relative group w-full max-w-md">
                  <div className={`absolute inset-0 bg-neon-purple/20 blur-xl rounded-full transition-opacity ${uploading ? 'opacity-100 animate-pulse' : 'opacity-0 group-hover:opacity-100'}`} />
                  <div className="relative flex flex-col items-center justify-center p-12 glass border-2 border-dashed border-white/20 rounded-3xl hover:border-neon-purple/50 transition-colors cursor-pointer bg-white/5 overflow-hidden">
                    {uploading ? (
                      <>
                        <div className="w-12 h-12 border-4 border-neon-purple border-t-transparent rounded-full animate-spin mb-4" />
                        <p className="text-white/70 font-medium">Uploading to club_assets...</p>
                      </>
                    ) : (
                      <>
                        <UploadCloud className="w-16 h-16 text-white/30 mb-4 group-hover:text-neon-purple transition-colors" />
                        <p className="text-white/70 font-medium text-lg mb-2">Click to browse files</p>
                        <p className="text-white/30 text-xs text-center max-w-[200px]">Images and videos will be saved to club_assets/uploads</p>
                      </>
                    )}
                    <input
                      type="file"
                      disabled={uploading}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      onChange={handleDeviceUpload}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex justify-end mb-4">
                  <Button variant="outline" size="sm" onClick={fetchFiles} className="glass border-white/10 hover:bg-white/10">
                    <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                </div>
                {loading ? (
                  <div className="flex items-center justify-center py-20">
                    <div className="w-8 h-8 border-4 border-neon-purple border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : files.length === 0 ? (
                  <div className="text-center py-20 text-white/40">
                    <p>No pre-uploaded files found.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    {files.map((file) => {
                      const mime = file.metadata?.mimetype || "";
                      const isImage = mime.startsWith("image/");
                      const isVideo = mime.startsWith("video/");
                      const publicUrl = getPublicUrl(file.name);

                      return (
                        <div
                          key={file.id}
                          onClick={() => handleSelectPreupload(file)}
                          className="group relative glass border border-white/10 rounded-2xl overflow-hidden hover:border-neon-purple/50 transition-colors cursor-pointer"
                        >
                          <div className="relative w-full h-32 bg-white/5 flex items-center justify-center overflow-hidden">
                            {isImage && <img src={publicUrl} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />}
                            {isVideo && <video src={publicUrl} className="w-full h-full object-cover opacity-70 group-hover:opacity-90 transition-opacity" muted playsInline />}
                            {!isImage && !isVideo && <File className="w-10 h-10 text-white/20" />}
                            <div className="absolute inset-0 bg-neon-purple/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <CheckCircle className="w-8 h-8 text-white shadow-lg" />
                            </div>
                          </div>
                          <div className="p-3">
                            <p className="text-xs text-white/70 truncate font-mono" title={file.name}>{file.name}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
}
