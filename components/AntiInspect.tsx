"use client";

import {useEffect} from "react";

export default function AntiInspect() {
  useEffect(() => {
    // Disable right click
    const disableContext = (e: any) => e.preventDefault();
    document.addEventListener("contextmenu", disableContext);

    // Disable text selection
    document.body.style.userSelect = "none";

    // Disable drag events (prevents saving images/videos)
    const disableDrag = (e: any) => e.preventDefault();
    document.addEventListener("dragstart", disableDrag);

    // Disable common inspect shortcuts
    const disableKeys = (e: KeyboardEvent) => {
      if (
        e.key === "F12" ||
        (e.ctrlKey && e.shiftKey && ["I", "J", "C"].includes(e.key)) ||
        (e.ctrlKey && e.key === "U")
      ) {
        e.preventDefault();
        e.stopPropagation();
      }
    };
    document.addEventListener("keydown", disableKeys);

    return () => {
      document.removeEventListener("contextmenu", disableContext);
      document.removeEventListener("dragstart", disableDrag);
      document.removeEventListener("keydown", disableKeys);
    };
  }, []);

  return null;
}
