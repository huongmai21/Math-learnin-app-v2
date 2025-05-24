"use client"

import { useState, useEffect } from "react"

const useResponsive = () => {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== "undefined" ? window.innerWidth : 0,
    height: typeof window !== "undefined" ? window.innerHeight : 0,
  })

  const [isMobile, setIsMobile] = useState(false)
  const [isTablet, setIsTablet] = useState(false)
  const [isDesktop, setIsDesktop] = useState(false)

  useEffect(() => {
    if (typeof window === "undefined") return

    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      })
    }

    window.addEventListener("resize", handleResize)
    handleResize()

    return () => window.removeEventListener("resize", handleResize)
  }, [])

  useEffect(() => {
    setIsMobile(windowSize.width < 768)
    setIsTablet(windowSize.width >= 768 && windowSize.width < 1024)
    setIsDesktop(windowSize.width >= 1024)
  }, [windowSize])

  return {
    windowSize,
    isMobile,
    isTablet,
    isDesktop,
  }
}

export default useResponsive
