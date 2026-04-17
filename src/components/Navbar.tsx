import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { Menu, X, ChevronRight } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const navLinks = [
  { name: "About", href: "/about" },
  { name: "Events", href: "/events" },
  { name: "Gallery", href: "/gallery" },
  { name: "Tools", href: "/tools" },
  { name: "Support", href: "/support" },
];

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled ? "py-3 lg:py-4 glass-dark border-b border-neon-purple/20 shadow-[0_4px_30px_rgba(0,0,0,1)]" : "py-5 lg:py-8 bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 lg:px-6 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="max-h-[70px] flex items-center justify-center">
            <img className="max-h-[60px] md:max-h-[70px] max-w-[180px] md:max-w-none object-contain group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 drop-shadow-[0_0_20px_rgba(168,85,247,0.3)]" src="/images/navbarlogo.svg" alt="logo" />
          </div>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-10">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.href}
              className={`relative font-bold text-sm uppercase tracking-widest transition-all duration-300 hover:text-neon-purple ${
                location.pathname === link.href ? "text-neon-purple" : "text-white/60"
              }`}
            >
              {link.name}
              {location.pathname === link.href && (
                <motion.div
                  layoutId="nav-underline"
                  className="absolute -bottom-2 left-0 right-0 h-[2px] bg-neon-purple shadow-[0_0_15px_rgba(168,85,247,0.8)]"
                />
              )}
            </Link>
          ))}
          <Link
            to="/join"
            className={cn(
              buttonVariants({ size: "lg" }),
              "btn-primary px-8 py-6 rounded-full text-sm uppercase tracking-widest flex items-center justify-center"
            )}
          >
            Join Us
          </Link>
        </div>

        {/* Mobile Nav */}
        <div className="md:hidden flex items-center gap-4">
          <Sheet>
            <SheetTrigger 
              render={
                <button 
                  className={cn(
                    buttonVariants({ variant: "ghost", size: "icon" }),
                    "text-white glass border-white/10 w-12 h-12 rounded-xl"
                  )} 
                />
              }
            >
              <Menu className="w-6 h-6" />
            </SheetTrigger>
            <SheetContent side="right" className="glass-dark border-l border-white/10 text-white w-full sm:w-[400px] p-0">
              <div className="flex flex-col h-full p-12 bg-mesh">
                <div className="flex flex-col gap-6 mt-10">
                  {navLinks.map((link, i) => (
                    <motion.div
                      key={link.name}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                    >
                      <Link
                        to={link.href}
                        className={`text-4xl font-display uppercase flex items-center justify-between group ${
                          location.pathname === link.href ? "text-neon-purple" : "text-white/70"
                        }`}
                      >
                        {link.name}
                        <ChevronRight className={`w-8 h-8 transition-all duration-300 ${
                          location.pathname === link.href ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0"
                        }`} />
                      </Link>
                    </motion.div>
                  ))}
                </div>

                <div className="mt-auto">
                  <Link
                    to="/join"
                    className={cn(
                      buttonVariants({ size: "lg" }),
                      "w-full btn-primary py-8 rounded-2xl text-xl uppercase tracking-widest flex items-center justify-center"
                    )}
                  >
                    Join the Community
                  </Link>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </motion.nav>
  );
}
