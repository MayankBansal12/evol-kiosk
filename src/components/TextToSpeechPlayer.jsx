"use client";

import { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import { getSpeechForText } from "@/app/actions/textToSpeech";

/**
 * TextToSpeechPlayer
 * - Generates audio for given `text` using server action and auto-plays
 * - Keeps audio playback separate from AI response text
 * - Converts base64 audio data to Blob URL and handles cleanup
 */
const TextToSpeechPlayer = ({ text, disabled }) => {
  const audioRef = useRef(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Cleanup old object URLs when component unmounts or audioUrl changes
  useEffect(() => {
    return () => {
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [audioUrl]);

  useEffect(() => {
    let cancelled = false;

    const generateAndPlay = async () => {
      if (!text || disabled) return;
      setIsGenerating(true);
      try {
        const result = await getSpeechForText(text);
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
        if (cancelled) return;

        // Swap URL and autoplay
        setAudioUrl((prev) => {
          if (prev) URL.revokeObjectURL(prev);
          return url;
        });

        // Attempt autoplay
        const audioEl = audioRef.current;
        if (audioEl) {
          audioEl.src = url;
          audioEl.autoplay = true;
          try {
            await audioEl.play();
          } catch (err) {
            // Autoplay may be blocked by browser policies
            console.warn("Autoplay was blocked:", err);
          }
        }
      } catch (err) {
        console.error("Failed to generate or play TTS:", err);
      } finally {
        if (!cancelled) setIsGenerating(false);
      }
    };

    generateAndPlay();
    return () => {
      cancelled = true;
    };
  }, [text, disabled]);

  return (
    <audio ref={audioRef} src={audioUrl || undefined} aria-hidden="true" />
  );
};

export { TextToSpeechPlayer };



