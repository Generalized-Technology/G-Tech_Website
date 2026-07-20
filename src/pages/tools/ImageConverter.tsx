import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { FileUp, RefreshCw, Download, Image as ImageIcon, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { GlassCard } from "@/components/UIElements";
import { ToolHeader } from "@/components/ToolHeader";

type Format = "png" | "jpeg" | "webp" | "gif";

export default function ImageConverter() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [targetFormat, setTargetFormat] = useState<Format>("png");
  const [isConverting, setIsConverting] = useState(false);
  const [convertedUrl, setConvertedUrl] = useState<string | null>(null);
  const [quality, setQuality] = useState(0.8);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
      setConvertedUrl(null);
    }
  };

  const convertImage = () => {
    if (!preview) return;
    setIsConverting(true);

    const img = new Image();
    img.src = preview;
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      ctx?.drawImage(img, 0, 0);
      
      const newUrl = canvas.toDataURL(`image/${targetFormat}`, quality);
      setConvertedUrl(newUrl);
      setIsConverting(false);
    };
  };

  const downloadImage = () => {
    if (!convertedUrl) return;
    const link = document.createElement("a");
    link.href = convertedUrl;
    link.download = `gtech-converted.${targetFormat}`;
    link.click();
  };

  return (
    <main className="min-h-screen bg-mesh pb-20 pt-16">
      <ToolHeader title="Image Converter" />
      <div className="container mx-auto px-6 py-12">
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-12 lg:grid-cols-2">
          {/* Work Area */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <GlassCard className="p-8 h-full">
              {!preview ? (
                <div className="relative h-full min-h-[400px] border-2 border-dashed border-white/10 rounded-3xl flex flex-col items-center justify-center group hover:border-neon-purple/50 transition-all">
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <div className="w-20 h-20 bg-neon-purple/20 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <FileUp className="w-10 h-10 text-neon-purple" />
                  </div>
                  <h3 className="text-xl text-white uppercase tracking-widest font-display">Drop Image Here</h3>
                  <p className="text-white/40 mt-2">Support for PNG, JPG, WEBP</p>
                </div>
              ) : (
                <div className="space-y-8">
                  <div className="relative aspect-video glass rounded-2xl overflow-hidden border border-white/10">
                    <img src={preview} className="w-full h-full object-contain" alt="Original preview" />
                    <button 
                      onClick={() => { setFile(null); setPreview(null); setConvertedUrl(null); }}
                      className="absolute top-4 right-4 bg-red-500/80 p-2 rounded-xl text-white hover:bg-red-500"
                    >
                      <RefreshCw className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <label className="text-[10px] text-white/50 uppercase tracking-widest ml-1">Target Format</label>
                      <Select value={targetFormat} onValueChange={(v) => setTargetFormat(v as Format)}>
                        <SelectTrigger className="glass h-14 rounded-xl border-white/10">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="glass-dark border-white/10 text-white">
                          <SelectItem value="png">PNG (Lossless)</SelectItem>
                          <SelectItem value="jpeg">JPEG (Standard)</SelectItem>
                          <SelectItem value="webp">WEBP (Modern)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] text-white/50 uppercase tracking-widest ml-1">Quality ({Math.round(quality * 100)}%)</label>
                      <input 
                        type="range" 
                        min="0.1" max="1" step="0.1" 
                        value={quality}
                        onChange={(e) => setQuality(parseFloat(e.target.value))}
                        className="w-full accent-neon-purple mt-5"
                      />
                    </div>
                  </div>

                  <Button 
                    onClick={convertImage} 
                    disabled={isConverting}
                    className="w-full btn-primary py-8 rounded-2xl text-lg uppercase tracking-widest font-bold"
                  >
                    {isConverting ? "Processing..." : "Run Conversion"}
                  </Button>
                </div>
              )}
            </GlassCard>
          </motion.div>

          {/* Results Area */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <GlassCard className="p-8 h-full flex flex-col justify-center items-center relative overflow-hidden">
               <div className="absolute inset-0 bg-linear-to-tr from-neon-blue/5 via-transparent to-neon-purple/5" />
               
               <AnimatePresence mode="wait">
                 {convertedUrl ? (
                   <motion.div
                     key="result"
                     initial={{ opacity: 0, scale: 0.9 }}
                     animate={{ opacity: 1, scale: 1 }}
                     className="relative z-10 w-full text-center"
                   >
                     <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                       <CheckCircle2 className="w-10 h-10 text-green-500" />
                     </div>
                     <h3 className="text-2xl text-white font-display uppercase tracking-widest mb-8">Ready for download</h3>
                     
                     <div className="relative aspect-video glass rounded-2xl overflow-hidden border border-white/10 mb-10">
                       <img src={convertedUrl} className="w-full h-full object-contain" alt="Converted result" />
                     </div>

                     <Button 
                        size="lg"
                        onClick={downloadImage}
                        className="w-full btn-primary py-8 rounded-2xl text-xl uppercase tracking-widest"
                      >
                       <Download className="w-6 h-6 mr-3" />
                       Save as {targetFormat.toUpperCase()}
                     </Button>
                   </motion.div>
                 ) : (
                   <div key="placeholder" className="relative z-10 text-center opacity-30">
                     <ImageIcon className="w-24 h-24 mx-auto mb-6" />
                     <p className="text-xl uppercase tracking-[0.2em] font-bold">Waiting for input</p>
                   </div>
                 )}
               </AnimatePresence>
            </GlassCard>
          </motion.div>
        </div>
      </div>
    </main>
  );
}
