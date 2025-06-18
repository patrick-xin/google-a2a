import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { InlineTOC } from "fumadocs-ui/components/inline-toc";
import { blog } from "@/lib/source";
import { createMetadata } from "@/lib/metadata";
import { getMDXComponents } from "@/mdx-components";
import { Control } from "./page.client";

export default async function Page(props: {
  params: Promise<{ slug: string }>;
}) {
  const params = await props.params;
  const page = blog.getPage([params.slug]);
  if (!page) notFound();

  const { body: Mdx, toc } = await page.data;

  // Subtle noise SVG for texture
  const noiseSvg = `<svg viewBox='0 0 500 500' xmlns='http://www.w3.org/2000/svg'>
    <filter id='noiseFilter'>
      <feTurbulence
        type='fractalNoise'
        baseFrequency='0.65'
        numOctaves='3'
        stitchTiles='stitch'/>
      <feColorMatrix values='0 0 0 0 0 0 0 0 0 0.1 0 0 0 0 0.2 0 0 0 0.03 0'/>
    </filter>
    <rect width='100%' height='100%' filter='url(#noiseFilter)'/>
  </svg>`;

  return (
    <div className="h-full">
      {/* Hero Section */}
      <section
        className="relative mt-4 overflow-hidden"
        style={{
          background: [
            "linear-gradient(135deg, hsla(274,94%,54%,0.3), transparent 50%)",
            "linear-gradient(to left top, hsla(260,90%,50%,0.4), transparent 50%)",
            "radial-gradient(circle at 100% 100%, hsla(240,100%,82%,0.6), hsla(240,40%,40%,0.4) 17%, hsla(240,40%,40%,0.2) 20%, transparent)",
            `url("data:image/svg+xml,${encodeURIComponent(noiseSvg)}")`,
          ].join(", "),
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,hsl(var(--primary)/0.1),transparent_50%)]" />

        <div className="container mx-auto px-4 py-16 md:py-24 relative">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent leading-tight">
              {page.data.title}
            </h1>
            <p className="mt-6 text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              {page.data.description}
            </p>
            <div className="mt-8 flex items-center justify-center gap-4 text-sm text-muted-foreground">
              <span>By {page.data.author}</span>
              <span>•</span>
              <span>
                {new Date(page.data.date ?? page.file.name).toDateString()}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content - Holy Grail Layout */}
      <div
        className="min-h-svh"
        style={{
          background: [
            "linear-gradient(135deg, rgba(120, 119, 198, 0.1), rgba(255, 119, 198, 0.05))",
            "radial-gradient(circle at 50% 50%, rgba(50, 205, 255, 0.08), transparent)",
          ].join(", "),
        }}
      >
        <div className="container px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-7xl mx-auto">
          {/* Left Sidebar - Navigation/Metadata */}
          <aside className="lg:col-span-2 order-3 lg:order-1">
            <div className="sticky top-24">
              {/* Article Controls */}
              <Control url={page.url} />
            </div>
          </aside>

          {/* Main Article Content */}
          <article className="lg:col-span-7 lg:-mt-6 order-2 lg:order-2">
            <div className="prose max-w-none">
              <Mdx components={getMDXComponents()} />
            </div>
          </article>

          {/* Right Sidebar - Table of Contents */}
          <aside className="lg:col-span-3 order-1 lg:order-3">
            <div className="sticky top-24">
              <InlineTOC items={toc} />
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

export async function generateMetadata(props: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const params = await props.params;
  const page = blog.getPage([params.slug]);
  if (!page) notFound();

  return createMetadata({
    title: page.data.title,
    description:
      page.data.description ?? "Your go to source to know everything about A2A",
  });
}

export function generateStaticParams(): { slug: string }[] {
  return blog.getPages().map((page) => ({
    slug: page.slugs[0],
  }));
}
