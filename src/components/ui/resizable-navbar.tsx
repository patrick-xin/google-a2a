"use client";
import { cn } from "@/lib/utils";
import { Menu, X } from "lucide-react";

import {
  motion,
  AnimatePresence,
  useScroll,
  useMotionValueEvent,
} from "motion/react";
import Link from "next/link";

import React, { useRef, useState } from "react";

interface NavbarProps {
  children: React.ReactNode;
  className?: string;
}

interface NavBodyProps {
  children: React.ReactNode;
  className?: string;
  visible?: boolean;
}

interface NavItemsProps {
  items: {
    name: string;
    link: string;
  }[];
  className?: string;
  onItemClick?: () => void;
}

interface MobileNavProps {
  children: React.ReactNode;
  className?: string;
  visible?: boolean;
}

interface MobileNavHeaderProps {
  children: React.ReactNode;
  className?: string;
}

interface MobileNavMenuProps {
  children: React.ReactNode;
  className?: string;
  isOpen: boolean;
  onClose: () => void;
}

export const Navbar = ({ children, className }: NavbarProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const [visible, setVisible] = useState<boolean>(false);

  useMotionValueEvent(scrollY, "change", (latest) => {
    if (latest > 100) {
      setVisible(true);
    } else {
      setVisible(false);
    }
  });

  return (
    <motion.div
      ref={ref}
      // IMPORTANT: Change this to class of `fixed` if you want the navbar to be fixed
      className={cn("sticky inset-x-0 top-4 z-40 w-full", className)}
    >
      {React.Children.map(children, (child) =>
        React.isValidElement(child)
          ? React.cloneElement(
              child as React.ReactElement<{ visible?: boolean }>,
              { visible }
            )
          : child
      )}
    </motion.div>
  );
};

export const NavBody = ({ children, className, visible }: NavBodyProps) => {
  return (
    <motion.div
      animate={{
        backdropFilter: visible ? "blur(20px) saturate(180%)" : "blur(8px)",
        boxShadow: visible
          ? "0 8px 32px rgba(0, 0, 0, 0.12), 0 0 0 1px hsl(var(--border) / 0.5), inset 0 1px 0 hsl(var(--background) / 0.8)"
          : "0 4px 16px rgba(0, 0, 0, 0.04), 0 0 0 1px hsl(var(--border) / 0.2)",
        width: visible ? "42%" : "100%",
        y: visible ? 16 : 0,
        scale: visible ? 0.98 : 1,
      }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 40,
        mass: 0.8,
      }}
      style={{
        minWidth: "800px",
        background: visible
          ? "hsl(var(--card) / 0.85)"
          : "hsl(var(--background) / 0.5)",
      }}
      className={cn(
        "relative z-[60] mx-auto hidden w-full max-w-7xl flex-row items-center justify-between self-start rounded-2xl border border-border/40 px-6 py-3 lg:flex transition-colors duration-300",
        className
      )}
    >
      {children}
    </motion.div>
  );
};

export const NavItems = ({ items, className, onItemClick }: NavItemsProps) => {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <motion.div
      onMouseLeave={() => setHovered(null)}
      className={cn(
        "absolute inset-0 hidden flex-1 flex-row items-center justify-center space-x-1 text-sm font-medium text-muted-foreground transition-colors duration-200 lg:flex lg:space-x-1",
        className
      )}
    >
      {items.map((item, idx) => (
        <a
          onMouseEnter={() => setHovered(idx)}
          onClick={onItemClick}
          className="relative px-4 py-2.5 text-muted-foreground hover:text-foreground transition-colors duration-200 rounded-xl"
          key={`link-${idx}`}
          href={item.link}
        >
          {hovered === idx && (
            <motion.div
              layoutId="hovered"
              className="absolute inset-0 h-full w-full rounded-xl bg-accent/60 backdrop-blur-sm border border-border/40"
              transition={{
                type: "spring",
                stiffness: 400,
                damping: 30,
              }}
            />
          )}
          <span className="relative z-20 font-medium">{item.name}</span>
        </a>
      ))}
    </motion.div>
  );
};

export const MobileNav = ({ children, className, visible }: MobileNavProps) => {
  return (
    <motion.div
      animate={{
        backdropFilter: visible ? "blur(20px) saturate(180%)" : "blur(8px)",
        boxShadow: visible
          ? "0 8px 32px rgba(0, 0, 0, 0.12), 0 0 0 1px hsl(var(--border) / 0.5), inset 0 1px 0 hsl(var(--background) / 0.8)"
          : "0 4px 16px rgba(0, 0, 0, 0.04), 0 0 0 1px hsl(var(--border) / 0.2)",
        width: visible ? "92%" : "100%",
        paddingRight: visible ? "16px" : "12px",
        paddingLeft: visible ? "16px" : "12px",
        borderRadius: visible ? "16px" : "24px",
        y: visible ? 12 : 0,
        scale: visible ? 0.98 : 1,
      }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 40,
        mass: 0.8,
      }}
      style={{
        background: visible
          ? "hsl(var(--card) / 0.85)"
          : "hsl(var(--background) / 0.5)",
      }}
      className={cn(
        "relative z-50 mx-auto flex w-full max-w-[calc(100vw-2rem)] flex-col items-center justify-between border border-border/40 py-3 lg:hidden transition-colors duration-300",
        className
      )}
    >
      {children}
    </motion.div>
  );
};

export const MobileNavHeader = ({
  children,
  className,
}: MobileNavHeaderProps) => {
  return (
    <div
      className={cn(
        "flex w-full flex-row items-center justify-between px-2",
        className
      )}
    >
      {children}
    </div>
  );
};

export const MobileNavMenu = ({
  children,
  className,
  isOpen,
}: MobileNavMenuProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{
            type: "spring",
            stiffness: 400,
            damping: 30,
          }}
          className={cn(
            "absolute inset-x-0 top-16 z-50 flex w-full flex-col items-start justify-start gap-3 rounded-2xl bg-card/95 backdrop-blur-xl border border-border/50 px-6 py-6 shadow-2xl shadow-black/10",
            className
          )}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export const MobileNavToggle = ({
  isOpen,
  onClick,
}: {
  isOpen: boolean;
  onClick: () => void;
}) => {
  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      whileHover={{ scale: 1.05 }}
      onClick={onClick}
      className="p-2 rounded-lg hover:bg-accent/60 transition-colors duration-200 text-foreground"
    >
      {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
    </motion.button>
  );
};

export const NavbarLogo = () => {
  return (
    <Link
      href="/"
      className="relative z-20 mr-4 flex items-center space-x-3 px-3 py-2 text-sm font-semibold text-foreground rounded-xl hover:bg-accent/40 transition-colors duration-200"
    >
      <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
        <span className="text-primary-foreground font-bold text-lg">S</span>
      </div>
      <span className="font-semibold text-foreground">Startup</span>
    </Link>
  );
};

export const NavbarButton = ({
  href,
  as: Tag = "a",
  children,
  className,
  variant = "primary",
  ...props
}: {
  href?: string;
  as?: React.ElementType;
  children: React.ReactNode;
  className?: string;
  variant?: "primary" | "secondary" | "dark" | "gradient";
} & (
  | React.ComponentPropsWithoutRef<"a">
  | React.ComponentPropsWithoutRef<"button">
)) => {
  const baseStyles =
    "px-5 py-2.5 rounded-xl font-semibold text-sm relative cursor-pointer transition-all duration-200 inline-flex items-center justify-center border";

  const variantStyles = {
    primary:
      "bg-primary text-primary-foreground border-primary/20 hover:bg-primary/90 hover:scale-105 hover:shadow-lg hover:shadow-primary/25",
    secondary:
      "bg-secondary text-secondary-foreground border-border/40 hover:bg-secondary/80 hover:scale-105 hover:shadow-md",
    dark: "bg-foreground text-background border-foreground/20 hover:bg-foreground/90 hover:scale-105 hover:shadow-lg hover:shadow-foreground/25",
    gradient:
      "bg-gradient-to-r from-primary to-primary/80 text-primary-foreground border-primary/20 hover:from-primary/90 hover:to-primary/70 hover:scale-105 hover:shadow-lg hover:shadow-primary/25",
  };

  return (
    <motion.div>
      <Tag
        href={href || undefined}
        className={cn(baseStyles, variantStyles[variant], className)}
        {...props}
      >
        {children}
      </Tag>
    </motion.div>
  );
};
