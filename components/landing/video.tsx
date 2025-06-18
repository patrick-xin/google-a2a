"use client";
import React, { useState, useRef, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Play, X, Loader2 } from "lucide-react";

const LandingVideo: React.FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasError, setHasError] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Reset video when modal closes
  useEffect(() => {
    if (!isOpen && videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
      setIsLoading(true);
      setHasError(false);
    }
  }, [isOpen]);

  const handleVideoEnd = (): void => {
    // Optional: Auto-close modal when video ends
    // setIsOpen(false);
  };

  const handleVideoLoad = (): void => {
    setIsLoading(false);
    setHasError(false);
  };

  const handleVideoError = (): void => {
    setIsLoading(false);
    setHasError(true);
  };

  const handleVideoLoadStart = (): void => {
    setIsLoading(true);
    setHasError(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size={"lg"} variant={"outline"}>
          <Play className="w-5 h-5" />
          Watch Demo
        </Button>
      </DialogTrigger>

      <DialogContent
        className="max-w-[80vw] w-[80vw] max-h-[80vh] p-0 sm:max-w-[80vw] md:max-w-[85vw] lg:max-w-[80vw]"
        showCloseButton={false}
      >
        <VisuallyHidden>
          <DialogTitle>Demo Video</DialogTitle>
        </VisuallyHidden>

        {/* Custom Close Button */}
        <DialogClose asChild>
          <Button
            variant="outline"
            size="icon"
            className="absolute -top-12 right-0 z-50 bg-background/80 backdrop-blur-sm hover:bg-background/90 border-border/50"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close video</span>
          </Button>
        </DialogClose>

        <div className="relative w-full h-full">
          {/* Loading Spinner */}
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-muted/50 rounded-lg z-10">
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">
                  Loading video...
                </p>
              </div>
            </div>
          )}

          {/* Error State */}
          {hasError && (
            <div className="absolute inset-0 flex items-center justify-center bg-muted/50 rounded-lg z-10">
              <div className="flex flex-col items-center gap-4 text-center p-6">
                <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
                  <X className="h-6 w-6 text-destructive" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">Video unavailable</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Sorry, we couldn't load the video. Please try again later.
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (videoRef.current) {
                      videoRef.current.load();
                    }
                  }}
                >
                  Try Again
                </Button>
              </div>
            </div>
          )}

          {/* Video Container */}
          <div className="relative w-full h-full">
            <div className="aspect-[16/9] w-full h-full">
              <video
                ref={videoRef}
                className="w-full h-full object-cover rounded-lg"
                controls
                autoPlay
                preload="metadata"
                onEnded={handleVideoEnd}
                onLoadedData={handleVideoLoad}
                onError={handleVideoError}
                onLoadStart={handleVideoLoadStart}
                controlsList="nodownload"
              >
                <source
                  src="https://storage.googleapis.com/gweb-developer-goog-blog-assets/original_videos/A2A_demo_v4.mp4"
                  type="video/mp4"
                />
                Your browser does not support the video tag.
              </video>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LandingVideo;
