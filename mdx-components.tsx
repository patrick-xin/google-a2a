import defaultMdxComponents from "fumadocs-ui/mdx";
import type { MDXComponents } from "mdx/types";
import * as FilesComponents from "fumadocs-ui/components/files";
import * as TabsComponents from "fumadocs-ui/components/tabs";
import { Accordion, Accordions } from "fumadocs-ui/components/accordion";
import * as icons from "lucide-react";
import CustomQuote from "./components/mdx/quote";
import CustomLink from "./components/mdx/custom-link";
import { Mermaid } from "./components/mdx/mermaid";
import { ImageZoom } from "fumadocs-ui/components/image-zoom";

export function getMDXComponents(components?: MDXComponents): MDXComponents {
  return {
    ...(icons as unknown as MDXComponents),
    ...defaultMdxComponents,
    ...TabsComponents,
    ...FilesComponents,
    img: (props) => <ImageZoom {...props} />,
    Accordion,
    Accordions,
    CustomLink,
    Mermaid,
    CustomQuote,
    ...components,
  };
}
