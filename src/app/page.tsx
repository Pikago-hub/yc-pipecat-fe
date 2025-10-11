"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

const ROOM_NAME = "passepartout";

interface SlideData {
  id: string;
  title: string;
  aiNotes: string;
  rawMd: string;
  presenterNotes?: string;
}

interface SlidesResponse {
  slides: SlideData[];
}

export default function Home() {
  const router = useRouter();
  const [slidesData, setSlidesData] = useState<SlideData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSendingToBackend, setIsSendingToBackend] = useState(false);
  const slidesInitializedRef = useRef(false);

  const revealApiUrl =
    process.env.NEXT_PUBLIC_REVEAL_API_URL || "http://localhost:8000";
  const backendUrl =
    process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

  // Fetch slides on page load
  useEffect(() => {
    const fetchSlides = async () => {
      if (slidesInitializedRef.current) return;
      slidesInitializedRef.current = true;
      setIsLoading(true);

      try {
        console.log("Fetching slides from reveal API...");
        const response = await fetch(revealApiUrl);

        if (!response.ok) {
          console.error("Failed to fetch slides:", await response.text());
          return;
        }

        const data: SlidesResponse = await response.json();
        console.log(
          "Slides fetched successfully:",
          data.slides.length,
          "slides"
        );
        setSlidesData(data.slides);

        // Store slides in localStorage for room page to access
        localStorage.setItem("slidesData", JSON.stringify(data.slides));
      } catch (error) {
        console.error("Error fetching slides:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSlides();
  }, [revealApiUrl]);

  const handleJoinCall = async () => {
    if (slidesData.length === 0) {
      console.error("No slides data available");
      router.push(`/room/${ROOM_NAME}`);
      return;
    }

    setIsSendingToBackend(true);

    try {
      // Send slides to backend for script generation
      console.log("Sending slides to backend for script generation...");
      const response = await fetch(`${backendUrl}/api/agent/initialize`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ slides: slidesData }),
      });

      if (response.ok) {
        console.log("Backend initialized with slides successfully");
      } else {
        console.error("Failed to initialize backend:", await response.text());
      }
    } catch (error) {
      console.error("Error sending slides to backend:", error);
    } finally {
      setIsSendingToBackend(false);
      // Navigate to room regardless of backend response
      router.push(`/room/${ROOM_NAME}`);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-5xl font-bold tracking-tight">Passepartout</h1>
          <p className="text-xl text-muted-foreground">
            Your Personal Travel Architect
          </p>
        </div>

        <div className="space-y-4 pt-4">
          <Button
            onClick={handleJoinCall}
            className="h-14 w-full text-lg"
            size="lg"
            disabled={isLoading || isSendingToBackend}
          >
            {isLoading
              ? "Loading slides..."
              : isSendingToBackend
              ? "Initializing..."
              : "Join Room"}
          </Button>
        </div>

        <div className="text-center text-sm text-muted-foreground pt-4">
          <p>
            {isLoading
              ? "Fetching presentation data..."
              : "Click to join and start planning your journey"}
          </p>
        </div>
      </div>
    </div>
  );
}
