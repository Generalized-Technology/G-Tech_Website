import { useState, useRef, useEffect, ChangeEvent, DragEvent } from "react";
import { motion, AnimatePresence } from "motion/react";
import { GlassCard } from "@/components/UIElements";
import {
  Upload,
  Crop,
  Settings,
  Download,
  Info,
  Grid,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import JSZip from "jszip";
import { ToolHeader } from "@/components/ToolHeader";

export default function InstagramCarousel() {
  const [file, setFile] = useState<File | null>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });
  const [ratio, setRatio] = useState<"1:1" | "4:5">("1:1");
  const [sliceCount, setSliceCount] = useState<number>(3);
  const [alignX, setAlignX] = useState<number>(50); // horizontal crop offset (0-100)
  const [alignY, setAlignY] = useState<number>(50); // vertical crop offset (0-100)
  const [previews, setPreviews] = useState<string[]>([]);
  const [processing, setProcessing] = useState(false);

  const imageRef = useRef<HTMLImageElement | null>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      loadImage(selectedFile);
    }
  };

  const loadImage = (selectedFile: File) => {
    setFile(selectedFile);
    const url = URL.createObjectURL(selectedFile);
    setImageSrc(url);

    const img = new Image();
    img.src = url;
    img.onload = () => {
      setImageDimensions({ width: img.naturalWidth, height: img.naturalHeight });
      // Suggest logical default slice count based on width/height aspect ratio
      const R = ratio === "1:1" ? 1.0 : 0.8;
      const imgRatio = img.naturalWidth / img.naturalHeight;
      const suggestedSlices = Math.max(2, Math.min(10, Math.round(imgRatio / R)));
      setSliceCount(suggestedSlices);
    };
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile && droppedFile.type.startsWith("image/")) {
      loadImage(droppedFile);
    }
  };

  // Generate previews in real-time
  useEffect(() => {
    if (!imageSrc || imageDimensions.width === 0) {
      setPreviews([]);
      return;
    }

    const img = new Image();
    img.src = imageSrc;
    img.onload = () => {
      const R = ratio === "1:1" ? 1.0 : 0.8;
      const R_total = sliceCount * R;
      const imgRatio = img.naturalWidth / img.naturalHeight;

      let cropW = 0;
      let cropH = 0;
      let maxOffsetX = 0;
      let maxOffsetY = 0;

      if (imgRatio >= R_total) {
        cropH = img.naturalHeight;
        cropW = img.naturalHeight * R_total;
        maxOffsetX = img.naturalWidth - cropW;
        maxOffsetY = 0;
      } else {
        cropW = img.naturalWidth;
        cropH = img.naturalWidth / R_total;
        maxOffsetX = 0;
        maxOffsetY = img.naturalHeight - cropH;
      }

      const offsetX = maxOffsetX * (alignX / 100);
      const offsetY = maxOffsetY * (alignY / 100);
      const sliceW = cropW / sliceCount;
      const sliceH = cropH;

      const canvas = document.createElement("canvas");
      // Keep previews at a reasonable visual size
      canvas.width = Math.min(sliceW, 600);
      canvas.height = Math.min(sliceH, 600 / R);
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const newPreviews: string[] = [];
      for (let i = 0; i < sliceCount; i++) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(
          img,
          offsetX + i * sliceW,
          offsetY,
          sliceW,
          sliceH,
          0,
          0,
          canvas.width,
          canvas.height
        );
        newPreviews.push(canvas.toDataURL("image/jpeg", 0.9));
      }
      setPreviews(newPreviews);
    };
  }, [imageSrc, imageDimensions, ratio, sliceCount, alignX, alignY]);

  const handleDownload = async () => {
    if (!imageSrc || !file) return;
    setProcessing(true);

    try {
      const img = new Image();
      img.src = imageSrc;
      await new Promise((resolve) => (img.onload = resolve));

      const R = ratio === "1:1" ? 1.0 : 0.8;
      const R_total = sliceCount * R;
      const imgRatio = img.naturalWidth / img.naturalHeight;

      let cropW = 0;
      let cropH = 0;
      let maxOffsetX = 0;
      let maxOffsetY = 0;

      if (imgRatio >= R_total) {
        cropH = img.naturalHeight;
        cropW = img.naturalHeight * R_total;
        maxOffsetX = img.naturalWidth - cropW;
        maxOffsetY = 0;
      } else {
        cropW = img.naturalWidth;
        cropH = img.naturalWidth / R_total;
        maxOffsetX = 0;
        maxOffsetY = img.naturalHeight - cropH;
      }

      const offsetX = maxOffsetX * (alignX / 100);
      const offsetY = maxOffsetY * (alignY / 100);
      const sliceW = cropW / sliceCount;
      const sliceH = cropH;

      const zip = new JSZip();
      const canvas = document.createElement("canvas");
      canvas.width = sliceW;
      canvas.height = sliceH;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      for (let i = 0; i < sliceCount; i++) {
        ctx.clearRect(0, 0, sliceW, sliceH);
        ctx.drawImage(
          img,
          offsetX + i * sliceW,
          offsetY,
          sliceW,
          sliceH,
          0,
          0,
          sliceW,
          sliceH
        );

        const dataUrl = canvas.toDataURL("image/jpeg", 0.95);
        const base64Data = dataUrl.split(",")[1];
        zip.file(`slide-${i + 1}.jpg`, base64Data, { base64: true });
      }

      const content = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(content);
      const a = document.createElement("a");
      a.href = url;
      a.download = `carousel-${file.name.split(".")[0] || "instagram"}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Failed to generate ZIP carousel:", err);
    } finally {
      setProcessing(false);
    }
  };

  useEffect(() => {
    return () => {
      if (imageSrc) URL.revokeObjectURL(imageSrc);
    };
  }, [imageSrc]);

  // Calculate overlay outline parameters for the workspace view
  const R = ratio === "1:1" ? 1.0 : 0.8;
  const R_total = sliceCount * R;
  const imgRatio = imageDimensions.width / imageDimensions.height;
  const isWiderThanCrop = imgRatio >= R_total;

  return (
    <main className="min-h-screen bg-mesh pb-20 pt-16">
      <ToolHeader title="Instagram Carousel Slicer" />
      <section className="px-6 py-12">
        <div className="container mx-auto max-w-5xl">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-12">
            {/* Left Workspace Panel */}
            <div className="lg:col-span-2 space-y-8">
              {!imageSrc ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                  className="border-2 border-dashed border-white/10 hover:border-neon-purple/50 rounded-[32px] p-16 text-center cursor-pointer transition-all bg-white/5 backdrop-blur-md relative overflow-hidden group"
                >
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <div className="w-20 h-20 rounded-2xl glass flex items-center justify-center border border-white/10 mx-auto mb-6 group-hover:border-neon-purple/50 group-hover:shadow-[0_0_20px_rgba(168,85,247,0.3)] transition-all duration-500">
                    <Crop className="w-10 h-10 text-neon-purple animate-pulse" />
                  </div>
                  <h3 className="text-2xl text-white font-sans uppercase mb-2">
                    Upload Panorama Image
                  </h3>
                  <p className="text-white/40 mb-6">Drag & drop or click to select a wide banner</p>
                  <span className="text-[10px] uppercase tracking-widest text-white/30 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full">
                    Supports JPG, PNG, WEBP
                  </span>
                </motion.div>
              ) : (
                <div className="space-y-8">
                  {/* Visual Cropper Editor Workspace */}
                  <GlassCard className="p-6 rounded-[32px] overflow-hidden space-y-6">
                    <div className="flex justify-between items-center border-b border-white/10 pb-4">
                      <span className="text-white/60 font-sans text-xs uppercase tracking-widest">
                        Visual Slicing Guide
                      </span>
                      <Button
                        variant="ghost"
                        onClick={() => {
                          setImageSrc(null);
                          setFile(null);
                        }}
                        className="text-white/40 hover:text-white"
                      >
                        Reset Workspace
                      </Button>
                    </div>

                    <div className="relative w-full overflow-hidden bg-black/60 rounded-2xl border border-white/10 p-4 flex items-center justify-center min-h-75">
                      <div className="relative max-w-full">
                        <img
                          ref={imageRef}
                          src={imageSrc}
                          alt="Workspace preview"
                          className="max-h-[50vh] object-contain select-none pointer-events-none rounded-sm"
                          referrerPolicy="no-referrer"
                        />

                        {/* Grid Crop Overlay Layer */}
                        <div
                          className="absolute border border-neon-purple/80 shadow-[0_0_20px_rgba(168,85,247,0.2)] bg-black/30 pointer-events-none transition-all duration-200"
                          style={{
                            top: isWiderThanCrop
                              ? "0%"
                              : `${(alignY * (100 - 100 / (imgRatio / R_total))) / 100}%`,
                            left: isWiderThanCrop
                              ? `${(alignX * (100 - (R_total / imgRatio) * 100)) / 100}%`
                              : "0%",
                            width: isWiderThanCrop
                              ? `${(R_total / imgRatio) * 100}%`
                              : "100%",
                            height: isWiderThanCrop
                              ? "100%"
                              : `${(100 / (imgRatio / R_total))}%`,
                          }}
                        >
                          {/* Dotted slicing indicators */}
                          <div className="absolute inset-0 flex">
                            {Array.from({ length: sliceCount - 1 }).map((_, index) => (
                              <div
                                key={index}
                                className="h-full border-r border-dashed border-neon-purple/50 flex-1 relative"
                              >
                                <span className="absolute top-2 right-2 text-[8px] font-bold text-white/40 uppercase tracking-widest bg-black/60 px-1 rounded">
                                  Cut {index + 1}
                                </span>
                              </div>
                            ))}
                            <div className="flex-1" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </GlassCard>

                  {/* Sliced Output Previews */}
                  {previews.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-4"
                    >
                      <h4 className="text-white/60 font-sans text-xs uppercase tracking-widest ml-4">
                        Seamless Slices Preview
                      </h4>
                      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin">
                        {previews.map((preview, index) => (
                          <div
                            key={index}
                            className="flex-none w-35 rounded-xl overflow-hidden glass border border-white/10 group relative"
                          >
                            <img
                              src={preview}
                              alt={`slide-${index}`}
                              className="w-full h-auto object-cover"
                            />
                            <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-xs px-2 py-0.5 rounded text-[8px] font-bold text-neon-purple uppercase tracking-widest">
                              Slide {index + 1}
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </div>
              )}
            </div>

            {/* Right Settings Panel */}
            <div>
              <GlassCard className="p-6 rounded-[32px] space-y-8 sticky top-32">
                <div className="flex items-center gap-2 border-b border-white/10 pb-4">
                  <Settings className="w-5 h-5 text-neon-purple" />
                  <h4 className="text-lg text-white font-sans uppercase">Slicer Config</h4>
                </div>

                {/* Aspect Ratio Switch */}
                <div className="space-y-3">
                  <span className="text-xs uppercase text-white/40 tracking-wider">Slide Format</span>
                  <div className="grid grid-cols-2 gap-4">
                    <Button
                      variant={ratio === "1:1" ? "default" : "outline"}
                      onClick={() => setRatio("1:1")}
                      disabled={!imageSrc}
                      className="h-12 text-sm font-sans"
                    >
                      1:1 Square
                    </Button>
                    <Button
                      variant={ratio === "4:5" ? "default" : "outline"}
                      onClick={() => setRatio("4:5")}
                      disabled={!imageSrc}
                      className="h-12 text-sm font-sans"
                    >
                      4:5 Portrait
                    </Button>
                  </div>
                </div>

                {/* Number of Slices Slider */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-xs uppercase text-white/40 tracking-wider">
                    <span>Number of Slides</span>
                    <span className="text-neon-purple font-bold font-sans text-sm">{sliceCount} Slides</span>
                  </div>
                  <Slider
                    value={[sliceCount]}
                    onValueChange={(val) => setSliceCount(val[0])}
                    min={2}
                    max={10}
                    step={1}
                    disabled={!imageSrc}
                  />
                  <p className="text-[9px] text-white/30 leading-normal">
                    Divide your panoramic banner into 2 up to 10 swipeable slides.
                  </p>
                </div>

                {/* Horizontal Crop Alignment (Only active if image is wider than target ratio) */}
                {imageSrc && isWiderThanCrop && (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-xs uppercase text-white/40 tracking-wider">
                      <span>Horizontal Panning</span>
                      <span className="text-neon-purple font-bold font-sans text-sm">{alignX}%</span>
                    </div>
                    <Slider
                      value={[alignX]}
                      onValueChange={(val) => setAlignX(val[0])}
                      min={0}
                      max={100}
                      step={1}
                    />
                    <p className="text-[9px] text-white/30 leading-normal">
                      Shift the cropping frame horizontally to keep the important objects centered.
                    </p>
                  </div>
                )}

                {/* Vertical Crop Alignment (Only active if image is taller than target ratio) */}
                {imageSrc && !isWiderThanCrop && (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-xs uppercase text-white/40 tracking-wider">
                      <span>Vertical Panning</span>
                      <span className="text-neon-purple font-bold font-sans text-sm">{alignY}%</span>
                    </div>
                    <Slider
                      value={[alignY]}
                      onValueChange={(val) => setAlignY(val[0])}
                      min={0}
                      max={100}
                      step={1}
                    />
                    <p className="text-[9px] text-white/30 leading-normal">
                      Shift the cropping frame vertically to adjust framing.
                    </p>
                  </div>
                )}

                {/* Download Trigger */}
                <div className="border-t border-white/5 pt-6">
                  <Button
                    onClick={handleDownload}
                    disabled={!imageSrc || processing}
                    className="w-full btn-primary h-14 text-lg rounded-2xl shadow-xl flex items-center justify-center gap-2"
                  >
                    {processing ? (
                      <>
                        <RefreshCw className="w-5 h-5 animate-spin" />
                        Generating ZIP...
                      </>
                    ) : (
                      <>
                        <Download className="w-5 h-5" />
                        Slice & Download
                      </>
                    )}
                  </Button>
                </div>

                {/* Tips section */}
                <div className="bg-white/5 p-4 rounded-xl border border-white/10 flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-neon-purple shrink-0 mt-0.5 animate-pulse" />
                  <p className="text-[9px] text-white/40 leading-relaxed">
                    <span className="font-bold text-white/60">Tip:</span> Ensure you swipe across without borders or gaps. We slice your images with 95% JPEG quality to ensure sharp Instagram posts.
                  </p>
                </div>
              </GlassCard>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
