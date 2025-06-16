export interface DocumentMetadata {
  title: string;
  url: string;
  description?: string;
  baseUrl: string;
  fullUrl: string;
}

interface HeadingNode {
  level: number;
  text: string;
  anchor: string;
  startIndex: number;
  endIndex?: number;
  children: HeadingNode[];
  content: string;
}

export interface ChunkMetadata {
  title: string;
  url: string;
  section?: string;
  subsection?: string;
  anchor?: string;
  headingPath: string;
  chunkType: "intro" | "section" | "subsection" | "definition" | "example";
  chunkIndex: number;
  wordCount: number;
  hasOverlap: boolean;
}

export interface DocumentChunk {
  content: string;
  metadata: ChunkMetadata;
  contextualContent: string; // Content with hierarchical context added
}

interface ChunkingOptions {
  targetChunkSize: number; // Target words per chunk
  maxChunkSize: number; // Maximum words before forced split
  overlapSize: number; // Words to overlap between chunks
  respectCodeBlocks: boolean;
  includeHierarchicalContext: boolean;
}

const DEFAULT_OPTIONS: ChunkingOptions = {
  targetChunkSize: 400,
  maxChunkSize: 800,
  overlapSize: 75,
  respectCodeBlocks: true,
  includeHierarchicalContext: true,
};

/**
 * Parses document metadata from the structured header
 */
function parseDocumentMetadata(
  content: string,
  baseUrl: string
): DocumentMetadata {
  const lines = content.split("\n");

  // Extract title from first line
  const titleMatch = lines[0]?.match(/^#\s+(.+)$/);
  const title = titleMatch?.[1] || "Untitled Document";

  // Extract URL from second line
  const urlMatch = lines[1]?.match(/^URL:\s+(.+)$/);
  const url = urlMatch?.[1] || "/docs/unknown";

  // Extract description (optional, after ***)
  let description: string | undefined;
  const separatorIndex = lines.findIndex((line) => line.trim() === "***");
  if (separatorIndex > -1 && separatorIndex < lines.length - 1) {
    // Look for description in the frontmatter-like section
    for (let i = separatorIndex + 1; i < lines.length; i++) {
      if (lines[i].trim() === "" || lines[i].includes("---")) continue;
      if (lines[i].startsWith("title:") || lines[i].startsWith("icon:"))
        continue;
      description = lines[i].trim();
      break;
    }
  }

  return {
    title,
    url,
    description,
    baseUrl,
    fullUrl: `${baseUrl}${url}`,
  };
}

/**
 * Generates URL-friendly anchor from heading text
 */
function generateAnchor(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "") // Remove special characters
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Remove duplicate hyphens
    .trim();
}

/**
 * Extracts heading structure from markdown content
 */
function extractHeadingStructure(content: string): HeadingNode[] {
  const lines = content.split("\n");
  const headings: HeadingNode[] = [];
  const headingStack: HeadingNode[] = [];

  // Skip metadata section
  let contentStartIndex = 0;
  const separatorIndex = lines.findIndex((line) => line.trim() === "***");
  if (separatorIndex > -1) {
    // Find the second separator or end of frontmatter
    for (let i = separatorIndex + 1; i < lines.length; i++) {
      if (
        lines[i].includes("---") ||
        (i > separatorIndex + 10 && lines[i].trim() !== "")
      ) {
        contentStartIndex = i + 1;
        break;
      }
    }
  }

  for (let i = contentStartIndex; i < lines.length; i++) {
    const line = lines[i];
    const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);

    if (headingMatch) {
      const level = headingMatch[1].length;
      const text = headingMatch[2].trim();
      const anchor = generateAnchor(text);

      const heading: HeadingNode = {
        level,
        text,
        anchor,
        startIndex: i,
        children: [],
        content: "",
      };

      // Close previous headings of same or lower level
      while (
        headingStack.length > 0 &&
        headingStack[headingStack.length - 1].level >= level
      ) {
        const closedHeading = headingStack.pop()!;
        closedHeading.endIndex = i - 1;
      }

      // Add to parent or root
      if (headingStack.length > 0) {
        headingStack[headingStack.length - 1].children.push(heading);
      } else {
        headings.push(heading);
      }

      headingStack.push(heading);
    }
  }

  // Close remaining headings
  while (headingStack.length > 0) {
    const closedHeading = headingStack.pop()!;
    closedHeading.endIndex = lines.length - 1;
  }

  // Extract content for each heading
  function extractContent(node: HeadingNode, lines: string[]): void {
    const startLine = node.startIndex + 1; // Skip the heading line itself
    const endLine = node.endIndex || lines.length - 1;
    node.content = lines
      .slice(startLine, endLine + 1)
      .join("\n")
      .trim();

    // Process children
    node.children.forEach((child) => extractContent(child, lines));
  }

  headings.forEach((heading) => extractContent(heading, lines));

  return headings;
}

/**
 * Gets the hierarchical path for a heading
 */
function getHeadingPath(
  heading: HeadingNode,
  parents: HeadingNode[] = []
): string {
  const path = [...parents.map((p) => p.text), heading.text];
  return path.join(" > ");
}

/**
 * Counts words in text
 */
function countWords(text: string): number {
  return text
    .trim()
    .split(/\s+/)
    .filter((word) => word.length > 0).length;
}

/**
 * Splits text at natural boundaries (paragraphs, sentences)
 */
function splitAtNaturalBoundaries(text: string, maxWords: number): string[] {
  const paragraphs = text.split(/\n\s*\n/);
  const chunks: string[] = [];
  let currentChunk = "";

  for (const paragraph of paragraphs) {
    const paragraphWords = countWords(paragraph);
    const currentWords = countWords(currentChunk);

    if (currentWords + paragraphWords <= maxWords) {
      currentChunk += (currentChunk ? "\n\n" : "") + paragraph;
    } else {
      if (currentChunk) {
        chunks.push(currentChunk.trim());
      }

      // If single paragraph is too large, split by sentences
      if (paragraphWords > maxWords) {
        const sentences = paragraph.split(/(?<=[.!?])\s+/);
        let sentenceChunk = "";

        for (const sentence of sentences) {
          const sentenceWords = countWords(sentence);
          const chunkWords = countWords(sentenceChunk);

          if (chunkWords + sentenceWords <= maxWords) {
            sentenceChunk += (sentenceChunk ? " " : "") + sentence;
          } else {
            if (sentenceChunk) {
              chunks.push(sentenceChunk.trim());
            }
            sentenceChunk = sentence;
          }
        }

        if (sentenceChunk) {
          currentChunk = sentenceChunk;
        } else {
          currentChunk = "";
        }
      } else {
        currentChunk = paragraph;
      }
    }
  }

  if (currentChunk) {
    chunks.push(currentChunk.trim());
  }

  return chunks.filter((chunk) => chunk.length > 0);
}

/**
 * Creates chunks from heading nodes
 */
function createChunksFromHeadings(
  headings: HeadingNode[],
  docMetadata: DocumentMetadata,
  options: ChunkingOptions,
  parents: HeadingNode[] = []
): DocumentChunk[] {
  const chunks: DocumentChunk[] = [];
  let chunkIndex = 0;

  function processHeading(heading: HeadingNode, parents: HeadingNode[]): void {
    const headingPath = getHeadingPath(heading, parents);
    const contentWords = countWords(heading.content);

    // Determine chunk type
    let chunkType: ChunkMetadata["chunkType"] = "section";
    if (heading.level === 3) chunkType = "subsection";
    if (heading.text.toLowerCase().includes("example")) chunkType = "example";
    if (parents.length === 0 && heading.level === 2) chunkType = "definition";

    if (contentWords <= options.targetChunkSize) {
      // Content fits in one chunk
      const contextualContent = options.includeHierarchicalContext
        ? `Context: ${headingPath}\n\n## ${heading.text}\n\n${heading.content}`
        : `## ${heading.text}\n\n${heading.content}`;

      chunks.push({
        content: heading.content,
        contextualContent,
        metadata: {
          title: docMetadata.title,
          url: docMetadata.fullUrl,
          section: parents[0]?.text,
          subsection: heading.level === 3 ? heading.text : undefined,
          anchor: `#${heading.anchor}`,
          headingPath,
          chunkType,
          chunkIndex: chunkIndex++,
          wordCount: contentWords,
          hasOverlap: false,
        },
      });
    } else if (contentWords <= options.maxChunkSize) {
      // Content is large but manageable, try to keep together
      const contextualContent = options.includeHierarchicalContext
        ? `Context: ${headingPath}\n\n## ${heading.text}\n\n${heading.content}`
        : `## ${heading.text}\n\n${heading.content}`;

      chunks.push({
        content: heading.content,
        contextualContent,
        metadata: {
          title: docMetadata.title,
          url: docMetadata.fullUrl,
          section: parents[0]?.text,
          subsection: heading.level === 3 ? heading.text : undefined,
          anchor: `#${heading.anchor}`,
          headingPath,
          chunkType,
          chunkIndex: chunkIndex++,
          wordCount: contentWords,
          hasOverlap: false,
        },
      });
    } else {
      // Content is too large, need to split
      const textChunks = splitAtNaturalBoundaries(
        heading.content,
        options.targetChunkSize
      );

      textChunks.forEach((textChunk, index) => {
        const isFirst = index === 0;
        const isLast = index === textChunks.length - 1;

        // Add overlap from previous chunk (for continuity)
        let chunkContent = textChunk;
        if (!isFirst && index > 0) {
          const previousChunk = textChunks[index - 1];
          const overlapWords = previousChunk
            .split(/\s+/)
            .slice(-options.overlapSize)
            .join(" ");
          chunkContent = overlapWords + "\n\n" + textChunk;
        }

        // Add forward overlap to next chunk (except for last chunk)
        if (!isLast && index < textChunks.length - 1) {
          const nextChunk = textChunks[index + 1];
          const forwardOverlapWords = nextChunk
            .split(/\s+/)
            .slice(0, Math.floor(options.overlapSize / 2))
            .join(" ");
          chunkContent = chunkContent + "\n\n" + forwardOverlapWords;
        }

        const contextualContent = options.includeHierarchicalContext
          ? `Context: ${headingPath}${
              textChunks.length > 1
                ? ` (Part ${index + 1}/${textChunks.length})`
                : ""
            }\n\n## ${heading.text}\n\n${chunkContent}`
          : `## ${heading.text}\n\n${chunkContent}`;

        chunks.push({
          content: chunkContent,
          contextualContent,
          metadata: {
            title: docMetadata.title,
            url: docMetadata.fullUrl,
            section: parents[0]?.text,
            subsection: heading.level === 3 ? heading.text : undefined,
            anchor: `#${heading.anchor}`,
            headingPath:
              headingPath +
              (textChunks.length > 1 ? ` (Part ${index + 1})` : ""),
            chunkType,
            chunkIndex: chunkIndex++,
            wordCount: countWords(chunkContent),
            hasOverlap: !isFirst || !isLast,
          },
        });
      });
    }

    // Process children
    heading.children.forEach((child) =>
      processHeading(child, [...parents, heading])
    );
  }

  headings.forEach((heading) => processHeading(heading, parents));
  return chunks;
}

/**
 * Main chunking function
 */
export function chunkMDXDocument(
  content: string,
  baseUrl: string = process.env.NEXT_PUBLIC_BASE_URL!,
  options: Partial<ChunkingOptions> = {}
): {
  metadata: DocumentMetadata;
  chunks: DocumentChunk[];
  headingStructure: HeadingNode[];
} {
  const finalOptions = { ...DEFAULT_OPTIONS, ...options };

  // Parse document metadata
  const metadata = parseDocumentMetadata(content, baseUrl);

  // Extract heading structure
  const headingStructure = extractHeadingStructure(content);

  // Create chunks
  const chunks = createChunksFromHeadings(
    headingStructure,
    metadata,
    finalOptions
  );

  // Handle introduction content (before first heading)
  const lines = content.split("\n");
  const firstHeadingIndex = lines.findIndex((line) => line.match(/^#{1,6}\s+/));
  if (firstHeadingIndex > 0) {
    const introContent = lines.slice(0, firstHeadingIndex).join("\n").trim();
    if (introContent && countWords(introContent) > 20) {
      const contextualContent = finalOptions.includeHierarchicalContext
        ? `Context: ${metadata.title} - Introduction\n\n${introContent}`
        : introContent;

      chunks.unshift({
        content: introContent,
        contextualContent,
        metadata: {
          title: metadata.title,
          url: metadata.fullUrl,
          headingPath: `${metadata.title} - Introduction`,
          chunkType: "intro",
          chunkIndex: 0,
          wordCount: countWords(introContent),
          hasOverlap: false,
        },
      });

      // Update chunk indices
      chunks.slice(1).forEach((chunk, index) => {
        chunk.metadata.chunkIndex = index + 1;
      });
    }
  }

  return {
    metadata,
    chunks,
    headingStructure,
  };
}

// Utility function for testing
export function analyzeChunking(content: string): void {
  const result = chunkMDXDocument(content);

  console.log("=== DOCUMENT ANALYSIS ===");
  console.log(`Title: ${result.metadata.title}`);
  console.log(`URL: ${result.metadata.fullUrl}`);
  console.log(`Total chunks: ${result.chunks.length}`);
  console.log(
    `Heading structure: ${result.headingStructure.length} main sections`
  );

  console.log("\n=== CHUNKS ===");
  result.chunks.forEach((chunk, index) => {
    console.log(`\nChunk ${index + 1}:`);
    console.log(`- Type: ${chunk.metadata.chunkType}`);
    console.log(`- Path: ${chunk.metadata.headingPath}`);
    console.log(`- Words: ${chunk.metadata.wordCount}`);
    console.log(`- URL: ${chunk.metadata.url}${chunk.metadata.anchor || ""}`);
    console.log(`- Content preview: ${chunk.content.substring(0, 100)}...`);
  });
}
