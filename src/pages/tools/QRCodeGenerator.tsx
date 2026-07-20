import React, { useState, useRef } from "react";
import { motion } from "motion/react";
import { QRCodeSVG } from "qrcode.react";
import { Download, Share2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GlassCard } from "@/components/UIElements";
import { ToolHeader } from "@/components/ToolHeader";

export default function QRCodeGenerator() {
  const [text, setText] = useState("https://generalizedtechnology.vercel.app/");
  const [fgColor, setFgColor] = useState("#a855f7");
  const [size, setSize] = useState(256);
  const qrRef = useRef<SVGSVGElement>(null);

  const downloadQR = () => {
    const svg = qrRef.current;
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.onload = () => {
      canvas.width = size;
      canvas.height = size;
      ctx?.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.download = "gtech-qr.png";
      downloadLink.href = `${pngFile}`;
      downloadLink.click();
    };
    img.src = `data:image/svg+xml;base64,${btoa(svgData)}`;
  };

  return (
    <main className="min-h-screen bg-mesh pb-20 pt-16">
      <ToolHeader title="QR Code Generator" />
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
          {/* Controls */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <GlassCard className="p-8 space-y-8">
              <div className="space-y-4">
                <label className="text-xs font-bold uppercase tracking-widest text-white/50 ml-1">Content (URL or Text)</label>
                <Input 
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Enter link or text..."
                  className="glass h-14 rounded-xl border-white/10 focus:border-neon-purple text-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <label className="text-xs font-bold uppercase tracking-widest text-white/50 ml-1">Color</label>
                  <div className="flex gap-4 items-center">
                    <input 
                      type="color" 
                      value={fgColor}
                      onChange={(e) => setFgColor(e.target.value)}
                      className="w-12 h-12 rounded-lg bg-transparent border border-white/10 cursor-pointer overflow-hidden"
                    />
                    <span className="text-sm font-mono text-white/70 uppercase">{fgColor}</span>
                  </div>
                </div>
                <div className="space-y-4">
                  <label className="text-xs font-bold uppercase tracking-widest text-white/50 ml-1">Size ({size}px)</label>
                  <input 
                    type="range" 
                    min="128" 
                    max="512" 
                    step="8"
                    value={size}
                    onChange={(e) => setSize(parseInt(e.target.value))}
                    className="w-full accent-neon-purple"
                  />
                </div>
              </div>

              <div className="pt-6 border-t border-white/5 gap-4 flex flex-col sm:flex-row">
                <Button onClick={downloadQR} className="btn-primary grow py-7 rounded-xl text-lg uppercase tracking-widest group">
                  <Download className="w-5 h-5 mr-3 group-hover:translate-y-1 transition-transform" />
                  Download PNG
                </Button>
                <Button onClick={() => { setText(""); setFgColor("#a855f7"); }} variant="outline" className="glass border-white/10 py-7 rounded-xl px-8">
                  <RefreshCw className="w-5 h-5" />
                </Button>
              </div>
            </GlassCard>
          </motion.div>

          {/* Preview */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center justify-center p-12 glass-dark rounded-[40px] border border-white/10 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-linear-to-br from-neon-purple/10 via-parent to-neon-blue/10 animate-pulse" />
            <div className="relative p-8 glass bg-white rounded-3xl shadow-[0_0_50px_rgba(168,85,247,0.3)]">
              <QRCodeSVG 
                ref={qrRef}
                value={text || " "}
                size={size}
                fgColor={fgColor}
                includeMargin={true}
                level="H"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </main>
  );
}
