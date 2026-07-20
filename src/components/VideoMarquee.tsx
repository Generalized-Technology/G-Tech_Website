import React, { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import { motion, useScroll, useTransform, AnimatePresence } from "motion/react";
import { SectionHeader } from "./UIElements";
import { supabase } from "@/lib/supabase";

const marqueeCSS = `
@keyframes marquee-scroll {
  0%   { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}
.marquee-track {
  animation: marquee-scroll 40s linear infinite;
}
.marquee-track:hover {
  animation-play-state: paused;
}
`;

export function VideoMarquee() {
  const { scrollYProgress } = useScroll();
  const x = useTransform(scrollYProgress, [0, 1], [0, -200]);
  const [videoList, setVideoList] = useState<any[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<any | null>(null);
  const modalVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const fetchVideos = async () => {
      const { data } = await supabase.from("videos").select("*").order("created_at");
      if (data) setVideoList(data);
    };
    fetchVideos();
  }, []);

  // Escape key closes modal
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedVideo(null);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  // Reset & play modal video when opened
  useEffect(() => {
    if (selectedVideo && modalVideoRef.current) {
      modalVideoRef.current.currentTime = 0;
      modalVideoRef.current.play().catch(() => {});
    }
  }, [selectedVideo]);

  // Render portal so fixed modal is never clipped by parent overflow/transforms
  const modalPortal = ReactDOM.createPortal(
    <AnimatePresence>
      {selectedVideo && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          style={{ position: "fixed", inset: 0, zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}
          onClick={() => setSelectedVideo(null)}
        >
          {/* Backdrop */}
          <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.85)", backdropFilter: "blur(24px)" }} />

          {/* Card */}
          <motion.div
            initial={{ scale: 0.88, opacity: 0, y: 40 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.88, opacity: 0, y: 40 }}
            transition={{ type: "spring", stiffness: 280, damping: 26 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              position: "relative",
              width: "100%",
              maxWidth: "900px",
              borderRadius: "28px",
              overflow: "hidden",
              border: "1px solid rgba(255,255,255,0.1)",
              boxShadow: "0 40px 80px rgba(0,0,0,0.8), 0 0 60px rgba(168,85,247,0.15)",
              background: "rgba(10,10,20,0.7)",
              backdropFilter: "blur(32px)",
            }}
          >
            {/* Neon glow ring */}
            <div style={{
              position: "absolute", inset: -2, borderRadius: "30px",
              background: "linear-gradient(135deg, rgba(168,85,247,0.3), rgba(59,130,246,0.2))",
              filter: "blur(12px)", zIndex: -1,
            }} />

            {/* Close button */}
            <button
              onClick={() => setSelectedVideo(null)}
              style={{
                position: "absolute", top: 16, right: 16, zIndex: 10,
                width: 40, height: 40, borderRadius: "50%",
                background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)",
                backdropFilter: "blur(8px)", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "white", transition: "background 0.2s",
              }}
              onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.22)")}
              onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.1)")}
            >
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Video player */}
            <video
              ref={modalVideoRef}
              src={selectedVideo.url}
              style={{ width: "100%", aspectRatio: "16/9", display: "block", objectFit: "cover" }}
              controls
              controlsList="nodownload"
              autoPlay
              loop
              playsInline
            />

            {/* Footer */}
            <div style={{ padding: "24px 32px", background: "rgba(0,0,0,0.5)" }}>
              <p style={{ color: "white", fontFamily: "sans-serif", fontSize: "22px", textTransform: "uppercase", letterSpacing: "0.1em", margin: 0 }}>
                {selectedVideo.title}
              </p>
              <div style={{
                width: 56, height: 5, marginTop: 14, borderRadius: 999,
                background: "rgb(168,85,247)",
                boxShadow: "0 0 12px rgba(168,85,247,1)",
              }} />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );

  return (
    <>
      <style>{marqueeCSS}</style>

      <section className="py-40 bg-mesh overflow-hidden relative">
        <motion.div
          style={{ x }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-neon-purple/5 blur-[150px] -z-10"
        />
        <div className="absolute top-0 left-0 w-full h-px bg-linear-to-r from-transparent via-neon-purple/30 to-transparent" />
        <div className="absolute bottom-0 left-0 w-full h-px bg-linear-to-r from-transparent via-neon-blue/30 to-transparent" />

        <div className="container mx-auto px-6">
          <SectionHeader
            title="Digital Archives"
            subtitle="Experience the energy and excitement of our club activities through our lens."
          />
        </div>

        <div className="relative mt-20">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-40 bg-neon-purple/10 blur-[120px] rounded-full pointer-events-none" />

          {/* CSS-animated marquee track — hover pauses via animation-play-state */}
          <div className="marquee-track flex gap-12 w-max">
            {videoList.length > 0 ? [...videoList, ...videoList].map((video, index) => (
              <motion.div
                key={`${video.id}-${index}`}
                whileHover={{ scale: 1.05, y: -10 }}
                onClick={() => setSelectedVideo(video)}
                className="relative w-165 aspect-video rounded-[32px] overflow-hidden glass border border-white/10 group shadow-2xl cursor-pointer"
              >
                <video
                  src={video.url}
                  className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-all duration-700"
                  autoPlay
                  muted
                  loop
                  playsInline
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/90 via-transparent to-transparent pointer-events-none" />

                {/* Play icon */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                  <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-xl">
                    <svg className="w-7 h-7 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                </div>

                <div className="absolute bottom-8 left-8 right-8 pointer-events-none">
                  <p className="text-white font-sans text-2xl uppercase drop-shadow-lg">{video.title}</p>
                  <div className="w-16 h-1.5 bg-neon-purple mt-4 rounded-full shadow-[0_0_10px_rgba(168,85,247,1)]" />
                </div>
              </motion.div>
            )) : (
              <div className="w-screen flex justify-center py-20 text-white/20">No archives loaded yet.</div>
            )}
          </div>
        </div>
      </section>

      {modalPortal}
    </>
  );
}
