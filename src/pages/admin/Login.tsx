import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "motion/react";
import { Lock, Mail, Loader2, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      navigate("/admin");
    }
  };

  return (
    <div className="min-h-screen bg-mesh flex items-center justify-center p-6 pt-32">
      <div className="absolute top-10 left-10">
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-white/50 hover:text-neon-purple transition-colors group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          Back to Site
        </Link>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-dark border-white/10 rounded-[40px] p-8 md:p-12 w-full max-w-md relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-neon-purple/20 blur-[100px] -z-10" />
        
        <div className="mb-10 text-center">
          <div className="w-20 h-20 bg-neon-purple/20 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-neon-purple/30">
            <Lock className="w-10 h-10 text-neon-purple" />
          </div>
          <h1 className="text-4xl font-display text-white mb-2 uppercase tracking-tighter">
            Admin <span className="text-gradient">Access</span>
          </h1>
          <p className="text-white/50 text-sm">Enter your credentials to manage G-Tech Club</p>
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-red-500/10 border border-red-500/20 text-red-500 text-sm p-4 rounded-xl mb-6 text-center"
          >
            {error}
          </motion.div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs text-white/50 ml-1 uppercase tracking-widest font-bold">Email</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
              <Input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@gtech.club"
                className="glass border-white/10 h-14 pl-12 pr-6 focus:border-neon-purple rounded-2xl transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs text-white/50 ml-1 uppercase tracking-widest font-bold">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
              <Input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="glass border-white/10 h-14 pl-12 pr-6 focus:border-neon-purple rounded-2xl transition-all"
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full btn-primary h-14 rounded-2xl text-lg uppercase tracking-widest font-bold shadow-lg mt-4"
          >
            {loading ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              "Sign In"
            )}
          </Button>
        </form>
      </motion.div>
    </div>
  );
}
