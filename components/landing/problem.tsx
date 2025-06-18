"use client";

import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";

const A2AProblemSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, {
    once: true,
    amount: 0.2,
    margin: "0px 0px -100px 0px",
  });

  // Optimized animation variants
  const fadeInUp = {
    initial: { opacity: 0, y: 40 },
    animate: { opacity: 1, y: 0 },
  };

  const slideInLeft = {
    initial: { opacity: 0, x: -40 },
    animate: { opacity: 1, x: 0 },
  };

  const slideInRight = {
    initial: { opacity: 0, x: 40 },
    animate: { opacity: 1, x: 0 },
  };

  // Optimized path drawing animation
  const pathVariants = {
    initial: { pathLength: 0, opacity: 0 },
    animate: {
      pathLength: 1,
      opacity: 1,
      transition: { duration: 1.5, ease: "easeInOut" },
    },
  };

  return (
    <section
      ref={ref}
      className="py-24 bg-gradient-to-b from-transparent to-muted/20"
    >
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          initial="initial"
          animate={isInView ? "animate" : "initial"}
          variants={fadeInUp}
          transition={{ duration: 0.6 }}
          className="text-center max-w-4xl mx-auto mb-20"
        >
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            Breaking Down the{" "}
            <span className="bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
              Silos
            </span>
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
            AI agents today are islands of capability. A2A builds the bridges
            between them,
            <br className="hidden md:block" />
            enabling unprecedented collaboration and innovation.
          </p>
        </motion.div>

        {/* Before/After Comparison */}
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center max-w-6xl mx-auto">
          {/* Before: Siloed Agents */}
          <motion.div
            initial="initial"
            animate={isInView ? "animate" : "initial"}
            variants={slideInLeft}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-center"
          >
            <div className="bg-card border border-border rounded-2xl p-8 mb-6 relative overflow-hidden">
              {/* Subtle red gradient background */}
              <div className="absolute inset-0 bg-gradient-to-br from-red-50 to-transparent dark:from-red-950/20 dark:to-transparent" />

              <div className="relative">
                <div className="grid grid-cols-2 gap-6 mb-8">
                  {[1, 2, 3, 4].map((i) => (
                    <motion.div
                      key={i}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={isInView ? { scale: 1, opacity: 1 } : {}}
                      transition={{ duration: 0.4, delay: 0.4 + i * 0.1 }}
                      className="h-24 bg-gradient-to-br from-red-100 to-red-50 dark:from-red-900/30 dark:to-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-xl flex items-center justify-center shadow-sm"
                    >
                      <div className="w-10 h-10 bg-red-500 rounded-lg shadow-sm" />
                    </motion.div>
                  ))}
                </div>

                {/* Disconnected indicators */}
                <div className="flex justify-center gap-2 mb-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="w-2 h-2 bg-red-400 rounded-full" />
                  ))}
                </div>

                <p className="text-red-600 dark:text-red-400 font-semibold text-lg">
                  Isolated Agents
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-red-600 dark:text-red-400">
                Before A2A
              </h3>
              <p className="text-muted-foreground">
                Custom integrations, vendor lock-in, limited collaboration
              </p>
            </div>
          </motion.div>

          {/* After: Connected Ecosystem */}
          <motion.div
            initial="initial"
            animate={isInView ? "animate" : "initial"}
            variants={slideInRight}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="text-center"
          >
            <div className="bg-card border border-border rounded-2xl p-8 mb-6 relative overflow-hidden">
              {/* Subtle green gradient background */}
              <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-transparent dark:from-green-950/20 dark:to-transparent" />

              <div className="relative">
                <div className="grid grid-cols-2 gap-6 mb-8 relative">
                  {[1, 2, 3, 4].map((i) => (
                    <motion.div
                      key={i}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={isInView ? { scale: 1, opacity: 1 } : {}}
                      transition={{ duration: 0.4, delay: 0.6 + i * 0.1 }}
                      className="h-24 bg-gradient-to-br from-green-100 to-green-50 dark:from-green-900/30 dark:to-green-900/20 border-2 border-green-200 dark:border-green-800 rounded-xl flex items-center justify-center shadow-sm"
                    >
                      <div className="w-10 h-10 bg-green-500 rounded-lg shadow-sm" />
                    </motion.div>
                  ))}

                  {/* Connection lines - optimized SVG */}
                  <svg
                    className="absolute inset-0 w-full h-full pointer-events-none"
                    viewBox="0 0 240 180"
                    style={{ transform: "translate(-10px, -10px)" }}
                  >
                    <motion.g
                      stroke="currentColor"
                      strokeWidth="2"
                      fill="none"
                      className="text-green-500"
                    >
                      {/* Horizontal lines */}
                      <motion.line
                        x1="60"
                        y1="45"
                        x2="180"
                        y2="45"
                        variants={pathVariants}
                      />
                      <motion.line
                        x1="60"
                        y1="135"
                        x2="180"
                        y2="135"
                        variants={pathVariants}
                      />
                      {/* Vertical lines */}
                      <motion.line
                        x1="60"
                        y1="45"
                        x2="60"
                        y2="135"
                        variants={pathVariants}
                      />
                      <motion.line
                        x1="180"
                        y1="45"
                        x2="180"
                        y2="135"
                        variants={pathVariants}
                      />
                      {/* Diagonal lines */}
                      <motion.line
                        x1="60"
                        y1="45"
                        x2="180"
                        y2="135"
                        variants={pathVariants}
                      />
                      <motion.line
                        x1="180"
                        y1="45"
                        x2="60"
                        y2="135"
                        variants={pathVariants}
                      />
                    </motion.g>
                  </svg>
                </div>

                {/* Connected indicators */}
                <div className="flex justify-center gap-2 mb-4">
                  {[1, 2, 3].map((i) => (
                    <motion.div
                      key={i}
                      className="w-2 h-2 bg-green-400 rounded-full"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        delay: i * 0.3,
                      }}
                    />
                  ))}
                </div>

                <p className="text-green-600 dark:text-green-400 font-semibold text-lg">
                  Connected Ecosystem
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-green-600 dark:text-green-400">
                With A2A
              </h3>
              <p className="text-muted-foreground">
                Seamless interoperability, standardized communication, unlimited
                potential
              </p>
            </div>
          </motion.div>
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial="initial"
          animate={isInView ? "animate" : "initial"}
          variants={fadeInUp}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-center mt-16"
        >
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Transform your AI agent ecosystem from isolated capabilities to a
            collaborative powerhouse with the A2A Protocol.
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default A2AProblemSection;
