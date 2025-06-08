"use client";

import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Network, Shield, Zap, Globe, ArrowRight } from "lucide-react";

const A2ABenefitsSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, {
    once: true,
    amount: 0.1,
    margin: "0px 0px -50px 0px",
  });

  const benefits = [
    {
      icon: Network,
      title: "Interoperability",
      description:
        "Connect agents built on different platforms (LangGraph, CrewAI, Semantic Kernel, custom solutions) to create powerful, composite AI systems.",
      gradient: "from-blue-500 to-cyan-500",
      delay: 0,
    },
    {
      icon: Shield,
      title: "Enterprise Security",
      description:
        "Built-in support for authentication, authorization, and standard web security practices. Keep agents secure and compliant.",
      gradient: "from-green-500 to-emerald-500",
      delay: 0.1,
    },
    {
      icon: Zap,
      title: "Complex Workflows",
      description:
        "Enable agents to delegate sub-tasks, exchange information, and coordinate actions to solve problems no single agent can.",
      gradient: "from-purple-500 to-pink-500",
      delay: 0.2,
    },
    {
      icon: Globe,
      title: "Open Standard",
      description:
        "Community-driven, open-source protocol that prevents vendor lock-in and encourages innovation across the ecosystem.",
      gradient: "from-orange-500 to-red-500",
      delay: 0.3,
    },
  ];

  // Optimized animation variants
  const containerVariants = {
    initial: {},
    animate: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const cardVariants = {
    initial: { opacity: 0, y: 30 },
    animate: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  const titleVariants = {
    initial: { opacity: 0, y: 20 },
    animate: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  };

  return (
    <section ref={ref} className="py-24 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/2 to-transparent" />

      <div className="container mx-auto px-4 relative">
        {/* Section Header */}
        <motion.div
          initial="initial"
          animate={isInView ? "animate" : "initial"}
          variants={titleVariants}
          className="text-center max-w-4xl mx-auto mb-20"
        >
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            Why Choose{" "}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              A2A
            </span>
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
            Built for the future of AI collaboration with enterprise-grade
            reliability
          </p>
        </motion.div>

        {/* Benefits Grid */}
        <motion.div
          initial="initial"
          animate={isInView ? "animate" : "initial"}
          variants={containerVariants}
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto"
        >
          {benefits.map((benefit) => (
            <motion.div
              key={benefit.title}
              variants={cardVariants}
              whileHover={{
                y: -8,
                transition: { duration: 0.2, ease: "easeOut" },
              }}
              className="group relative h-full"
            >
              <div className="relative bg-card border border-border rounded-2xl p-8 h-full transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 overflow-hidden">
                {/* Hover background gradient */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${benefit.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}
                />

                {/* Content */}
                <div className="relative">
                  {/* Icon with gradient background */}
                  <div
                    className={`inline-flex p-4 rounded-xl bg-gradient-to-br ${benefit.gradient} mb-6 shadow-lg`}
                  >
                    <benefit.icon className="w-6 h-6 text-white" />
                  </div>

                  {/* Title */}
                  <h3 className="text-xl md:text-2xl font-bold mb-4 group-hover:text-primary transition-colors duration-300">
                    {benefit.title}
                  </h3>

                  {/* Description */}
                  <p className="text-muted-foreground leading-relaxed mb-6">
                    {benefit.description}
                  </p>

                  {/* Learn more link */}
                  <div className="flex items-center gap-2 text-primary opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:gap-3">
                    <span className="text-sm font-medium">Learn more</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>

                {/* Corner decoration */}
                <div
                  className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${benefit.gradient} opacity-5 transform rotate-45 translate-x-10 -translate-y-10 group-hover:opacity-10 transition-opacity duration-300`}
                />
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-center mt-20"
        >
          <div className="max-w-3xl mx-auto">
            <p className="text-lg text-muted-foreground mb-8">
              Ready to unlock the full potential of your AI agents?
            </p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="group bg-gradient-to-r from-primary to-accent text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 hover:shadow-lg hover:shadow-primary/25 flex items-center gap-3 mx-auto"
            >
              Explore the Documentation
              <ArrowRight className="w-5 h-5 transition-transform duration-200 group-hover:translate-x-1" />
            </motion.button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default A2ABenefitsSection;
