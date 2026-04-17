import { motion } from "motion/react";
import { events } from "@/data/clubData";
import { SectionHeader, GlassCard, TiltCard } from "@/components/UIElements";
import { Button } from "@/components/ui/button";
import { ExternalLink, Calendar } from "lucide-react";

export default function Events() {
  return (
    <main className="pt-32 pb-20 bg-mesh min-h-screen">

      <section className="py-32 relative">
        <div className="container mx-auto px-6">
          <SectionHeader
            title="Event Archive"
            subtitle="Explore our full history of technical events, workshops, and symposiums."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {events.map((event, index) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <TiltCard>
                  <GlassCard className="h-full flex flex-col border border-white/5 hover:border-neon-blue/50 p-6">
                    <div className="aspect-video rounded-2xl overflow-hidden mb-8 relative group/img">
                      <img
                        src={event.image}
                        alt={event.title}
                        className="w-full h-full object-cover group-hover/img:scale-110 transition-transform duration-700"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    
                    <div className="flex items-center gap-3 text-white/40 text-sm font-bold mb-4 uppercase tracking-widest">
                      <Calendar className="w-4 h-4 text-neon-blue" />
                      {event.date}
                    </div>
                    
                    <h3 className="text-3xl font-sans text-white mb-4 uppercase">{event.title}</h3>
                    <p className="text-white/60 text-lg mb-8 grow leading-relaxed">
                      {event.description}
                    </p>
                    
                    <Button
                      render={<a href={event.driveLink} target="_blank" rel="noopener noreferrer" />}
                      variant="outline"
                      className="btn-secondary w-full py-8 rounded-2xl group/btn"
                    >
                      View Event Gallery
                      <ExternalLink className="ml-2 w-5 h-5 group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
                    </Button>
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
