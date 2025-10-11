"use client";

import { useEffect, useRef, useState } from "react";
import DailyIframe from "@daily-co/daily-js";

export default function RoomPage() {
  const dailyRoomUrl =
    process.env.NEXT_PUBLIC_DAILY_ROOM_URL || "YOUR_DAILY_ROOM_URL";
  const containerRef = useRef<HTMLDivElement>(null);
  const callObjectRef = useRef<any>(null);
  const [currentSlide, setCurrentSlide] = useState<number | null>(null);

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
        setCurrentSlide(slideId);
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
        callObjectRef.current.destroy().catch((err: any) => {
          console.error("Error destroying call object:", err);
        });
        callObjectRef.current = null;
      }
    };
  }, [dailyRoomUrl]);

  return (
    <div className="flex h-screen w-full bg-background">
      {currentSlide ? (
        // Presentation mode: Small video + Large slides
        <>
          {/* Video Call - Small Bottom Left Corner */}
          <div className="absolute bottom-4 left-4 w-80 h-60 z-10 rounded-lg overflow-hidden shadow-2xl border-2 border-white/20">
            <div ref={containerRef} className="h-full w-full" />
          </div>

          {/* Slides - Full Screen */}
          <div className="w-full h-full bg-black flex flex-col items-center justify-center p-8">
            <div className="w-full h-full flex flex-col items-center justify-center">
              <img
                src={`/slides/slide-${currentSlide}.jpg`}
                alt={`Slide ${currentSlide}`}
                className="max-w-full max-h-full object-contain"
                onError={(e) => {
                  console.error(`Failed to load slide ${currentSlide}`);
                  // Try .png if .jpg fails
                  e.currentTarget.src = `/slides/slide-${currentSlide}.png`;
                }}
              />
              <div className="mt-4 text-white text-sm bg-black/50 px-4 py-2 rounded">
                Slide {currentSlide}
              </div>
            </div>
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
