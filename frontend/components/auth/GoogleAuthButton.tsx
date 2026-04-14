"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";
import { Button } from "@/components/ui/button";

declare global {
  interface Window {
    google?: any;
  }
}

type GoogleAuthButtonProps = {
  label?: string;
  buttonText?: "signin_with" | "signup_with" | "continue_with";
  onSuccess: (idToken: string) => Promise<void>;
  onError?: (message: string) => void;
};

export function GoogleAuthButton({
  label = "Đăng nhập bằng Google",
  buttonText = "signin_with",
  onSuccess,
  onError,
}: GoogleAuthButtonProps) {
  const buttonContainer = useRef<HTMLDivElement | null>(null);
  const [ready, setReady] = useState(false);
  const [scriptError, setScriptError] = useState(false);
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  const initializedRef = useRef<{ [key: string]: boolean }>({});

  useEffect(() => {
    if (window.google && !ready) {
      setReady(true);
    }
  }, [ready]);

  useEffect(() => {
    if (!ready || !buttonContainer.current || !clientId || !window.google) {
      return;
    }

    const key = `${clientId}-${buttonText}`;
    
    // Prevent re-initialization
    if (initializedRef.current[key]) {
      return;
    }

    try {
      // Clear old button HTML
      if (buttonContainer.current) {
        buttonContainer.current.innerHTML = "";
      }

      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: async (response: any) => {
          try {
            if (!response.credential) {
              throw new Error("Google sign-in failed");
            }
            await onSuccess(response.credential);
          } catch (error) {
            onError?.(error instanceof Error ? error.message : "Google sign-in failed");
          }
        },
      });

      if (buttonContainer.current) {
        window.google.accounts.id.renderButton(buttonContainer.current, {
          type: "standard",
          theme: "outline",
          size: "large",
          text: buttonText,
        });
        initializedRef.current[key] = true;
      }
    } catch (error) {
      console.error("Google initialization error:", error);
      setScriptError(true);
    }
  }, [ready, clientId]);

  if (!clientId) {
    return (
      <div className="rounded-xl border border-yellow-300 bg-yellow-50 px-4 py-3 text-sm text-yellow-900">
        Google client ID is not configured.
      </div>
    );
  }

  if (scriptError) {
    return (
      <div className="rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-900">
        Failed to load Google authentication. Please refresh the page.
      </div>
    );
  }

  return (
    <>
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onLoad={() => setReady(true)}
        onError={() => setScriptError(true)}
      />
      <div ref={buttonContainer} className="w-full" />
    </>
  );
}
