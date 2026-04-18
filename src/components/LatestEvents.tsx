import { useState, useEffect, useRef } from "react";
import { motion, useScroll, useTransform, useSpring } from "motion/react";
import { ExternalLink, Calendar as CalendarIcon, ArrowRight, Clock } from "lucide-react";
import { SectionHeader, GlassCard, TiltCard } from "./UIElements";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";

export function LatestEvents() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(3);
      if (!error) setEvents(data);
      setLoading(false);
    };
    fetchEvents();
  }, []);

  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start center", "end center"]
  });

  const scaleY = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  const y = useTransform(scrollYProgress, [0, 1], [0, 150]);

  return (
    <section ref={containerRef} className="py-32 relative bg-mesh">
      <motion.div 
        style={{ y }}
        className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-neon-blue/5 blur-[180px] -z-10" 
      />
      <div className="container mx-auto px-6">
        <SectionHeader
          title="Recent Activities"
          subtitle="A timeline of our latest contributions and events at Guru Nanak College."
        />

        <div className="relative max-w-6xl mx-auto">
          {/* Static Background Line */}
          <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-px bg-white/5 hidden md:block" />
          
          {/* Animated Progress Line */}
          <motion.div 
            style={{ scaleY, originY: 0 }}
            className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-px bg-linear-to-b from-neon-purple via-neon-blue to-neon-purple hidden md:block z-20 shadow-[0_0_15px_rgba(168,85,247,0.5)]" 
          >
            {/* Glow Tip */}
            <motion.div 
              style={{ top: "100%" }}
              className="absolute left-1/2 -translate-x-1/2 w-2 h-2 bg-white rounded-full shadow-[0_0_20px_rgba(255,255,255,1),0_0_40px_rgba(168,85,247,1)]"
            />
          </motion.div>

          {loading ? (
             <div className="text-center py-20 flex flex-col items-center gap-4">
               <Clock className="w-10 h-10 text-neon-purple animate-spin" />
               <p className="text-white/20 uppercase tracking-widest text-xs">Loading Timeline</p>
             </div>
          ) : (
            <div className="space-y-32">
              {events.map((event, index) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className={`flex flex-col md:flex-row items-center gap-16 ${
                    index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                  }`}
                >
                  <div className="flex-1 w-full">
                    <TiltCard>
                      <GlassCard className="border border-white/5 hover:border-neon-blue/50 transition-all duration-500">
                        <div className="relative aspect-video rounded-2xl overflow-hidden mb-8 group/img">
                          <img
                            src={event.image}
                            alt={event.title}
                            className="w-full h-full object-cover group-hover/img:scale-110 transition-transform duration-700"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        
                        <div className="flex items-center gap-3 text-white/40 text-sm font-bold mb-4 uppercase tracking-widest">
                          <CalendarIcon className="w-4 h-4 text-neon-blue" />
                          {event.date}
                        </div>
                        
                        <h3 className="text-4xl font-sans font-semibold text-white mb-6 uppercase">{event.title}</h3>
                        <p className="text-white/60 text-lg mb-8 leading-relaxed line-clamp-3">
                          {event.description}
                        </p>
                        
                        <Button
                          render={<a href={event.drive_link} target="_blank" rel="noopener noreferrer" />}
                          variant="outline"
                          className="btn-secondary px-8 py-6 rounded-xl group/btn"
                        >
                          View Photos
                          <ExternalLink className="ml-2 w-4 h-4 group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
                        </Button>
                      </GlassCard>
                    </TiltCard>
                  </div>

                  {/* Center Dot */}
                  <div className="relative z-10 hidden md:flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full glass border-2 border-neon-purple flex items-center justify-center shadow-[0_0_30px_rgba(168,85,247,0.4)]">
                      <div className="w-6 h-6 rounded-full bg-neon-purple animate-pulse" />
                    </div>
                  </div>

                  <div className="flex-1 hidden md:block" />
                </motion.div>
              ))}
            </div>
          )}
        </div>


        <div className="mt-32 text-center">
          <Button
            render={<Link to="/events" />}
            size="lg"
            variant="outline"
            className="btn-secondary px-12 py-8 rounded-2xl text-xl group"
          >
            View All Events
            <ArrowRight className="ml-3 w-6 h-6 group-hover:translate-x-2 transition-transform" />
          </Button>
        </div>
      </div>
    </section>
  );
}


