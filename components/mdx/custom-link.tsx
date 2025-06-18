import Link from "next/link";
import React, { ReactNode } from "react";
import * as icons from "lucide-react";

interface CustomLinkProps {
  href: string;
  title?: string;
  icon?: string | ReactNode;
  children?: ReactNode;
  className?: string;
  target?: string;
  rel?: string;
}

const CustomLink = ({
  href,
  title,
  icon,
  children,
  className = "",
  ...props
}: CustomLinkProps) => {
  // Check if it's an external link
  const isExternal =
    href.startsWith("http") ||
    href.startsWith("https") ||
    href.startsWith("//");

  // Check if it's a hash link (anchor)
  const isHashLink = href.startsWith("#");

  // Check if it's a mailto or tel link
  const isSpecialLink = href.startsWith("mailto:") || href.startsWith("tel:");

  // Render the link content
  const linkContent = (
    <>
      {icon && (
        <span className="inline-flex items-center mr-2 text-muted-foreground size-4">
          {typeof icon === "string"
            ? // If icon is a string, try to get it from icons object
              (() => {
                const IconComponent = icons[
                  icon as keyof typeof icons
                ] as React.ComponentType;
                return IconComponent ? <IconComponent /> : <span>{icon}</span>;
              })()
            : icon}
        </span>
      )}
      {title || children}
    </>
  );

  // For external links, mailto, tel, or hash links, use regular anchor tag
  if (isExternal || isHashLink || isSpecialLink) {
    return (
      <a
        href={href}
        className={`inline-flex items-center ${className}`}
        {...props}
        // Add target="_blank" and rel="noopener noreferrer" for external links
        {...(isExternal && {
          target: "_blank",
          rel: "noopener noreferrer",
        })}
      >
        {linkContent}
      </a>
    );
  }

  // For internal links, use Next.js Link
  return (
    <Link
      href={href}
      className={`inline-flex items-center ${className}`}
      {...props}
    >
      {linkContent}
    </Link>
  );
};

export default CustomLink;
