import React, { useState, useEffect } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "motion/react";
import { SectionHeader, GlassCard, TiltCard } from "@/components/UIElements";
import { Linkedin, Globe, Instagram, ArrowRight, History } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";

export default function About() {
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const [leadership, setLeadership] = useState<any[]>([]);

  const backgroundImages = [
    "/images/bgi/img0.jpeg",
    "/images/bgi/img1.jpg",
    "/images/bgi/img2.jpg",
    "/images/bgi/img3.jpg",
    "/images/bgi/img4.jpg",
    "/images/bgi/img5.jpg",
  ];
  const [currentBg, setCurrentBg] = useState(0);

  useEffect(() => {
    const bgInterval = setInterval(() => {
      setCurrentBg((prev) => (prev + 1) % backgroundImages.length);
    }, 5000);
    return () => clearInterval(bgInterval);
  }, []);

  useEffect(() => {
    const fetchLeads = async () => {
      const { data } = await supabase
        .from("club_leads")
        .select("*")
        .eq("show_first", true)
        .order("order_index", { ascending: true });
      if (data) {
        setLeadership(data);
      }
    };
    fetchLeads();
  }, []);

  return (
    <main className="pb-16 md:pb-30 bg-mesh">
      {/* About Section */}
      <section className="relative overflow-hidden min-h-screen flex items-center pt-20 md:pt-32 pb-10 md:pb-20">
        {/* Background Image Carousel with Gradient Overlay */}
        <div className="absolute inset-0 z-0 overflow-hidden bg-[#050510]">
          <AnimatePresence>
            <motion.img
              key={currentBg}
              src={backgroundImages[currentBg]}
              alt="team background"
              className="w-full h-full object-cover opacity-40 absolute top-0 left-0"
              initial={{ opacity: 0, scale: 1.0 }}
              animate={{ opacity: 1, scale: 1.1 }}
              exit={{ opacity: 0 }}
              transition={{
                opacity: { duration: 1.5 },
                scale: { duration: 10, ease: "linear" },
              }}
            />
          </AnimatePresence>
          <div className="absolute inset-0 bg-linear-to-t from-[#050510] via-[#050510]/60 to-[#050510]/10 pointer-events-none" />
        </div>

        <motion.div
          style={{ y }}
          className="absolute top-0 right-0 w-125 h-125 bg-neon-purple/10 blur-[150px] -z-10"
        />

        <div className="absolute bottom-12 left-0 right-0 px-6 z-10 w-full">
          <div className="container mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="max-w-5xl mx-auto text-center"
            >
              <h2 className="text-3xl md:text-5xl font-display font-bold text-transparent bg-clip-text bg-linear-to-r from-white via-white to-white/70 drop-shadow-[0_4px_20px_rgba(0,0,0,0.8)] neon-text">
                Generalized Technology
              </h2>
              <h2 className="text-xl md:text-3xl font-display font-bold text-transparent bg-clip-text bg-linear-to-r from-white via-white to-white/70 drop-shadow-[0_4px_20px_rgba(0,0,0,0.8)] neon-text">
                "Dream big, work hard, and never give up. Your future is bright!"
              </h2>
            </motion.div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-6 max-w-full md:max-w-[75%] py-8 md:py-10">
        <SectionHeader
          align="center"
          title="About G-Tech Club"
          subtitle="The driving force of technical innovation and creative excellence at Guru Nanak College."
        />
        <div className="space-y-6 text-white/90 text-lg leading-relaxed mt-6">
          <p>
            G-Tech Club is the <b className="text-neon-purple">official technical team of Guru Nanak College</b>,
            proudly partnering with the <b className="text-neon-purple">Guru Nanak Media Centre (GNMC)</b> and
            functioning under the <b className="text-neon-purple">Fine Arts Association</b>. We serve as the
            college's central technical and creative team, supporting events,
            initiatives, and digital transformation across the campus.
          </p>

          <p>
            From capturing the most memorable moments of college life to
            developing modern websites, applications, and digital solutions, our
            specialized domains work together to deliver professional-quality
            media, technology, and event support for the institution.
          </p>

          <p>
            Our mission is to empower students through hands-on learning,
            innovation, and collaboration by providing real-world experience in
            media production, software development, design, photography,
            videography, and technical event management while contributing to
            the growth of Guru Nanak College.
          </p>
        </div>
      </div>

      {/* Leads Section */}
      <section className="py-16 md:py-32 relative">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 md:mb-16 gap-8">
            <SectionHeader
              align="left"
              title="Our Leadership"
              subtitle="Meet the visionaries leading our domains and shaping the future of G-Tech Club."
              className="mb-0"
            />
            <Button
              render={<Link to="/overall-leads" />}
              variant="outline"
              className="btn-secondary px-8 py-6 rounded-2xl group"
            >
              <History className="w-5 h-5 mr-2" />
              View Past Leads
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {leadership.map((lead, index) => (
              <motion.div
                key={lead.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <TiltCard>
                  <GlassCard className="p-0 border border-white/5 hover:border-neon-purple/50 overflow-hidden group">
                    <div className="aspect-4/5 relative overflow-hidden">
                      <img
                        src={lead.image}
                        alt={lead.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-linear-to-t from-black via-transparent to-transparent opacity-80" />

                      {/* Social Overlay */}
                      <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-4 opacity-0 group-hover:opacity-100 transition-all translate-y-4 group-hover:translate-y-0">
                        {lead.linkedin && (
                          <a
                            href={lead.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-10 h-10 rounded-full glass flex items-center justify-center hover:bg-neon-blue transition-colors"
                          >
                            <Linkedin className="w-5 h-5" />
                          </a>
                        )}
                        {lead.portfolio && (
                          <a
                            href={lead.portfolio}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-10 h-10 rounded-full glass flex items-center justify-center hover:bg-neon-purple transition-colors"
                          >
                            <Globe className="w-5 h-5" />
                          </a>
                        )}
                        {lead.instagram && (
                          <a
                            href={lead.instagram}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-10 h-10 rounded-full glass flex items-center justify-center hover:bg-pink-500 transition-colors"
                          >
                            <Instagram className="w-5 h-5" />
                          </a>
                        )}
                      </div>
                    </div>

                    <div className="p-6 text-center">
                      <div className="text-xs  text-neon-purple uppercase mb-2">
                        {lead.domain}
                      </div>
                      <h4 className="text-2xl font-sans  text-white mb-1">
                        {lead.name}
                      </h4>
                      <p className="text-white/40 text-sm font-medium">
                        {lead.year}
                      </p>
                    </div>
                  </GlassCard>
                </TiltCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
