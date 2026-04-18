import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { CheckCircle2, ArrowLeft, Send, Loader2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { supabase } from "@/lib/supabase";

export default function Join() {
  const [formType, setFormType] = useState<"gnc" | "common">("gnc");
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    whatsapp: "",
    department: "",
    year: "",
    interest: "",
    roll_number: "",
    register_number: "",
    portfolio_link: "",
    purpose: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const { error } = await supabase.from("applications").insert([{
      ...formData,
      form_type: formType // added for tracking
    }]);

    if (!error) {
      setSubmitted(true);
    } else {
      alert("Error submitting application: " + error.message);
    }
    setIsSubmitting(false);
  };


  return (
    <div className="min-h-screen bg-mesh pt-32 pb-20 px-6">
      <div className="max-w-4xl mx-auto">
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-white/50 hover:text-neon-purple transition-colors mb-12 group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          Back to Home
        </Link>

        <AnimatePresence mode="wait">
          {!submitted ? (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-dark border-white/10 rounded-[40px] p-8 md:p-16 relative overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.5)]"
            >
              <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-neon-purple/10 blur-[150px] -z-10 animate-pulse" />
              <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-neon-blue/5 blur-[150px] -z-10 animate-pulse delay-1000" />

              <div className="mb-12">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border-white/10 text-neon-purple text-xs font-bold uppercase tracking-widest mb-6"
                >
                  Application Form
                </motion.div>
                <h1 className="text-6xl md:text-7xl font-display text-white mb-6 uppercase leading-[0.9]">
                  Join the <span className="text-gradient">Elite</span>
                </h1>
                <p className="text-white/60 text-xl font-medium max-w-2xl leading-relaxed">
                  Apply to become a member of Guru Nanak College's premier technical club.
                </p>
              </div>

              {/* Form Type Switcher */}
              <div className="flex p-1 bg-white/5 rounded-2xl mb-12 max-w-md">
                <button
                  onClick={() => setFormType("gnc")}
                  className={`flex-1 py-4 px-6 rounded-xl text-xs uppercase tracking-widest font-bold transition-all ${
                    formType === "gnc" 
                      ? "bg-neon-purple text-white shadow-[0_0_20px_rgba(168,85,247,0.4)]" 
                      : "text-white/40 hover:text-white"
                  }`}
                >
                  GNC Student
                </button>
                <button
                  onClick={() => setFormType("common")}
                  className={`flex-1 py-4 px-6 rounded-xl text-xs uppercase tracking-widest font-bold transition-all ${
                    formType === "common" 
                      ? "bg-neon-blue text-white shadow-[0_0_20px_rgba(59,130,246,0.4)]" 
                      : "text-white/40 hover:text-white"
                  }`}
                >
                  External / Common
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="group space-y-4">
                    <label className="text-xs text-white/50 ml-1 uppercase tracking-[0.3em] font-bold group-focus-within:text-neon-purple transition-colors">
                      Full Name
                    </label>
                    <Input
                      required
                      placeholder="John Doe"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="glass border-white/10 h-16 px-8 text-lg focus:border-neon-purple focus:ring-neon-purple/20 rounded-[24px] transition-all duration-300"
                    />
                  </div>
                  <div className="group space-y-4">
                    <label className="text-xs text-white/50 ml-1 uppercase tracking-[0.3em] font-bold group-focus-within:text-neon-purple transition-colors">
                      Email Address
                    </label>
                    <Input
                      required
                      type="email"
                      placeholder="john@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="glass border-white/10 h-16 px-8 text-lg focus:border-neon-purple focus:ring-neon-purple/20 rounded-[24px] transition-all duration-300"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="group space-y-4">
                    <label className="text-xs text-white/50 ml-1 uppercase tracking-[0.3em] font-bold group-focus-within:text-neon-purple transition-colors">
                      WhatsApp Number
                    </label>
                    <Input
                      required
                      type="tel"
                      placeholder="+91 00000 00000"
                      value={formData.whatsapp}
                      onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                      className="glass border-white/10 h-16 px-8 text-lg focus:border-neon-purple focus:ring-neon-purple/20 rounded-[24px] transition-all duration-300"
                    />
                  </div>
                  <div className="group space-y-4">
                    <label className="text-xs text-white/50 ml-1 uppercase tracking-[0.3em] font-bold group-focus-within:text-neon-purple transition-colors">
                      Department
                    </label>
                    <Input
                      required
                      placeholder="e.g. Computer Applications"
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      className="glass border-white/10 h-16 px-8 text-lg focus:border-neon-purple focus:ring-neon-purple/20 rounded-[24px] transition-all duration-300"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="group space-y-4">
                    <label className="text-xs text-white/50 ml-1 uppercase tracking-[0.3em] font-bold group-focus-within:text-neon-purple transition-colors">
                      Year of Study
                    </label>
                    <Select 
                      required 
                      value={formData.year} 
                      onValueChange={(value) => setFormData({ ...formData, year: value })}
                    >
                      <SelectTrigger className="glass border-white/10 h-16 px-8 text-lg focus:border-neon-purple rounded-[24px] transition-all duration-300 text-white">
                        <SelectValue placeholder="Select current year" />
                      </SelectTrigger>
                      <SelectContent className="glass-dark border-white/10 text-white backdrop-blur-2xl">
                        <SelectItem value="1">1st Year</SelectItem>
                        <SelectItem value="2">2nd Year</SelectItem>
                        <SelectItem value="3">3rd Year</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="group space-y-4">
                    <label className="text-xs text-white/50 ml-1 uppercase tracking-[0.3em] font-bold group-focus-within:text-neon-purple transition-colors">
                      Domain of Interest
                    </label>
                    <Select 
                      required 
                      value={formData.interest}
                      onValueChange={(value) => setFormData({ ...formData, interest: value })}
                    >
                      <SelectTrigger className="glass border-white/10 h-16 px-8 text-lg focus:border-neon-purple rounded-[24px] transition-all duration-300 text-white">
                        <SelectValue placeholder="What's your niche?" />
                      </SelectTrigger>
                      <SelectContent className="glass-dark border-white/10 text-white backdrop-blur-2xl">
                        <SelectItem value="photography">Photography</SelectItem>
                        <SelectItem value="videography">Videography</SelectItem>
                        <SelectItem value="editing">Video Editing</SelectItem>
                        <SelectItem value="design">Graphic Design</SelectItem>
                        <SelectItem value="web">Web Development</SelectItem>
                        <SelectItem value="docs">Documentation</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {formType === "gnc" && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-10"
                  >
                    <div className="group space-y-4">
                      <label className="text-xs text-white/50 ml-1 uppercase tracking-[0.3em] font-bold group-focus-within:text-neon-purple transition-colors">
                        Roll Number
                      </label>
                      <Input
                        required
                        placeholder="21-1234-56"
                        value={formData.roll_number}
                        onChange={(e) => setFormData({ ...formData, roll_number: e.target.value })}
                        className="glass border-white/10 h-16 px-8 text-lg focus:border-neon-purple rounded-[24px] transition-all duration-300"
                      />
                    </div>
                    <div className="group space-y-4">
                      <label className="text-xs text-white/50 ml-1 uppercase tracking-[0.3em] font-bold group-focus-within:text-neon-purple transition-colors">
                        Register Number
                      </label>
                      <Input
                        required
                        placeholder="122112345"
                        value={formData.register_number}
                        onChange={(e) => setFormData({ ...formData, register_number: e.target.value })}
                        className="glass border-white/10 h-16 px-8 text-lg focus:border-neon-purple rounded-[24px] transition-all duration-300"
                      />
                    </div>
                  </motion.div>
                )}

                <div className="group space-y-4">
                  <label className="text-xs text-white/50 ml-1 uppercase tracking-[0.3em] font-bold group-focus-within:text-neon-purple transition-colors">
                    Portfolio Link (Optional)
                  </label>
                  <Input
                    placeholder="https://behance.net/johndoe"
                    value={formData.portfolio_link}
                    onChange={(e) => setFormData({ ...formData, portfolio_link: e.target.value })}
                    className="glass border-white/10 h-16 px-8 text-lg focus:border-neon-purple rounded-[24px] transition-all duration-300"
                  />
                </div>

                <div className="group space-y-4">
                  <label className="text-xs text-white/50 ml-1 uppercase tracking-[0.3em] font-bold group-focus-within:text-neon-purple transition-colors">
                    Statement of Purpose
                  </label>
                  <Textarea
                    required
                    placeholder="Why G-Tech? Tell us about your journey and ambition..."
                    value={formData.purpose}
                    onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                    className="glass border-white/10 focus:border-neon-purple min-h-[200px] p-8 text-lg rounded-[32px] focus:ring-neon-purple/20 transition-all duration-300"
                  />
                </div>

                <Button
                  type="submit"
                  size="lg"
                  disabled={isSubmitting}
                  className="w-full btn-primary py-10 rounded-[28px] text-xl uppercase tracking-[0.4em] font-black shadow-[0_20px_50px_rgba(168,85,247,0.4)] hover:shadow-[0_25px_60px_rgba(168,85,247,0.6)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-500"
                >
                  {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin" /> : (
                    <>
                      Request Membership
                      <Send className="ml-3 w-6 h-6" />
                    </>
                  )}
                </Button>
              </form>
            </motion.div>
          ) : (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-dark border-white/10 rounded-[48px] p-16 md:p-32 text-center relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-linear-to-br from-neon-purple/20 via-transparent to-neon-blue/20 animate-pulse" />
              
              <div className="relative z-10 flex flex-col items-center">
                <div className="w-32 h-32 rounded-full bg-neon-purple/20 flex items-center justify-center mb-12 border-2 border-neon-purple/50 shadow-[0_0_80px_rgba(168,85,247,0.4)]">
                  <CheckCircle2 className="w-16 h-16 text-neon-purple" />
                </div>
                <h2 className="text-5xl md:text-7xl font-display text-white mb-6 uppercase tracking-tighter">
                  Application <span className="text-gradient">Sent</span>
                </h2>
                <p className="text-white/60 text-2xl max-w-xl mx-auto mb-16 leading-relaxed">
                  Your mission profile has been uploaded to our servers. Our core leads will review your application and initiate contact shortly.
                </p>
                <Button
                  size="lg"
                  onClick={() => navigate("/")}
                  className="btn-secondary px-12 py-8 rounded-2xl text-lg uppercase tracking-widest"
                >
                  Return to Base
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
