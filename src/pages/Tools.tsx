import { motion } from "motion/react";
import { tools } from "@/data/clubData";
import { SectionHeader, GlassCard, TiltCard } from "@/components/UIElements";
import { 
  FolderOpen, 
  Layout, 
  Terminal, 
  Award, 
  Search, 
  ExternalLink,
  Tool
} from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const iconMap = {
  FolderOpen: FolderOpen,
  Layout: Layout,
  Terminal: Terminal,
  Award: Award,
};

export default function Tools() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTools = tools.filter(tool => 
    tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tool.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tool.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <main className="pt-32 pb-20 bg-mesh min-h-screen">
      <section className="py-20 relative px-6">
        <div className="container mx-auto">
          <SectionHeader 
            title="The G-Tech"
            subtitle="Explore our arsenal of custom-built tools, frameworks, and digital utilities designed to empower members and streamline club operations."
            gradient="Toolkit"
          />

          {/* Search Bar */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-xl mx-auto mb-20 relative group"
          >
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-neon-purple transition-colors w-5 h-5" />
            <Input 
              placeholder="Search tools, categories or functions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="glass border-white/10 h-16 pl-14 pr-8 rounded-2xl text-lg focus:ring-neon-purple/20 focus:border-neon-purple transition-all"
            />
          </motion.div>

          {/* Tools Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredTools.map((tool, i) => {
              const IconComponent = iconMap[tool.icon as keyof typeof iconMap] || Terminal;
              return (
                <motion.div
                  key={tool.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <TiltCard>
                    <GlassCard className="h-full p-8 flex flex-col group hover:border-neon-purple/50 transition-colors duration-500">
                      <div className="flex items-start justify-between mb-8">
                        <div className="w-14 h-14 rounded-2xl glass flex items-center justify-center border border-white/10 group-hover:border-neon-purple/50 group-hover:shadow-[0_0_20px_rgba(168,85,247,0.3)] transition-all duration-500">
                          <IconComponent className="w-7 h-7 text-neon-purple" />
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-white/30 glass px-3 py-1 rounded-full border border-white/5">
                          {tool.category}
                        </span>
                      </div>

                      <h3 className="text-2xl font-display text-white mb-4 uppercase tracking-tight group-hover:text-neon-purple transition-colors">
                        {tool.name}
                      </h3>
                      <p className="text-white/60 leading-relaxed mb-8 grow">
                        {tool.description}
                      </p>

                      <Button 
                        variant="link" 
                        className="p-0 h-auto text-neon-purple hover:text-white uppercase tracking-widest text-xs font-bold group/btn flex items-center gap-2"
                      >
                        Access Tool 
                        <ExternalLink className="w-4 h-4 group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
                      </Button>
                    </GlassCard>
                  </TiltCard>
                </motion.div>
              );
            })}
          </div>

          {filteredTools.length === 0 && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="w-10 h-10 text-white/20" />
              </div>
              <h3 className="text-2xl text-white/50 uppercase tracking-widest">No tools found</h3>
              <p className="text-white/30 mt-2">Try adjusting your search criteria</p>
            </motion.div>
          )}
        </div>
      </section>
    </main>
  );
}
