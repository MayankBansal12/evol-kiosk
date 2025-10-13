"use client";

import { useEffect, useRef, useState, useImperativeHandle, forwardRef } from "react";
import { getSpeechForText } from "@/app/actions/textToSpeech";

/**
 * TextToSpeechPlayer
 * - Generates audio for given `text` using server action and auto-plays
 * - Keeps audio playback separate from AI response text
 * - Converts base64 audio data to Blob URL and handles cleanup
 */
const TextToSpeechPlayer = forwardRef(function TextToSpeechPlayer({ text, disabled }, ref) {
  const audioRef = useRef(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const cacheRef = useRef(new Map()); // text -> objectURL
  const lastRequestIdRef = useRef(0);

  // Cleanup old object URLs when component unmounts or audioUrl changes
  useEffect(() => {
    return () => {
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [audioUrl]);

  const generateAndPlayInternal = async (inputText) => {
    if (!inputText || disabled) return;
    const requestId = ++lastRequestIdRef.current;

    // Serve from cache if available to reduce latency
    const cachedUrl = cacheRef.current.get(inputText);
    if (cachedUrl) {
      setAudioUrl((prev) => {
        if (prev && prev !== cachedUrl && ![...cacheRef.current.values()].includes(prev)) {
          URL.revokeObjectURL(prev);
        }
        return cachedUrl;
      });
      const audioEl = audioRef.current;
      if (audioEl) {
        audioEl.src = cachedUrl;
        audioEl.autoplay = true;
        try {
          await audioEl.play();
        } catch (err) {
          console.warn("Autoplay was blocked:", err);
        }
      }
      return;
    }

    setIsGenerating(true);
    try {
      const result = await getSpeechForText(inputText);
      if (requestId !== lastRequestIdRef.current) return; // stale
      if (!result?.success || !result.audio_data) return;

      // Decode base64 string to Uint8Array
      const byteCharacters = atob(result.audio_data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i += 1) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);

      // Create Blob and object URL
      const mimeType = result.audio_format === "mp3" ? "audio/mpeg" : "audio/wav";
      const blob = new Blob([byteArray], { type: mimeType });
      const url = URL.createObjectURL(blob);

      // Cache for identical text to eliminate future latency
      cacheRef.current.set(inputText, url);

      // Swap URL and autoplay
      setAudioUrl((prev) => {
        if (prev && prev !== url && ![...cacheRef.current.values()].includes(prev)) {
          URL.revokeObjectURL(prev);
        }
        return url;
      });

      const audioEl = audioRef.current;
      if (audioEl) {
        audioEl.src = url;
        audioEl.autoplay = true;
        try {
          await audioEl.play();
        } catch (err) {
          console.warn("Autoplay was blocked:", err);
        }
      }
    } catch (err) {
      console.error("Failed to generate or play TTS:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  // Expose imperative API so parent can start generation immediately when text is known
  useImperativeHandle(ref, () => ({
    playText: (t) => generateAndPlayInternal(t),
  }));

  // Still respond to prop changes as a fallback
  useEffect(() => {
    if (!text || disabled) return;
    generateAndPlayInternal(text);
  }, [text, disabled]);

  return (
    <audio ref={audioRef} src={audioUrl || undefined} aria-hidden="true" />
  );
});

export { TextToSpeechPlayer };



