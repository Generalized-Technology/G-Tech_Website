import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { jsPDF } from "jspdf";
import { FileUp, FileType, Trash2, Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/UIElements";
import { ToolHeader } from "@/components/ToolHeader";

interface ImageFile {
  file: File;
  preview: string;
}

export default function ImageToPDF() {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).map((file: File) => ({
        file,
        preview: URL.createObjectURL(file)
      }));
      setImages(prev => [...prev, ...newFiles]);
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => {
      const updated = [...prev];
      URL.revokeObjectURL(updated[index].preview);
      updated.splice(index, 1);
      return updated;
    });
  };

  const generatePDF = async () => {
    if (images.length === 0) return;
    setIsGenerating(true);

    const pdf = new jsPDF();
    
    for (let i = 0; i < images.length; i++) {
      const img = await new Promise<HTMLImageElement>((resolve) => {
        const image = new Image();
        image.src = images[i].preview;
        image.onload = () => resolve(image);
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 10;
      const maxWidth = pageWidth - (margin * 2);
      const maxHeight = pageHeight - (margin * 2);

      let width = img.width;
      let height = img.height;

      // Maintain aspect ratio
      const ratio = Math.min(maxWidth / width, maxHeight / height);
      width *= ratio;
      height *= ratio;

      const x = (pageWidth - width) / 2;
      const y = (pageHeight - height) / 2;

      if (i > 0) pdf.addPage();
      pdf.addImage(img, "JPEG", x, y, width, height);
    }

    pdf.save("gtech-converted.pdf");
    setIsGenerating(false);
  };

  return (
    <main className="min-h-screen bg-mesh pb-20 pt-16">
      <ToolHeader title="Image to PDF" />
      <div className="container mx-auto px-6 py-12">
        <div className="mx-auto max-w-4xl space-y-8">
          {/* Dropzone */}
          <div className="relative group">
            <input 
              type="file" 
              multiple 
              accept="image/*"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
            <div className="glass border-2 border-dashed border-white/10 group-hover:border-neon-purple/50 rounded-[32px] p-16 text-center transition-all duration-300">
              <div className="w-20 h-20 bg-neon-purple/20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <FileUp className="w-10 h-10 text-neon-purple" />
              </div>
              <h3 className="text-2xl text-white font-display uppercase tracking-widest mb-2">Upload Images</h3>
              <p className="text-white/50">Drag and drop or click to select multiple images</p>
            </div>
          </div>

          {/* List */}
          <AnimatePresence>
            {images.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <span className="text-white/50 text-sm">{images.length} images selected</span>
                  <Button onClick={() => setImages([])} variant="ghost" className="text-red-400 hover:text-red-300 hover:bg-red-400/10">
                    <Trash2 className="w-4 h-4 mr-2" /> Clear All
                  </Button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {images.map((img, i) => (
                    <motion.div
                      layout
                      key={img.preview}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="relative aspect-square group rounded-2xl overflow-hidden glass border border-white/10"
                    >
                      <img src={img.preview} alt="preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button 
                          onClick={() => removeImage(i)}
                          className="p-2 bg-red-500/80 rounded-full text-white hover:bg-red-500 transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="pt-8 flex justify-center">
                  <Button 
                    size="lg"
                    disabled={isGenerating}
                    onClick={generatePDF}
                    className="btn-primary px-12 py-8 rounded-2xl text-xl uppercase tracking-[0.2em] font-bold shadow-[0_10px_30px_rgba(168,85,247,0.3)] min-w-[300px]"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-6 h-6 mr-3 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Download className="w-6 h-6 mr-3" />
                        Compile PDF
                      </>
                    )}
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </main>
  );
}
