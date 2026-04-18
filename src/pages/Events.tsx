import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { SectionHeader, GlassCard, TiltCard } from "@/components/UIElements";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";
import { ExternalLink, Calendar, Search, Clock } from "lucide-react";

export default function Events() {
  const [searchQuery, setSearchQuery] = useState("");
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .order("created_at", { ascending: false });
    
    if (!error) setEvents(data);
    setLoading(false);
  };

  const filteredEvents = events.filter(event => 
    event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.date.toLowerCase().includes(searchQuery.toLowerCase())
  );


  return (
    <main className="pt-32 pb-20 bg-mesh min-h-screen">

      <section className="py-20 relative">
        <div className="container mx-auto px-6">
          <SectionHeader
            title="Event Archive"
            subtitle="Explore our full history of technical events, workshops, and symposiums."
          />

          {/* Search Bar */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-xl mx-auto mb-20 relative group"
          >
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-neon-blue transition-colors w-5 h-5" />
            <Input 
              placeholder="Search by title, date or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="glass border-white/10 h-16 pl-14 pr-8 rounded-2xl text-lg focus:ring-neon-blue/20 focus:border-neon-blue transition-all"
            />
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {loading ? (
              <div className="col-span-full text-center py-20">
                <Clock className="w-10 h-10 text-neon-blue animate-spin mx-auto" />
              </div>
            ) : (
              <AnimatePresence mode="popLayout">
                {filteredEvents.map((event, index) => (
                  <motion.div
                    key={event.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
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
                      <p className="text-white/60 text-lg mb-8 grow leading-relaxed line-clamp-3">
                        {event.description}
                      </p>
                      
                      <Button
                        render={<a href={event.drive_link} target="_blank" rel="noopener noreferrer" />}
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
              </AnimatePresence>
            )}
          </div>

          {!loading && filteredEvents.length === 0 && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="w-10 h-10 text-white/20" />
              </div>
              <h3 className="text-2xl text-white/50 uppercase tracking-widest">No matching events</h3>
              <p className="text-white/30 mt-2">Try searching with a different keyword</p>
            </motion.div>
          )}
        </div>
      </section>
    </main>
  );
}
