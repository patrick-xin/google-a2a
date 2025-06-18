"use client";

import {
  createContext,
  type HTMLAttributes,
  type TextareaHTMLAttributes,
  use,
  useEffect,
  useRef,
} from "react";
import { Loader2, RefreshCw, Send, Trash2, X } from "lucide-react";
import {
  ScrollArea,
  ScrollViewport,
} from "fumadocs-ui/components/ui/scroll-area";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogOverlay,
  DialogPortal,
  type DialogProps,
  DialogTitle,
} from "@radix-ui/react-dialog";
import {
  type Message,
  useChat,
  type UseChatHelpers,
  type UseChatOptions,
} from "@ai-sdk/react";

import { Button, buttonVariants } from "../ui/button";
import { cn } from "@/lib/utils";
import { MemoizedMarkdown } from "../markdown";

// Create context with proper typing
const ChatContext = createContext<UseChatHelpers | null>(null);

// Simple hook to access chat context
function useChatContext() {
  const context = use(ChatContext);
  if (!context) {
    throw new Error("useChatContext must be used within a ChatProvider");
  }
  return context;
}

function SearchAIActions() {
  const { messages, status, setMessages, reload } = useChatContext();
  const isLoading = status === "streaming";

  if (messages.length === 0) return null;

  return (
    <div className="sticky bottom-0 px-3 py-1.5 flex flex-row items-center justify-end gap-2 empty:hidden">
      {!isLoading && messages.at(-1)?.role === "assistant" && (
        <Button size="sm" variant={"secondary"} onClick={() => reload()}>
          <RefreshCw className="size-4" />
        </Button>
      )}
      <Button size="sm" variant={"destructive"} onClick={() => setMessages([])}>
        <Trash2 />
      </Button>
    </div>
  );
}

function SearchAIInput(props: HTMLAttributes<HTMLDivElement>) {
  const { status, input, setInput, handleSubmit, stop } = useChatContext();
  const isLoading = status === "streaming" || status === "submitted";

  const onStart = (e?: React.FormEvent) => {
    e?.preventDefault();
    handleSubmit(e);
  };

  useEffect(() => {
    if (isLoading) {
      document.getElementById("ai-input")?.focus();
    }
  }, [isLoading]);

  return (
    <div
      {...props}
      className={cn(
        "flex items-start pe-2 transition-colors",
        isLoading && "bg-muted",
        props.className
      )}
    >
      <SearchInput
        value={input}
        placeholder={isLoading ? "AI is answering..." : "Ask AI something"}
        disabled={status === "streaming" || status === "submitted"}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(event) => {
          if (!event.shiftKey && event.key === "Enter") {
            onStart();
            event.preventDefault();
          }
        }}
      />
      {isLoading ? (
        <Button
          variant={"destructive"}
          className="rounded-full mt-3"
          onClick={stop}
          size={"icon"}
        >
          <Loader2 className="size-4 animate-spin" />
        </Button>
      ) : (
        <Button
          className="rounded-full mt-3"
          disabled={input.length === 0}
          onClick={onStart}
        >
          <Send className="size-4" />
        </Button>
      )}
    </div>
  );
}

function List(props: Omit<HTMLAttributes<HTMLDivElement>, "dir">) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new ResizeObserver(() => {
      const container = containerRef.current;
      if (!container) return;

      container.scrollTo({
        top: container.scrollHeight,
        behavior: "instant",
      });
    });

    // Initial scroll to bottom
    containerRef.current.scrollTop =
      containerRef.current.scrollHeight - containerRef.current.clientHeight;

    // Observe for changes after animation
    const timeoutId = setTimeout(() => {
      const element = containerRef.current?.firstElementChild;
      if (element) {
        observer.observe(element);
      }
    }, 2000);

    return () => {
      observer.disconnect();
      clearTimeout(timeoutId);
    };
  }, []);

  return (
    <ScrollArea {...props}>
      <ScrollViewport
        ref={containerRef}
        className="max-h-[calc(100dvh-240px)] *:!min-w-0 *:!flex *:flex-col"
      >
        {props.children}
      </ScrollViewport>
    </ScrollArea>
  );
}

function SearchInput(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const ref = useRef<HTMLDivElement>(null);
  const shared = cn("col-start-1 row-start-1 max-h-60 min-h-12 p-3");

  return (
    <div className="grid flex-1">
      <textarea
        id="ai-input"
        className={cn(
          shared,
          "resize-none bg-transparent placeholder:text-muted-foreground focus-visible:outline-none"
        )}
        {...props}
      />
      <div
        ref={ref}
        className={cn(shared, "break-all invisible")}
        aria-hidden="true"
      >
        {`${props.value?.toString() ?? ""}\n`}
      </div>
    </div>
  );
}

const roleName: Record<string, string> = {
  user: "you",
  assistant: "AI",
};

function Message({ message }: { message: Message }) {
  const { parts } = message;
  const { messages, status } = useChatContext();
  const isAssistant = message.role === "assistant";
  const isLastMessage = messages[messages.length - 1]?.id === message.id;
  const isStreaming = status === "streaming";
  const isLoading = status === "submitted";

  // Determine if this message is currently being generated
  const isActiveMessage =
    isAssistant && isLastMessage && (isLoading || isStreaming);
  const showLoadingIndicator = isActiveMessage && !message.content;
  const showStreamingIndicator =
    isActiveMessage && isStreaming && message.content;

  // Process tool invocations if needed
  for (const part of parts ?? []) {
    if (part.type !== "tool-invocation") continue;
    // Handle specific tool invocations here
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-1">
        <p
          className={cn(
            "text-xs font-medium text-muted-foreground",
            isAssistant && "text-primary"
          )}
        >
          {roleName[message.role] ?? "unknown"}
        </p>
        {showStreamingIndicator && (
          <span className="flex gap-0.5">
            <span className="size-1 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]" />
            <span className="size-1 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]" />
            <span className="size-1 rounded-full bg-primary animate-bounce" />
          </span>
        )}
      </div>

      {/* Loading indicator for empty assistant messages */}
      {showLoadingIndicator ? (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="size-3 animate-spin" />
            <span className="text-sm">Thinking...</span>
          </div>
          <div className="space-y-2">
            <div className="h-3 bg-muted rounded animate-pulse w-3/4" />
            <div className="h-3 bg-muted rounded animate-pulse w-1/2" />
          </div>
        </div>
      ) : (
        <div
          className={cn(
            "relative",
            showStreamingIndicator &&
              "after:content-[''] after:inline-block after:w-0.5 after:h-4 after:bg-primary after:animate-pulse after:ml-0.5 after:align-middle"
          )}
        >
          <MemoizedMarkdown content={message.content} />
        </div>
      )}
    </div>
  );
}

// Chat provider component that wraps the chat logic
function ChatProvider({
  children,
  options = {},
}: {
  children: React.ReactNode;
  options?: UseChatOptions;
}) {
  const defaultOptions: UseChatOptions = {
    id: "search",
    streamProtocol: "data",
    sendExtraMessageFields: true,
    maxSteps: 3,
    onResponse(response) {
      if (response.status === 401) {
        console.error("Unauthorized:", response.statusText);
      }
    },
    ...options,
  };

  const chat = useChat(defaultOptions);

  return <ChatContext.Provider value={chat}>{children}</ChatContext.Provider>;
}

function Content() {
  const { messages, error } = useChatContext();

  return (
    <>
      {error && (
        <div className="mb-3 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
          <p className="text-sm text-destructive">Error: {error.message}</p>
        </div>
      )}

      {messages.length > 0 && (
        <List className="bg-popover rounded-xl border shadow-lg animate-in duration-600">
          <div className="flex flex-col gap-4 p-3 pb-0">
            {messages.map((message, index) => (
              <Message key={`${message.id}-${index}`} message={message} />
            ))}
          </div>
          <SearchAIActions />
        </List>
      )}
      <div className="p-2 rounded-lg">
        <div className="rounded-xl overflow-hidden border shadow-lg bg-popover text-popover-foreground">
          <SearchAIInput />
          <div className="flex gap-2 items-center text-muted-foreground px-3 py-1.5">
            <DialogTitle className="text-xs flex-1">
              AI can be inaccurate, please verify the information.
            </DialogTitle>
            <DialogClose
              aria-label="Close"
              tabIndex={-1}
              className={cn(buttonVariants({ size: "sm", variant: "ghost" }))}
            >
              <X className="size-4" />
              Close Dialog
            </DialogClose>
          </div>
        </div>
      </div>
    </>
  );
}

export default function AIChat(props: DialogProps) {
  return (
    <Dialog {...props}>
      {props.children}
      <DialogPortal>
        <DialogOverlay className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm data-[state=closed]:animate-fade-out data-[state=open]:animate-fade-in" />
        <DialogContent
          onOpenAutoFocus={(e) => {
            document.getElementById("ai-input")?.focus();
            e.preventDefault();
          }}
          aria-describedby={undefined}
          className="fixed flex flex-col-reverse gap-3 md:flex-col max-md:top-12 md:bottom-12 left-1/2 z-50 w-[98vw] max-w-[860px] -translate-x-1/2 focus-visible:outline-none data-[state=closed]:animate-fd-fade-out"
        >
          <ChatProvider>
            <Content />
          </ChatProvider>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
}
