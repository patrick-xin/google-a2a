import { docs, blog as blogPosts } from "@/.source";
import { InferMetaType, InferPageType, loader } from "fumadocs-core/source";
import { createMDXSource } from "fumadocs-mdx";
import { icons } from "lucide-react";
import { createElement } from "react";

export const source = loader({
  // it assigns a URL to your pages
  baseUrl: "/docs",
  icon(icon) {
    if (icon && icon in icons)
      return createElement(icons[icon as keyof typeof icons]);
  },
  source: docs.toFumadocsSource(),
});

export const blog = loader({
  baseUrl: "/blog",
  source: createMDXSource(blogPosts),
});

export type Page = InferPageType<typeof source>;
export type Meta = InferMetaType<typeof source>;
