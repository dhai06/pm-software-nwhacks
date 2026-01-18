'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  GitBranch, 
  Zap, 
  Brain, 
  ShieldCheck,
  ArrowRight,
  Sparkles
} from 'lucide-react';

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
  }
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { duration: 0.8 }
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2
    }
  }
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] }
  }
};

// Glassmorphism Feature Card
function FeatureCard({ 
  icon: Icon, 
  title, 
  description 
}: { 
  icon: React.ElementType; 
  title: string; 
  description: string;
}) {
  return (
    <motion.div
      variants={scaleIn}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="group relative p-6 rounded-2xl bg-white/60 backdrop-blur-xl border border-white/40 shadow-lg shadow-stone-200/50 hover:shadow-xl hover:shadow-violet-200/30 transition-all duration-300"
    >
      {/* Subtle iridescent gradient overlay */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-violet-500/5 via-transparent to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <div className="relative z-10">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center mb-4 shadow-lg shadow-violet-500/25">
          <Icon size={24} className="text-white" />
        </div>
        <h3 className="text-lg font-semibold text-stone-900 mb-2">{title}</h3>
        <p className="text-stone-600 text-sm leading-relaxed">{description}</p>
      </div>
    </motion.div>
  );
}

// Prism Visual Component (Hero graphic)
function PrismVisual() {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="relative w-full max-w-2xl mx-auto h-80"
    >
      {/* Background glow */}
      <div className="absolute inset-0 bg-gradient-to-r from-violet-500/20 via-indigo-500/20 to-cyan-500/20 blur-3xl rounded-full" />
      
      {/* Main visual container */}
      <div className="relative h-full flex items-center justify-center">
        {/* Input beam */}
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: '120px' }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="absolute left-8 top-1/2 -translate-y-1/2 h-3 bg-gradient-to-r from-stone-300 to-stone-400 rounded-full"
        />
        
        {/* Prism shape */}
        <motion.div
          initial={{ opacity: 0, rotate: -10 }}
          animate={{ opacity: 1, rotate: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="relative z-10 w-24 h-24 ml-16"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-white/80 via-white/60 to-white/40 backdrop-blur-xl border border-white/60 shadow-2xl"
               style={{ clipPath: 'polygon(50% 0%, 100% 100%, 0% 100%)' }} />
          <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 via-cyan-500/10 to-pink-500/10"
               style={{ clipPath: 'polygon(50% 0%, 100% 100%, 0% 100%)' }} />
        </motion.div>
        
        {/* Output beams (refracted) */}
        <div className="absolute right-8 top-1/2 -translate-y-1/2 flex flex-col gap-6">
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: '140px', opacity: 1 }}
            transition={{ duration: 0.5, delay: 1.0 }}
            className="flex items-center gap-3"
          >
            <div className="h-2.5 flex-1 bg-gradient-to-r from-violet-500 to-violet-400 rounded-full shadow-lg shadow-violet-500/40" />
            <div className="px-3 py-1.5 rounded-lg bg-violet-500/10 border border-violet-500/20 text-xs font-medium text-violet-700">
              Scenario A
            </div>
          </motion.div>
          
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: '160px', opacity: 1 }}
            transition={{ duration: 0.5, delay: 1.15 }}
            className="flex items-center gap-3"
          >
            <div className="h-2.5 flex-1 bg-gradient-to-r from-cyan-500 to-cyan-400 rounded-full shadow-lg shadow-cyan-500/40" />
            <div className="px-3 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-xs font-medium text-cyan-700">
              Scenario B
            </div>
          </motion.div>
          
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: '120px', opacity: 1 }}
            transition={{ duration: 0.5, delay: 1.3 }}
            className="flex items-center gap-3"
          >
            <div className="h-2.5 flex-1 bg-gradient-to-r from-pink-500 to-pink-400 rounded-full shadow-lg shadow-pink-500/40" />
            <div className="px-3 py-1.5 rounded-lg bg-pink-500/10 border border-pink-500/20 text-xs font-medium text-pink-700">
              Scenario C
            </div>
          </motion.div>
        </div>
        
        {/* Dependency node label */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 1.4 }}
          className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm border border-stone-200 shadow-lg"
        >
          <span className="text-xs font-medium text-stone-600">Dependency Node</span>
        </motion.div>
      </div>
    </motion.div>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-50 via-white to-stone-50 overflow-hidden">
      {/* Subtle background gradients */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-to-bl from-violet-500/5 via-transparent to-transparent" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-tr from-cyan-500/5 via-transparent to-transparent" />
      </div>

      {/* Navbar */}
      <motion.nav 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-50 px-6 lg:px-12 py-4"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/25">
              <Sparkles size={18} className="text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-stone-900">Prism</span>
          </div>

          {/* Nav Links */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#" className="text-sm font-medium text-stone-600 hover:text-stone-900 transition-colors">
              Use Cases
            </a>
            <a href="#" className="text-sm font-medium text-stone-600 hover:text-stone-900 transition-colors">
              Features
            </a>
            <a href="#" className="text-sm font-medium text-stone-600 hover:text-stone-900 transition-colors">
              Pricing
            </a>
          </div>

          {/* CTA */}
          <Link
            href="/dashboard"
            className="px-5 py-2.5 rounded-full bg-stone-900 text-white text-sm font-medium hover:bg-stone-800 transition-colors shadow-lg shadow-stone-900/20"
          >
            Get Started
          </Link>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="relative z-10 px-6 lg:px-12 pt-16 pb-24">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Hero Text */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
              className="text-center lg:text-left"
            >
              <motion.div variants={fadeInUp} className="mb-4">
                <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-sm font-medium text-violet-700">
                  <Sparkles size={14} />
                  Project Risk Visualization
                </span>
              </motion.div>
              
              <motion.h1 
                variants={fadeInUp}
                className="text-5xl lg:text-6xl xl:text-7xl font-bold text-stone-900 tracking-tight mb-6"
              >
                Refract Your{' '}
                <span className="bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-600 bg-clip-text text-transparent">
                  Risk.
                </span>
              </motion.h1>
              
              <motion.p 
                variants={fadeInUp}
                className="text-lg lg:text-xl text-stone-600 max-w-xl mx-auto lg:mx-0 mb-8 leading-relaxed"
              >
                Stop viewing your project as a single linear path. Branch from your critical dependencies to simulate every possible outcome.
              </motion.p>
              
              <motion.div variants={fadeInUp}>
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold hover:from-violet-500 hover:to-indigo-500 transition-all shadow-xl shadow-violet-500/25 hover:shadow-violet-500/40 hover:-translate-y-0.5"
                >
                  Start Branching
                  <ArrowRight size={18} />
                </Link>
              </motion.div>
            </motion.div>

            {/* Hero Visual */}
            <PrismVisual />
          </div>
        </div>
      </section>

      {/* Philosophy Section */}
      <section className="relative z-10 px-6 lg:px-12 py-24 bg-gradient-to-b from-white to-stone-50/50">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="text-center"
          >
            <motion.p 
              variants={fadeInUp}
              className="text-sm font-semibold uppercase tracking-widest text-violet-600 mb-4"
            >
              The Philosophy
            </motion.p>
            <motion.h2 
              variants={fadeInUp}
              className="text-3xl lg:text-4xl font-bold text-stone-900 mb-6"
            >
              Dependencies aren&apos;t just links;{' '}
              <span className="bg-gradient-to-r from-violet-600 to-cyan-600 bg-clip-text text-transparent">
                they are pivot points.
              </span>
            </motion.h2>
            <motion.p 
              variants={fadeInUp}
              className="text-lg text-stone-600 max-w-3xl mx-auto leading-relaxed"
            >
              Prism allows you to &quot;fork&quot; your timeline at any specific dependency. See how a delay in &quot;Task A&quot; refracts across your entire schedule vs. an alternative plan. Every dependency becomes a lens through which you can view multiple futures.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="relative z-10 px-6 lg:px-12 py-24">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="text-center mb-16"
          >
            <motion.p 
              variants={fadeInUp}
              className="text-sm font-semibold uppercase tracking-widest text-violet-600 mb-4"
            >
              Features
            </motion.p>
            <motion.h2 
              variants={fadeInUp}
              className="text-3xl lg:text-4xl font-bold text-stone-900"
            >
              Built for clarity, designed for action
            </motion.h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="grid md:grid-cols-2 gap-6"
          >
            <FeatureCard
              icon={GitBranch}
              title="Dependency Branching"
              description="Right-click any dependency to spawn a 'What-If' scenario instantly. Visualize alternate timelines without disrupting your main plan."
            />
            <FeatureCard
              icon={Zap}
              title="The Reality Engine"
              description="A Critical Path view that highlights exactly which dependencies are load-bearing. Know where risk concentrates before it becomes a problem."
            />
            <FeatureCard
              icon={Brain}
              title="AI Pathfinder"
              description="Let AI analyze your dependency chain and suggest the optimal path forward. Surface hidden risks and unlock faster routes to completion."
            />
            <FeatureCard
              icon={ShieldCheck}
              title="Logic Guard"
              description="Real-time cycle detection prevents impossible loops before they break your plan. Build with confidence knowing your structure is sound."
            />
          </motion.div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="relative z-10 px-6 lg:px-12 py-24 bg-gradient-to-b from-stone-50/50 to-white">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeIn}
            className="text-center"
          >
            <p className="text-sm font-medium text-stone-500 mb-8">
              Used by small businesses and engineering teams
            </p>
            <div className="flex flex-wrap items-center justify-center gap-8 lg:gap-16">
              {['Cafes', 'Restaurnats', 'Event Planning', 'Engineering Teams'].map((company, index) => (
                <motion.div
                  key={company}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="text-lg lg:text-xl font-semibold text-stone-300 hover:text-stone-400 transition-colors cursor-default"
                >
                  {company}
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="relative z-10 px-6 lg:px-12 py-32">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="relative text-center"
          >
            {/* Background glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-violet-500/10 via-indigo-500/10 to-cyan-500/10 blur-3xl rounded-full" />
            
            <motion.h2 
              variants={fadeInUp}
              className="relative text-3xl lg:text-5xl font-bold text-stone-900 mb-6"
            >
              See the full spectrum{' '}
              <span className="bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-600 bg-clip-text text-transparent">
                of your project.
              </span>
            </motion.h2>
            
            <motion.div variants={fadeInUp} className="relative">
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 px-10 py-5 rounded-full bg-stone-900 text-white text-lg font-semibold hover:bg-stone-800 transition-all shadow-2xl shadow-stone-900/30 hover:shadow-stone-900/40 hover:-translate-y-0.5"
              >
                Get Started
                <ArrowRight size={20} />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 px-6 lg:px-12 py-8 border-t border-stone-200">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center">
              <Sparkles size={12} className="text-white" />
            </div>
            <span className="text-sm font-semibold text-stone-900">Prism</span>
          </div>
          <p className="text-sm text-stone-500">
            © 2026 Prism. Branch from dependencies.
          </p>
        </div>
      </footer>
    </div>
  );
}
