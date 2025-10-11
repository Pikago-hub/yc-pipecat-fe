"use client";

import { useEffect, useRef, useState } from "react";
import DailyIframe, { DailyCall } from "@daily-co/daily-js";
import RevealSlides, { RevealSlidesHandle } from "@/components/RevealSlides";
import { marked } from "marked";

interface SlideData {
  id: string;
  title: string;
  aiNotes: string;
  rawMd: string;
  presenterNotes?: string;
}

export default function RoomPage() {
  const dailyRoomUrl = process.env.NEXT_PUBLIC_DAILY_ROOM_URL;
  const containerRef = useRef<HTMLDivElement>(null);
  const callObjectRef = useRef<DailyCall | null>(null);
  const revealRef = useRef<RevealSlidesHandle>(null);
  const [isPresentationMode, setIsPresentationMode] = useState(false);
  const [slides, setSlides] = useState<string[]>([]);
  const slideIdToIndexMap = useRef<Map<string, number>>(new Map());

  // Load slides from localStorage
  useEffect(() => {
    const storedSlides = localStorage.getItem('slidesData');
    if (storedSlides) {
      try {
        const slidesData: SlideData[] = JSON.parse(storedSlides);

        // Create ID to index mapping
        const idMap = new Map<string, number>();
        slidesData.forEach((slide, index) => {
          idMap.set(slide.id, index);
        });
        slideIdToIndexMap.current = idMap;
        console.log("Slide ID mapping:", Object.fromEntries(idMap));

        // Convert markdown to HTML slides using marked
        const htmlSlides = slidesData.map((slide) => {
          return marked.parse(slide.rawMd, { async: false }) as string;
        });
        setSlides(htmlSlides);
        console.log("Loaded", htmlSlides.length, "slides from localStorage");
      } catch (error) {
        console.error("Error loading slides from localStorage:", error);
      }
    }
  }, []);

  useEffect(() => {
    if (!containerRef.current || callObjectRef.current) return;

    // Create Daily call object with Prebuilt UI
    const callObject = DailyIframe.createFrame(containerRef.current, {
      url: dailyRoomUrl,
      showLeaveButton: true,
      showFullscreenButton: true,
    });

    callObjectRef.current = callObject;

    // Listen for when user clicks Join in Daily's prejoin screen
    callObject.on("joined-meeting", async () => {
      console.log("User joined meeting - starting voice agent...");

      // Enable active speaker mode so whoever is speaking shows larger
      try {
        callObject.setActiveSpeakerMode(true);
        console.log("Active speaker mode enabled");
      } catch (error) {
        console.error("Error enabling active speaker mode:", error);
      }

      try {
        // Call backend to start the voice agent
        const backendUrl =
          process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";
        const response = await fetch(`${backendUrl}/api/agent/start`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          console.log("Voice agent started successfully");
        } else {
          console.error("Failed to start agent:", await response.text());
        }
      } catch (error) {
        console.error("Error starting agent:", error);
      }
    });

    // Listen for app-message events from bot
    callObject.on("app-message", (event) => {
      console.log("Message:", event.data);

      // Only process slide messages
      if (event.data?.type === "slide") {
        const slideId = event.data.slideId;
        console.log("Switching to slide:", slideId);

        // Look up slide index from ID
        const slideIndex = slideIdToIndexMap.current.get(slideId);
        if (slideIndex === undefined) {
          console.error("Unknown slide ID:", slideId);
          return;
        }

        // Enter presentation mode if not already
        setIsPresentationMode((prev) => {
          if (!prev) return true;
          return prev;
        });

        // Navigate to the slide
        if (revealRef.current) {
          console.log(`Navigating to slide ${slideId} (index ${slideIndex})`);
          revealRef.current.goToSlide(slideIndex);
        }
      } else if (event.data?.type === "slide-next") {
        revealRef.current?.next();
      } else if (event.data?.type === "slide-prev") {
        revealRef.current?.prev();
      } else {
        console.log("Ignoring non-slide message:", event.data);
      }
    });

    // Show Daily's prejoin screen
    callObject.join().catch((err) => {
      console.error("Failed to join call:", err);
    });

    // Cleanup
    return () => {
      if (callObjectRef.current) {
        callObjectRef.current.destroy().catch((err: unknown) => {
          console.error("Error destroying call object:", err);
        });
        callObjectRef.current = null;
      }
    };
  }, [dailyRoomUrl]);

  return (
    <div className="flex h-screen w-full bg-background">
      {isPresentationMode ? (
        // Presentation mode: Small video + Large slides
        <>
          {/* Video Call - Small Bottom Left Corner */}
          <div className="absolute bottom-4 left-4 w-80 h-60 z-10 rounded-lg overflow-hidden shadow-2xl border-2 border-white/20">
            <div ref={containerRef} className="h-full w-full" />
          </div>

          {/* Reveal.js Slides - Full Screen */}
          <div className="w-full h-full bg-black">
            <RevealSlides ref={revealRef} initialSlides={slides} />
          </div>
        </>
      ) : (
        // Chit-chat mode: Full screen video call
        <div className="w-full h-full">
          <div ref={containerRef} className="h-full w-full" />
        </div>
      )}
    </div>
  );
}
