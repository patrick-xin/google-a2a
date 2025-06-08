"use client";

import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Code, Zap, Shield, Globe, Copy, CheckCircle } from "lucide-react";

const A2ATechnicalSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, {
    once: true,
    amount: 0.1,
    margin: "0px 0px -100px 0px",
  });

  const [copied, setCopied] = React.useState(false);

  const features = [
    {
      title: "JSON-RPC 2.0 over HTTP(S)",
      description:
        "Standard, reliable communication protocol that's enterprise-ready",
      icon: "🔗",
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      title: "Server-Sent Events",
      description:
        "Real-time streaming for long-running tasks and live updates",
      icon: "⚡",
      gradient: "from-yellow-500 to-orange-500",
    },
    {
      title: "Agent Cards",
      description: "Standardized capability discovery and service metadata",
      icon: "🃏",
      gradient: "from-purple-500 to-pink-500",
    },
    {
      title: "Multi-modal Support",
      description: "Text, files, and structured data exchange between agents",
      icon: "📊",
      gradient: "from-green-500 to-emerald-500",
    },
    {
      title: "Push Notifications",
      description: "Asynchronous task completion alerts via webhooks",
      icon: "🔔",
      gradient: "from-indigo-500 to-purple-500",
    },
    {
      title: "Enterprise Security",
      description: "OAuth, API keys, TLS, and standard authentication methods",
      icon: "🔒",
      gradient: "from-red-500 to-pink-500",
    },
  ];

  const codeExample = `// Send a message to another agent
const response = await fetch('https://agent.example.com/a2a/v1', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer your-token'
  },
  body: JSON.stringify({
    jsonrpc: '2.0',
    method: 'message/send',
    params: {
      message: {
        role: 'user',
        parts: [{ kind: 'text', text: 'Plan a trip to Tokyo' }],
        messageId: 'msg-123'
      }
    },
    id: 1
  })
});

const result = await response.json();
console.log('Agent response:', result);`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(codeExample);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

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
    <section ref={ref} className="py-24 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-b from-muted/20 via-transparent to-muted/20" />

      <div className="container mx-auto px-4 relative">
        {/* Section Header */}
        <motion.div
          initial="initial"
          animate={isInView ? "animate" : "initial"}
          variants={fadeInUp}
          className="text-center max-w-4xl mx-auto mb-20"
        >
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            Technical{" "}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Excellence
            </span>
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
            Built on proven standards with modern capabilities for enterprise
            deployment
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          initial="initial"
          animate={isInView ? "animate" : "initial"}
          variants={staggerContainer}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20 max-w-6xl mx-auto"
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              variants={fadeInUp}
              transition={{ delay: index * 0.1 }}
              whileHover={{
                y: -5,
                transition: { duration: 0.2, ease: "easeOut" },
              }}
              className="group bg-card border border-border rounded-2xl p-8 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 relative overflow-hidden"
            >
              {/* Background gradient on hover */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}
              />

              <div className="relative">
                <div className="text-4xl mb-6">{feature.icon}</div>
                <h3 className="text-xl font-bold mb-4 group-hover:text-primary transition-colors duration-300">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Code Example */}
        <motion.div
          initial="initial"
          animate={isInView ? "animate" : "initial"}
          variants={fadeInUp}
          transition={{ delay: 0.6 }}
          className="max-w-5xl mx-auto"
        >
          <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-xl">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 bg-muted/30 border-b border-border">
              <div className="flex items-center gap-3">
                <Code className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-semibold">
                  Simple Agent Communication
                </h3>
              </div>
              <motion.button
                onClick={handleCopy}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 px-3 py-2 bg-primary/10 hover:bg-primary/20 rounded-lg text-sm font-medium transition-colors duration-200"
              >
                {copied ? (
                  <>
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copy
                  </>
                )}
              </motion.button>
            </div>

            {/* Code content */}
            <div className="p-6">
              <pre className="text-sm overflow-x-auto">
                <code className="text-muted-foreground leading-relaxed">
                  {codeExample}
                </code>
              </pre>
            </div>
          </div>
        </motion.div>

        {/* Key Benefits */}
        <motion.div
          initial="initial"
          animate={isInView ? "animate" : "initial"}
          variants={fadeInUp}
          transition={{ delay: 0.8 }}
          className="text-center mt-20 max-w-4xl mx-auto"
        >
          <div className="grid md:grid-cols-3 gap-8">
            <div className="space-y-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mx-auto">
                <Globe className="w-6 h-6 text-white" />
              </div>
              <h4 className="text-lg font-semibold">Standard Protocols</h4>
              <p className="text-sm text-muted-foreground">
                Built on HTTP, JSON-RPC, and SSE—technologies your team already
                knows
              </p>
            </div>

            <div className="space-y-3">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mx-auto">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h4 className="text-lg font-semibold">Enterprise Ready</h4>
              <p className="text-sm text-muted-foreground">
                Production-grade security, monitoring, and compliance features
                included
              </p>
            </div>

            <div className="space-y-3">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mx-auto">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <h4 className="text-lg font-semibold">High Performance</h4>
              <p className="text-sm text-muted-foreground">
                Optimized for real-time streaming and asynchronous operations
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default A2ATechnicalSection;
