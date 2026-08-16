// texagonui/app/student/scratch/page.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { Maximize, Minimize, RefreshCw, Info } from "lucide-react";
import { useSidebar } from "@/components/ui/sidebar";
import { useBrand } from "@/hooks/use-brand";

/**
 * Scratch Studio — Student Page
 * --------------------------------
 * Embeds the self-hosted Scratch GUI build (`public/scratch-editor`).
 * This provides the full Scratch experience (multiple sprites, asset library)
 * directly within the LMS without X-Frame-Options blocking or CORS errors.
 */

const SCRATCH_EDITOR_URL = "/scratch-editor/index.html";

export default function StudentScratchPage() {
    const brand = useBrand();
    const iframeRef = useRef<HTMLIFrameElement | null>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const { setOpen } = useSidebar();

    const [isLoading, setIsLoading] = useState(true);
    const [isUIVisible, setIsUIVisible] = useState(true);
    const [reloadKey, setReloadKey] = useState(0);

    // Loader safety net
    useEffect(() => {
        const t = window.setTimeout(() => setIsLoading(false), 25000);
        return () => window.clearTimeout(t);
    }, [reloadKey]);

    useEffect(() => {
        const layoutHeader = document.getElementById("student-layout-header");
        if (layoutHeader) {
            layoutHeader.style.display = isUIVisible ? "" : "none";
        }
    }, [isUIVisible]);

    const handleReload = () => {
        setIsLoading(true);
        setReloadKey((k) => k + 1);
    };

    const handleHideUI = () => {
        setIsUIVisible(false);
        setOpen(false);
    };

    const handleShowUI = () => {
        setIsUIVisible(true);
    };

    return (
        <div className="flex h-full w-full flex-col bg-white">
            {/* Slim toolbar above the iframe */}
            {isUIVisible && (
                <div className="flex items-center justify-between gap-2 border-b border-[#EF7B553a] bg-white px-3 py-2">
                    <div className="flex min-w-0 items-center gap-2">
                        <Image
                            src={brand.logo}
                            alt={brand.name}
                            width={20}
                            height={20}
                            className="shrink-0 object-contain"
                        />
                        <span className="truncate text-sm font-semibold text-slate-700">
                            Scratch Studio
                        </span>
                        <span className="hidden items-center gap-1 text-[11px] text-slate-500 sm:inline-flex">
                            <Info className="h-3 w-3" />
                            Play &amp; experiment — use &quot;Save to your computer&quot; in the File
                            menu to keep your work
                        </span>
                    </div>

                    <div className="flex items-center gap-1">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleReload}
                            title="Reload editor"
                            className="h-8 px-2 text-slate-600 hover:bg-[#F797713a]"
                        >
                            <RefreshCw className="h-3.5 w-3.5" />
                            <span className="ml-1 hidden text-xs sm:inline">Reload</span>
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleHideUI}
                            title="Focus mode (Hide layout)"
                            className="h-8 px-2 text-slate-600 hover:bg-[#F797713a]"
                        >
                            <Maximize className="h-3.5 w-3.5" />
                            <span className="ml-1 hidden text-xs sm:inline">Focus</span>
                        </Button>
                    </div>
                </div>
            )}

            {/* Iframe container */}
            <div
                ref={containerRef}
                className="relative min-h-0 w-full flex-1 bg-[#f4f4f4]"
            >
                {/* Loading overlay */}
                {isLoading && (
                    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 bg-white/90">
                        <Image
                            src={brand.logo}
                            alt={brand.name}
                            width={brand.id === "nimet" ? 100 : 56}
                            height={56}
                            className="animate-pulse object-contain"
                        />
                        <div className="flex items-center gap-3 text-[#EF7B55]">
                            <Spinner size="md" className="text-[#EF7B55]" />
                            <span className="text-sm font-medium">Loading Scratch Studio…</span>
                        </div>
                        <p className="max-w-sm text-center text-xs text-slate-500">
                            The editor runs entirely in your browser. First load can take a
                            few seconds.
                        </p>
                    </div>
                )}

                <iframe
                    key={reloadKey}
                    ref={iframeRef}
                    src={SCRATCH_EDITOR_URL}
                    title="Scratch Studio"
                    allow="fullscreen; autoplay; clipboard-read; clipboard-write; gamepad; microphone; camera"
                    onLoad={() => setIsLoading(false)}
                    className="h-full w-full border-0"
                    referrerPolicy="no-referrer-when-downgrade"
                />

                {/* Floating button to restore UI */}
                {!isUIVisible && (
                    <Button
                        variant="secondary"
                        size="icon"
                        onClick={handleShowUI}
                        title="Show layout"
                        className="absolute bottom-6 right-6 z-50 h-12 w-12 rounded-full shadow-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-100"
                    >
                        <Minimize className="h-5 w-5" />
                    </Button>
                )}
            </div>
        </div>
    );
}