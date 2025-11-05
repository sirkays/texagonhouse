"use client"

import type React from "react"

import { useEffect, useRef } from "react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

// Register GSAP plugins
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger)
}

interface AnimatedContainerProps {
  children: React.ReactNode
  className?: string
  animation?: "fadeIn" | "slideUp" | "slideInLeft" | "scaleIn" | "staggerChildren"
  delay?: number
  duration?: number
}

export function AnimatedContainer({
  children,
  className = "",
  animation = "fadeIn",
  delay = 0,
  duration = 0.6,
}: AnimatedContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    const element = containerRef.current

    // Set initial state
    gsap.set(element, {
      opacity: 0,
      y: animation === "slideUp" ? 30 : 0,
      x: animation === "slideInLeft" ? -30 : 0,
      scale: animation === "scaleIn" ? 0.95 : 1,
    })

    // Create animation
    const tl = gsap.timeline({ delay })

    if (animation === "staggerChildren") {
      const children = element.children
      gsap.set(children, { opacity: 0, y: 20 })

      tl.to(element, { opacity: 1, duration: 0.3 }).to(
        children,
        {
          opacity: 1,
          y: 0,
          duration: 0.4,
          stagger: 0.1,
          ease: "power2.out",
        },
        "-=0.2",
      )
    } else {
      tl.to(element, {
        opacity: 1,
        y: 0,
        x: 0,
        scale: 1,
        duration,
        ease: "power2.out",
      })
    }

    return () => {
      tl.kill()
    }
  }, [animation, delay, duration])

  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  )
}

interface ScrollAnimatedProps {
  children: React.ReactNode
  className?: string
  animation?: "fadeInUp" | "slideInLeft" | "scaleIn"
  trigger?: string
}

export function ScrollAnimated({ children, className = "", animation = "fadeInUp", trigger }: ScrollAnimatedProps) {
  const elementRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!elementRef.current) return

    const element = elementRef.current

    // Set initial state
    gsap.set(element, {
      opacity: 0,
      y: animation === "fadeInUp" ? 50 : 0,
      x: animation === "slideInLeft" ? -50 : 0,
      scale: animation === "scaleIn" ? 0.8 : 1,
    })

    // Create scroll-triggered animation
    ScrollTrigger.create({
      trigger: trigger || element,
      start: "top 80%",
      onEnter: () => {
        gsap.to(element, {
          opacity: 1,
          y: 0,
          x: 0,
          scale: 1,
          duration: 0.8,
          ease: "power2.out",
        })
      },
    })

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill())
    }
  }, [animation, trigger])

  return (
    <div ref={elementRef} className={className}>
      {children}
    </div>
  )
}

interface HoverAnimatedProps {
  children: React.ReactNode
  className?: string
  hoverScale?: number
  hoverY?: number
}

export function HoverAnimated({ children, className = "", hoverScale = 1.02, hoverY = -2 }: HoverAnimatedProps) {
  const elementRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!elementRef.current) return

    const element = elementRef.current

    const handleMouseEnter = () => {
      gsap.to(element, {
        scale: hoverScale,
        y: hoverY,
        duration: 0.3,
        ease: "power2.out",
      })
    }

    const handleMouseLeave = () => {
      gsap.to(element, {
        scale: 1,
        y: 0,
        duration: 0.3,
        ease: "power2.out",
      })
    }

    element.addEventListener("mouseenter", handleMouseEnter)
    element.addEventListener("mouseleave", handleMouseLeave)

    return () => {
      element.removeEventListener("mouseenter", handleMouseEnter)
      element.removeEventListener("mouseleave", handleMouseLeave)
    }
  }, [hoverScale, hoverY])

  return (
    <div ref={elementRef} className={className}>
      {children}
    </div>
  )
}

export function CountUpAnimation({
  value,
  duration = 2,
  prefix = "",
  suffix = "",
  className = "",
}: {
  value: number
  duration?: number
  prefix?: string
  suffix?: string
  className?: string
}) {
  const elementRef = useRef<HTMLSpanElement>(null)
  const countRef = useRef({ value: 0 })

  useEffect(() => {
    if (!elementRef.current) return

    const element = elementRef.current

    gsap.to(countRef.current, {
      value: value,
      duration,
      ease: "power2.out",
      onUpdate: () => {
        if (element) {
          const currentValue = Math.round(countRef.current.value)
          element.textContent = `${prefix}${currentValue.toLocaleString()}${suffix}`
        }
      },
    })
  }, [value, duration, prefix, suffix])

  return (
    <span ref={elementRef} className={className}>
      0
    </span>
  )
}
