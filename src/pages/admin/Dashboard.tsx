import React, { useState, useEffect } from "react";
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
  Linkedin
} from "lucide-react";
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

type TabType = "applications" | "leads" | "events" | "gallery" | "videos";

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
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && user) {
      fetchData();
    }
  }, [activeTab, user, authLoading]);

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
            { id: "applications", icon: ClipboardList, label: "Applications" }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as TabType);
                setIsAdding(false);
              }}
              className={`flex items-center gap-3 px-6 py-4 rounded-2xl transition-all font-bold uppercase tracking-widest text-xs ${
                activeTab === tab.id 
                  ? "bg-neon-purple text-white shadow-[0_0_30px_rgba(168,85,247,0.3)]" 
                  : "text-white/40 hover:text-white hover:bg-white/5"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="glass-dark border-white/10 rounded-[40px] overflow-hidden min-h-[500px]">
          {loading ? (
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
                           <div className="relative group">
                              <Input type="file" accept="image/*" className="cursor-pointer h-14 pt-3.5 bg-white/5 border-white/10" onChange={e => handleFileUpload(e, 'new', 'image')} />
                              <Upload className="absolute right-4 top-4 text-white/20 w-5 h-5" />
                           </div>
                           {newItem.image && <p className="text-[10px] text-green-400 ml-2 truncate">Uploaded: {newItem.image}</p>}
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
                           <div className="relative group">
                             <Input type="file" accept="image/*" className="cursor-pointer h-14 pt-3.5 bg-white/5 border-white/10" onChange={e => handleFileUpload(e, 'new', 'image')} />
                             <Upload className="absolute right-4 top-4 text-white/20 w-5 h-5" />
                           </div>
                        </div>
                        <div className="space-y-2 md:col-span-2">
                          <label className="text-xs uppercase text-white/30 ml-2">Description</label>
                          <Textarea className="min-h-[150px] text-lg p-6 bg-white/5 border-white/10 rounded-2xl" placeholder="Description" onChange={e => setNewItem({...newItem, description: e.target.value})} />
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
                           <label className="text-xs uppercase text-white/30 ml-2">Gallery Image</label>
                           <div className="relative group">
                             <Input type="file" accept="image/*" className="cursor-pointer h-14 pt-3.5 bg-white/5 border-white/10" onChange={e => handleFileUpload(e, 'new', 'url')} />
                             <Upload className="absolute right-4 top-4 text-white/20 w-5 h-5" />
                           </div>
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
                              <TableHead className="text-white/50 min-w-[200px]">Name</TableHead>
                              <TableHead className="text-white/50 min-w-[150px]">Portfolio</TableHead>
                              <TableHead className="text-white/50 min-w-[200px]">Email</TableHead>
                              <TableHead className="text-white/50 min-w-[150px]">WhatsApp No</TableHead>
                              <TableHead className="text-white/50 min-w-[150px]">Department</TableHead>
                              <TableHead className="text-white/50 min-w-[120px]">Roll No</TableHead>
                              <TableHead className="text-white/50 min-w-[120px]">Reg No</TableHead>
                              <TableHead className="text-white/50 min-w-[80px]">Year</TableHead>
                              <TableHead className="text-white/50 min-w-[180px]">Interested Domain</TableHead>
                              <TableHead className="text-white/50 min-w-[300px]">Purpose</TableHead>
                              <TableHead className="text-white/50 min-w-[120px]">Status</TableHead>
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
                                    <div className="flex items-center gap-6">
                                      <div className="w-2 h-10 bg-linear-to-b from-neon-purple to-neon-blue rounded-full shadow-[0_0_15px_rgba(168,85,247,0.5)]" />
                                      <div>
                                        <span className="text-2xl font-mono uppercase tracking-[0.2em] text-white block">{year} Leads</span>
                                        <span className="text-[10px] uppercase text-white/20 tracking-widest mt-1 block">Leadership & Coordination Team</span>
                                      </div>
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
                     <div className="relative group">
                        <Input type="file" accept="image/*" className="cursor-pointer h-14 pt-3.5 bg-white/5 border-white/10" onChange={e => handleFileUpload(e, 'edit', 'image')} />
                        <Upload className="absolute right-4 top-4 text-white/20 w-5 h-5" />
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
                    <Input type="file" accept="image/*" className="h-14 pt-3.5 bg-white/5 border-white/10" onChange={e => handleFileUpload(e, 'edit', 'image')} />
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
                    <Input type="file" accept="image/*" className="h-14 pt-3.5 bg-white/5 border-white/10" onChange={e => handleFileUpload(e, 'edit', 'url')} />
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
    </div>
  );
}
