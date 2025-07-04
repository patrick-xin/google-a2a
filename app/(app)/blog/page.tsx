import { Footer } from "@/components/footer";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import Link from "next/link";
import { blog } from "@/lib/source";

export default function Page(): React.ReactElement {
  const posts = [...blog.getPages()].sort(
    (a, b) =>
      new Date(b.data.date ?? b.file.name).getTime() -
      new Date(a.data.date ?? a.file.name).getTime()
  );

  // SVG noise background (subtle, not dominant)
  const svg = `<svg viewBox='0 0 500 500' xmlns='http://www.w3.org/2000/svg'><filter id='noiseFilter'><feTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(#noiseFilter)'/></svg>`;

  return (
    <>
      <div className="container max-sm:px-0 min-h-screen flex flex-col gap-16">
        {/* Hero Section: modern, editorial, unique */}
        <section
          className="relative rounded-2xl overflow-hidden shadow-lg mt-10 mb-12 border border-border/60"
          style={{
            backgroundImage: [
              "linear-gradient(120deg, var(--color-primary) 0%, var(--color-accent) 100%)",
              "radial-gradient(circle at 80% 20%, rgba(255,255,255,0.10) 0%, transparent 70%)",
              `url("data:image/svg+xml,${encodeURIComponent(svg)}")`,
            ].join(", "),
          }}
        >
          <div className="relative z-10 flex flex-col items-start justify-center h-[200px] md:h-[260px] px-6 md:px-16 py-10 md:py-16 text-left">
            <span className="uppercase tracking-widest text-xs font-bold text-primary-foreground/80 mb-2 opacity-80">
              Blog
            </span>
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight drop-shadow-sm mb-3">
              A2A Hub Editorial
            </h1>
            <p className="text-base md:text-lg font-medium max-w-2xl">
              Fresh perspectives, technical deep-dives, and community stories
              from the world of A2A.
            </p>
          </div>
          <div
            className="absolute inset-0 z-0 pointer-events-none"
            style={{
              background:
                "linear-gradient(120deg,rgba(255,255,255,0.08) 0%,rgba(255,255,255,0.02) 100%)",
            }}
          />
        </section>
        {/* Blog Grid */}
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {posts.map((post) => (
            <Link key={post.url} href={post.url} className="group">
              <Card className="h-full flex flex-col border border-border/60 shadow-md bg-card/90 group-hover:shadow-xl group-hover:border-primary/70 transition-all duration-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-semibold group-hover:text-primary transition-colors line-clamp-2">
                    {post.data.title}
                  </CardTitle>
                  <CardDescription className="line-clamp-3 min-h-[48px] text-muted-foreground/90">
                    {post.data.description}
                  </CardDescription>
                </CardHeader>
                <CardFooter className="mt-auto pt-2 text-xs text-muted-foreground/70 flex items-center gap-2">
                  <span className="inline-block w-2 h-2 rounded-full bg-gradient-to-tr from-primary to-accent mr-2 opacity-80" />
                  {new Date(
                    post.data.date ?? post.file.name
                  ).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </CardFooter>
              </Card>
            </Link>
          ))}
        </div>
      </div>
      <Footer />
    </>
  );
}
