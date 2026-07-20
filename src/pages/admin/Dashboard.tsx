import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate, Navigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { 
  Users, 
  Calendar, 
  Image as ImageIcon, 
  ClipboardList, 
  LogOut, 
  Trash2, 
  Edit, 
  Plus, 
  CheckCircle,
  XCircle,
  Upload,
  ExternalLink,
  Search,
  Video,
  Settings,
  X,
  Clock,
  Pencil,
  Download,
  GripVertical,
  Globe,
  Instagram,
  Linkedin,
  FolderOpen,
  RefreshCw,
  Eye,
  Copy,
  Check,
  File
} from "lucide-react";
import { StorageBrowser } from "@/components/StorageBrowser";
import { MediaPickerModal } from "@/components/MediaPickerModal";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type TabType = "applications" | "leads" | "events" | "gallery" | "videos" | "uploads";

export default function AdminDashboard() {
  const { user, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>("applications");
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [newItem, setNewItem] = useState<any>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [uploading, setUploading] = useState(false);
  const [showUploads, setShowUploads] = useState(false);
  // Uploads tab state
  const [storageFiles, setStorageFiles] = useState<any[]>([]);
  const [storageLoading, setStorageLoading] = useState(false);
  const [deletingFileIds, setDeletingFileIds] = useState<Set<string>>(new Set());
  const [confirmDeleteFileId, setConfirmDeleteFileId] = useState<string | null>(null);
  const [copiedFileId, setCopiedFileId] = useState<string | null>(null);
  const [previewFile, setPreviewFile] = useState<{ url: string; mime: string } | null>(null);
  
  // Media Picker state
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerTarget, setPickerTarget] = useState<{ target: 'new' | 'edit', field: string } | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && user) {
      if (activeTab === 'uploads') {
        fetchStorageFiles();
      } else {
        fetchData();
      }
    }
  }, [activeTab, user, authLoading]);

  const fetchStorageFiles = async () => {
    setStorageLoading(true);
    const { data, error } = await supabase.storage.from('club_assets').list('uploads', {
      limit: 200,
      sortBy: { column: 'created_at', order: 'desc' },
    });
    if (!error && data) {
      setStorageFiles(data.filter((f: any) => f.name !== '.emptyFolderPlaceholder'));
    }
    setStorageLoading(false);
  };

  const getPublicUrl = (name: string) =>
    supabase.storage.from('club_assets').getPublicUrl(`uploads/${name}`).data.publicUrl;

  const handleDeleteFile = async (file: any) => {
    setDeletingFileIds(prev => new Set(prev).add(file.id));
    const { error } = await supabase.storage.from('club_assets').remove([`uploads/${file.name}`]);
    if (!error) setStorageFiles(prev => prev.filter(f => f.id !== file.id));
    else alert(error.message);
    setDeletingFileIds(prev => { const s = new Set(prev); s.delete(file.id); return s; });
    setConfirmDeleteFileId(null);
  };

  const handleCopyUrl = (file: any) => {
    navigator.clipboard.writeText(getPublicUrl(file.name));
    setCopiedFileId(file.id);
    setTimeout(() => setCopiedFileId(null), 2000);
  };

  const formatBytes = (b: number) => {
    if (!b) return '0 B';
    const k = 1024, s = ['B','KB','MB','GB'];
    const i = Math.floor(Math.log(b) / Math.log(k));
    return `${parseFloat((b / Math.pow(k, i)).toFixed(1))} ${s[i]}`;
  };

  const fetchData = async () => {
    setLoading(true);
    let table = "";
    switch (activeTab) {
      case "applications": table = "applications"; break;
      case "leads": table = "club_leads"; break;
      case "events": table = "events"; break;
      case "gallery": table = "gallery"; break;
      case "videos": table = "videos"; break;
    }

    const { data: result, error } = await supabase
      .from(table)
      .select("*")
      .order(activeTab === 'leads' ? "order_index" : "created_at", { ascending: activeTab === 'leads' });

    if (!error && result) {
      setData(result);
    }
    setLoading(false);
  };

  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData("draggedId", id);
  };

  const handleDrop = async (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    const draggedId = e.dataTransfer.getData("draggedId");
    if (draggedId === targetId) return;

    const newData = [...data];
    const draggedIndex = newData.findIndex(i => i.id === draggedId);
    const targetIndex = newData.findIndex(i => i.id === targetId);

    if (draggedIndex === -1 || targetIndex === -1) return;

    const [removed] = newData.splice(draggedIndex, 1);
    newData.splice(targetIndex, 0, removed);
    setData(newData);

    // Update DB
    const updates = newData.map((item, index) => 
      supabase.from('club_leads').update({ order_index: index }).eq('id', item.id)
    );
    await Promise.all(updates);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, target: 'new' | 'edit', field: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `uploads/${fileName}`;

    const { error: uploadError, data } = await supabase.storage
      .from('club_assets')
      .upload(filePath, file);

    if (uploadError) {
      alert(uploadError.message);
      setUploading(false);
      return;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('club_assets')
      .getPublicUrl(filePath);

    if (target === 'new') {
      setNewItem({ ...newItem, [field]: publicUrl });
    } else {
      setEditingItem({ ...editingItem, [field]: publicUrl });
    }
    setUploading(false);
  };

  const updateApplicationStatus = async (id: string, status: string) => {
    const { error } = await supabase
      .from("applications")
      .update({ status })
      .eq("id", id);
    if (!error) fetchData();
  };

  const toggleYearShowFirst = async (year: string, isCurrentlyShown: boolean) => {
    // If it's already shown, toggling it off means unfeaturing it.
    // If it's not shown, we set ALL other years to false, and THIS year to true.
    if (isCurrentlyShown) {
      await supabase.from("club_leads").update({ show_first: false }).eq("year", year);
    } else {
      await supabase.from("club_leads").update({ show_first: false }).neq("year", year);
      await supabase.from("club_leads").update({ show_first: true }).eq("year", year);
    }
    fetchData();
  };

  const deleteItem = async (table: string, id: string) => {
    if (!confirm("Are you sure?")) return;
    const { error } = await supabase.from(table).delete().eq("id", id);
    if (!error) fetchData();
  };

  const exportToCSV = () => {
    if (data.length === 0) return;
    
    const headers = Object.keys(data[0]).join(",");
    const rows = data.map(item => 
      Object.values(item)
        .map(val => `"${String(val).replace(/"/g, '""')}"`)
        .join(",")
    );
    
    const csvContent = [headers, ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    
    link.setAttribute("href", url);
    link.setAttribute("download", `gtech-${activeTab}-${new Date().toLocaleDateString()}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    let table = "";
    switch (activeTab) {
      case "leads": table = "club_leads"; break;
      case "events": table = "events"; break;
      case "gallery": table = "gallery"; break;
      case "applications": table = "applications"; break;
      case "videos": table = "videos"; break;
    }
    let itemToInsert = { ...newItem };
    if (activeTab === 'leads') {
      itemToInsert.order_index = data.length;
    }
    
    const { error } = await supabase.from(table).insert([itemToInsert]);
    if (!error) {
      setIsAdding(false);
      setNewItem({});
      fetchData();
    } else {
      alert(error.message);
    }
  };

  const handleUpdateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    let table = "";
    switch (activeTab) {
      case "applications": table = "applications"; break;
      case "leads": table = "club_leads"; break;
      case "events": table = "events"; break;
      case "gallery": table = "gallery"; break;
      case "videos": table = "videos"; break;
    }
    
    const { id, created_at, ...updateData } = editingItem;
    const { error } = await supabase.from(table).update(updateData).eq("id", id);
    if (!error) {
      setEditingItem(null);
      fetchData();
    } else {
      alert(error.message);
    }
  };


  if (authLoading) return <div className="min-h-screen bg-mesh flex items-center justify-center"><Clock className="animate-spin text-neon-purple" /></div>;
  if (!user) return <Navigate to="/login" />;

  return (
    <div className="min-h-screen bg-mesh text-white pb-20 pt-32">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-6">
          <div>
            <h1 className="text-5xl font-display uppercase tracking-tighter">
              Admin <span className="text-gradient">Control</span>
            </h1>
            <p className="text-white/40 mt-2 font-medium">Managing G-Tech Club ecosystem</p>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-3 md:gap-4">
            <Button 
              variant="outline" 
              onClick={() => window.open('https://github.com/Generalized-Technology/Video_Storage/upload/main/videos', '_blank', 'noopener,noreferrer')}
              className="glass hover:bg-neon-blue/20 hover:text-white border-white/10 rounded-2xl h-12 px-6 shadow-lg"
            >
              <Upload className="w-4 h-4 mr-2 text-neon-blue" />
              <span className="hidden sm:inline">Upload Videos</span>
              <span className="sm:hidden">Upload</span>
              <ExternalLink className="w-3 h-3 ml-2 text-white/50" />
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setShowUploads(true)}
              className="glass hover:bg-green-500/20 hover:text-green-400 border-white/10 rounded-2xl h-12 px-6 shadow-lg"
            >
              <FolderOpen className="w-4 h-4 mr-2 text-green-400" />
              <span className="hidden sm:inline">View Uploads</span>
              <span className="sm:hidden">Uploads</span>
            </Button>
            <Button 
              variant="outline" 
              onClick={() => window.open('https://generalized-technology.github.io/Video_Storage/', '_blank', 'noopener,noreferrer')}
              className="glass hover:bg-neon-purple/20 hover:text-white border-white/10 rounded-2xl h-12 px-6 shadow-lg"
            >
              <Video className="w-4 h-4 mr-2 text-neon-purple" />
              <span className="hidden sm:inline">View Video Storage</span>
              <span className="sm:hidden">Storage</span>
              <ExternalLink className="w-3 h-3 ml-2 text-white/50" />
            </Button>
            <Button 
              variant="outline" 
              onClick={handleLogout}
              className="glass hover:bg-red-500/20 hover:text-red-500 border-white/10 rounded-2xl h-12 px-6 shadow-lg"
            >
              <LogOut className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Logout</span>
              <span className="sm:hidden">Exit</span>
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-4 mb-10 bg-white/5 p-2 rounded-[24px] border border-white/10">
          {[
            { id: "events", icon: Calendar, label: "Events" },
            { id: "gallery", icon: ImageIcon, label: "Gallery" },
            { id: "videos", icon: Video, label: "Home Video" },
            { id: "leads", icon: Users, label: "Club Leads" },
            { id: "applications", icon: ClipboardList, label: "Applications" },
            { id: "uploads", icon: FolderOpen, label: "Uploads" }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as TabType);
                setIsAdding(false);
              }}
              className={`flex items-center gap-3 px-6 py-4 rounded-2xl transition-all font-bold uppercase tracking-widest text-xs ${
                activeTab === tab.id
                  ? tab.id === 'uploads'
                    ? 'bg-green-500/80 text-white shadow-[0_0_30px_rgba(34,197,94,0.3)]'
                    : 'bg-neon-purple text-white shadow-[0_0_30px_rgba(168,85,247,0.3)]'
                  : 'text-white/40 hover:text-white hover:bg-white/5'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="glass-dark border-white/10 rounded-[40px] overflow-hidden min-h-[500px]">
          {/* ── Uploads Tab ─────────────────────────────────── */}
          {activeTab === 'uploads' ? (
            <motion.div
              key="uploads"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="p-8"
            >
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-display uppercase flex items-center gap-3">
                    <FolderOpen className="w-6 h-6 text-green-400" /> Uploads
                  </h2>
                  <p className="text-white/30 text-xs mt-1">
                    club_assets / uploads &nbsp;·&nbsp; {storageFiles.length} files
                    &nbsp;·&nbsp; {formatBytes(storageFiles.reduce((a, f) => a + (f.metadata?.size || 0), 0))}
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={fetchStorageFiles}
                  className="glass border-white/10 h-10 px-5 rounded-xl hover:bg-white/10 flex items-center gap-2"
                >
                  <RefreshCw className={`w-4 h-4 ${storageLoading ? 'animate-spin' : ''}`} />
                  <span className="hidden sm:inline">Refresh</span>
                </Button>
              </div>

              {storageLoading ? (
                <div className="flex items-center justify-center py-32">
                  <div className="w-10 h-10 border-4 border-green-400 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : storageFiles.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-32 text-white/20">
                  <FolderOpen className="w-12 h-12 mb-4" />
                  <p>No uploads found in club_assets/uploads</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {storageFiles.map((file) => {
                    const mime = file.metadata?.mimetype || '';
                    const isImage = mime.startsWith('image/');
                    const isVideo = mime.startsWith('video/');
                    const publicUrl = getPublicUrl(file.name);
                    const isDeleting = deletingFileIds.has(file.id);
                    const isConfirming = confirmDeleteFileId === file.id;
                    return (
                      <motion.div
                        key={file.id}
                        layout
                        animate={{ opacity: isDeleting ? 0.4 : 1 }}
                        className="group relative glass border border-white/10 rounded-2xl overflow-hidden hover:border-white/25 transition-colors"
                      >
                        {/* Thumbnail */}
                        <div className="relative w-full h-32 bg-white/5 flex items-center justify-center overflow-hidden">
                          {isImage && <img src={publicUrl} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />}
                          {isVideo && <video src={publicUrl} className="w-full h-full object-cover opacity-70 group-hover:opacity-90 transition-opacity" muted playsInline />}
                          {!isImage && !isVideo && <File className="w-10 h-10 text-white/20" />}
                          {/* Hover actions */}
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            {(isImage || isVideo) && (
                              <button
                                onClick={() => setPreviewFile({ url: publicUrl, mime })}
                                className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/30 border border-white/20 flex items-center justify-center transition-colors"
                                title="Preview"
                              >
                                <Eye className="w-3.5 h-3.5 text-white" />
                              </button>
                            )}
                            <button
                              onClick={() => handleCopyUrl(file)}
                              className="w-8 h-8 rounded-full bg-white/15 hover:bg-neon-blue/40 border border-white/20 flex items-center justify-center transition-colors"
                              title="Copy URL"
                            >
                              {copiedFileId === file.id
                                ? <Check className="w-3.5 h-3.5 text-green-400" />
                                : <Copy className="w-3.5 h-3.5 text-white" />}
                            </button>
                          </div>
                        </div>
                        {/* Info row */}
                        <div className="px-3 py-2.5">
                          <p className="text-[11px] text-white/60 truncate font-mono" title={file.name}>{file.name}</p>
                          <div className="flex items-center justify-between mt-1.5">
                            <span className="text-[10px] text-white/30">{formatBytes(file.metadata?.size)}</span>
                            {isConfirming ? (
                              <div className="flex gap-1">
                                <button
                                  onClick={() => handleDeleteFile(file)}
                                  disabled={isDeleting}
                                  className="text-[10px] px-2 py-0.5 rounded bg-red-500/20 text-red-400 hover:bg-red-500/40 font-bold transition-colors"
                                >Confirm</button>
                                <button
                                  onClick={() => setConfirmDeleteFileId(null)}
                                  className="text-[10px] px-2 py-0.5 rounded bg-white/5 text-white/30 hover:bg-white/10 transition-colors"
                                >Cancel</button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setConfirmDeleteFileId(file.id)}
                                disabled={isDeleting}
                                className="opacity-0 group-hover:opacity-100 transition-opacity w-6 h-6 rounded-md bg-red-500/10 hover:bg-red-500/30 flex items-center justify-center"
                                title="Delete"
                              >
                                <Trash2 className="w-3 h-3 text-red-400" />
                              </button>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          ) : loading ? (
            <div className="flex items-center justify-center p-40">
              <div className="w-10 h-10 border-4 border-neon-purple border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab + (isAdding ? "-adding" : "")}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="p-8"
              >
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-2xl font-display uppercase">
                    {activeTab} {isAdding ? "(Add New)" : ""}
                  </h2>
                  <div className="flex gap-4">
                    {!isAdding && activeTab === 'applications' && (
                      <div className="flex items-center gap-4">
                        <div className="relative group">
                          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 group-focus-within:text-neon-purple transition-colors" />
                          <Input 
                            placeholder={`Search ${activeTab}...`} 
                            className="h-12 pl-12 w-64 bg-white/5 border-white/10 rounded-xl focus:w-80 transition-all font-medium"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                          />
                        </div>
                        <Button 
                          onClick={exportToCSV}
                          variant="outline" 
                          className="glass border-white/10 h-12 px-6 rounded-xl flex items-center gap-2 hover:bg-neon-purple/20 transition-all shadow-lg"
                        >
                          <Download className="w-4 h-4" />
                          <span className="hidden sm:inline">Export CSV</span>
                        </Button>
                      </div>
                    )}
                    {!isAdding && activeTab !== 'applications' && (
                      <Button 
                        onClick={() => setIsAdding(true)}
                        className="btn-primary rounded-xl h-12 shadow-lg"
                      >
                        <Plus className="w-4 h-4 mr-2" /> Add New
                      </Button>
                    )}
                    {isAdding && (
                      <Button 
                        onClick={() => setIsAdding(false)}
                        variant="outline"
                        className="glass border-white/10 rounded-xl h-12"
                      >
                        Cancel
                      </Button>
                    )}
                  </div>
                </div>

                {isAdding ? (
                  <form onSubmit={handleAddItem} className="mb-12 grid grid-cols-1 md:grid-cols-2 gap-6 bg-white/5 p-8 rounded-3xl border border-white/10 shadow-2xl">
                    <h3 className="md:col-span-2 text-white/40 uppercase tracking-widest text-xs font-bold mb-2">New {activeTab} entry</h3>
                    {activeTab === 'leads' && (
                      <>
                        <div className="space-y-2">
                          <label className="text-xs uppercase text-white/30 ml-2">Name</label>
                          <Input className="h-14 text-lg px-6 bg-white/5 border-white/10" placeholder="Name" required onChange={e => setNewItem({...newItem, name: e.target.value})} />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs uppercase text-white/30 ml-2">Domain / Role</label>
                          <Input className="h-14 text-lg px-6 bg-white/5 border-white/10" placeholder="Domain" required onChange={e => setNewItem({...newItem, domain: e.target.value})} />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs uppercase text-white/30 ml-2">Active Year</label>
                          <Input className="h-14 text-lg px-6 bg-white/5 border-white/10" placeholder="Year (e.g. 2025–26)" required onChange={e => setNewItem({...newItem, year: e.target.value})} />
                        </div>
                        <div className="space-y-2">
                           <label className="text-xs uppercase text-white/30 ml-2">Member Photo</label>
                           <div 
                             onClick={() => { setPickerTarget({ target: 'new', field: 'image' }); setPickerOpen(true); }}
                             className="relative group h-14 bg-white/5 border border-white/10 rounded-xl cursor-pointer flex items-center px-6 hover:border-white/20 transition-colors"
                           >
                             <span className="text-white/50">{newItem.image ? 'Change Media...' : 'Choose Media...'}</span>
                             <Upload className="absolute right-4 top-4 text-white/20 w-5 h-5 group-hover:text-neon-purple transition-colors" />
                           </div>
                           {newItem.image && <p className="text-[10px] text-green-400 ml-2 truncate">Selected: {newItem.image}</p>}
                        </div>
                        <div className="space-y-3 md:col-span-2 mt-4">
                          <label className="text-xs uppercase text-white/30 ml-2">Social & Professional Links</label>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input className="h-14 bg-white/5 border-white/10 px-6" placeholder="LinkedIn URL" onChange={e => setNewItem({...newItem, linkedin: e.target.value})} />
                            <Input className="h-14 bg-white/5 border-white/10 px-6" placeholder="Portfolio URL" onChange={e => setNewItem({...newItem, portfolio: e.target.value})} />
                            <Input className="h-14 bg-white/5 border-white/10 px-6" placeholder="Instagram URL" onChange={e => setNewItem({...newItem, instagram: e.target.value})} />
                            <Input className="h-14 bg-white/5 border-white/10 px-6" placeholder="Contact Number" onChange={e => setNewItem({...newItem, contact: e.target.value})} />
                          </div>
                        </div>
                      </>
                    )}
                    {activeTab === 'events' && (
                      <>
                        <div className="space-y-2">
                          <label className="text-xs uppercase text-white/30 ml-2">Event Title</label>
                          <Input className="h-14 text-lg px-6 bg-white/5 border-white/10" placeholder="Title" required onChange={e => setNewItem({...newItem, title: e.target.value})} />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs uppercase text-white/30 ml-2">Event Date</label>
                          <Input className="h-14 text-lg px-6 bg-white/5 border-white/10" placeholder="Date" required onChange={e => setNewItem({...newItem, date: e.target.value})} />
                        </div>
                        <div className="md:col-span-2 space-y-2">
                          <label className="text-xs uppercase text-white/30 ml-2">Google Drive Link</label>
                          <Input className="h-14 text-lg px-6 bg-white/5 border-white/10" placeholder="Drive Link" required onChange={e => setNewItem({...newItem, drive_link: e.target.value})} />
                        </div>
                        <div className="space-y-2">
                           <label className="text-xs uppercase text-white/30 ml-2">Event Poster</label>
                           <div 
                             onClick={() => { setPickerTarget({ target: 'new', field: 'image' }); setPickerOpen(true); }}
                             className="relative group h-14 bg-white/5 border border-white/10 rounded-xl cursor-pointer flex items-center px-6 hover:border-white/20 transition-colors"
                           >
                             <span className="text-white/50">{newItem.image ? 'Change Media...' : 'Choose Media...'}</span>
                             <Upload className="absolute right-4 top-4 text-white/20 w-5 h-5 group-hover:text-neon-purple transition-colors" />
                           </div>
                           {newItem.image && <p className="text-[10px] text-green-400 ml-2 truncate">Selected: {newItem.image}</p>}
                        </div>
                        <div className="space-y-2 md:col-span-2">
                          <label className="text-xs uppercase text-white/30 ml-2">Description</label>
                          <Textarea className="min-h-37.5 text-lg p-6 bg-white/5 border-white/10 rounded-2xl" placeholder="Description" onChange={e => setNewItem({...newItem, description: e.target.value})} />
                        </div>
                      </>
                    )}
                    {activeTab === 'gallery' && (
                      <>
                        <div className="space-y-2">
                          <label className="text-xs uppercase text-white/30 ml-2">Caption</label>
                          <Input className="h-14 text-lg px-6 bg-white/5 border-white/10" placeholder="Caption" onChange={e => setNewItem({...newItem, caption: e.target.value})} />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs uppercase text-white/30 ml-2">Taken By / PC</label>
                          <Input className="h-14 text-lg px-6 bg-white/5 border-white/10" placeholder="Taken By / PC" onChange={e => setNewItem({...newItem, taken_by: e.target.value})} />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                           <label className="text-xs uppercase text-white/30 ml-2">Gallery Media (Upload or URL)</label>
                           <div className="flex flex-col md:flex-row gap-4">
                             <div 
                               onClick={() => { setPickerTarget({ target: 'new', field: 'url' }); setPickerOpen(true); }}
                               className="relative w-full md:w-1/2 group h-14 bg-white/5 border border-white/10 rounded-xl cursor-pointer flex items-center px-6 hover:border-white/20 transition-colors"
                             >
                               <span className="text-white/50">{newItem.url && !newItem.url.startsWith('http') ? 'Change File...' : 'Choose File...'}</span>
                               <Upload className="absolute right-4 top-4 text-white/20 w-5 h-5 group-hover:text-neon-purple transition-colors" />
                             </div>
                             <Input 
                               className="w-full md:w-1/2 h-14 text-lg px-6 bg-white/5 border-white/10" 
                               placeholder="Or paste Video URL" 
                               value={newItem.url || ""}
                               onChange={e => setNewItem({...newItem, url: e.target.value})} 
                             />
                           </div>
                           {newItem.url && <p className="text-[10px] text-green-400 ml-2 mt-2 truncate">Selected/Entered: {newItem.url}</p>}
                        </div>
                      </>
                    )}
                    {activeTab === 'videos' && (
                      <>
                        <div className="space-y-2">
                          <label className="text-xs uppercase text-white/30 ml-2">Video Title</label>
                          <Input className="h-14 text-lg px-6 bg-white/5 border-white/10" placeholder="Video Title" required onChange={e => setNewItem({...newItem, title: e.target.value})} />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs uppercase text-white/30 ml-2">Video URL</label>
                          <Input className="h-14 text-lg px-6 bg-white/5 border-white/10" placeholder="Video URL (no upload)" required onChange={e => setNewItem({...newItem, url: e.target.value})} />
                        </div>
                      </>
                    )}
                    <Button type="submit" disabled={uploading} className="btn-primary h-14 text-lg md:col-span-2 rounded-2xl shadow-2xl mt-4">
                      {uploading ? "Uploading Image..." : "Save To Database"}
                    </Button>
                  </form>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader className="border-white/10 border-b">
                        <TableRow className="hover:bg-transparent border-none">
                          {activeTab === "applications" && (
                            <>
                              <TableHead className="text-white/50 min-w-50">Name</TableHead>
                              <TableHead className="text-white/50 min-w-37.5">Portfolio</TableHead>
                              <TableHead className="text-white/50 min-w-50">Email</TableHead>
                              <TableHead className="text-white/50 min-w-37.5">WhatsApp No</TableHead>
                              <TableHead className="text-white/50 min-w-37.5">Department</TableHead>
                              <TableHead className="text-white/50 min-w-30">Roll No</TableHead>
                              <TableHead className="text-white/50 min-w-30">Reg No</TableHead>
                              <TableHead className="text-white/50 min-w-20">Year</TableHead>
                              <TableHead className="text-white/50 min-w-45">Interested Domain</TableHead>
                              <TableHead className="text-white/50 min-w-75">Purpose</TableHead>
                              <TableHead className="text-white/50 min-w-30">Status</TableHead>
                              <TableHead className="text-white/50 text-right sticky right-0 bg-mesh/90 backdrop-blur-md">Actions</TableHead>
                            </>
                          )}
                          {activeTab === "leads" && (
                            <>
                              <TableHead className="text-white/50">Lead Name</TableHead>
                              <TableHead className="text-white/50">Position</TableHead>
                              <TableHead className="text-white/50">Year</TableHead>
                              <TableHead className="text-white/50">Links</TableHead>
                              <TableHead className="text-white/50 text-right">Actions</TableHead>
                            </>
                          )}
                          {activeTab === "events" && (
                            <>
                              <TableHead className="text-white/50">Event Title</TableHead>
                              <TableHead className="text-white/50">Date</TableHead>
                              <TableHead className="text-white/50">Drive Link</TableHead>
                              <TableHead className="text-white/50 text-right">Actions</TableHead>
                            </>
                          )}
                          {activeTab === "gallery" && (
                            <>
                              <TableHead className="text-white/50">Preview</TableHead>
                              <TableHead className="text-white/50">Taken By</TableHead>
                              <TableHead className="text-white/50">Caption</TableHead>
                              <TableHead className="text-white/50 text-right">Actions</TableHead>
                            </>
                          )}
                          {activeTab === "videos" && (
                            <>
                              <TableHead className="text-white/50">Video Details</TableHead>
                              <TableHead className="text-white/50">URL</TableHead>
                              <TableHead className="text-white/50 text-right">Actions</TableHead>
                            </>
                          )}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {activeTab === "leads" ? (
                          (() => {
                            const filteredData = data.filter(item => {
                              if (!searchQuery) return true;
                              const q = searchQuery.toLowerCase();
                              return item.name?.toLowerCase().includes(q) || item.domain?.toLowerCase().includes(q);
                            });
                            
                            const groups = filteredData.reduce((acc: any, item: any) => {
                              const year = item.year || "Unknown Year";
                              if (!acc[year]) acc[year] = [];
                              acc[year].push(item);
                              return acc;
                            }, {});

                            return Object.keys(groups).sort((a, b) => b.localeCompare(a)).map(year => (
                              <React.Fragment key={year}>
                                <TableRow className="bg-white/5 hover:bg-white/5 border-none">
                                  <TableCell colSpan={5} className="py-8 px-10">
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-6">
                                        <div className="w-2 h-10 bg-linear-to-b from-neon-purple to-neon-blue rounded-full shadow-[0_0_15px_rgba(168,85,247,0.5)]" />
                                        <div>
                                          <span className="text-2xl font-mono uppercase tracking-[0.2em] text-white block">{year} Leads</span>
                                          <span className="text-[10px] uppercase text-white/20 tracking-widest mt-1 block">Leadership & Coordination Team</span>
                                        </div>
                                      </div>
                                      
                                      {(() => {
                                        const isShown = groups[year].some((item: any) => item.show_first);
                                        return (
                                          <div className="flex items-center gap-3">
                                            <span className="text-xs uppercase text-white/40 tracking-wider">Show on About Page</span>
                                            <button
                                              onClick={() => toggleYearShowFirst(year, isShown)}
                                              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                                isShown ? 'bg-neon-purple' : 'bg-white/10'
                                              }`}
                                              title={isShown ? "Currently shown on About page" : "Show this year's leads on About page"}
                                            >
                                              <span
                                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                                  isShown ? 'translate-x-6' : 'translate-x-1'
                                                }`}
                                              />
                                            </button>
                                          </div>
                                        );
                                      })()}
                                    </div>
                                  </TableCell>
                                </TableRow>
                                {groups[year].map((item: any) => (
                                  <TableRow 
                                    key={item.id} 
                                    draggable={activeTab === 'leads'}
                                    onDragStart={(e) => handleDragStart(e, item.id)}
                                    onDragOver={(e) => e.preventDefault()}
                                    onDrop={(e) => handleDrop(e, item.id)}
                                    className={`border-white/5 hover:bg-white/2 transition-colors group ${activeTab === 'leads' ? 'cursor-move' : ''}`}
                                  >
                                    <TableCell className="py-6 flex items-center gap-4">
                                      {activeTab === 'leads' && (
                                        <GripVertical className="w-4 h-4 text-white/20 group-hover:text-neon-purple transition-colors" />
                                      )}
                                      <img src={item.image} className="w-10 h-10 rounded-lg object-cover border border-white/10" alt="" />
                                      <span className="font-bold">{item.name}</span>
                                    </TableCell>
                                    <TableCell className="text-white/60">{item.domain}</TableCell>
                                    <TableCell className="text-neon-purple text-xs font-bold">{item.year}</TableCell>
                                    <TableCell>
                                      <div className="flex gap-2">
                                        {item.portfolio && <a href={item.portfolio} target="_blank" className="text-neon-purple hover:text-white transition-colors"><Globe className="w-4 h-4" /></a>}
                                        {item.linkedin && <a href={item.linkedin} target="_blank" className="text-neon-blue hover:text-white transition-colors"><Linkedin className="w-4 h-4" /></a>}
                                        {item.instagram && <a href={item.instagram} target="_blank" className="text-pink-500 hover:text-white transition-colors"><Instagram className="w-4 h-4" /></a>}
                                      </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                      <div className="flex justify-end gap-2">
                                        <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setEditingItem(item)}><Pencil className="w-4 h-4" /></Button>
                                        <Button size="icon" variant="ghost" className="h-8 w-8 text-red-400" onClick={() => deleteItem('club_leads', item.id)}><Trash2 className="w-4 h-4" /></Button>
                                      </div>
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </React.Fragment>
                            ));
                          })()
                        ) : (
                          data
                            .filter(item => {
                              if (activeTab !== 'applications') return true;
                              if (!searchQuery) return true;
                              const q = searchQuery.toLowerCase();
                              return (
                                item.name?.toLowerCase().includes(q) ||
                                item.email?.toLowerCase().includes(q) ||
                                item.interest?.toLowerCase().includes(q) ||
                                item.roll_number?.toLowerCase().includes(q)
                              );
                            })
                            .map((item) => (
                            <TableRow key={item.id} className="border-white/5 hover:bg-white/2 transition-colors group">
                              {activeTab === "applications" && (
                                <>
                                  <TableCell className="py-6 whitespace-nowrap font-bold text-white">{item.name}</TableCell>
                                  <TableCell className="whitespace-nowrap">
                                     {item.portfolio_link ? (
                                       <a 
                                         href={item.portfolio_link.startsWith('http') ? item.portfolio_link : `https://${item.portfolio_link}`} 
                                         target="_blank" 
                                         rel="noopener noreferrer"
                                         className="text-neon-blue underline text-xs"
                                       >
                                         View Works
                                       </a>
                                     ) : <span className="text-white/10 italic">None</span>}
                                  </TableCell>
                                  <TableCell className="whitespace-nowrap text-white/60">{item.email}</TableCell>
                                  <TableCell className="whitespace-nowrap text-white/60">{item.whatsapp}</TableCell>
                                  <TableCell className="whitespace-nowrap text-white/60">{item.department}</TableCell>
                                  <TableCell className="whitespace-nowrap text-white/40">{item.roll_number || 'N/A'}</TableCell>
                                  <TableCell className="whitespace-nowrap text-white/40">{item.register_number || 'N/A'}</TableCell>
                                  <TableCell className="whitespace-nowrap text-white/60 font-bold">{item.year}</TableCell>
                                  <TableCell className="whitespace-nowrap text-neon-purple text-xs font-bold uppercase">{item.interest}</TableCell>
                                  <TableCell className="min-w-[300px]">
                                     <div className="text-white/40 text-xs truncate max-w-[280px]" title={item.purpose}>{item.purpose}</div>
                                  </TableCell>
                                  <TableCell className="whitespace-nowrap">
                                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                                      item.status === 'accepted' ? 'bg-green-500/20 text-green-400' :
                                      item.status === 'rejected' ? 'bg-red-500/20 text-red-400' :
                                      'bg-yellow-500/20 text-yellow-400'
                                    }`}>
                                      {item.status}
                                    </span>
                                  </TableCell>
                                  <TableCell className="text-right min-w-[160px] sticky right-0 bg-mesh/90 backdrop-blur-md">
                                    <div className="flex justify-end gap-2">
                                      <Button size="icon" variant="ghost" className="h-8 w-8 text-green-400 hover:bg-green-500/10" title="Accept" onClick={() => updateApplicationStatus(item.id, 'accepted')}>
                                        <CheckCircle className="w-4 h-4" />
                                      </Button>
                                      <Button size="icon" variant="ghost" className="h-8 w-8 text-red-400 hover:bg-red-500/10" title="Reject" onClick={() => updateApplicationStatus(item.id, 'rejected')}>
                                        <XCircle className="w-4 h-4" />
                                      </Button>
                                      <Button size="icon" variant="ghost" className="h-8 w-8 text-white/60 hover:bg-white/10" title="Edit" onClick={() => setEditingItem(item)}>
                                        <Pencil className="w-4 h-4" />
                                      </Button>
                                      <Button size="icon" variant="ghost" className="h-8 w-8 hover:bg-red-500/10 text-red-400" title="Delete" onClick={() => deleteItem('applications', item.id)}>
                                        <Trash2 className="w-4 h-4" />
                                      </Button>
                                    </div>
                                  </TableCell>
                                </>
                              )}
                              {activeTab === "events" && (
                                <>
                                  <TableCell className="py-6 min-w-[300px]">
                                    <div className="font-bold">{item.title}</div>
                                    <div className="text-white/20 text-[10px] mt-1 truncate max-w-[280px]">{item.description}</div>
                                  </TableCell>
                                  <TableCell className="text-white/60 whitespace-nowrap">{item.date}</TableCell>
                                  <TableCell className="min-w-[200px]">
                                     {item.drive_link ? (
                                        <a href={item.drive_link} target="_blank" className="text-neon-blue flex items-center gap-1 text-xs hover:underline">
                                           Link <ExternalLink className="w-3 h-3" />
                                        </a>
                                     ) : <span className="text-white/10">No link</span>}
                                  </TableCell>
                                  <TableCell className="text-right">
                                    <div className="flex justify-end gap-2">
                                      <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setEditingItem(item)}><Pencil className="w-4 h-4" /></Button>
                                      <Button size="icon" variant="ghost" className="h-8 w-8 text-red-400" onClick={() => deleteItem('events', item.id)}><Trash2 className="w-4 h-4" /></Button>
                                    </div>
                                  </TableCell>
                                </>
                              )}
                              {activeTab === "gallery" && (
                                <>
                                  <TableCell className="py-6">
                                    <img src={item.url} className="w-16 h-10 rounded object-cover border border-white/10" alt="" />
                                  </TableCell>
                                  <TableCell className="text-white/60">{item.taken_by || item.takenBy || 'G-Tech'}</TableCell>
                                  <TableCell className="text-white/40 truncate max-w-[300px]">{item.caption}</TableCell>
                                  <TableCell className="text-right">
                                    <div className="flex justify-end gap-2">
                                      <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setEditingItem(item)}><Pencil className="w-4 h-4" /></Button>
                                      <Button size="icon" variant="ghost" className="h-8 w-8 text-red-400" onClick={() => deleteItem('gallery', item.id)}><Trash2 className="w-4 h-4" /></Button>
                                    </div>
                                  </TableCell>
                                </>
                              )}
                              {activeTab === "videos" && (
                                <>
                                  <TableCell className="py-6">
                                    <div className="font-bold">{item.title}</div>
                                  </TableCell>
                                  <TableCell className="text-white/40 truncate max-w-[400px]">{item.url}</TableCell>
                                  <TableCell className="text-right">
                                    <div className="flex justify-end gap-2">
                                      <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setEditingItem(item)}><Pencil className="w-4 h-4" /></Button>
                                      <Button size="icon" variant="ghost" className="h-8 w-8 text-red-400" onClick={() => deleteItem('videos', item.id)}><Trash2 className="w-4 h-4" /></Button>
                                    </div>
                                  </TableCell>
                                </>
                              )}

                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                    {data.length === 0 && (
                      <div className="text-center py-20 text-white/20">
                        No records found in {activeTab}
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      <Dialog open={!!editingItem} onOpenChange={() => setEditingItem(null)}>
        <DialogContent className="w-[95vw] sm:max-w-none md:w-[70vw] md:max-w-[70vw] glass-dark border-white/10 text-white p-0 overflow-hidden rounded-[32px] shadow-[0_0_100px_rgba(0,0,0,0.8)]">
          <DialogHeader className="p-10 border-b border-white/5 bg-white/2">
            <DialogTitle className="text-3xl font-display uppercase tracking-widest flex items-center gap-4">
               <div className="w-2 h-8 bg-neon-purple rounded-full" />
               Edit {activeTab === 'applications' ? 'Application' : 
                     activeTab === 'leads' ? 'Lead' : 
                     activeTab === 'events' ? 'Event' : 
                     activeTab === 'gallery' ? 'Gallery' : 'Video Archive'}
            </DialogTitle>
          </DialogHeader>
          
          {editingItem && (
            <form onSubmit={handleUpdateItem} className="grid grid-cols-1 md:grid-cols-2 gap-8 p-10 max-h-[70vh] overflow-y-auto custom-scrollbar">
              {activeTab === 'applications' && (
                <>
                  <div className="space-y-2">
                    <label className="text-xs uppercase text-white/30 ml-2">Full Name</label>
                    <Input className="h-14 text-lg px-6 bg-white/5 border-white/10" value={editingItem.name} onChange={e => setEditingItem({...editingItem, name: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs uppercase text-white/30 ml-2">Email Address</label>
                    <Input className="h-14 text-lg px-6 bg-white/5 border-white/10" value={editingItem.email} onChange={e => setEditingItem({...editingItem, email: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs uppercase text-white/30 ml-2">WhatsApp Number</label>
                    <Input className="h-14 text-lg px-6 bg-white/5 border-white/10" value={editingItem.whatsapp} onChange={e => setEditingItem({...editingItem, whatsapp: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs uppercase text-white/30 ml-2">Department</label>
                    <Input className="h-14 text-lg px-6 bg-white/5 border-white/10" value={editingItem.department} onChange={e => setEditingItem({...editingItem, department: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs uppercase text-white/30 ml-2">Academic Year</label>
                    <Input className="h-14 text-lg px-6 bg-white/5 border-white/10" value={editingItem.year} onChange={e => setEditingItem({...editingItem, year: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs uppercase text-white/30 ml-2">Interested Domain</label>
                    <Input className="h-14 text-lg px-6 bg-white/5 border-white/10" value={editingItem.interest} onChange={e => setEditingItem({...editingItem, interest: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs uppercase ml-2 text-neon-purple">Roll Number</label>
                    <Input className="h-14 text-lg px-6 bg-white/5 border-white/10" value={editingItem.roll_number} onChange={e => setEditingItem({...editingItem, roll_number: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs uppercase ml-2 text-neon-purple">Register Number</label>
                    <Input className="h-14 text-lg px-6 bg-white/5 border-white/10" value={editingItem.register_number} onChange={e => setEditingItem({...editingItem, register_number: e.target.value})} />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-xs uppercase text-white/30 ml-2">Motivation / Purpose</label>
                    <Textarea className="min-h-[150px] text-lg p-6 bg-white/5 border-white/10 rounded-2xl" value={editingItem.purpose} onChange={e => setEditingItem({...editingItem, purpose: e.target.value})} />
                  </div>
                </>
              )}
              {activeTab === 'leads' && (
                <>
                  <div className="space-y-2">
                    <label className="text-xs uppercase text-white/30 ml-2">Member Name</label>
                    <Input className="h-14 text-lg px-6 bg-white/5 border-white/10" value={editingItem.name} onChange={e => setEditingItem({...editingItem, name: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs uppercase text-white/30 ml-2">Domain / Role</label>
                    <Input className="h-14 text-lg px-6 bg-white/5 border-white/10" value={editingItem.domain} onChange={e => setEditingItem({...editingItem, domain: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs uppercase text-white/30 ml-2">Active Year</label>
                    <Input className="h-14 text-lg px-6 bg-white/5 border-white/10" value={editingItem.year} onChange={e => setEditingItem({...editingItem, year: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                     <label className="text-xs uppercase text-white/30 ml-2">Update Photo</label>
                     <div 
                       onClick={() => { setPickerTarget({ target: 'edit', field: 'image' }); setPickerOpen(true); }}
                       className="relative group h-14 bg-white/5 border border-white/10 rounded-xl cursor-pointer flex items-center px-6 hover:border-white/20 transition-colors"
                     >
                       <span className="text-white/50">Change Media...</span>
                       <Upload className="absolute right-4 top-4 text-white/20 w-5 h-5 group-hover:text-neon-purple transition-colors" />
                     </div>
                   </div>
                   <div className="space-y-3 md:col-span-2">
                     <label className="text-xs uppercase text-white/30 ml-2">Social & Professional Links</label>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       <Input placeholder="LinkedIn URL" className="bg-white/5 border-white/10 h-14" value={editingItem.linkedin || ''} onChange={e => setEditingItem({...editingItem, linkedin: e.target.value})} />
                       <Input placeholder="Portfolio URL" className="bg-white/5 border-white/10 h-14" value={editingItem.portfolio || ''} onChange={e => setEditingItem({...editingItem, portfolio: e.target.value})} />
                       <Input placeholder="Instagram URL" className="bg-white/5 border-white/10 h-14" value={editingItem.instagram || ''} onChange={e => setEditingItem({...editingItem, instagram: e.target.value})} />
                       <Input placeholder="Contact Number" className="bg-white/5 border-white/10 h-14" value={editingItem.contact || ''} onChange={e => setEditingItem({...editingItem, contact: e.target.value})} />
                     </div>
                   </div>
                </>
              )}
              {activeTab === 'events' && (
                <>
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-xs uppercase text-white/30 ml-2">Event Title</label>
                    <Input className="h-14 text-lg px-6 bg-white/5 border-white/10" value={editingItem.title} onChange={e => setEditingItem({...editingItem, title: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs uppercase text-white/30 ml-2">Event Date</label>
                    <Input className="h-14 text-lg px-6 bg-white/5 border-white/10" value={editingItem.date} onChange={e => setEditingItem({...editingItem, date: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs uppercase text-white/30 ml-2">Update Poster</label>
                    <div 
                      onClick={() => { setPickerTarget({ target: 'edit', field: 'image' }); setPickerOpen(true); }}
                      className="relative group h-14 bg-white/5 border border-white/10 rounded-xl cursor-pointer flex items-center px-6 hover:border-white/20 transition-colors"
                    >
                      <span className="text-white/50">Change Media...</span>
                      <Upload className="absolute right-4 top-4 text-white/20 w-5 h-5 group-hover:text-neon-purple transition-colors" />
                    </div>
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-xs uppercase text-white/30 ml-2">Google Drive Link</label>
                    <Input className="h-14 text-lg px-6 bg-white/5 border-white/10" value={editingItem.drive_link} onChange={e => setEditingItem({...editingItem, drive_link: e.target.value})} />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-xs uppercase text-white/30 ml-2">Event Description</label>
                    <Textarea className="min-h-[120px] text-lg p-6 bg-white/5 border-white/10 rounded-2xl" value={editingItem.description} onChange={e => setEditingItem({...editingItem, description: e.target.value})} />
                  </div>
                </>
              )}
              {activeTab === 'gallery' && (
                <>
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-xs uppercase text-white/30 ml-2">Taken By / Photo Credits</label>
                    <Input className="h-14 text-lg px-6 bg-white/5 border-white/10" value={editingItem.taken_by || editingItem.takenBy} onChange={e => setEditingItem({...editingItem, taken_by: e.target.value})} />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-xs uppercase text-white/30 ml-2">Caption</label>
                    <Input className="h-14 text-lg px-6 bg-white/5 border-white/10" value={editingItem.caption} onChange={e => setEditingItem({...editingItem, caption: e.target.value})} />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-xs uppercase text-white/30 ml-2">Replace Image</label>
                    <div 
                      onClick={() => { setPickerTarget({ target: 'edit', field: 'url' }); setPickerOpen(true); }}
                      className="relative group h-14 bg-white/5 border border-white/10 rounded-xl cursor-pointer flex items-center px-6 hover:border-white/20 transition-colors"
                    >
                      <span className="text-white/50">Change Media...</span>
                      <Upload className="absolute right-4 top-4 text-white/20 w-5 h-5 group-hover:text-neon-purple transition-colors" />
                    </div>
                  </div>
                </>
              )}
              {activeTab === 'videos' && (
                <>
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-xs uppercase text-white/30 ml-2">Video Title</label>
                    <Input className="h-14 text-lg px-6 bg-white/5 border-white/10" value={editingItem.title} onChange={e => setEditingItem({...editingItem, title: e.target.value})} />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-xs uppercase text-white/30 ml-2">Video URL</label>
                    <Input className="h-14 text-lg px-6 bg-white/5 border-white/10" value={editingItem.url} onChange={e => setEditingItem({...editingItem, url: e.target.value})} />
                  </div>
                </>
              )}
              
              <div className="md:col-span-2 flex justify-end items-center gap-6 mt-6 border-t border-white/5 pt-10">
                <Button type="button" variant="ghost" onClick={() => setEditingItem(null)} className="h-14 px-10 text-white/40 hover:text-white transition-colors">Cancel</Button>
                <Button type="submit" disabled={uploading} className="btn-primary px-16 h-14 text-lg rounded-2xl shadow-2xl min-w-[200px]">
                  {uploading ? (
                    <span className="flex items-center gap-3">
                      <Clock className="w-5 h-5 animate-spin" /> Uploading...
                    </span>
                  ) : "Save Changes"}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <StorageBrowser open={showUploads} onClose={() => setShowUploads(false)} />

      <MediaPickerModal
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={(url) => {
          if (!pickerTarget) return;
          if (pickerTarget.target === 'new') {
            setNewItem({ ...newItem, [pickerTarget.field]: url });
          } else {
            setEditingItem({ ...editingItem, [pickerTarget.field]: url });
          }
        }}
      />

      {/* Preview lightbox for Uploads tab */}
      {ReactDOM.createPortal(
        <AnimatePresence>
          {previewFile && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{ position: 'fixed', inset: 0, zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px', background: 'rgba(0,0,0,0.92)' }}
              onClick={() => setPreviewFile(null)}
            >
              <button
                onClick={() => setPreviewFile(null)}
                className="absolute top-5 right-5 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center transition-colors z-10"
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
                {previewFile.mime.startsWith('image/') ? (
                  <img src={previewFile.url} className="w-full max-h-[80vh] object-contain rounded-2xl" />
                ) : (
                  <video src={previewFile.url} controls controlsList="nodownload" autoPlay className="w-full max-h-[80vh] rounded-2xl" />
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}
