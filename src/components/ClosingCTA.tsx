import { motion, useScroll, useTransform } from "motion/react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowRight } from "lucide-react";

export function ClosingCTA() {
  const { scrollYProgress } = useScroll();
  const scale = useTransform(scrollYProgress, [0.8, 1], [0.9, 1]);
  const y = useTransform(scrollYProgress, [0.8, 1], [50, 0]);

  return (
    <section className="py-32 relative overflow-hidden bg-mesh">
      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          style={{ scale, y }}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="max-w-6xl mx-auto glass-dark rounded-[48px] p-12 md:p-24 border border-white/10 relative overflow-hidden text-center shadow-[0_0_50px_rgba(0,0,0,0.5)]"
        >
          {/* Background Glow */}
          <div className="absolute -top-32 -right-32 w-[500px] h-[500px] bg-neon-purple/20 blur-[150px] rounded-full animate-pulse" />
          <div className="absolute -bottom-32 -left-32 w-[500px] h-[500px] bg-neon-blue/20 blur-[150px] rounded-full animate-pulse delay-1000" />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full glass border-white/10 text-neon-purple text-xs font-black uppercase tracking-[0.3em] mb-10 shadow-[0_0_20px_rgba(168,85,247,0.2)]"
          >
            <Sparkles className="w-4 h-4" />
            Join the Elite Community
          </motion.div>

          <h2 className="text-4xl sm:text-5xl md:text-8xl font-display text-white mb-10 leading-tight md:leading-[0.9] uppercase">
            READY TO <span className="text-gradient drop-shadow-[0_0_30px_rgba(168,85,247,0.4)]">CREATE</span> <br className="hidden md:block" /> THE FUTURE?
          </h2>
          
          <p className="text-white/60 text-lg md:text-2xl max-w-3xl mx-auto mb-16 leading-relaxed font-medium px-4">
            Whether you're a photographer, coder, or designer, there's a place for you in G-Tech. Let's build something extraordinary together.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4 md:gap-8 px-6">
            <Link
              to="/join"
              className="btn-primary flex items-center justify-center gap-3 px-8 md:px-12 py-6 md:py-10 rounded-2xl text-lg md:text-xl uppercase tracking-widest group no-underline"
            >
              Join Us Now
              <ArrowRight className="ml-3 w-5 h-5 md:w-6 md:h-6 group-hover:translate-x-2 transition-transform" />
            </Link>
            <Button
              size="lg"
              variant="outline"
              render={<Link to="/support" />}
              className="btn-secondary px-8 md:px-12 py-6 md:py-10 rounded-2xl text-lg md:text-xl uppercase tracking-widest"
            >
              Get Support
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
