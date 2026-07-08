import React from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { AlertCircle, ArrowLeft, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Form() {
  const [searchParams] = useSearchParams();
  const id = searchParams.get('id');

  // We construct the forms.gle URL based on the ID passed
  const formUrl = id ? `https://forms.gle/${id}` : '';

  return (
    <main className="w-screen h-screen bg-[#050510] flex flex-col overflow-hidden">
      {/* Header Bar */}
      <header className="w-full flex justify-between items-center px-4 md:px-6 py-4 z-50 glass border-b border-white/10 shrink-0">
        <Button
          render={<Link to="/" />}
          variant="outline"
          className="glass border-white/20 bg-black/50 hover:bg-black/80 text-white rounded-full pl-4 pr-5 md:pr-6 h-10 md:h-12 shadow-lg backdrop-blur-md group transition-all"
        >
          <ArrowLeft className="w-4 h-4 md:w-5 md:h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
          <span className="hidden sm:inline">Back to Home</span>
          <span className="sm:hidden">Back</span>
        </Button>

        {id && (
          <a 
            href={formUrl} 
            target="_blank" 
            rel="noreferrer" 
            className="btn-primary px-4 md:px-6 py-2 md:py-3 rounded-full font-bold flex items-center text-sm md:text-base"
          >
            <span className="hidden sm:inline">Open in New Tab</span>
            <span className="sm:hidden">New Tab</span>
            <ExternalLink className="w-4 h-4 ml-2" />
          </a>
        )}
      </header>

      {/* Form Content Area */}
      <div className="grow w-full relative bg-white">
        {!id ? (
          <div className="w-full h-full flex items-center justify-center p-4 bg-[#050510]">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass p-10 rounded-3xl flex flex-col items-center text-center max-w-md w-full border border-white/10"
            >
              <AlertCircle className="w-16 h-16 text-neon-purple mb-6" />
              <h2 className="text-3xl font-display font-bold mb-3 text-white">Form Not Found</h2>
              <p className="text-white/60 text-lg">
                Please provide a valid form ID in the URL.
              </p>
            </motion.div>
          </div>
        ) : (
          <iframe
            src={formUrl}
            className="w-full h-full border-0 absolute inset-0"
            title="Google Form"
            allowFullScreen
          >
            Loading form...
          </iframe>
        )}
      </div>
    </main>
  );
}
