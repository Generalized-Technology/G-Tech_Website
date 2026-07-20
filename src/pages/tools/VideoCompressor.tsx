import { useState, useRef, useEffect, ChangeEvent, DragEvent } from "react";
import { motion, AnimatePresence } from "motion/react";
import { GlassCard } from "@/components/UIElements";
import {
  Upload,
  Video,
  Settings,
  Download,
  Play,
  Pause,
  RefreshCw,
  Info,
  Volume2,
  VolumeX,
  FileVideo,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { ToolHeader } from "@/components/ToolHeader";

export default function VideoCompressor() {
  const [file, setFile] = useState<File | null>(null);
  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const [compressing, setCompressing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [compressedBlob, setCompressedBlob] = useState<Blob | null>(null);
  const [compressedSize, setCompressedSize] = useState<number | null>(null);
  const [originalSize, setOriginalSize] = useState<number | null>(null);

  // Settings
  const [scale, setScale] = useState<number>(50); // 50% scale
  const [bitrate, setBitrate] = useState<number>(1.5); // 1.5 Mbps
  const [keepAudio, setKeepAudio] = useState(true);

  // Refs
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      loadVideo(selectedFile);
    }
  };

  const loadVideo = (selectedFile: File) => {
    setFile(selectedFile);
    setOriginalSize(selectedFile.size);
    setCompressedBlob(null);
    setCompressedSize(null);
    setProgress(0);

    const url = URL.createObjectURL(selectedFile);
    setVideoSrc(url);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile && droppedFile.type.startsWith("video/")) {
      loadVideo(droppedFile);
    }
  };

  const startCompression = async () => {
    if (!videoRef.current || !canvasRef.current || !videoSrc) return;

    setCompressing(true);
    setProgress(0);
    setCompressedBlob(null);

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    if (!ctx) return;

    // Reset video to start
    video.currentTime = 0;
    video.muted = true; // Mute during processing to avoid double audio playing

    // Set canvas dimensions based on scale
    const targetWidth = Math.round((video.videoWidth * scale) / 100);
    const targetHeight = Math.round((video.videoHeight * scale) / 100);
    canvas.width = targetWidth;
    canvas.height = targetHeight;

    // Setup Stream
    const fps = 30;
    const canvasStream = canvas.captureStream(fps);

    // Get Audio Track if keepAudio is true
    try {
      const videoStream = (video as any).captureStream
        ? (video as any).captureStream()
        : (video as any).mozCaptureStream();

      const audioTrack = videoStream.getAudioTracks()[0];
      if (audioTrack && keepAudio) {
        canvasStream.addTrack(audioTrack);
      }
    } catch (err) {
      console.warn("Could not capture audio track from video element:", err);
    }

    // Configure MediaRecorder
    const options = {
      mimeType: "video/webm;codecs=vp8,opus",
      videoBitsPerSecond: bitrate * 1000000,
    };

    let recorder: MediaRecorder;
    try {
      recorder = new MediaRecorder(canvasStream, options);
    } catch (e) {
      // Fallback for Safari/other browsers
      recorder = new MediaRecorder(canvasStream, {
        videoBitsPerSecond: bitrate * 1000000,
      });
    }

    mediaRecorderRef.current = recorder;
    const chunks: Blob[] = [];

    recorder.ondataavailable = (event) => {
      if (event.data && event.data.size > 0) {
        chunks.push(event.data);
      }
    };

    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: "video/mp4" });
      setCompressedBlob(blob);
      setCompressedSize(blob.size);
      setCompressing(false);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };

    // Draw frame-by-frame loop
    const draw = () => {
      if (video.paused || video.ended) {
        if (video.ended) {
          recorder.stop();
        }
        return;
      }

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const currentProgress = (video.currentTime / video.duration) * 100;
      setProgress(Math.min(currentProgress, 100));

      animationFrameRef.current = requestAnimationFrame(draw);
    };

    // Start recording & playing
    recorder.start();
    await video.play();
    draw();
  };

  const cancelCompression = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    if (videoRef.current) {
      videoRef.current.pause();
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    setCompressing(false);
    setProgress(0);
  };

  const downloadCompressed = () => {
    if (!compressedBlob) return;
    const url = URL.createObjectURL(compressedBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `compressed-${file?.name || "video.mp4"}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // Clean up object URLs
  useEffect(() => {
    return () => {
      if (videoSrc) {
        URL.revokeObjectURL(videoSrc);
      }
    };
  }, [videoSrc]);

  return (
    <main className="min-h-screen bg-mesh pb-20 pt-16">
      <ToolHeader title="Video Compressor" />
      <section className="px-6 py-12">
        <div className="container mx-auto max-w-4xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            {/* Left/Main Column */}
            <div className="md:col-span-2 space-y-8">
              {!videoSrc ? (
                // Dropzone
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                  className="border-2 border-dashed border-white/10 hover:border-neon-purple/50 rounded-[32px] p-12 text-center cursor-pointer transition-all bg-white/5 backdrop-blur-md relative overflow-hidden group"
                >
                  <input
                    type="file"
                    accept="video/*"
                    onChange={handleFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <div className="w-20 h-20 rounded-2xl glass flex items-center justify-center border border-white/10 mx-auto mb-6 group-hover:border-neon-purple/50 group-hover:shadow-[0_0_20px_rgba(168,85,247,0.3)] transition-all duration-500">
                    <Video className="w-10 h-10 text-neon-purple animate-pulse" />
                  </div>
                  <h3 className="text-2xl text-white font-sans uppercase mb-2">
                    Drag & Drop Video
                  </h3>
                  <p className="text-white/40 mb-6">Or click to browse files from device</p>
                  <span className="text-[10px] uppercase tracking-widest text-white/30 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full">
                    Supports MP4, WEBM, MOV
                  </span>
                </motion.div>
              ) : (
                // Preview Card
                <GlassCard className="p-6 rounded-[32px] overflow-hidden space-y-6">
                  <div className="flex justify-between items-center border-b border-white/10 pb-4">
                    <div className="flex items-center gap-3">
                      <FileVideo className="w-6 h-6 text-neon-purple" />
                      <span className="text-white/80 font-medium truncate max-w-50 sm:max-w-xs">
                        {file?.name}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      onClick={() => setVideoSrc(null)}
                      className="text-white/50 hover:text-white"
                    >
                      Remove
                    </Button>
                  </div>

                  <div className="relative aspect-video rounded-2xl overflow-hidden bg-black border border-white/10 flex items-center justify-center">
                    {/* Source Video (always hidden or used for playing) */}
                    <video
                      ref={videoRef}
                      src={videoSrc}
                      className={compressing ? "hidden" : "w-full h-full object-contain"}
                      controls={!compressing}
                      playsInline
                    />

                    {/* Canvas for compression (renders only when compressing) */}
                    <canvas
                      ref={canvasRef}
                      className={compressing ? "w-full h-full object-contain" : "hidden"}
                    />

                    {compressing && (
                      <div className="absolute inset-0 bg-black/50 backdrop-blur-xs flex flex-col items-center justify-center p-8 text-center space-y-4">
                        <RefreshCw className="w-10 h-10 text-neon-purple animate-spin" />
                        <h4 className="text-lg text-white font-sans uppercase">Compressing Video</h4>
                        <p className="text-white/60 text-sm max-w-xs">
                          Rendering frame-by-frame. Please keep this tab active...
                        </p>
                        <div className="w-full max-w-xs bg-white/10 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-neon-purple h-full transition-all duration-300 shadow-[0_0_10px_rgba(168,85,247,1)]"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <span className="text-white text-xs font-bold">{Math.round(progress)}%</span>
                        <Button
                          variant="destructive"
                          onClick={cancelCompression}
                          className="mt-2"
                        >
                          Cancel
                        </Button>
                      </div>
                    )}
                  </div>
                </GlassCard>
              )}

              {/* Compressed Result */}
              <AnimatePresence>
                {compressedBlob && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                  >
                    <GlassCard className="p-6 rounded-[32px] border-neon-blue/30 space-y-6">
                      <h4 className="text-xl text-white font-sans uppercase">Compression Finished</h4>
                      <div className="grid grid-cols-2 gap-6 bg-white/5 p-6 rounded-2xl border border-white/5">
                        <div>
                          <p className="text-xs uppercase text-white/30">Original Size</p>
                          <p className="text-xl text-white font-bold mt-1">
                            {originalSize ? formatSize(originalSize) : "N/A"}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs uppercase text-white/30">Compressed Size</p>
                          <p className="text-xl text-neon-blue font-bold mt-1">
                            {compressedSize ? formatSize(compressedSize) : "N/A"}
                          </p>
                        </div>
                        <div className="col-span-2 border-t border-white/10 pt-4 flex items-center justify-between">
                          <div>
                            <p className="text-xs uppercase text-white/30">Reduction</p>
                            <p className="text-lg text-green-400 font-bold mt-1">
                              {originalSize && compressedSize
                                ? (
                                    ((originalSize - compressedSize) / originalSize) *
                                    100
                                  ).toFixed(1) + "% Smaller"
                                : "N/A"}
                            </p>
                          </div>
                          <Button
                            onClick={downloadCompressed}
                            className="bg-neon-blue text-black hover:bg-neon-blue/80 flex items-center gap-2"
                          >
                            <Download className="w-5 h-5" /> Download Video
                          </Button>
                        </div>
                      </div>
                    </GlassCard>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Sidebar / Configuration */}
            <div>
              <GlassCard className="p-6 rounded-[32px] space-y-8 sticky top-32">
                <div className="flex items-center gap-2 border-b border-white/10 pb-4">
                  <Settings className="w-5 h-5 text-neon-purple" />
                  <h4 className="text-lg text-white font-sans uppercase">Settings</h4>
                </div>

                {/* Resolution Scale Slider */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-white/60">Scale resolution</span>
                    <span className="text-neon-purple font-bold">{scale}%</span>
                  </div>
                  <Slider
                    value={[scale]}
                    onValueChange={(val) => setScale(val[0])}
                    min={10}
                    max={100}
                    step={5}
                    disabled={compressing || !videoSrc}
                  />
                  <p className="text-[10px] text-white/30 leading-normal">
                    Lowering resolution significantly reduces the file size.
                  </p>
                  {scale < 50 && (
                    <div className="flex items-start gap-2 bg-amber-500/10 border border-amber-500/30 rounded-xl px-3 py-2.5 mt-1">
                      <span className="text-amber-400 text-sm leading-none mt-0.5">⚠️</span>
                      <p className="text-[10px] text-amber-400 leading-relaxed">
                        <span className="font-bold">Low quality warning!</span> Scaling below 50% may cause the video to look blurry or pixelated.
                      </p>
                    </div>
                  )}
                </div>

                {/* Bitrate Slider */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-white/60">Target Bitrate</span>
                    <span className="text-neon-purple font-bold">{bitrate} Mbps</span>
                  </div>
                  <Slider
                    value={[bitrate]}
                    onValueChange={(val) => setBitrate(val[0])}
                    min={0.5}
                    max={8}
                    step={0.1}
                    disabled={compressing || !videoSrc}
                  />
                  <p className="text-[10px] text-white/30 leading-normal">
                    Bitrate limits data size per second. 1.5 Mbps is great for web/mobile sharing.
                  </p>
                </div>

                {/* Audio Option */}
                <div className="flex items-center justify-between border-t border-white/5 pt-4">
                  <span className="text-sm text-white/60">Keep Audio track</span>
                  <Button
                    size="sm"
                    variant={keepAudio ? "default" : "outline"}
                    onClick={() => setKeepAudio(!keepAudio)}
                    disabled={compressing || !videoSrc}
                    className="flex items-center gap-2"
                  >
                    {keepAudio ? (
                      <>
                        <Volume2 className="w-4 h-4" /> Yes
                      </>
                    ) : (
                      <>
                        <VolumeX className="w-4 h-4" /> No
                      </>
                    )}
                  </Button>
                </div>

                <div className="border-t border-white/5 pt-4">
                  <Button
                    onClick={startCompression}
                    disabled={compressing || !videoSrc}
                    className="w-full btn-primary h-14 text-lg rounded-2xl shadow-xl flex items-center justify-center gap-2"
                  >
                    <RefreshCw className={`w-5 h-5 ${compressing ? 'animate-spin' : ''}`} />
                    {compressing ? "Compressing..." : "Start Compression"}
                  </Button>
                </div>

                {/* Notice Box */}
                <div className="bg-white/5 p-4 rounded-xl border border-white/10 flex items-start gap-3">
                  <Info className="w-5 h-5 text-neon-purple shrink-0 mt-0.5" />
                  <p className="text-[10px] text-white/40 leading-relaxed">
                    Compression uses your browser's recording engine. To maintain full sync, the video will process in real-time. Please keep the video visible to ensure smooth frame capture.
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
