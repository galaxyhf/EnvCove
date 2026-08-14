"use client";

import { useEffect } from "react";

export function HomeScrollEffects() {
  useEffect(() => {
    const root = document.documentElement;
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    );
    let observer: IntersectionObserver | null = null;
    let anchorFrame = 0;
    let anchorTimeout = 0;

    const revealAnchorTarget = () => {
      if (!window.location.hash) return;

      const targetId = decodeURIComponent(window.location.hash.slice(1));
      const target = document.getElementById(targetId);
      if (!target) return;

      target
        .querySelectorAll<HTMLElement>("[data-scroll-reveal]")
        .forEach((element) =>
          element.setAttribute("data-scroll-visible", "true"),
        );
    };

    const handleHashChange = () => {
      if (anchorFrame) window.cancelAnimationFrame(anchorFrame);
      if (anchorTimeout) window.clearTimeout(anchorTimeout);
      anchorFrame = window.requestAnimationFrame(revealAnchorTarget);
      anchorTimeout = window.setTimeout(revealAnchorTarget, 900);
    };

    if (!reducedMotion.matches) {
      const revealElements = document.querySelectorAll<HTMLElement>(
        "[data-scroll-reveal]",
      );
      revealAnchorTarget();
      root.classList.add("scroll-motion-ready");
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.setAttribute("data-scroll-visible", "true");
              return;
            }

            entry.target.removeAttribute("data-scroll-visible");
          });
        },
        { rootMargin: "0px 0px -12%", threshold: 0.12 },
      );

      revealElements.forEach((element) => observer?.observe(element));
    }

    let animationFrame = 0;
    const updateScrollPosition = () => {
      const scrollRange = Math.max(
        document.documentElement.scrollHeight - window.innerHeight,
        1,
      );
      const pageProgress = Math.min(window.scrollY / scrollRange, 1);
      const heroProgress = Math.min(window.scrollY / 760, 1);

      root.dataset.homeScrolled = window.scrollY > 16 ? "true" : "false";
      root.style.setProperty("--page-scroll", pageProgress.toFixed(4));
      root.style.setProperty("--hero-scroll", heroProgress.toFixed(4));
      animationFrame = 0;
    };

    const handleScroll = () => {
      if (animationFrame) return;
      animationFrame = window.requestAnimationFrame(updateScrollPosition);
    };

    updateScrollPosition();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);
    window.addEventListener("hashchange", handleHashChange);
    if (window.location.hash) handleHashChange();

    return () => {
      observer?.disconnect();
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
      window.removeEventListener("hashchange", handleHashChange);
      if (animationFrame) window.cancelAnimationFrame(animationFrame);
      if (anchorFrame) window.cancelAnimationFrame(anchorFrame);
      if (anchorTimeout) window.clearTimeout(anchorTimeout);
      root.classList.remove("scroll-motion-ready");
      delete root.dataset.homeScrolled;
      root.style.removeProperty("--page-scroll");
      root.style.removeProperty("--hero-scroll");
    };
  }, []);

  return <div className="scroll-progress" aria-hidden="true" />;
}
