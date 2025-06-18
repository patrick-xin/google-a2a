import { source } from "@/lib/source";
import {
  DocsPage,
  DocsBody,
  DocsDescription,
  DocsTitle,
} from "fumadocs-ui/page";
import { notFound } from "next/navigation";
import { createRelativeLink } from "fumadocs-ui/mdx";
import { getMDXComponents } from "@/mdx-components";
import { ClaudeLink, GitHubLink, LLMCopyButton } from "./page.client";
import { chunkMDXDocument } from "@/lib/ai/chunking";
import { getLLMText } from "@/lib/get-llm-text";
import {
  embedDocument,
  generateSingleEmbedding,
  searchDocuments,
  searchForAgent,
  testEmbeddingPipeline,
} from "@/lib/ai/embedding";
import { quickFix, testWithCorrectThresholds } from "@/lib/ai/debug";
import { testEnhancedSearch } from "@/lib/ai/embedding-comparison-test";
import { Breadcrumb } from "@/components/breadcrumb";

export default async function Page(props: {
  params: Promise<{ slug: string[] }>;
}) {
  const params = await props.params;
  const page = source.getPage(params.slug);
  if (!page) notFound();
  // const result = await getLLMText(page);

  // const embeddingResult = await embedDocument(result);
  // console.log("Embedding result:", embeddingResult);

  // const searchResult = await searchForAgent("Agent Card");
  // console.log("Search result:", searchResult);

  const MDXContent = page.data.body;

  return (
    <DocsPage
      toc={page.data.toc}
      full={page.data.full}
      //  breadcrumb={{ component: <Breadcrumb tree={source.pageTree} /> }}
      tableOfContent={{
        style: "clerk",
        footer: (
          <div className="my-4">
            <LLMCopyButton slug={params.slug} />
          </div>
        ),
      }}
      // lastUpdate={new Date(lastModifiedTime)}
    >
      <DocsTitle>{page.data.title}</DocsTitle>
      <DocsDescription>{page.data.description}</DocsDescription>
      <div className="flex flex-row gap-2 items-center border-b pb-6">
        {/* <GitHubLink url={`https://github.com/`} /> */}
      </div>

      <DocsBody className="text-foreground prose-code:bg-primary/10 prose-code:break-words prose-code:max-w-full flex-1">
        <MDXContent
          components={getMDXComponents({
            // link to other pages with relative file paths
            a: createRelativeLink(source, page),
          })}
        />
      </DocsBody>
    </DocsPage>
  );
}

export async function generateStaticParams() {
  return source.generateParams();
}

export async function generateMetadata(props: {
  params: Promise<{ slug?: string[] }>;
}) {
  const params = await props.params;
  const page = source.getPage(params.slug);
  if (!page) notFound();

  return {
    title: page.data.title,
    description: page.data.description ?? "",
  };
}
