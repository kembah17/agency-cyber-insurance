/**
 * email-sync.ts — Cross-component email capture synchronization
 *
 * Provides a centralized way to store, retrieve, and listen for email captures
 * across different components (Policy Scrutinizer, future Newsletter, etc.).
 *
 * Usage:
 *   import { useEmailCapture, dispatchEmailCapture } from "@/lib/email-sync";
 *
 *   // In a component that captures email:
 *   dispatchEmailCapture(email, "policy_scrutinizer");
 *
 *   // In a component that needs the email:
 *   const { email, source } = useEmailCapture();
 */

import { useState, useEffect, useCallback } from "react";

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */
const STORAGE_KEY_EMAIL = "policy_scrutinizer_email";
const STORAGE_KEY_SOURCE = "email_capture_source";
const EVENT_NAME = "email-captured";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */
export interface EmailCaptureState {
  email: string | null;
  source: string | null;
}

export interface EmailCaptureEvent {
  email: string;
  source: string;
}

/* ------------------------------------------------------------------ */
/*  Dispatch helper                                                    */
/* ------------------------------------------------------------------ */
/**
 * Store a captured email in localStorage and fire a custom event
 * so other components can react immediately.
 */
export function dispatchEmailCapture(email: string, source: string): void {
  // Persist
  localStorage.setItem(STORAGE_KEY_EMAIL, email);
  localStorage.setItem(STORAGE_KEY_SOURCE, source);

  // Broadcast
  window.dispatchEvent(
    new CustomEvent<EmailCaptureEvent>(EVENT_NAME, {
      detail: { email, source },
    })
  );
}

/* ------------------------------------------------------------------ */
/*  Read helper (non-hook)                                             */
/* ------------------------------------------------------------------ */
/**
 * Synchronously read the current captured email from localStorage.
 * Useful outside of React components.
 */
export function getStoredEmail(): EmailCaptureState {
  if (typeof window === "undefined") {
    return { email: null, source: null };
  }
  return {
    email: localStorage.getItem(STORAGE_KEY_EMAIL),
    source: localStorage.getItem(STORAGE_KEY_SOURCE),
  };
}

/* ------------------------------------------------------------------ */
/*  React hook                                                         */
/* ------------------------------------------------------------------ */
/**
 * Hook that returns the current captured email and automatically
 * updates when a new email-captured event fires.
 *
 * @example
 * function NewsletterSignup() {
 *   const { email, source } = useEmailCapture();
 *   // If email is already captured, pre-fill or skip the form
 * }
 */
export function useEmailCapture(): EmailCaptureState {
  const [state, setState] = useState<EmailCaptureState>({
    email: null,
    source: null,
  });

  // Read from localStorage on mount
  useEffect(() => {
    setState({
      email: localStorage.getItem(STORAGE_KEY_EMAIL),
      source: localStorage.getItem(STORAGE_KEY_SOURCE),
    });
  }, []);

  // Listen for cross-component captures
  const handleCapture = useCallback((e: Event) => {
    const detail = (e as CustomEvent<EmailCaptureEvent>).detail;
    if (detail?.email) {
      setState({ email: detail.email, source: detail.source });
    }
  }, []);

  useEffect(() => {
    window.addEventListener(EVENT_NAME, handleCapture);
    return () => window.removeEventListener(EVENT_NAME, handleCapture);
  }, [handleCapture]);

  return state;
}
