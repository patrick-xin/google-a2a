"use client";

import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import {
  ArrowRight,
  BookOpen,
  Code2,
  Github,
  Users,
  Sparkles,
  ExternalLink,
  Play,
  FileText,
} from "lucide-react";

const A2AGetStartedSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, {
    once: true,
    amount: 0.1,
    margin: "0px 0px -100px 0px",
  });

  const resources = [
    {
      title: "Documentation",
      description: "Complete protocol specification, guides, and API reference",
      icon: BookOpen,
      link: "/docs",
      gradient: "from-blue-500 to-cyan-500",
      badge: "Essential",
    },
    {
      title: "Python Tutorial",
      description:
        "Step-by-step tutorial to build your first A2A agent from scratch",
      icon: Code2,
      link: "/docs/tutorials/python",
      gradient: "from-green-500 to-emerald-500",
      badge: "Beginner",
    },
    {
      title: "GitHub Samples",
      description:
        "Ready-to-run examples and integrations with popular frameworks",
      icon: Github,
      link: "https://github.com/google-a2a/a2a-samples",
      gradient: "from-purple-500 to-pink-500",
      badge: "Examples",
    },
    {
      title: "Community",
      description:
        "Join discussions, contribute, and get help from the community",
      icon: Users,
      link: "/docs/community",
      gradient: "from-orange-500 to-red-500",
      badge: "Support",
    },
  ];

  const quickLinks = [
    { title: "Watch Demo Video", icon: Play, link: "#demo" },
    {
      title: "View Specification",
      icon: FileText,
      link: "/docs/specification",
    },
    {
      title: "Browse Examples",
      icon: Code2,
      link: "https://github.com/google-a2a/a2a-samples",
    },
  ];

  // Animation variants
  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    animate: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  const staggerContainer = {
    initial: {},
    animate: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  return (
    <section
      ref={ref}
      className="py-24 bg-gradient-to-b from-primary/5 to-transparent relative overflow-hidden"
    >
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_80%,rgba(120,119,198,0.1),transparent_50%)]" />

      <div className="container mx-auto px-4 relative">
        {/* Section Header */}
        <motion.div
          initial="initial"
          animate={isInView ? "animate" : "initial"}
          variants={fadeInUp}
          className="text-center max-w-4xl mx-auto mb-20"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 rounded-full mb-8">
            <Sparkles className="w-5 h-5 text-primary" />
            <span className="text-sm font-medium text-primary">
              Start Building Today
            </span>
          </div>

          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            Get{" "}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Started
            </span>
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
            Everything you need to start building with A2A today—from
            documentation to working examples
          </p>
        </motion.div>

        {/* Resource Cards */}
        <motion.div
          initial="initial"
          animate={isInView ? "animate" : "initial"}
          variants={staggerContainer}
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20 max-w-7xl mx-auto"
        >
          {resources.map((resource, index) => (
            <motion.div
              key={resource.title}
              variants={fadeInUp}
              transition={{ delay: index * 0.1 }}
              whileHover={{
                y: -8,
                transition: { duration: 0.2, ease: "easeOut" },
              }}
              className="group cursor-pointer h-full"
            >
              <div className="bg-card border border-border rounded-2xl p-8 h-full transition-all duration-300 hover:shadow-xl hover:shadow-primary/10 relative overflow-hidden">
                {/* Background gradient on hover */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${resource.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}
                />

                {/* Badge */}
                <div className="absolute top-4 right-4">
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full bg-gradient-to-r ${resource.gradient} text-white`}
                  >
                    {resource.badge}
                  </span>
                </div>

                <div className="relative">
                  {/* Icon */}
                  <div
                    className={`inline-flex p-4 rounded-xl bg-gradient-to-br ${resource.gradient} mb-6 shadow-lg`}
                  >
                    <resource.icon className="w-8 h-8 text-white" />
                  </div>

                  {/* Content */}
                  <h3 className="text-xl md:text-2xl font-bold mb-4 group-hover:text-primary transition-colors duration-300">
                    {resource.title}
                  </h3>

                  <p className="text-muted-foreground leading-relaxed mb-6 text-sm">
                    {resource.description}
                  </p>

                  {/* Link */}
                  <div className="flex items-center gap-2 text-primary opacity-70 group-hover:opacity-100 group-hover:gap-3 transition-all duration-300">
                    <span className="text-sm font-medium">Explore</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Quick Links */}
        <motion.div
          initial="initial"
          animate={isInView ? "animate" : "initial"}
          variants={fadeInUp}
          transition={{ delay: 0.5 }}
          className="text-center mb-16"
        >
          <h3 className="text-2xl font-bold mb-8">Quick Links</h3>
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-2xl mx-auto">
            {quickLinks.map((link) => (
              <motion.button
                key={link.title}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-3 px-6 py-3 bg-card border border-border rounded-xl hover:bg-accent hover:border-accent-foreground/20 transition-all duration-200 group"
              >
                <link.icon className="w-5 h-5" />
                <span className="font-medium">{link.title}</span>
                <ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Main CTA */}
        <motion.div
          initial="initial"
          animate={isInView ? "animate" : "initial"}
          variants={fadeInUp}
          transition={{ delay: 0.6 }}
          className="text-center"
        >
          <div className="max-w-3xl mx-auto bg-card border border-border rounded-2xl p-12 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5" />

            <div className="relative">
              <h3 className="text-3xl md:text-4xl font-bold mb-6">
                Ready to Connect Your Agents?
              </h3>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                Join the growing ecosystem of developers building the future of
                AI collaboration.
                <br className="hidden md:block" />
                Start with our quickstart guide and have your first A2A agent
                running in minutes.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="group bg-gradient-to-r from-primary to-accent text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 hover:shadow-lg hover:shadow-primary/25 flex items-center gap-3 justify-center"
                >
                  <Sparkles className="w-5 h-5" />
                  Start Building with A2A
                  <ArrowRight className="w-5 h-5 transition-transform duration-200 group-hover:translate-x-1" />
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="group border border-border px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 hover:bg-accent hover:border-accent-foreground/20 flex items-center gap-3 justify-center backdrop-blur-sm"
                >
                  <Github className="w-5 h-5" />
                  View on GitHub
                  <ExternalLink className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1 group-hover:-translate-y-1" />
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Bottom note */}
        <motion.div
          initial="initial"
          animate={isInView ? "animate" : "initial"}
          variants={fadeInUp}
          transition={{ delay: 0.8 }}
          className="text-center mt-12"
        >
          <p className="text-sm text-muted-foreground">
            Open source • Community driven • Enterprise ready
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default A2AGetStartedSection;
