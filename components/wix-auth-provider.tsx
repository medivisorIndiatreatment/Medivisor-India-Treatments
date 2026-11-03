"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { wixClient } from "@/lib/wix"

interface WixAuthContextType {
  isAuthenticated: boolean
  isLoading: boolean
  login: () => Promise<void>
  logout: () => Promise<void>
}

const WixAuthContext = createContext<WixAuthContextType | undefined>(undefined)

export function WixAuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    try {
      setIsLoading(true)
      if (typeof window === "undefined") return
      const isLoggedIn = wixClient.auth.loggedIn()
      setIsAuthenticated(isLoggedIn)

      if (!isLoggedIn && typeof wixClient.auth.generateVisitorTokens === "function") {
        try {
          await wixClient.auth.generateVisitorTokens()
          setIsAuthenticated(true)
        } catch (visitorError) {
          if (visitorError instanceof TypeError) {
            console.warn("Visitor token generation skipped (fetch not available or blocked):", visitorError.message)
          } else if (typeof visitorError === "object" && visitorError !== null && "message" in visitorError && typeof (visitorError as any).message === "string" && (visitorError as any).message.includes("is not a valid GUID")) {
            console.warn("Visitor token generation skipped (invalid Wix appId):", (visitorError as any).message)
          } else {
            console.warn("Visitor token generation failed, continuing without auth:", visitorError)
          }
        }
      }
    } catch (error) {
      console.error("Auth check failed:", error)
      setIsAuthenticated(false)
    } finally {
      setIsLoading(false)
    }
  }

  const login = async () => {
    try {
      if (typeof wixClient.auth.generateVisitorTokens === 'function') {
        try {
          await wixClient.auth.generateVisitorTokens()
          setIsAuthenticated(true)
        } catch (visitorError) {
          if (typeof visitorError === "object" && visitorError !== null && "message" in visitorError && typeof (visitorError as any).message === "string" && (visitorError as any).message.includes("is not a valid GUID")) {
            console.warn("Visitor token generation skipped during login (invalid Wix appId):", (visitorError as any).message)
          } else {
            console.warn("Visitor token generation failed during login:", visitorError)
          }
          throw new Error('Visitor authentication failed')
        }
      } else {
        console.warn('generateVisitorTokens is not available on the auth instance')
        throw new Error('Visitor authentication is not supported')
      }
    } catch (error) {
      console.error("Login failed:", error)
      throw error
    }
  }

  const logout = async () => {
    try {
      // @ts-expect-error - type mismatch with wix SDK
      await wixClient.auth.logout({})
      setIsAuthenticated(false)
    } catch (error) {
      console.error("Logout failed:", error)
      throw error
    }
  }

  return (
    <WixAuthContext.Provider value={{ isAuthenticated, isLoading, login, logout }}>{children}</WixAuthContext.Provider>
  )
}

export function useWixAuth() {
  const context = useContext(WixAuthContext)
  if (context === undefined) {
    throw new Error("useWixAuth must be used within a WixAuthProvider")
  }
  return context
}
