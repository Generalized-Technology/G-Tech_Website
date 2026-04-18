import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { SectionHeader, TiltCard } from "@/components/UIElements";
import { Maximize2, Clock } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { supabase } from "@/lib/supabase";

export default function Gallery() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [images, setImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("gallery")
      .select("*")
      .order("created_at", { ascending: false });
    
    if (!error) setImages(data);
    setLoading(false);
  };


  return (
    <main className="pt-32 pb-20 bg-mesh min-h-screen">
      <section className="py-20">
        <div className="container mx-auto px-6">
          <SectionHeader
            title="Glimpse of Club"
            subtitle="Memorable moments, team bonding, and behind-the-scenes action from G-Tech Club."
          />

          <div className="columns-1 sm:columns-2 lg:columns-3 gap-8 space-y-8">
            {loading ? (
              <div className="col-span-full text-center py-20">
                <Clock className="w-10 h-10 text-neon-purple animate-spin mx-auto" />
              </div>
            ) : (
              images.map((image, index) => (
                <motion.div
                  key={image.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => setSelectedImage(image.url)}
                  className="break-inside-avoid"
                >
                  <TiltCard>
                    <div className="relative group cursor-pointer rounded-[32px] overflow-hidden glass border border-white/10">
                      <img
                        src={image.url}
                        alt={image.caption}
                        className="w-full h-auto object-cover group-hover:scale-110 transition-transform duration-1000"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col justify-end p-8">
                        <p className="text-white font-sans  text-2xl uppercase tracking-tighter mb-2 line-clamp-2">
                          {image.caption}
                        </p>
                        <div className="flex items-center gap-2 text-neon-purple text-xs uppercase tracking-widest">
                          <Maximize2 className="w-4 h-4" /> Expand Visual
                        </div>
                      </div>

                      {/* Subtle glow on hover */}
                      <div className="absolute inset-0 border-2 border-neon-purple/0 group-hover:border-neon-purple/30 transition-colors duration-500 rounded-[32px] pointer-events-none" />
                    </div>
                  </TiltCard>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </section>

      <Dialog
        open={!!selectedImage}
        onOpenChange={() => setSelectedImage(null)}
      >
        <DialogContent className="max-w-6xl p-0 bg-transparent border-none overflow-hidden flex items-center justify-center">
          {selectedImage && (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="relative p-4"
            >
              <img
                src={selectedImage}
                alt="Gallery Preview"
                className="max-w-full max-h-[85vh] object-contain rounded-3xl shadow-[0_0_100px_rgba(168,85,247,0.3)] border border-white/10"
                referrerPolicy="no-referrer"
              />
            </motion.div>
          )}
        </DialogContent>
      </Dialog>
    </main>
  );
}
