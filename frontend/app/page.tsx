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
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5 }
  }
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { duration: 0.6 }
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1
    }
  }
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { duration: 0.4 }
  }
};

// Feature Card matching dashboard card styling
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
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
      className="group p-5 rounded-lg bg-white border border-stone-200 shadow-sm hover:shadow-md hover:border-stone-300 transition-all duration-200"
    >
      <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center mb-4">
        <Icon size={20} className="text-white" />
      </div>
      <h3 className="text-base font-semibold text-stone-900 mb-2">{title}</h3>
      <p className="text-stone-500 text-sm leading-relaxed">{description}</p>
    </motion.div>
  );
}

// Prism Visual Component (Hero graphic)
function PrismVisual() {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="relative w-full max-w-2xl mx-auto h-72"
    >
      {/* Subtle background */}
      <div className="absolute inset-0 bg-stone-100/50 rounded-lg" />
      
      {/* Main visual container */}
      <div className="relative h-full flex items-center justify-center rounded-lg">
        {/* Input beam */}
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: '60px' }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="absolute top-1/2 -translate-y-1/2 h-2.5 bg-stone-300 rounded-full"
          style={{ left: '140px' }}
        />
        
        {/* Prism shape */}
        <motion.div
          initial={{ opacity: 0, rotate: -10 }}
          animate={{ opacity: 1, rotate: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="relative z-10 w-20 h-20 ml-14"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-500 shadow-md"
               style={{ clipPath: 'polygon(50% 0%, 100% 100%, 0% 100%)' }} />
        </motion.div>
        
        {/* Output beams (refracted) */}
        <div className="absolute right-8 top-1/2 -translate-y-1/2 flex flex-col gap-5">
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: '130px', opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.9 }}
            className="flex items-center gap-3"
          >
            <div className="h-2 flex-1 bg-accent rounded-full" />
            <div className="px-3 py-1.5 rounded-lg bg-blue-50 border border-stone-200 text-xs font-medium text-stone-700">
              Scenario A
            </div>
          </motion.div>
          
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: '150px', opacity: 1 }}
            transition={{ duration: 0.4, delay: 1.0 }}
            className="flex items-center gap-3"
          >
            <div className="h-2 flex-1 bg-blue-400 rounded-full" />
            <div className="px-3 py-1.5 rounded-lg bg-blue-50 border border-stone-200 text-xs font-medium text-stone-700">
              Scenario B
            </div>
          </motion.div>
          
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: '110px', opacity: 1 }}
            transition={{ duration: 0.4, delay: 1.1 }}
            className="flex items-center gap-3"
          >
            <div className="h-2 flex-1 bg-blue-300 rounded-full" />
            <div className="px-3 py-1.5 rounded-lg bg-blue-50 border border-stone-200 text-xs font-medium text-stone-700">
              Scenario C
            </div>
          </motion.div>
        </div>
        
        {/* Dependency node label */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 1.2 }}
          className="absolute px-3 py-1.5 rounded-lg bg-white border border-stone-200 shadow-sm"
          style={{ zIndex: 10, left: '140px', top: '30%' }}
        >
          <span className="text-xs font-medium text-stone-600">Dependency Node</span>
        </motion.div>
      </div>
    </motion.div>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-stone-50 overflow-hidden">
      {/* Navbar */}
      <motion.nav 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative z-50 border-b border-stone-200 bg-stone-50"
      >
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
              <Sparkles size={16} className="text-white" />
            </div>
            <span className="text-lg font-bold text-stone-900">Prism</span>
          </div>

          {/* Nav Links */}
          <div className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-sm font-medium text-stone-500 hover:text-stone-900 transition-colors">
              Features
            </a>
            <a href="#philosophy" className="text-sm font-medium text-stone-500 hover:text-stone-900 transition-colors">
              Philosophy
            </a>
          </div>

          {/* CTA */}
          <Link
            href="/dashboard"
            className="px-4 py-2 rounded-lg bg-accent text-white text-sm font-medium hover:bg-accent-hover transition-colors"
          >
            Get Started
          </Link>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="relative z-10 px-6 pt-12 pb-16">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Hero Text */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
              className="text-center lg:text-left"
            >
              <motion.div variants={fadeInUp} className="mb-3">
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-blue-50 border border-stone-200 text-sm font-medium text-stone-700">
                  <Sparkles size={14} className="text-accent" />
                  Project Risk Visualization
                </span>
              </motion.div>
              
              <motion.h1 
                variants={fadeInUp}
                className="text-3xl lg:text-4xl font-bold text-stone-900 mb-4"
              >
                Refract Your{' '}
                <span className="text-accent">
                  Risk.
                </span>
              </motion.h1>
              
              <motion.p 
                variants={fadeInUp}
                className="text-base text-stone-500 max-w-lg mx-auto lg:mx-0 mb-6 leading-relaxed"
              >
                Stop viewing your project as a single linear path. Branch from your critical dependencies to simulate every possible outcome.
              </motion.p>
              
              <motion.div variants={fadeInUp}>
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-accent text-white text-sm font-medium hover:bg-accent-hover transition-colors"
                >
                  Start Branching
                  <ArrowRight size={16} />
                </Link>
              </motion.div>
            </motion.div>

            {/* Hero Visual */}
            <PrismVisual />
          </div>
        </div>
      </section>

      {/* Philosophy Section */}
      <section id="philosophy" className="relative z-10 px-6 py-16 bg-white border-y border-stone-200">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={staggerContainer}
            className="text-center"
          >
            <motion.p 
              variants={fadeInUp}
              className="text-sm font-medium uppercase tracking-wide text-accent mb-3"
            >
              The Philosophy
            </motion.p>
            <motion.h2 
              variants={fadeInUp}
              className="text-2xl lg:text-3xl font-bold text-stone-900 mb-4"
            >
              Dependencies aren&apos;t just links;{' '}
              <span className="text-accent">
                they are pivot points.
              </span>
            </motion.h2>
            <motion.p 
              variants={fadeInUp}
              className="text-sm text-stone-500 max-w-2xl mx-auto leading-relaxed"
            >
              Prism allows you to &quot;fork&quot; your timeline at any specific dependency. See how a delay in &quot;Task A&quot; refracts across your entire schedule vs. an alternative plan. Every dependency becomes a lens through which you can view multiple futures.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="relative z-10 px-6 py-16 bg-stone-50">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={staggerContainer}
            className="text-center mb-10"
          >
            <motion.p 
              variants={fadeInUp}
              className="text-sm font-medium uppercase tracking-wide text-accent mb-3"
            >
              Features
            </motion.p>
            <motion.h2 
              variants={fadeInUp}
              className="text-2xl lg:text-3xl font-bold text-stone-900"
            >
              Built for clarity, designed for action
            </motion.h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={staggerContainer}
            className="grid md:grid-cols-2 gap-4"
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
      <section className="relative z-10 px-6 py-12 bg-white border-t border-stone-200">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={fadeIn}
            className="text-center"
          >
            <p className="text-xs font-medium text-stone-400 mb-6">
              Used by small businesses and engineering teams
            </p>
            <div className="flex flex-wrap items-center justify-center gap-6 lg:gap-12">
              {['Cafes', 'Restaurants', 'Event Planning', 'Engineering Teams'].map((company, index) => (
                <motion.div
                  key={company}
                  initial={{ opacity: 0, y: 8 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: index * 0.08 }}
                  className="text-sm font-medium text-stone-300 cursor-default"
                >
                  {company}
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="relative z-10 px-6 py-16 bg-stone-50">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={staggerContainer}
            className="text-center p-8 bg-white rounded-lg border border-stone-200 shadow-sm"
          >
            <motion.h2 
              variants={fadeInUp}
              className="text-xl lg:text-2xl font-bold text-stone-900 mb-4"
            >
              See the full spectrum{' '}
              <span className="text-accent">
                of your project.
              </span>
            </motion.h2>
            
            <motion.div variants={fadeInUp}>
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-accent text-white text-sm font-medium hover:bg-accent-hover transition-colors"
              >
                Get Started
                <ArrowRight size={16} />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 px-6 py-6 border-t border-stone-200 bg-white">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-accent flex items-center justify-center">
              <Sparkles size={12} className="text-white" />
            </div>
            <span className="text-sm font-semibold text-stone-900">Prism</span>
          </div>
          <p className="text-xs text-stone-400">
            © 2026 Prism. Branch from dependencies.
          </p>
        </div>
      </footer>
    </div>
  );
}
