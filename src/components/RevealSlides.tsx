"use client";

import { useEffect, useRef, forwardRef, useImperativeHandle } from "react";
import Reveal from "reveal.js";
import "reveal.js/dist/reveal.css";
import "reveal.js/dist/theme/black.css";

export interface RevealSlidesHandle {
  next: () => void;
  prev: () => void;
  goToSlide: (index: number) => void;
  getCurrentSlide: () => number;
  updateSlideContent: (index: number, content: string) => void;
  addSlide: (content: string) => void;
  sync: () => void;
}

interface RevealSlidesProps {
  initialSlides?: string[];
}

const RevealSlides = forwardRef<RevealSlidesHandle, RevealSlidesProps>(
  ({ initialSlides = [] }, ref) => {
    const deckRef = useRef<Reveal.Api | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      if (!containerRef.current || deckRef.current) return;

      // Initialize Reveal
      const deck = new Reveal(containerRef.current, {
        embedded: false,
        width: 1920,
        height: 1080,
        margin: 0.04,
        minScale: 0.2,
        maxScale: 2.0,
        controls: true,
        progress: true,
        center: true,
        hash: false,
        transition: "slide",
      });

      deck.initialize().then(() => {
        console.log("Reveal.js initialized");
        deckRef.current = deck;
      });

      return () => {
        if (deckRef.current) {
          deckRef.current.destroy();
          deckRef.current = null;
        }
      };
    }, []);

    // Expose methods to parent via ref
    useImperativeHandle(ref, () => ({
      next: () => {
        deckRef.current?.next();
      },
      prev: () => {
        deckRef.current?.prev();
      },
      goToSlide: (index: number) => {
        deckRef.current?.slide(index);
      },
      getCurrentSlide: () => {
        const indices = deckRef.current?.getIndices();
        return indices?.h ?? 0;
      },
      updateSlideContent: (index: number, content: string) => {
        if (!containerRef.current) return;
        const slides =
          containerRef.current.querySelectorAll(".slides > section");
        if (slides[index]) {
          slides[index].innerHTML = content;
          deckRef.current?.sync();
        }
      },
      addSlide: (content: string) => {
        if (!containerRef.current) return;
        const slidesContainer = containerRef.current.querySelector(".slides");
        if (slidesContainer) {
          const newSlide = document.createElement("section");
          newSlide.innerHTML = content;
          slidesContainer.appendChild(newSlide);
          deckRef.current?.sync();
        }
      },
      sync: () => {
        deckRef.current?.sync();
      },
    }));

    return (
      <div ref={containerRef} className="reveal">
        <div className="slides">
          {initialSlides.length > 0 ? (
            initialSlides.map((content, index) => (
              <section
                key={index}
                dangerouslySetInnerHTML={{ __html: content }}
              />
            ))
          ) : (
            <section>
              <h2>Waiting for content...</h2>
              <p>Slides will appear here when the presentation starts.</p>
            </section>
          )}
        </div>
      </div>
    );
  }
);

RevealSlides.displayName = "RevealSlides";

export default RevealSlides;
