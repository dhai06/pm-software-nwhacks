"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  GitBranch,
  Cpu,
  Sparkles,
  ShieldCheck,
  ChevronRight,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1 },
};

// Navbar Component
function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-white/70 border-b border-gray-200/50"
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="relative w-8 h-8">
              <div className="absolute inset-0 bg-gradient-to-br from-violet-500 via-fuchsia-500 to-cyan-400 rounded-lg rotate-45 opacity-80" />
              <div className="absolute inset-1 bg-white rounded-md rotate-45" />
              <div className="absolute inset-2 bg-gradient-to-br from-violet-500 via-fuchsia-500 to-cyan-400 rounded-sm rotate-45" />
            </div>
            <span className="text-xl font-semibold tracking-tight text-gray-900">
              Prism
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <a
              href="#use-cases"
              className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
            >
              Use Cases
            </a>
            <a
              href="#features"
              className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
            >
              Features
            </a>
            <a
              href="#pricing"
              className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
            >
              Pricing
            </a>
          </div>

          {/* CTA Button */}
          <div className="hidden md:block">
            <Link
              href="/dashboard"
              className="inline-flex items-center px-5 py-2.5 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-all duration-200 shadow-lg shadow-gray-900/20 hover:shadow-xl hover:shadow-gray-900/30 hover:-translate-y-0.5"
            >
              Get Started
              <ChevronRight className="ml-1 w-4 h-4" />
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 text-gray-600 hover:text-gray-900"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden py-4 border-t border-gray-200/50"
          >
            <div className="flex flex-col space-y-4">
              <a
                href="#use-cases"
                className="text-sm font-medium text-gray-600 hover:text-gray-900"
              >
                Use Cases
              </a>
              <a
                href="#features"
                className="text-sm font-medium text-gray-600 hover:text-gray-900"
              >
                Features
              </a>
              <a
                href="#pricing"
                className="text-sm font-medium text-gray-600 hover:text-gray-900"
              >
                Pricing
              </a>
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-medium text-white bg-gray-900 rounded-lg"
              >
                Get Started
              </Link>
            </div>
          </motion.div>
        )}
      </div>
    </motion.nav>
  );
}

// Prismatic Visual Component for Hero
function PrismVisual() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
      className="relative w-full max-w-2xl mx-auto h-80 lg:h-96"
    >
      {/* Background glow */}
      <div className="absolute inset-0 bg-gradient-to-r from-violet-200/30 via-fuchsia-200/30 to-cyan-200/30 blur-3xl rounded-full" />

      {/* Main visual container */}
      <div className="relative h-full flex items-center justify-center">
        {/* Input beam */}
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: "120px" }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="absolute left-[10%] top-1/2 -translate-y-1/2 h-3 bg-gradient-to-r from-gray-300 to-gray-400 rounded-full shadow-lg"
        />

        {/* Dependency Node (Prism) */}
        <motion.div
          initial={{ scale: 0, rotate: -45 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 0.5, delay: 0.8, type: "spring" }}
          className="absolute left-[25%] top-1/2 -translate-y-1/2 w-16 h-16"
        >
          <div className="relative w-full h-full">
            <div className="absolute inset-0 bg-gradient-to-br from-violet-500 via-fuchsia-500 to-cyan-400 rounded-xl rotate-45 shadow-2xl shadow-fuchsia-500/30" />
            <div className="absolute inset-2 bg-white/90 rounded-lg rotate-45 backdrop-blur-sm" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs font-bold text-gray-700 z-10">DEP</span>
            </div>
          </div>
        </motion.div>

        {/* Output beams - Three scenarios */}
        <svg
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 600 300"
          fill="none"
        >
          {/* Top path - Scenario A */}
          <motion.path
            d="M 180 150 Q 300 50 520 60"
            stroke="url(#gradient1)"
            strokeWidth="4"
            strokeLinecap="round"
            fill="none"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.8, delay: 1.0 }}
          />
          {/* Middle path - Scenario B */}
          <motion.path
            d="M 180 150 Q 300 150 520 150"
            stroke="url(#gradient2)"
            strokeWidth="4"
            strokeLinecap="round"
            fill="none"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.8, delay: 1.1 }}
          />
          {/* Bottom path - Scenario C */}
          <motion.path
            d="M 180 150 Q 300 250 520 240"
            stroke="url(#gradient3)"
            strokeWidth="4"
            strokeLinecap="round"
            fill="none"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.8, delay: 1.2 }}
          />
          <defs>
            <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#8B5CF6" />
              <stop offset="100%" stopColor="#06B6D4" />
            </linearGradient>
            <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#D946EF" />
              <stop offset="100%" stopColor="#F472B6" />
            </linearGradient>
            <linearGradient id="gradient3" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#EF4444" />
            </linearGradient>
          </defs>
        </svg>

        {/* Scenario Labels */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 1.4 }}
          className="absolute right-[5%] top-[15%] px-3 py-1.5 bg-gradient-to-r from-violet-500/10 to-cyan-500/10 backdrop-blur-sm border border-violet-200/50 rounded-lg"
        >
          <span className="text-xs font-medium text-violet-700">
            Scenario A: On-Time
          </span>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 1.5 }}
          className="absolute right-[5%] top-[47%] px-3 py-1.5 bg-gradient-to-r from-fuchsia-500/10 to-pink-500/10 backdrop-blur-sm border border-fuchsia-200/50 rounded-lg"
        >
          <span className="text-xs font-medium text-fuchsia-700">
            Scenario B: +2 Days
          </span>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 1.6 }}
          className="absolute right-[5%] bottom-[15%] px-3 py-1.5 bg-gradient-to-r from-amber-500/10 to-red-500/10 backdrop-blur-sm border border-amber-200/50 rounded-lg"
        >
          <span className="text-xs font-medium text-amber-700">
            Scenario C: Alt Path
          </span>
        </motion.div>
      </div>
    </motion.div>
  );
}

// Hero Section
function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center pt-16 overflow-hidden">
      {/* Background gradients */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-50 via-white to-gray-50" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-200/30 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-200/30 rounded-full blur-3xl" />
      <div className="absolute top-1/3 right-1/3 w-64 h-64 bg-fuchsia-200/20 rounded-full blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8 py-20 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Text Content */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="text-center lg:text-left"
          >
            <motion.div
              variants={fadeInUp}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center px-3 py-1 mb-6 text-xs font-medium text-violet-700 bg-violet-100/80 rounded-full border border-violet-200/50 backdrop-blur-sm"
            >
              <Sparkles className="w-3 h-3 mr-1.5" />
              Project Management, Reimagined
            </motion.div>

            <motion.h1
              variants={fadeInUp}
              transition={{ duration: 0.6 }}
              className="text-5xl lg:text-7xl font-bold tracking-tight text-gray-900 mb-6"
            >
              Refract Your{" "}
              <span className="relative">
                <span className="bg-gradient-to-r from-violet-600 via-fuchsia-500 to-cyan-500 bg-clip-text text-transparent">
                  Risk
                </span>
                <span className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-violet-600 via-fuchsia-500 to-cyan-500 rounded-full opacity-50" />
              </span>
              .
            </motion.h1>

            <motion.p
              variants={fadeInUp}
              transition={{ duration: 0.6 }}
              className="text-lg lg:text-xl text-gray-600 max-w-xl mx-auto lg:mx-0 mb-8 leading-relaxed"
            >
              Stop viewing your project as a single linear path. Branch from
              your critical dependencies to simulate every possible outcome.
            </motion.p>

            <motion.div
              variants={fadeInUp}
              transition={{ duration: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
            >
              <Link
                href="/dashboard"
                className="group inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-white bg-gray-900 rounded-xl hover:bg-gray-800 transition-all duration-300 shadow-xl shadow-gray-900/20 hover:shadow-2xl hover:shadow-gray-900/30 hover:-translate-y-1"
              >
                Start Branching
                <GitBranch className="ml-2 w-5 h-5 group-hover:rotate-12 transition-transform" />
              </Link>
            </motion.div>
          </motion.div>

          {/* Visual */}
          <div className="relative">
            <PrismVisual />
          </div>
        </div>
      </div>
    </section>
  );
}

// Problem/Solution Section
function ProblemSolutionSection() {
  return (
    <section id="use-cases" className="relative py-24 lg:py-32 overflow-hidden">
      {/* Subtle background */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-50 to-white" />

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
          className="grid lg:grid-cols-2 gap-16 lg:gap-24"
        >
          {/* The Philosophy */}
          <motion.div variants={fadeInUp} transition={{ duration: 0.6 }}>
            <div className="relative">
              <div className="absolute -left-4 top-0 w-1 h-full bg-gradient-to-b from-violet-500 to-fuchsia-500 rounded-full" />
              <div className="pl-8">
                <span className="text-sm font-semibold text-violet-600 tracking-wider uppercase">
                  The Philosophy
                </span>
                <h2 className="mt-4 text-3xl lg:text-4xl font-bold text-gray-900 leading-tight">
                  Dependencies aren&apos;t just links; they are{" "}
                  <span className="bg-gradient-to-r from-violet-600 to-fuchsia-500 bg-clip-text text-transparent">
                    pivot points
                  </span>
                  .
                </h2>
                <p className="mt-6 text-lg text-gray-600 leading-relaxed">
                  Every dependency in your project represents a decision point
                  where reality could branch in multiple directions. Traditional
                  tools show you one path. Prism shows you all of them.
                </p>
              </div>
            </div>
          </motion.div>

          {/* The Solution */}
          <motion.div variants={fadeInUp} transition={{ duration: 0.6 }}>
            <div className="relative">
              <div className="absolute -left-4 top-0 w-1 h-full bg-gradient-to-b from-cyan-500 to-emerald-500 rounded-full" />
              <div className="pl-8">
                <span className="text-sm font-semibold text-cyan-600 tracking-wider uppercase">
                  The Solution
                </span>
                <h2 className="mt-4 text-3xl lg:text-4xl font-bold text-gray-900 leading-tight">
                  Fork your timeline at{" "}
                  <span className="bg-gradient-to-r from-cyan-600 to-emerald-500 bg-clip-text text-transparent">
                    any dependency
                  </span>
                  .
                </h2>
                <p className="mt-6 text-lg text-gray-600 leading-relaxed">
                  Prism allows you to &quot;fork&quot; your timeline at any
                  specific dependency. See how a delay in &quot;Task A&quot;
                  refracts across your entire schedule vs. an alternative plan.
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

// Feature Card Component
function FeatureCard({
  icon: Icon,
  title,
  description,
  gradient,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  gradient: string;
}) {
  return (
    <motion.div
      variants={scaleIn}
      transition={{ duration: 0.5 }}
      whileHover={{ y: -8, transition: { duration: 0.2 } }}
      className="group relative"
    >
      {/* Glassmorphism card */}
      <div className="relative h-full p-8 rounded-2xl bg-white/60 backdrop-blur-xl border border-gray-200/50 shadow-xl shadow-gray-200/20 hover:shadow-2xl hover:shadow-gray-300/30 transition-all duration-300 overflow-hidden">
        {/* Gradient accent */}
        <div
          className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${gradient}`}
        />

        {/* Icon */}
        <div
          className={`inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br ${gradient} shadow-lg mb-6`}
        >
          <Icon className="w-7 h-7 text-white" />
        </div>

        {/* Content */}
        <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
        <p className="text-gray-600 leading-relaxed">{description}</p>

        {/* Hover glow effect */}
        <div
          className={`absolute -bottom-20 -right-20 w-40 h-40 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-10 blur-3xl transition-opacity duration-500 rounded-full`}
        />
      </div>
    </motion.div>
  );
}

// Features Section
function FeaturesSection() {
  const features = [
    {
      icon: GitBranch,
      title: "Dependency Branching",
      description:
        "Right-click any dependency to spawn a 'What-If' scenario instantly. Explore parallel timelines without affecting your main plan.",
      gradient: "from-violet-500 to-purple-600",
    },
    {
      icon: Cpu,
      title: "The Reality Engine",
      description:
        "A Critical Path view that highlights exactly which dependencies are load-bearing. Know what matters before it breaks.",
      gradient: "from-fuchsia-500 to-pink-600",
    },
    {
      icon: Sparkles,
      title: "AI Pathfinder",
      description:
        "Let AI analyze your dependency chain and suggest the optimal path forward. Smart recommendations, not guesswork.",
      gradient: "from-cyan-500 to-blue-600",
    },
    {
      icon: ShieldCheck,
      title: "Logic Guard",
      description:
        "Real-time cycle detection prevents impossible loops before they break your plan. Your timeline stays consistent.",
      gradient: "from-emerald-500 to-teal-600",
    },
  ];

  return (
    <section id="features" className="relative py-24 lg:py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-white via-gray-50/50 to-white" />
      <div className="absolute top-1/2 left-0 w-72 h-72 bg-violet-200/20 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-72 h-72 bg-cyan-200/20 rounded-full blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeInUp}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-sm font-semibold text-fuchsia-600 tracking-wider uppercase">
            Features
          </span>
          <h2 className="mt-4 text-4xl lg:text-5xl font-bold text-gray-900">
            Built for{" "}
            <span className="bg-gradient-to-r from-violet-600 via-fuchsia-500 to-cyan-500 bg-clip-text text-transparent">
              clarity
            </span>
          </h2>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            Every feature is designed to illuminate your project&apos;s true
            complexity.
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
          className="grid md:grid-cols-2 gap-8"
        >
          {features.map((feature) => (
            <FeatureCard key={feature.title} {...feature} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// Social Proof Section
function SocialProofSection() {
  const logos = [
    "Apex Engineering",
    "Venue 54",
    "Formula UBC",
    "Momentum Hardware",
  ];

  return (
    <section className="relative py-20 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gray-900" />
      <div className="absolute inset-0 bg-gradient-to-r from-violet-900/20 via-fuchsia-900/20 to-cyan-900/20" />

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
          className="text-center"
        >
          <motion.p
            variants={fadeIn}
            transition={{ duration: 0.6 }}
            className="text-lg text-gray-400 mb-12"
          >
            Used by teams who can&apos;t afford a single point of failure.
          </motion.p>

          <motion.div
            variants={fadeIn}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-wrap justify-center items-center gap-8 lg:gap-16"
          >
            {logos.map((logo, index) => (
              <motion.div
                key={logo}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="px-6 py-3 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10"
              >
                <span className="text-lg font-semibold text-white/70">
                  {logo}
                </span>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

// Footer CTA Section
function FooterCTASection() {
  return (
    <section id="pricing" className="relative py-24 lg:py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-white to-gray-50" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-violet-200/30 via-fuchsia-200/30 to-cyan-200/30 rounded-full blur-3xl" />

      <div className="relative max-w-4xl mx-auto px-6 lg:px-8 text-center">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
        >
          <motion.h2
            variants={fadeInUp}
            transition={{ duration: 0.6 }}
            className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6"
          >
            See the{" "}
            <span className="bg-gradient-to-r from-violet-600 via-fuchsia-500 to-cyan-500 bg-clip-text text-transparent">
              full spectrum
            </span>{" "}
            of your project.
          </motion.h2>

          <motion.p
            variants={fadeInUp}
            transition={{ duration: 0.6 }}
            className="text-lg text-gray-600 max-w-2xl mx-auto mb-10"
          >
            Stop guessing. Start branching. Transform uncertainty into clarity
            with Prism.
          </motion.p>

          <motion.div variants={fadeInUp} transition={{ duration: 0.6 }}>
            <Link
              href="/dashboard"
              className="group inline-flex items-center justify-center px-10 py-5 text-lg font-semibold text-white bg-gray-900 rounded-2xl hover:bg-gray-800 transition-all duration-300 shadow-2xl shadow-gray-900/30 hover:shadow-3xl hover:shadow-gray-900/40 hover:-translate-y-1"
            >
              Get Started
              <ChevronRight className="ml-2 w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>

          {/* Decorative prism element */}
          <motion.div
            variants={scaleIn}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-16 flex justify-center"
          >
            <div className="relative w-24 h-24">
              <div className="absolute inset-0 bg-gradient-to-br from-violet-500 via-fuchsia-500 to-cyan-400 rounded-2xl rotate-45 shadow-2xl shadow-fuchsia-500/30 animate-pulse" />
              <div className="absolute inset-2 bg-white/90 rounded-xl rotate-45 backdrop-blur-sm" />
              <div className="absolute inset-4 bg-gradient-to-br from-violet-500 via-fuchsia-500 to-cyan-400 rounded-lg rotate-45" />
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

// Footer
function Footer() {
  return (
    <footer className="relative py-12 bg-gray-900 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="relative w-6 h-6">
              <div className="absolute inset-0 bg-gradient-to-br from-violet-500 via-fuchsia-500 to-cyan-400 rounded-md rotate-45 opacity-80" />
              <div className="absolute inset-0.5 bg-gray-900 rounded-sm rotate-45" />
              <div className="absolute inset-1.5 bg-gradient-to-br from-violet-500 via-fuchsia-500 to-cyan-400 rounded-sm rotate-45" />
            </div>
            <span className="text-lg font-semibold text-white">Prism</span>
          </div>

          {/* Copyright */}
          <p className="text-sm text-gray-500">
            {new Date().getFullYear()} Prism. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

// Main Landing Page Component
export default function LandingPage() {
  return (
    <main className="min-h-screen bg-white antialiased">
      <Navbar />
      <HeroSection />
      <ProblemSolutionSection />
      <FeaturesSection />
      <SocialProofSection />
      <FooterCTASection />
      <Footer />
    </main>
  );
}
