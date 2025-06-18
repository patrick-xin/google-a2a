"use client";

import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Heart, Code, Network, Check, ArrowRight, Layers } from "lucide-react";

const A2AMCPSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, {
    once: true,
    amount: 0.1,
    margin: "0px 0px -100px 0px",
  });

  // Animation variants
  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    animate: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  const slideInLeft = {
    initial: { opacity: 0, x: -40 },
    animate: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  const slideInRight = {
    initial: { opacity: 0, x: 40 },
    animate: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  const heartPulse = {
    animate: {
      scale: [1, 1.1, 1],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  };

  return (
    <section
      ref={ref}
      className="py-24 bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 relative overflow-hidden"
    >
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_50%)]" />

      <div className="container mx-auto px-4 relative">
        {/* Section Header */}
        <motion.div
          initial="initial"
          animate={isInView ? "animate" : "initial"}
          variants={fadeInUp}
          className="text-center max-w-5xl mx-auto mb-20"
        >
          <div className="flex items-center justify-center gap-4 mb-8">
            <motion.h2
              className="text-4xl md:text-5xl lg:text-6xl font-bold"
              variants={fadeInUp}
            >
              A2A
            </motion.h2>
            <motion.div animate={isInView ? heartPulse.animate : {}}>
              <Heart className="w-8 h-8 md:w-12 md:h-12 text-red-500 fill-current" />
            </motion.div>
            <motion.h2
              className="text-4xl md:text-5xl lg:text-6xl font-bold"
              variants={fadeInUp}
            >
              MCP
            </motion.h2>
          </div>

          <motion.p
            variants={fadeInUp}
            transition={{ delay: 0.2 }}
            className="text-lg md:text-xl text-muted-foreground leading-relaxed"
          >
            A2A and Model Context Protocol are complementary standards for
            building robust agentic applications.
            <br className="hidden md:block" />
            <span className="font-semibold text-foreground">
              MCP connects agents to tools.
            </span>{" "}
            <span className="font-semibold text-foreground">
              A2A connects agents to agents.
            </span>
          </motion.p>
        </motion.div>

        {/* Comparison Cards */}
        <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto mb-16">
          {/* MCP Card */}
          <motion.div
            initial="initial"
            animate={isInView ? "animate" : "initial"}
            variants={slideInLeft}
            transition={{ delay: 0.2 }}
            className="group"
          >
            <div className="bg-card border border-border rounded-2xl p-8 h-full hover:shadow-xl transition-all duration-300 relative overflow-hidden">
              {/* Background gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 opacity-50" />

              <div className="relative">
                {/* Icon and header */}
                <div className="text-center mb-8">
                  <div className="inline-flex p-4 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 mb-6 shadow-lg">
                    <Code className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl md:text-3xl font-bold mb-2">
                    Model Context Protocol
                  </h3>
                  <p className="text-muted-foreground text-lg">
                    Agent ↔ Tools & Resources
                  </p>
                </div>

                {/* Features list */}
                <ul className="space-y-4 mb-8">
                  {[
                    "Structured tool calling",
                    "API integrations",
                    "Data source access",
                    "Function execution",
                  ].map((feature, index) => (
                    <motion.li
                      key={feature}
                      initial={{ opacity: 0, x: -20 }}
                      animate={isInView ? { opacity: 1, x: 0 } : {}}
                      transition={{ duration: 0.4, delay: 0.4 + index * 0.1 }}
                      className="flex items-start gap-3"
                    >
                      <Check className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                      <span className="text-muted-foreground">{feature}</span>
                    </motion.li>
                  ))}
                </ul>

                {/* Learn more */}
                <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 group-hover:gap-3 transition-all duration-300">
                  <span className="text-sm font-medium">Learn about MCP</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          </motion.div>

          {/* A2A Card */}
          <motion.div
            initial="initial"
            animate={isInView ? "animate" : "initial"}
            variants={slideInRight}
            transition={{ delay: 0.4 }}
            className="group"
          >
            <div className="bg-card border border-border rounded-2xl p-8 h-full hover:shadow-xl transition-all duration-300 relative overflow-hidden">
              {/* Background gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 opacity-50" />

              <div className="relative">
                {/* Icon and header */}
                <div className="text-center mb-8">
                  <div className="inline-flex p-4 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 mb-6 shadow-lg">
                    <Network className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl md:text-3xl font-bold mb-2">
                    Agent2Agent Protocol
                  </h3>
                  <p className="text-muted-foreground text-lg">
                    Agent ↔ Agent Collaboration
                  </p>
                </div>

                {/* Features list */}
                <ul className="space-y-4 mb-8">
                  {[
                    "Multi-agent workflows",
                    "Task delegation",
                    "Context sharing",
                    "Agent discovery",
                  ].map((feature, index) => (
                    <motion.li
                      key={feature}
                      initial={{ opacity: 0, x: 20 }}
                      animate={isInView ? { opacity: 1, x: 0 } : {}}
                      transition={{ duration: 0.4, delay: 0.6 + index * 0.1 }}
                      className="flex items-start gap-3"
                    >
                      <Check className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                      <span className="text-muted-foreground">{feature}</span>
                    </motion.li>
                  ))}
                </ul>

                {/* Learn more */}
                <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 group-hover:gap-3 transition-all duration-300">
                  <span className="text-sm font-medium">Explore A2A</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* How they work together */}
        <motion.div
          initial="initial"
          animate={isInView ? "animate" : "initial"}
          variants={fadeInUp}
          transition={{ delay: 0.6 }}
          className="max-w-4xl mx-auto"
        >
          <div className="bg-card border border-border rounded-2xl p-8 md:p-12 text-center relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5" />

            <div className="relative">
              <div className="inline-flex p-3 rounded-xl bg-gradient-to-r from-primary to-accent mb-6">
                <Layers className="w-8 h-8" />
              </div>

              <h3 className="text-2xl md:text-3xl font-bold mb-6">
                Stronger Together
              </h3>

              <p className="text-lg text-muted-foreground leading-relaxed mb-8">
                Together, they create a complete ecosystem where agents can both
                access powerful tools through MCP and collaborate with each
                other through A2A to solve complex, multi-step problems that no
                single agent could handle alone.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-6 py-3 bg-blue-500 rounded-lg font-medium hover:bg-blue-600 transition-colors duration-200"
                >
                  Learn about MCP
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-6 py-3 bg-purple-500 rounded-lg font-medium hover:bg-purple-600 transition-colors duration-200"
                >
                  Explore A2A Docs
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default A2AMCPSection;
