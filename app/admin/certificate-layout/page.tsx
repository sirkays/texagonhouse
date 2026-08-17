"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Save, RefreshCw, Type, Palette, Move } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";

import { useBrand } from "@/hooks/use-brand";

type LayoutConfig = {
  top: string;
  left: string;
  fontSize: string;
  fontFamily: string;
  color: string;
};

type TemplateConfig = {
  course_name: LayoutConfig;
  center_name: LayoutConfig;
};

type GlobalLayoutConfig = {
  techxagon: TemplateConfig;
  akure: TemplateConfig;
  nimet: TemplateConfig;
};

const DEFAULT_CONFIG: GlobalLayoutConfig = {
  techxagon: {
    course_name: { top: "57%", left: "63.5%", fontSize: "1.1rem", fontFamily: "'Georgia', 'Times New Roman', serif", color: "#000000" },
    center_name: { top: "90%", left: "63.5%", fontSize: "1.3rem", fontFamily: "'Georgia', 'Times New Roman', serif", color: "#1a1a1a" },
  },
  akure: {
    course_name: { top: "49%", left: "30.5%", fontSize: "1.65rem", fontFamily: "'Georgia', 'Times New Roman', serif", color: "#1a1a1a" },
    center_name: { top: "90%", left: "31.5%", fontSize: "1.3rem", fontFamily: "'Georgia', 'Times New Roman', serif", color: "#1a1a1a" },
  },
  nimet: {
    course_name: { top: "58.5%", left: "50%", fontSize: "1.3rem", fontFamily: "'Space Grotesk', 'Georgia', serif", color: "#006B3E" },
    center_name: { top: "88%", left: "50%", fontSize: "1.1rem", fontFamily: "'Space Grotesk', 'Georgia', serif", color: "#003822" },
  },
};

const FONT_OPTIONS = [
  { label: "Georgia (Serif)", value: "'Georgia', 'Times New Roman', serif" },
  { label: "Dancing Script (Cursive)", value: "'Dancing Script', 'Brush Script MT', cursive" },
  { label: "Arial (Sans Serif)", value: "Arial, sans-serif" },
  { label: "Courier New (Monospace)", value: "'Courier New', Courier, monospace" },
  { label: "Verdana (Sans Serif)", value: "Verdana, sans-serif" },
];

function DraggableText({
  text,
  config,
  onChangePos,
  isSelected,
  onClick,
}: {
  text: string;
  config: LayoutConfig;
  onChangePos: (pos: { top: string; left: string }) => void;
  isSelected: boolean;
  onClick: () => void;
}) {
  const nodeRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    onClick();

    const parent = nodeRef.current?.parentElement;
    if (!parent) return;

    const startX = e.clientX;
    const startY = e.clientY;

    const initialTop = parseFloat(config.top);
    const initialLeft = parseFloat(config.left);

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const parentRect = parent.getBoundingClientRect();
      const deltaX = moveEvent.clientX - startX;
      const deltaY = moveEvent.clientY - startY;

      const newTop = initialTop + (deltaY / parentRect.height) * 100;
      const newLeft = initialLeft + (deltaX / parentRect.width) * 100;

      onChangePos({
        top: `${Math.max(0, Math.min(100, newTop))}%`,
        left: `${Math.max(0, Math.min(100, newLeft))}%`,
      });
    };

    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  return (
    <div
      ref={nodeRef}
      onMouseDown={handleMouseDown}
      className={`absolute cursor-move px-3 py-1 z-10 transition-colors ${
        isSelected
          ? "border-2 border-primary border-dashed bg-primary/10 shadow-lg rounded"
          : "hover:border border-gray-400 border-dashed rounded"
      }`}
      style={{
        top: config.top,
        left: config.left,
        transform: "translate(-50%, -50%)",
        fontSize: config.fontSize,
        fontFamily: config.fontFamily,
        color: config.color,
        fontWeight: 700,
        textTransform: "uppercase",
        letterSpacing: "0.15em",
        whiteSpace: "nowrap",
        textAlign: "center",
      }}
    >
      {text}
    </div>
  );
}

export default function CertificateLayoutPage() {
  const brand = useBrand();
  const [config, setConfig] = useState<GlobalLayoutConfig>(DEFAULT_CONFIG);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTemplate, setActiveTemplate] = useState<"techxagon" | "akure" | "nimet">(
    brand.id === "nimet" ? "nimet" : "techxagon"
  );
  const [selectedElement, setSelectedElement] = useState<"course_name" | "center_name" | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const res = await fetch("/api/admin/certificates/layout/");
      const data = await res.json();
      if (data.certificate_layout) {
        setConfig({
          techxagon: { ...DEFAULT_CONFIG.techxagon, ...data.certificate_layout.techxagon },
          akure: { ...DEFAULT_CONFIG.akure, ...data.certificate_layout.akure },
          nimet: { ...DEFAULT_CONFIG.nimet, ...data.certificate_layout.nimet },
        });
      }
    } catch (err) {
      toast({ title: "Error", description: "Failed to load layout settings.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/certificates/layout/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ certificate_layout: config }),
      });
      if (res.ok) {
        toast({ title: "Success", description: "Certificate layout saved successfully." });
      } else {
        throw new Error("Failed to save");
      }
    } catch (err) {
      toast({ title: "Error", description: "Could not save layout.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const updateConfig = (element: "course_name" | "center_name", updates: Partial<LayoutConfig>) => {
    setConfig((prev) => ({
      ...prev,
      [activeTemplate]: {
        ...prev[activeTemplate],
        [element]: { ...prev[activeTemplate][element], ...updates },
      },
    }));
  };

  if (loading) {
    return <div className="p-8">Loading layout settings...</div>;
  }

  const activeBg =
    activeTemplate === "nimet"
      ? "/nimet_cert_image.png"
      : activeTemplate === "techxagon"
      ? "/certificate.png"
      : "/akure_cert_image.png";
  const currentConfig = config[activeTemplate];

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] p-6 overflow-hidden">
      <div className="flex items-center justify-between mb-6 shrink-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Certificate Layout Builder</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Drag elements to position them, and use the sidebar to customize typography.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select
            value={activeTemplate}
            onValueChange={(val) => {
              setActiveTemplate(val as any);
              setSelectedElement(null);
            }}
          >
            <SelectTrigger className="w-56">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {brand.id === "nimet" ? (
                <SelectItem value="nimet">NiMet Template</SelectItem>
              ) : (
                <>
                  <SelectItem value="techxagon">Techxagon Template</SelectItem>
                  <SelectItem value="akure">Akure Template</SelectItem>
                </>
              )}
            </SelectContent>
          </Select>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Save Layout
          </Button>
        </div>
      </div>

      <div className="flex gap-6 flex-1 min-h-0">
        <div className="flex-1 bg-muted/30 border rounded-xl overflow-auto relative flex items-center justify-center p-8 shadow-inner">
          <div
            className="relative w-full shadow-2xl bg-white select-none overflow-hidden"
            style={{
              aspectRatio: activeTemplate === "nimet" ? "4/3" : activeTemplate === "techxagon" ? "1260/820" : "1260/880",
              maxWidth: "100%",
              maxHeight: "100%",
            }}
            onClick={(e) => {
              if (e.target === e.currentTarget || (e.target as any).tagName === "IMG") {
                setSelectedElement(null);
              }
            }}
          >
            <Image src={activeBg} fill className="object-contain pointer-events-none" alt="Certificate Background" priority />

            {/* Draggable Elements */}
            <DraggableText
              text="COURSE NAME GOES HERE"
              config={currentConfig.course_name}
              isSelected={selectedElement === "course_name"}
              onClick={() => setSelectedElement("course_name")}
              onChangePos={(pos) => updateConfig("course_name", pos)}
            />

            <DraggableText
              text="CENTER: ORGANIZATION NAME"
              config={currentConfig.center_name}
              isSelected={selectedElement === "center_name"}
              onClick={() => setSelectedElement("center_name")}
              onChangePos={(pos) => updateConfig("center_name", pos)}
            />
          </div>
        </div>

        {/* Sidebar Controls */}
        <div className="w-80 shrink-0 bg-card border rounded-xl p-5 shadow-sm flex flex-col gap-6 overflow-y-auto">
          <div className="flex items-center gap-2 border-b pb-4">
            <Move className="w-5 h-5 text-primary" />
            <h2 className="font-semibold text-lg">Properties</h2>
          </div>

          {!selectedElement ? (
            <div className="text-center text-muted-foreground flex flex-col items-center justify-center h-40 border-2 border-dashed rounded-lg p-4">
              <Type className="w-8 h-8 mb-2 opacity-20" />
              <p className="text-sm">Click on a text element on the certificate to edit its properties.</p>
            </div>
          ) : (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div>
                <Label className="text-primary font-medium flex items-center gap-2 mb-4">
                  Editing:{" "}
                  <span className="bg-primary/10 text-primary px-2 py-1 rounded text-xs uppercase font-bold">
                    {selectedElement === "course_name" ? "Course Name" : "Center Name"}
                  </span>
                </Label>
              </div>

              <div className="space-y-3">
                <Label className="flex items-center gap-2 text-sm font-semibold">
                  <Type className="w-4 h-4" /> Font Family
                </Label>
                <Select
                  value={currentConfig[selectedElement].fontFamily}
                  onValueChange={(val) => updateConfig(selectedElement, { fontFamily: val })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FONT_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                <Label className="flex items-center gap-2 text-sm font-semibold">
                  Text Size
                </Label>
                <div className="flex items-center gap-3">
                  <Slider
                    value={[parseFloat(currentConfig[selectedElement].fontSize)]}
                    min={0.5}
                    max={4}
                    step={0.05}
                    onValueChange={([val]) => updateConfig(selectedElement, { fontSize: `${val}rem` })}
                    className="flex-1"
                  />
                  <span className="w-12 text-xs text-right font-mono text-muted-foreground bg-muted px-2 py-1 rounded">
                    {parseFloat(currentConfig[selectedElement].fontSize).toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <Label className="flex items-center gap-2 text-sm font-semibold">
                  <Palette className="w-4 h-4" /> Text Color
                </Label>
                <div className="flex items-center gap-3">
                  <Input
                    type="color"
                    value={currentConfig[selectedElement].color}
                    onChange={(e) => updateConfig(selectedElement, { color: e.target.value })}
                    className="w-12 h-12 p-1 cursor-pointer shrink-0"
                  />
                  <Input
                    type="text"
                    value={currentConfig[selectedElement].color}
                    onChange={(e) => updateConfig(selectedElement, { color: e.target.value })}
                    className="flex-1 font-mono uppercase"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
