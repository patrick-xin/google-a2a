import Link from "next/link";
import { cn } from "@/lib/utils";

import { NavbarLogo } from "./ui/resizable-navbar";
import { ThemeToggle } from "./theme-toggle";
import { Logo } from "./logo";

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
              <Logo />
              <p className="text-muted-foreground max-w-md">
                Your go-to resources to know about A2A
              </p>
              <ThemeToggle className="w-fit" />
            </div>
          </div>

          {/* Resources column */}
          <FooterColumn title="Resources">
            <FooterLink href="/docs">
              <span>Documentation</span>
            </FooterLink>
            <FooterLink href="/blog">
              <span>Blog</span>
            </FooterLink>
          </FooterColumn>

          {/* Company column */}
          <FooterColumn title="Company">
            <FooterLink href="/about">
              <span>About</span>
            </FooterLink>
            <FooterLink href="/terms" className="text-sm">
              <span>Terms of Service</span>
            </FooterLink>
            <FooterLink href="/privacy" className="text-sm">
              <span> Privacy Policy</span>
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
