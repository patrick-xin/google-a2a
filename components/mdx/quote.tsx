import { Quote } from "lucide-react";
import React from "react";

type CustomQuoteProps = {
  children: React.ReactNode;
  author?: string;
  source?: string;
};

const CustomQuote = ({ children, author, source }: CustomQuoteProps) => {
  return (
    <div className="my-6">
      <div
        className={`
          relative shadow-sm p-6 bg-card
        `}
      >
        {/* Quote icon */}
        <div className="absolute -top-2 -left-2 w-6 h-6 rounded-full flex items-center justify-center">
          <Quote className="text-primary" />
        </div>

        {/* Quote content */}
        <div className="relative z-10">
          <div className="text-foreground italic leading-relaxed">
            {children}
          </div>

          {(author || source) && (
            <footer className="mt-4 pt-3 border-t border-border/50">
              <cite className="text-muted-foreground text-sm not-italic">
                {author && (
                  <span className="font-medium text-foreground">{author}</span>
                )}
                {author && source && <span className="mx-2">—</span>}
                {source && <span className="italic">{source}</span>}
              </cite>
            </footer>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomQuote;
