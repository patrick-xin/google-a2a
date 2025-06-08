"use client";

import Link from "next/link";
import {
  Accessibility,
  Code,
  Github,
  Instagram,
  Mail,
  Moon,
  Sparkles,
  Twitter,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface GridPatternProps {
  className?: string;
  width?: number;
  height?: number;
  x?: number;
  y?: number;
  strokeWidth?: number;
}

export function GridPattern({
  className,
  width = 100,
  height = 100,
  x = 0,
  y = 0,
  strokeWidth = 1,
  ...props
}: GridPatternProps & React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0 h-full w-full fill-gray-400/30 stroke-gray-400/30",
        className
      )}
      {...props}
    >
      <defs>
        <pattern
          id="grid-pattern"
          width={width}
          height={height}
          patternUnits="userSpaceOnUse"
          x={x}
          y={y}
        >
          <path
            d={`M ${height} 0 L 0 0 0 ${width}`}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#grid-pattern)" />
    </svg>
  );
}

const FooterLink = ({
  href,
  children,
  className,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <Link
      href={href}
      className={cn(
        "text-muted-foreground hover:text-foreground transition-colors duration-200 flex items-center gap-1.5 group",
        className
      )}
    >
      {children}
    </Link>
  );
};

// Footer column component
const FooterColumn = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => {
  return (
    <div className="flex flex-col gap-4">
      <h3 className="font-semibold text-foreground">{title}</h3>
      <div className="flex flex-col gap-3">{children}</div>
    </div>
  );
};

// Social media icon component
const SocialIcon = ({
  href,
  icon: Icon,
  label,
}: {
  href: string;
  icon: React.ElementType;
  label: string;
}) => {
  return (
    <Link
      href={href}
      className="w-9 h-9 flex items-center justify-center rounded-full bg-muted hover:bg-primary/10 hover:text-primary transition-colors duration-200"
      aria-label={label}
    >
      <Icon className="w-4 h-4" />
    </Link>
  );
};

export function Footer({
  hasChromifyText = true,
}: {
  hasChromifyText?: boolean;
}) {
  return (
    <footer className="border-t border-border bg-gradient-to-b from-muted/30 to-background relative overflow-hidden md:max-h-[580px]">
      {/* Decorative elements */}
      <GridPattern
        className="opacity-[0.02]"
        width={40}
        height={40}
        strokeWidth={0.5}
      />

      {/* Main footer content */}
      <div className="container mx-auto px-4 md:px-6 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand column */}
          <div className="lg:col-span-2">
            <div className="flex flex-col gap-6">
              logo
              <p className="text-muted-foreground max-w-md">
                Chromify combines AI with expert color theory to deliver
                beautiful, accessible color schemes for any project. Perfect for
                developers and designers.
              </p>
              <div className="flex gap-3">
                <SocialIcon
                  href="https://github.com"
                  icon={Github}
                  label="GitHub"
                />
                <SocialIcon
                  href="https://twitter.com"
                  icon={Twitter}
                  label="Twitter"
                />
                <SocialIcon
                  href="https://instagram.com"
                  icon={Instagram}
                  label="Instagram"
                />
                <SocialIcon
                  href="mailto:contact@chromify.app"
                  icon={Mail}
                  label="Email"
                />
              </div>
            </div>
          </div>

          {/* Features column */}
          <FooterColumn title="Features">
            <FooterLink href="/features/ai-generation">
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI-Powered Generation</span>
            </FooterLink>
            <FooterLink href="/features/dark-mode">
              <Moon className="w-3.5 h-3.5" />
              <span>Light & Dark Modes</span>
            </FooterLink>
            <FooterLink href="/features/accessibility">
              <Accessibility className="w-3.5 h-3.5" />
              <span>Accessibility Tools</span>
            </FooterLink>
            <FooterLink href="/features/tailwind">
              <Code className="w-3.5 h-3.5" />
              <span>Tailwind CSS Export</span>
            </FooterLink>
          </FooterColumn>

          {/* Resources column */}
          <FooterColumn title="Resources">
            <FooterLink href="/docs">
              <span>Documentation</span>
            </FooterLink>
            <FooterLink href="/blog">
              <span>Blog</span>
            </FooterLink>
            <FooterLink href="/tutorials">
              <span>Tutorials</span>
            </FooterLink>
            <FooterLink href="/market">
              <span>Color Market</span>
            </FooterLink>
            <FooterLink href="/terms" className="text-sm">
              Terms of Service
            </FooterLink>
            <FooterLink href="/privacy" className="text-sm">
              Privacy Policy
            </FooterLink>
          </FooterColumn>

          {/* Company column */}
          <FooterColumn title="Company">
            <FooterLink href="/about">
              <span>About Us</span>
            </FooterLink>
            <FooterLink href="/pricing">
              <span>Pricing</span>
            </FooterLink>
            <FooterLink href="/contact">
              <span>Contact</span>
            </FooterLink>
            <FooterLink href="/careers">
              <span>Careers</span>
            </FooterLink>
          </FooterColumn>
        </div>
      </div>

      {hasChromifyText && (
        <h5 className="bg-clip-text block md:hidden text-transparent bg-gradient-to-r from-chart-2/10 via-primary/10 to-chart-3/10 text-[120px] leading-none text-center pointer-events-none">
          chromify
        </h5>
      )}
    </footer>
  );
}
