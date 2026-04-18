import React, { useState, useEffect } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { SectionHeader } from "./UIElements";
import { supabase } from "@/lib/supabase";

export function VideoMarquee() {
  const { scrollYProgress } = useScroll();
  const x = useTransform(scrollYProgress, [0, 1], [0, -200]);
  const [videoList, setVideoList] = useState<any[]>([]);

  useEffect(() => {
    const fetchVideos = async () => {
      const { data } = await supabase.from("videos").select("*").order("created_at");
      if (data) setVideoList(data);
    };
    fetchVideos();
  }, []);

  return (
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

        <motion.div
          animate={{ x: ["0%", "-50%"] }}
          transition={{ 
            duration: 40, 
            repeat: Infinity, 
            ease: "linear" 
          }}
          className="flex gap-12 w-max px-6"
        >
          {videoList.length > 0 ? [...videoList, ...videoList].map((video, index) => (
            <motion.div
              key={`${video.id}-${index}`}
              whileHover={{ scale: 1.05, y: -10 }}
              className="relative w-[320px] aspect-9/16 rounded-[32px] overflow-hidden glass border border-white/10 group shadow-2xl"
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
              
              <div className="absolute bottom-8 left-8 right-8 pointer-events-none">
                <p className="text-white font-sans text-2xl uppercase drop-shadow-lg">{video.title}</p>
                <div className="w-16 h-1.5 bg-neon-purple mt-4 rounded-full shadow-[0_0_10px_rgba(168,85,247,1)]" />
              </div>
            </motion.div>
          )) : (
            <div className="w-screen flex justify-center py-20 text-white/20">No archives loaded yet.</div>
          )}
        </motion.div>
      </div>
    </section>
  );
}
