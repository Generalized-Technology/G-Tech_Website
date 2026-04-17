import { Link } from "react-router-dom";
import { Instagram, Twitter, Github, Mail } from "lucide-react";

export function Footer() {
  return (
    <footer className="py-24 border-t border-white/5 relative overflow-hidden bg-mesh">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-linear-to-r from-transparent via-neon-purple to-transparent shadow-[0_0_20px_rgba(168,85,247,0.5)]" />
      
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-16 mb-20">
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="flex items-center gap-3 mb-8 group">
              <img className="max-h-[70px] group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 drop-shadow-[0_0_20px_rgba(168,85,247,0.3)]" src="/images/navbarlogo.svg" alt="logo" />
            </Link>
            <p className="text-white/60 max-w-md text-lg leading-relaxed mb-8">
              The official technical club of Guru Nanak College. Powering creativity, technology, and technical support for a digital future.
            </p>
            <div className="flex gap-6">
              <a href="https://www.instagram.com/gtechclub_gnc/" className="w-12 h-12 rounded-2xl glass flex items-center justify-center text-white/50 hover:text-neon-purple hover:border-neon-purple/50 transition-all duration-500">
                <Instagram className="w-6 h-6" />
              </a>
              <a href="https://github.com/Generalized-Technology/" className="w-12 h-12 rounded-2xl glass flex items-center justify-center text-white/50 hover:text-neon-purple hover:border-neon-purple/50 transition-all duration-500">
                <Github className="w-6 h-6" />
              </a>
              <a href="mailto: gtech@gurunanakcollege.edu.in" className="w-12 h-12 rounded-2xl glass flex items-center justify-center text-white/50 hover:text-neon-purple hover:border-neon-purple/50 transition-all duration-500">
                <Mail className="w-6 h-6" />
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="font-display font-black text-white mb-8 uppercase tracking-[0.2em] text-xs">Navigation</h4>
            <ul className="space-y-5">
              <li><Link to="/about" className="text-white/40 hover:text-neon-purple transition-all font-bold uppercase tracking-widest text-xs">About Us</Link></li>
              <li><Link to="/events" className="text-white/40 hover:text-neon-purple transition-all font-bold uppercase tracking-widest text-xs">Events</Link></li>
              <li><Link to="/gallery" className="text-white/40 hover:text-neon-purple transition-all font-bold uppercase tracking-widest text-xs">Gallery</Link></li>
              <li><Link to="/support" className="text-white/40 hover:text-neon-purple transition-all font-bold uppercase tracking-widest text-xs">Support</Link></li>
              <li><Link to="/overall-leads" className="text-white/40 hover:text-neon-purple transition-all font-bold uppercase tracking-widest text-xs">Leadership</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-display font-black text-white mb-8 uppercase tracking-[0.2em] text-xs">Location</h4>
            <p className="text-white/40 text-sm leading-relaxed font-medium">
              Guru Nanak College (Autonomous)<br />
              Velachery, Chennai - 600042<br />
              Tamil Nadu, India
            </p>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row justify-between items-center pt-10 border-t border-white/5 gap-6">
          <p className="text-white/20 text-xs font-bold uppercase tracking-widest">
            © 2025 G-Tech Club. Engineered for the Future.
          </p>
          <p className="text-white/20 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
            Crafted with <span className="text-neon-purple animate-pulse">✦</span> by G-Tech Web Team
          </p>
        </div>
      </div>
    </footer>
  );
}
