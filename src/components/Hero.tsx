import { motion, useScroll, useTransform } from "motion/react";
import { Link } from "react-router-dom";
import { ChevronRight, Sparkles, Zap, Shield, Cpu } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { TiltCard } from "./UIElements";
import { cn } from "@/lib/utils";

export function Hero() {
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, 200]);
  const y2 = useTransform(scrollY, [0, 500], [0, -100]);
  const rotate = useTransform(scrollY, [0, 1000], [0, 360]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);
  const scale = useTransform(scrollY, [0, 300], [1, 0.8]);

  return (
    <section className="relative min-h-screen flex items-center pt-24 lg:pt-20 overflow-x-clip bg-mesh">
      {/* Dynamic Background Glows with Parallax */}
      <motion.div 
        style={{ y: y2 }}
        className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none"
      >
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] lg:w-[40%] lg:h-[40%] bg-neon-purple/20 blur-[100px] lg:blur-[150px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] lg:w-[40%] lg:h-[40%] bg-neon-blue/20 blur-[100px] lg:blur-[150px] rounded-full animate-pulse delay-1000" />
      </motion.div>
      
      <div className="container mx-auto px-6 flex flex-col lg:grid lg:grid-cols-2 gap-12 lg:gap-16 items-center relative z-10 py-12 lg:py-0">
        {/* Content */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          style={{ scale }}
          className="text-center lg:text-left order-2 lg:order-1"
        >
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-6xl md:text-7xl lg:text-8xl font-display text-white mb-8 lg:mb-8 leading-[0.85] lg:leading-[0.85] uppercase wrap-break-word"
          >
            Generalized <br />
            <span className="text-gradient drop-shadow-[0_0_30px_rgba(168,85,247,0.3)]">technology</span>
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-white/70 text-lg md:text-xl lg:text-xl max-w-xl mb-10 lg:mb-8 leading-relaxed mx-auto lg:mx-0"
          >
            The Next Generation of Creators, Developers, and Tech Enthusiasts at Guru Nanak College.
          </motion.p>

          {/* Stats/Badges */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mb-6 lg:mb-8 flex flex-wrap justify-center lg:justify-start gap-4 lg:gap-8 opacity-50"
          >
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 lg:w-5 lg:h-5 text-neon-purple" />
              <span className="text-xs lg:text-sm font-medium uppercase">Fast Support</span>
            </div>
            <div className="flex items-center gap-2">
              <Cpu className="w-5 h-5 lg:w-5 lg:h-5 text-neon-blue" />
              <span className="text-xs lg:text-sm font-medium uppercase ">Tech Driven</span>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex flex-col sm:flex-row justify-center lg:justify-start gap-5 lg:gap-6"
          >
            <Button
              size="lg"
              className="btn-primary w-full sm:w-auto px-10 py-7 lg:px-10 lg:py-8 rounded-2xl text-xl lg:text-xl group"
              onClick={() => document.getElementById('domains')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Explore Domains
              <ChevronRight className="ml-2 w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Link
              to="/join"
              className={cn(
                buttonVariants({ size: "lg" }),
                "btn-secondary w-full sm:w-auto px-10 py-7 lg:px-10 lg:py-8 rounded-2xl text-xl lg:text-xl flex items-center justify-center"
              )}
            >
              Join Us
            </Link>
          </motion.div>

          
        </motion.div>

        {/* Visual */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
          style={{ y: y1 }}
          className="relative order-1 lg:order-2 mt-12 lg:mt-0 flex items-center justify-center"
        >
          <div className="relative w-64 h-64 md:w-80 md:h-80 lg:w-125 lg:h-125 flex items-center justify-center">
            {/* Outer Rings */}
            <motion.div
              style={{ rotate }}
              className="absolute w-full h-full border border-dashed border-neon-purple/20 rounded-full"
            />
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
              className="absolute w-[80%] h-[80%] border border-neon-blue/10 rounded-full"
            />
            
            {/* Core Object */}
            <div className="relative w-48 h-48 md:w-60 md:h-60 lg:w-80 lg:h-80">
              <motion.div
                animate={{ 
                  y: [0, -15, 0],
                  rotate: [45, 48, 45]
                }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="w-full h-full glass rounded-[32px] md:rounded-[36px] lg:rounded-[48px] border border-white/30 shadow-[0_0_40px_rgba(168,85,247,0.3)] lg:shadow-[0_0_80px_rgba(168,85,247,0.4)] overflow-hidden"
              >
                <div className="absolute inset-0 bg-linear-to-br from-neon-purple/40 via-transparent to-neon-blue/40" />
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />
                
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  {/* Inner Glow */}
                  <motion.div
                    animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0.8, 0.4] }}
                    transition={{ duration: 4, repeat: Infinity }}
                    className="w-32 h-32 md:w-32 md:h-32 lg:w-48 lg:h-48 rounded-full bg-neon-purple/60 blur-2xl lg:blur-3xl"
                  />
                </div>
                
                {/* Floating Logo Container */}
                <div className="absolute inset-0 flex items-center justify-center -rotate-45">
                  <img className="h-24 md:h-36 lg:h-48 drop-shadow-[0_0_20px_rgba(255,255,255,0.4)]" src="/images/whitelogo.svg" alt="white logo" />
                </div>
              </motion.div>

                  {/* Orbiting Elements */}
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                    className="absolute -inset-5 lg:-inset-10 pointer-events-none"
                  >
                    <motion.div
                      animate={{ rotate: -360 }}
                      transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                      className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-8 lg:w-16 lg:h-16 glass rounded-lg lg:rounded-2xl border border-white/20 flex items-center justify-center shadow-2xl"
                    >
                      <Cpu className="w-4 h-4 lg:w-8 lg:h-8 text-neon-purple" />
                    </motion.div>
                  </motion.div>
                  
                  <motion.div
                    animate={{ rotate: -360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="absolute -inset-10 lg:-inset-20 pointer-events-none"
                  >
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                      className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-6 lg:w-12 lg:h-12 glass rounded-md lg:rounded-xl border border-white/20 flex items-center justify-center shadow-2xl"
                    >
                      <Zap className="w-3 h-3 lg:w-6 lg:h-6 text-neon-blue" />
                    </motion.div>
                  </motion.div>
                </div>
              </div>

              {/* Particle System */}
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={i}
                  animate={{ 
                    y: [0, -60, 0],
                    x: [0, Math.random() * 30 - 15, 0],
                    opacity: [0, 0.8, 0],
                    scale: [0, 1, 0]
                  }}
                  transition={{ 
                    duration: 3 + Math.random() * 3, 
                    repeat: Infinity, 
                    delay: Math.random() * 4 
                  }}
                  className="absolute w-1.5 h-1.5 rounded-full bg-neon-purple/60 blur-[1px]"
                  style={{
                    top: `${Math.random() * 100}%`,
                    left: `${Math.random() * 100}%`
                  }}
                />
              ))}
        </motion.div>
      </div>
    </section>
  );
}
