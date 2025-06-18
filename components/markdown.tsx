import { memo, useMemo } from "react";
import { marked } from "marked";
import ReactMarkdown from "react-markdown";
import { highlight } from "sugar-high";
import { cn } from "@/lib/utils";

function parseMarkdownIntoBlocks(markdown: string): string[] {
  const tokens = marked.lexer(markdown);
  return tokens.map((token) => token.raw);
}

// Separate component for code highlighting
const SyntaxHighlighter = ({
  children,
  className,
  language,
}: {
  children: string;
  className?: string;
  language?: string;
}) => {
  // Apply sugar-high syntax highlighting
  const highlightedCode = useMemo(() => {
    try {
      return { __html: highlight(children) };
    } catch (e) {
      console.error("Sugar-high highlighting error:", e);
      return { __html: children };
    }
  }, [children]);

  return (
    <pre className={cn("relative rounded-md my-4 text-sm", className)}>
      <code
        dangerouslySetInnerHTML={highlightedCode}
        className={`block overflow-x-auto ${
          language ? `language-${language}` : ""
        }`}
      />
    </pre>
  );
};

const MemoizedMarkdownBlock = memo(
  ({ content }: { content: string }) => {
    return (
      <ReactMarkdown
        components={{
          // @ts-expect-error error from react-markdown
          code: ({ inline, className, children, ...props }) => {
            const match = /language-(\w+)/.exec(className || "");
            return !inline && match ? (
              <SyntaxHighlighter language={match[1]} {...props}>
                {String(children).replace(/\n$/, "")}
              </SyntaxHighlighter>
            ) : (
              <code
                className={cn(
                  "bg-primary/10 border border-0.5 border-border-300 text-primary whitespace-pre-wrap rounded-[0.4rem] px-1 py-px text-[0.9rem]",
                  className
                )}
                {...props}
              >
                {children}
              </code>
            );
          },

          h1: ({ children }) => (
            <h1 className="text-2xl font-bold my-4">{children}</h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-xl font-bold my-4">{children}</h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-lg font-bold mt-4 my-4">{children}</h3>
          ),
          h4: ({ children }) => (
            <h4 className="text-lg font-semibold mt-4 mb-1 leading-snug">
              {children}
            </h4>
          ),

          p: ({ children }) => (
            <p className="text-base whitespace-pre-wrap break-words my-2 first:mt-0 last:mb-0 [&:has(+ul)]:mb-2">
              {children}
            </p>
          ),

          a: ({ href, children }) => (
            <a
              href={href}
              className="text-primary hover:underline underline-offset-2"
              target="_blank"
              rel="noopener noreferrer"
            >
              {children}
            </a>
          ),

          ul: ({ children }) => (
            <ul className="list-disc text-base [&:not(:last-child)_ul]:pb-1 [&:not(:last-child)_ol]:pb-1 space-y-1.5 pl-7">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal text-base [&:not(:last-child)_ul]:pb-1 [&:not(:last-child)_ol]:pb-1 space-y-1.5 pl-7">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="whitespace-normal break-words">{children}</li>
          ),

          blockquote: ({ children }) => (
            <blockquote className="border-l-4 pl-4 italic my-4">
              {children}
            </blockquote>
          ),

          table: ({ children }) => (
            <div className="overflow-auto my-4">
              <table className="w-full border-collapse border">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="text-left">{children}</thead>
          ),
          tbody: ({ children }) => <tbody>{children}</tbody>,
          tr: ({ children }) => <tr className="border-t">{children}</tr>,
          th: ({ children }) => (
            <th className="p-2 font-semibold text-sm">{children}</th>
          ),
          td: ({ children }) => <td className="p-2 text-sm">{children}</td>,
        }}
      >
        {content}
      </ReactMarkdown>
    );
  },
  (prevProps, nextProps) => prevProps.content === nextProps.content
);

MemoizedMarkdownBlock.displayName = "MemoizedMarkdownBlock";

export const MemoizedMarkdown = memo(
  ({ content, id }: { content: string; id?: string }) => {
    const blocks = useMemo(() => parseMarkdownIntoBlocks(content), [content]);
    const blockId = id || `md-${Date.now()}`;

    return blocks.map((block, index) => (
      <MemoizedMarkdownBlock
        content={block}
        key={`${blockId}-block_${index}`}
      />
    ));
  }
);

MemoizedMarkdown.displayName = "MemoizedMarkdown";
