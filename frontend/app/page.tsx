"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  GitBranch,
  Zap,
  Brain,
  ShieldCheck,
  Triangle,
  ArrowRight,
} from "lucide-react";

// Animation variants
const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: "easeOut" },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: { duration: 0.8 },
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-gray-50 to-white text-gray-900 antialiased overflow-x-hidden">
      {/* Navbar */}
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="sticky top-0 z-50 w-full backdrop-blur-xl bg-white/70 border-b border-gray-200/50"
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-2 cursor-pointer">
              <div className="relative w-8 h-8">
                <div
                  className="absolute inset-0 bg-gradient-to-br from-violet-500 via-fuchsia-500 to-cyan-400 opacity-80"
                  style={{
                    clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)",
                  }}
                />
              </div>
              <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                Prism
              </span>
            </div>

            {/* Desktop Nav Links */}
            <div className="hidden md:flex items-center gap-8">
              <a
                href="#"
                className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
              >
                Use Cases
              </a>
              <a
                href="#"
                className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
              >
                Features
              </a>
              <a
                href="#"
                className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
              >
                Pricing
              </a>
            </div>

            {/* CTA Button */}
            <Link
              href="/dashboard"
              className="flex items-center gap-2 h-10 px-5 rounded-lg bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white text-sm font-semibold shadow-lg shadow-violet-500/25 transition-all duration-300 hover:-translate-y-0.5"
            >
              Get Started
            </Link>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <header className="relative pt-24 pb-32 lg:pt-32 lg:pb-40 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 z-0">
          {/* Prismatic gradient orbs */}
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-gradient-to-br from-violet-200 via-fuchsia-200 to-transparent rounded-full blur-3xl opacity-40" />
          <div className="absolute top-40 right-1/4 w-80 h-80 bg-gradient-to-bl from-cyan-200 via-blue-200 to-transparent rounded-full blur-3xl opacity-30" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-1/2 bg-gradient-to-t from-gray-50 to-transparent" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div
            initial="initial"
            animate="animate"
            variants={staggerContainer}
            className="flex flex-col items-center text-center"
          >
            {/* Badge */}
            <motion.div
              variants={fadeInUp}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-violet-50 to-fuchsia-50 border border-violet-200/50 mb-8"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-500" />
              </span>
              <span className="text-xs font-semibold text-violet-700 uppercase tracking-wide">
                For Engineering Teams & Small Businesses
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              variants={fadeInUp}
              className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6 leading-[1.1]"
            >
              <span className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent">
                Refract Your
              </span>
              <br />
              <span className="bg-gradient-to-r from-violet-600 via-fuchsia-600 to-cyan-500 bg-clip-text text-transparent">
                Risk.
              </span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              variants={fadeInUp}
              className="max-w-2xl text-lg md:text-xl text-gray-500 mb-12 leading-relaxed"
            >
              Stop viewing your project as a single linear path. Branch from
              your critical dependencies to simulate every possible outcome.
            </motion.p>

            {/* CTA */}
            <motion.div variants={fadeInUp}>
              <Link
                href="/dashboard"
                className="group inline-flex items-center gap-3 h-14 px-8 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white text-base font-bold shadow-xl shadow-violet-500/30 transition-all duration-300 hover:-translate-y-1"
              >
                Start Branching
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>

            {/* Visual: Beam Splitting Graphic */}
            <motion.div
              variants={fadeIn}
              transition={{ delay: 0.4, duration: 1 }}
              className="mt-20 w-full max-w-4xl"
            >
              <div className="relative h-64 lg:h-80 rounded-2xl bg-white/50 backdrop-blur-sm border border-gray-200/60 shadow-2xl shadow-gray-200/50 overflow-hidden">
                {/* Grid Pattern */}
                <div
                  className="absolute inset-0 opacity-30"
                  style={{
                    backgroundImage:
                      "linear-gradient(to right, #e5e7eb 1px, transparent 1px), linear-gradient(to bottom, #e5e7eb 1px, transparent 1px)",
                    backgroundSize: "24px 24px",
                  }}
                />

                {/* Beam Visualization */}
                <svg
                  className="absolute inset-0 w-full h-full"
                  viewBox="0 0 800 300"
                  preserveAspectRatio="xMidYMid meet"
                >
                  {/* Incoming beam */}
                  <motion.line
                    x1="50"
                    y1="150"
                    x2="350"
                    y2="150"
                    stroke="url(#beamGradient)"
                    strokeWidth="4"
                    strokeLinecap="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1, delay: 0.5 }}
                  />

                  {/* Prism node */}
                  <motion.polygon
                    points="350,110 390,190 310,190"
                    fill="url(#prismGradient)"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 1.2 }}
                    style={{ transformOrigin: "350px 150px" }}
                  />

                  {/* Refracted beams */}
                  <motion.line
                    x1="390"
                    y1="140"
                    x2="700"
                    y2="60"
                    stroke="#8b5cf6"
                    strokeWidth="3"
                    strokeLinecap="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.8, delay: 1.5 }}
                  />
                  <motion.line
                    x1="390"
                    y1="150"
                    x2="700"
                    y2="150"
                    stroke="#d946ef"
                    strokeWidth="3"
                    strokeLinecap="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.8, delay: 1.7 }}
                  />
                  <motion.line
                    x1="390"
                    y1="160"
                    x2="700"
                    y2="240"
                    stroke="#06b6d4"
                    strokeWidth="3"
                    strokeLinecap="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.8, delay: 1.9 }}
                  />

                  {/* Scenario labels */}
                  <motion.g
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 2.5, duration: 0.5 }}
                  >
                    <text
                      x="710"
                      y="65"
                      className="text-xs fill-violet-600 font-semibold"
                    >
                      Scenario A
                    </text>
                    <text
                      x="710"
                      y="155"
                      className="text-xs fill-fuchsia-600 font-semibold"
                    >
                      Scenario B
                    </text>
                    <text
                      x="710"
                      y="245"
                      className="text-xs fill-cyan-600 font-semibold"
                    >
                      Scenario C
                    </text>
                  </motion.g>

                  {/* Gradient definitions */}
                  <defs>
                    <linearGradient
                      id="beamGradient"
                      x1="0%"
                      y1="0%"
                      x2="100%"
                      y2="0%"
                    >
                      <stop offset="0%" stopColor="#6b7280" />
                      <stop offset="100%" stopColor="#374151" />
                    </linearGradient>
                    <linearGradient
                      id="prismGradient"
                      x1="0%"
                      y1="0%"
                      x2="100%"
                      y2="100%"
                    >
                      <stop offset="0%" stopColor="#8b5cf6" />
                      <stop offset="50%" stopColor="#d946ef" />
                      <stop offset="100%" stopColor="#06b6d4" />
                    </linearGradient>
                  </defs>
                </svg>

                {/* Labels */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  className="absolute left-12 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-medium text-gray-700"
                >
                  Your Timeline
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1.3 }}
                  className="absolute left-[42%] top-[72%] bg-gradient-to-r from-violet-600 to-fuchsia-600 px-3 py-1.5 rounded-lg text-xs font-bold text-white shadow-lg"
                >
                  Dependency Node
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </header>

      {/* Dual-Audience Problem/Solution Section */}
      <section className="py-24 lg:py-32 bg-gradient-to-b from-gray-50 to-white relative">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="text-center mb-20"
          >
            <motion.p
              variants={fadeInUp}
              className="text-sm font-semibold text-violet-600 uppercase tracking-wider mb-4"
            >
              The Philosophy
            </motion.p>
            <motion.h2
              variants={fadeInUp}
              className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 tracking-tight mb-6"
            >
              Dependencies aren&apos;t just links;
              <br />
              <span className="bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
                they are pivot points.
              </span>
            </motion.h2>
            <motion.p
              variants={fadeInUp}
              className="text-lg text-gray-500 max-w-3xl mx-auto leading-relaxed"
            >
              Prism allows you to &quot;fork&quot; your timeline at any specific
              dependency. See how a delay in &quot;Task A&quot; refracts across
              your entire schedule vs. an alternative plan.
            </motion.p>
          </motion.div>

          {/* Two-column cards */}
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="grid md:grid-cols-2 gap-8 relative"
          >
            {/* Connector */}
            <div className="hidden md:flex absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
              <div className="bg-white rounded-full p-3 border border-gray-200 shadow-lg">
                <Triangle className="w-6 h-6 text-violet-600 rotate-90" />
              </div>
            </div>

            {/* Engineering Teams Card */}
            <motion.div
              variants={fadeInUp}
              className="relative bg-white rounded-2xl p-8 lg:p-10 border border-gray-200 shadow-sm hover:shadow-xl transition-shadow duration-300 overflow-hidden group"
            >
              <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                <GitBranch className="w-32 h-32 text-gray-900" />
              </div>
              <div className="relative z-10">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-violet-100 to-fuchsia-100 flex items-center justify-center text-violet-600 mb-6">
                  <GitBranch className="w-7 h-7" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Engineering Teams
                </h3>
                <p className="text-gray-500 leading-relaxed mb-6">
                  Manage complex dependencies and critical paths for technical
                  projects. When a component is delayed, instantly see the
                  impact on downstream deliverables.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-center gap-3 text-sm text-gray-700">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                      <span className="w-2 h-2 rounded-full bg-green-500" />
                    </span>
                    Dependency Chain Mapping
                  </li>
                  <li className="flex items-center gap-3 text-sm text-gray-700">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                      <span className="w-2 h-2 rounded-full bg-green-500" />
                    </span>
                    Multi-Scenario Branching
                  </li>
                </ul>
              </div>
            </motion.div>

            {/* Small Business Card */}
            <motion.div
              variants={fadeInUp}
              className="relative bg-white rounded-2xl p-8 lg:p-10 border border-gray-200 shadow-sm hover:shadow-xl transition-shadow duration-300 overflow-hidden group"
            >
              <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                <Zap className="w-32 h-32 text-gray-900" />
              </div>
              <div className="relative z-10">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-cyan-100 to-blue-100 flex items-center justify-center text-cyan-600 mb-6">
                  <Zap className="w-7 h-7" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Small Business Owners
                </h3>
                <p className="text-gray-500 leading-relaxed mb-6">
                  Focus on hard deadlines and business milestones. Bridge the
                  gap between operational realities and project dependencies.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-center gap-3 text-sm text-gray-700">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                      <span className="w-2 h-2 rounded-full bg-green-500" />
                    </span>
                    Launch Deadline Tracking
                  </li>
                  <li className="flex items-center gap-3 text-sm text-gray-700">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                      <span className="w-2 h-2 rounded-full bg-green-500" />
                    </span>
                    Risk Impact Visualization
                  </li>
                </ul>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 lg:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="mb-16"
          >
            <motion.h2
              variants={fadeInUp}
              className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight mb-4"
            >
              Engineered for Clarity
            </motion.h2>
            <motion.p
              variants={fadeInUp}
              className="text-lg text-gray-500 max-w-2xl"
            >
              Powerful tools designed to illuminate every path forward and
              protect your plans from chaos.
            </motion.p>
          </motion.div>

          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {/* Feature 1: Dependency Branching */}
            <motion.div
              variants={fadeInUp}
              className="group relative p-6 rounded-2xl bg-white/50 backdrop-blur-sm border border-gray-200/80 hover:border-violet-200 hover:bg-gradient-to-br hover:from-white hover:to-violet-50/50 transition-all duration-300 cursor-default"
              style={{
                boxShadow:
                  "0 4px 24px -4px rgba(139, 92, 246, 0.08), 0 0 0 1px rgba(255, 255, 255, 0.5) inset",
              }}
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-100 to-fuchsia-100 border border-violet-200/50 flex items-center justify-center text-violet-600 mb-5 group-hover:scale-110 transition-transform duration-300">
                <GitBranch className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                Dependency Branching
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                Right-click any dependency to spawn a &quot;What-If&quot;
                scenario instantly.
              </p>
            </motion.div>

            {/* Feature 2: The Reality Engine */}
            <motion.div
              variants={fadeInUp}
              className="group relative p-6 rounded-2xl bg-white/50 backdrop-blur-sm border border-gray-200/80 hover:border-fuchsia-200 hover:bg-gradient-to-br hover:from-white hover:to-fuchsia-50/50 transition-all duration-300 cursor-default"
              style={{
                boxShadow:
                  "0 4px 24px -4px rgba(217, 70, 239, 0.08), 0 0 0 1px rgba(255, 255, 255, 0.5) inset",
              }}
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-fuchsia-100 to-pink-100 border border-fuchsia-200/50 flex items-center justify-center text-fuchsia-600 mb-5 group-hover:scale-110 transition-transform duration-300">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                The Reality Engine
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                A Critical Path view that highlights exactly which dependencies
                are load-bearing.
              </p>
            </motion.div>

            {/* Feature 3: AI Pathfinder */}
            <motion.div
              variants={fadeInUp}
              className="group relative p-6 rounded-2xl bg-white/50 backdrop-blur-sm border border-gray-200/80 hover:border-cyan-200 hover:bg-gradient-to-br hover:from-white hover:to-cyan-50/50 transition-all duration-300 cursor-default"
              style={{
                boxShadow:
                  "0 4px 24px -4px rgba(6, 182, 212, 0.08), 0 0 0 1px rgba(255, 255, 255, 0.5) inset",
              }}
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-100 to-blue-100 border border-cyan-200/50 flex items-center justify-center text-cyan-600 mb-5 group-hover:scale-110 transition-transform duration-300">
                <Brain className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                AI Pathfinder
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                Let AI analyze your dependency chain and suggest the optimal
                path forward.
              </p>
            </motion.div>

            {/* Feature 4: Logic Guard */}
            <motion.div
              variants={fadeInUp}
              className="group relative p-6 rounded-2xl bg-white/50 backdrop-blur-sm border border-gray-200/80 hover:border-emerald-200 hover:bg-gradient-to-br hover:from-white hover:to-emerald-50/50 transition-all duration-300 cursor-default"
              style={{
                boxShadow:
                  "0 4px 24px -4px rgba(16, 185, 129, 0.08), 0 0 0 1px rgba(255, 255, 255, 0.5) inset",
              }}
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-100 to-green-100 border border-emerald-200/50 flex items-center justify-center text-emerald-600 mb-5 group-hover:scale-110 transition-transform duration-300">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                Logic Guard
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                Real-time cycle detection prevents impossible loops before they
                break your plan.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-16 bg-gradient-to-b from-white to-gray-50 border-y border-gray-100">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-7xl mx-auto px-6 lg:px-8"
        >
          <p className="text-center text-sm font-semibold text-gray-400 uppercase tracking-wider mb-10">
            Used by teams who can&apos;t afford a single point of failure
          </p>
          <div className="flex flex-wrap justify-center items-center gap-x-12 gap-y-6 opacity-60 hover:opacity-100 transition-opacity duration-500">
            <span className="text-lg font-bold text-gray-700 tracking-tight">
              Apex Engineering
            </span>
            <span className="text-lg font-bold text-gray-700 tracking-tight">
              Venue 54
            </span>
            <span className="text-lg font-bold text-gray-700 tracking-tight">
              Formula UBC
            </span>
            <span className="text-lg font-bold text-gray-700 tracking-tight">
              Momentum Hardware
            </span>
          </div>
        </motion.div>
      </section>

      {/* Footer CTA */}
      <section className="py-24 lg:py-32 px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-5xl mx-auto rounded-3xl bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-12 lg:p-20 text-center relative overflow-hidden shadow-2xl"
        >
          {/* Prismatic decorative elements */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-violet-500 to-fuchsia-500 opacity-15 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-cyan-500 to-blue-500 opacity-15 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3" />

          {/* Iridescent border effect */}
          <div
            className="absolute inset-0 rounded-3xl opacity-30"
            style={{
              background:
                "linear-gradient(135deg, rgba(139, 92, 246, 0.3) 0%, rgba(217, 70, 239, 0.3) 50%, rgba(6, 182, 212, 0.3) 100%)",
              padding: "1px",
              mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
              maskComposite: "xor",
              WebkitMaskComposite: "xor",
            }}
          />

          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white tracking-tight mb-6">
              See the full spectrum
              <br />
              <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent">
                of your project.
              </span>
            </h2>
            <p className="text-gray-400 text-lg max-w-xl mx-auto mb-10 leading-relaxed">
              Stop guessing how delays affect your launch. Start illuminating
              every possible path forward with Prism.
            </p>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-3 h-14 px-10 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white text-base font-bold shadow-xl shadow-violet-900/50 transition-all duration-300 hover:-translate-y-1"
            >
              Get Started
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Simple Footer */}
      <footer className="py-12 border-t border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="relative w-6 h-6">
              <div
                className="absolute inset-0 bg-gradient-to-br from-violet-500 via-fuchsia-500 to-cyan-400 opacity-60"
                style={{
                  clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)",
                }}
              />
            </div>
            <span className="text-sm font-semibold text-gray-500">
              © 2026 Prism
            </span>
          </div>
          <div className="flex gap-6">
            <a href="#" className="text-sm text-gray-500 hover:text-gray-700">
              Privacy
            </a>
            <a href="#" className="text-sm text-gray-500 hover:text-gray-700">
              Terms
            </a>
            <a href="#" className="text-sm text-gray-500 hover:text-gray-700">
              Contact
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
