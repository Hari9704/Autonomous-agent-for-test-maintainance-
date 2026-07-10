import React from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Github, Linkedin, MessageSquare } from 'lucide-react';

export default function Contact() {
  return (
    <div className="max-w-2xl mx-auto space-y-12 pb-16 flex flex-col items-center pt-8">
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <h1 className="text-4xl font-bold font-mono tracking-tight">Get in Touch</h1>
        <p className="text-lg text-muted-foreground max-w-lg mx-auto">
          Interested in bringing agentic QA infrastructure to your engineering team, or collaborating on multi-agent AI systems? I'm open to conversations.
        </p>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="w-full max-w-md bg-card border border-border rounded-xl p-8 shadow-sm relative overflow-hidden"
      >
        <div className="absolute -top-12 -right-12 p-8 opacity-5">
          <MessageSquare className="w-48 h-48" />
        </div>
        
        <div className="relative z-10 space-y-8">
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-1">Nunnagoppala Hari Prasad</h2>
            <p className="text-primary font-mono text-sm">AI Engineer</p>
          </div>

          <div className="space-y-6">
            <a 
              href="mailto:hariprasad97048@gmail.com" 
              className="flex items-center gap-4 group"
            >
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20 group-hover:bg-primary/20 transition-colors">
                <Mail className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Email</p>
                <p className="text-foreground font-medium group-hover:text-primary transition-colors">hariprasad97048@gmail.com</p>
              </div>
            </a>

            <a 
              href="tel:+919704813856" 
              className="flex items-center gap-4 group"
            >
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20 group-hover:bg-primary/20 transition-colors">
                <Phone className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Phone</p>
                <p className="text-foreground font-medium group-hover:text-primary transition-colors">+91 9704813856</p>
              </div>
            </a>

            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center border border-border">
                <MapPin className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Location</p>
                <p className="text-foreground font-medium">Vijayawada, India</p>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-border flex gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded bg-muted/50 border border-border text-muted-foreground">
              <Linkedin className="w-4 h-4" />
              <span className="text-sm font-mono">LinkedIn</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded bg-muted/50 border border-border text-muted-foreground">
              <Github className="w-4 h-4" />
              <span className="text-sm font-mono">GitHub</span>
            </div>
          </div>
        </div>
      </motion.div>

    </div>
  );
}