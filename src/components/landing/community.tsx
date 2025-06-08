"use client";

import React, { useRef, useState, useEffect } from "react";
import { motion, useInView } from "framer-motion";
import {
  Star,
  Users,
  GitBranch,
  Quote,
  ExternalLink,
  TrendingUp,
} from "lucide-react";

const A2ACommunitySection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, {
    once: true,
    amount: 0.1,
    margin: "0px 0px -100px 0px",
  });

  // Animated counter component
  const AnimatedCounter = ({ end = 0, duration = 2000, suffix = "" }) => {
    const [count, setCount] = useState(0);
    const counterRef = useRef(null);
    const counterInView = useInView(counterRef);

    useEffect(() => {
      if (counterInView) {
        let startTime: number;
        const animate = (currentTime: number) => {
          if (!startTime) startTime = currentTime;
          const progress = Math.min((currentTime - startTime) / duration, 1);
          setCount(Math.floor(progress * end));
          if (progress < 1) {
            requestAnimationFrame(animate);
          }
        };
        requestAnimationFrame(animate);
      }
    }, [counterInView, end, duration]);

    return (
      <span ref={counterRef}>
        {count}
        {suffix}
      </span>
    );
  };

  const testimonials = [
    {
      text: "Semantic Kernel now speaks A2A: a lightweight JSON-RPC protocol that lets agents swap context, not code or credentials, over plain HTTP.",
      author: "Asha Sharma",
      role: "Head of AI Platform Product",
      company: "Microsoft",
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      text: "A2A support in Semantic Kernel is a key unlock — context-level interoperability without sharing code or creds is how agent ecosystems scale securely across clouds.",
      author: "Developer Community",
      role: "Community Response",
      company: "LinkedIn",
      gradient: "from-purple-500 to-pink-500",
    },
  ];

  const frameworks = [
    "LangGraph",
    "CrewAI",
    "Semantic Kernel",
    "AutoGen",
    "PydanticAI",
    "AG2",
  ];

  const stats = [
    {
      number: 1200,
      suffix: "+",
      label: "GitHub Stars",
      icon: Star,
      color: "text-yellow-500",
    },
    {
      number: 50,
      suffix: "+",
      label: "Contributors",
      icon: Users,
      color: "text-blue-500",
    },
    {
      number: 6,
      suffix: "+",
      label: "Framework Integrations",
      icon: GitBranch,
      color: "text-green-500",
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
      className="py-24 bg-gradient-to-b from-transparent to-muted/20 relative overflow-hidden"
    >
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          initial="initial"
          animate={isInView ? "animate" : "initial"}
          variants={fadeInUp}
          className="text-center max-w-4xl mx-auto mb-20"
        >
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            Community{" "}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Momentum
            </span>
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
            See what the developer community and industry leaders are saying
            about A2A
          </p>
        </motion.div>

        {/* GitHub Stats */}
        <motion.div
          initial="initial"
          animate={isInView ? "animate" : "initial"}
          variants={staggerContainer}
          className="grid md:grid-cols-3 gap-8 mb-20 max-w-4xl mx-auto"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              variants={fadeInUp}
              transition={{ delay: index * 0.1 }}
              className="text-center bg-card border border-border rounded-2xl p-8 hover:shadow-lg transition-all duration-300"
            >
              <div className="flex items-center justify-center mb-4">
                <div
                  className={`p-3 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 ${stat.color}`}
                >
                  <stat.icon className="w-8 h-8" />
                </div>
              </div>
              <div className="text-3xl md:text-4xl font-bold text-primary mb-2">
                <AnimatedCounter end={stat.number} suffix={stat.suffix} />
              </div>
              <p className="text-muted-foreground font-medium">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Testimonials */}
        <motion.div
          initial="initial"
          animate={isInView ? "animate" : "initial"}
          variants={staggerContainer}
          className="grid lg:grid-cols-2 gap-8 mb-20 max-w-6xl mx-auto"
        >
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              variants={fadeInUp}
              transition={{ delay: 0.3 + index * 0.1 }}
              className="group"
            >
              <div className="bg-card border border-border rounded-2xl p-8 h-full hover:shadow-xl transition-all duration-300 relative overflow-hidden">
                {/* Background gradient */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${testimonial.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}
                />

                <div className="relative">
                  {/* Quote icon */}
                  <div className="flex items-start gap-4 mb-6">
                    <div
                      className={`p-3 rounded-xl bg-gradient-to-br ${testimonial.gradient} flex-shrink-0`}
                    >
                      <Quote className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <p className="text-muted-foreground leading-relaxed italic text-lg">
                        {testimonial.text}
                      </p>
                    </div>
                  </div>

                  {/* Author info */}
                  <div className="border-t border-border pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-lg">
                          {testimonial.author}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {testimonial.role}
                        </p>
                        <p className="text-sm text-primary font-medium">
                          {testimonial.company}
                        </p>
                      </div>
                      <ExternalLink className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors duration-300" />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Framework Support */}
        <motion.div
          initial="initial"
          animate={isInView ? "animate" : "initial"}
          variants={fadeInUp}
          transition={{ delay: 0.5 }}
          className="text-center max-w-4xl mx-auto"
        >
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 rounded-full mb-6">
              <TrendingUp className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium text-primary">
                Growing Ecosystem
              </span>
            </div>
            <h3 className="text-2xl md:text-3xl font-bold mb-4">
              Supported Frameworks & Libraries
            </h3>
            <p className="text-muted-foreground">
              A2A integrates seamlessly with popular AI agent frameworks
            </p>
          </div>

          {/* Framework badges */}
          <motion.div
            initial="initial"
            animate={isInView ? "animate" : "initial"}
            variants={staggerContainer}
            className="flex flex-wrap justify-center gap-4 mb-12"
          >
            {frameworks.map((framework, index) => (
              <motion.div
                key={framework}
                variants={{
                  initial: { opacity: 0, scale: 0.8 },
                  animate: {
                    opacity: 1,
                    scale: 1,
                    transition: { duration: 0.4, delay: 0.6 + index * 0.1 },
                  },
                }}
                whileHover={{ scale: 1.05 }}
                className="px-6 py-3 bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 rounded-full text-sm font-medium hover:shadow-lg transition-all duration-300 cursor-pointer"
              >
                {framework}
              </motion.div>
            ))}
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="group bg-gradient-to-r from-primary to-accent px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 hover:shadow-lg hover:shadow-primary/25 flex items-center gap-3 mx-auto"
            >
              <Users className="w-5 h-5" />
              Join the Community
              <ExternalLink className="w-5 h-5 transition-transform duration-200 group-hover:translate-x-1 group-hover:-translate-y-1" />
            </motion.button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default A2ACommunitySection;
