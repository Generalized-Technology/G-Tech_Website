import React, { useState, useEffect } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { SectionHeader, GlassCard, TiltCard } from "@/components/UIElements";
import { Linkedin, Globe, Instagram, ArrowRight, History } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";

export default function About() {
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const [leadership, setLeadership] = useState<any[]>([]);

  useEffect(() => {
    const fetchLeads = async () => {
      const { data } = await supabase
        .from("club_leads")
        .select("*")
        .eq("year", "2025–26")
        .order("order_index", { ascending: true });
      if (data) {
        setLeadership(data);
      }
    };
    fetchLeads();
  }, []);

  return (
    <main className="pt-32 pb-20 bg-mesh">
      {/* About Section */}
      <section className="py-20 relative overflow-hidden">
        <motion.div
          style={{ y }}
          className="absolute top-0 right-0 w-[500px] h-[500px] bg-neon-purple/10 blur-[150px] -z-10"
        />

        <div className="container mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <SectionHeader
              align="left"
              title="About G-Tech Club"
              subtitle="The driving force of technical innovation and creative excellence at Guru Nanak College."
            />
            <div className="space-y-6 text-white/70 text-lg leading-relaxed">
              <p>
                G-Tech Club is a community of passionate technologists,
                creators, and problem solvers. We serve as the backbone for all
                technical and media requirements of Guru Nanak College.
              </p>
              <p>
                From capturing the most memorable moments of college life to
                building complex digital platforms, our six specialized domains
                work in harmony to deliver professional-grade results.
              </p>
              <p>
                Our mission is to foster a culture of learning by doing,
                providing students with real-world experience in media
                production, software development, and event management.
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative"
          >
            <TiltCard>
              <div className="aspect-square rounded-[40px] overflow-hidden glass border border-white/10 p-4">
                <div className="w-full h-full rounded-[32px] bg-linear-to-br from-neon-purple/20 to-neon-blue/20 flex items-center justify-center relative overflow-hidden">
                  {/* Abstract 3D-ish elements */}
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 20,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="absolute w-[150%] h-[150%] border border-white/5 rounded-full"
                  />
                  <img
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 relative z-10 text-center"
                    src="/images/gt-logo.jpg"
                    alt="team image"
                  />
                </div>
              </div>
            </TiltCard>
          </motion.div>
        </div>
      </section>

      {/* Leads Section */}
      <section className="py-32 relative">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
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
