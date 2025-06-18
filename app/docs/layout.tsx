import { DocsLayout } from "fumadocs-ui/layouts/docs";
import type { ReactNode } from "react";
import { baseOptions, logo } from "@/app/layout.config";
import { source } from "@/lib/source";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Sparkles } from "lucide-react";
import { AISearchTrigger } from "@/components/ai/search-trigger";
import { LargeSearchToggle } from "fumadocs-ui/components/layout/search-toggle";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <DocsLayout
      {...baseOptions}
      tree={source.pageTree}
      searchToggle={{
        components: {
          lg: (
            <div className="flex gap-1.5 max-md:hidden">
              <LargeSearchToggle className="flex-1" />
              <AISearchTrigger
                aria-label="Ask AI"
                className={cn(
                  "mt-0.5",
                  buttonVariants({
                    variant: "secondary",
                    size: "sm",
                  })
                )}
              >
                <Sparkles className="size-4 text-fd-primary fill-current" />
              </AISearchTrigger>
            </div>
          ),
        },
      }}
      sidebar={{
        tabs: {
          transform(option, node) {
            const meta = source.getNodeMeta(node);
            if (!meta || !node.icon) return option;

            const color = `var(--${meta.file.dirname}-color, var(--color-fd-foreground))`;

            return {
              ...option,
              icon: (
                <div
                  className="rounded-lg p-1.5 shadow-lg ring-2 m-px border [&_svg]:size-6.5 md:[&_svg]:size-5"
                  style={
                    {
                      color,
                      borderColor: `color-mix(in oklab, ${color} 50%, transparent)`,
                      "--tw-ring-color": `color-mix(in oklab, ${color} 20%, transparent)`,
                    } as object
                  }
                >
                  {node.icon}
                </div>
              ),
            };
          },
        },
      }}
      nav={{
        ...baseOptions.nav,

        title: (
          <>
            {logo}
            <span className="font-semibold [.uwu_&]:hidden max-md:hidden">
              A2A Hub
            </span>
          </>
        ),
        children: (
          <AISearchTrigger
            className={cn(
              buttonVariants({
                variant: "secondary",
                size: "sm",
                className:
                  "absolute left-1/2 top-1/2 -translate-1/2 text-fd-muted-foreground rounded-full gap-2 md:hidden",
              })
            )}
          >
            <Sparkles className="size-4.5 fill-current" />
            Ask AI
          </AISearchTrigger>
        ),
      }}
    >
      {children}
    </DocsLayout>
  );
}
