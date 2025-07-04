import { remark } from "remark";
import remarkGfm from "remark-gfm";
import { remarkInstall } from "fumadocs-docgen";
import remarkMdx from "remark-mdx";
import { remarkAutoTypeTable } from "fumadocs-typescript";
import { remarkInclude } from "fumadocs-mdx/config";
import { type Page } from "@/lib/source";

const processor = remark()
  .use(remarkMdx)
  .use(remarkInclude)
  .use(remarkGfm)
  .use(remarkAutoTypeTable)
  .use(remarkInstall);

export async function getLLMText(page: Page) {
  const processed = await processor.process({
    path: page.data._file.absolutePath,
    value: page.data.content,
  });

  return `# ${page.data.title}
URL: ${page.url}

${page.data.description ?? ""}
        
${processed.value}`;
}
