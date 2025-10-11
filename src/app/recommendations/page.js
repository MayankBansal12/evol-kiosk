"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AIRecommendationsPage } from "@/components/AIRecommendationsPage";

export default function RecommendationsPage() {
  const [surveyData, setSurveyData] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Get data from localStorage (primary source)
    const storedData = localStorage.getItem("surveyData");
    if (storedData) {
      try {
        setSurveyData(JSON.parse(storedData));
      } catch (error) {
        console.error("Error parsing survey data:", error);
        // No valid data, redirect to home
        router.push("/");
      }
    } else {
      // No data available, redirect to home
      router.push("/");
    }
    setLoading(false);
  }, [router]);

  const handleRestart = () => {
    // Clear stored data and redirect to home
    localStorage.removeItem("surveyData");
    router.push("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen hero-gradient flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold mx-auto mb-4"></div>
          <p className="text-charcoal">Loading your recommendations...</p>
        </div>
      </div>
    );
  }

  if (!surveyData) {
    return (
      <div className="min-h-screen hero-gradient flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-medium text-charcoal mb-4">
            No recommendations found
          </h1>
          <button
            onClick={() => router.push("/")}
            className="gold-gradient text-charcoal border-0 px-6 py-2 rounded-lg"
          >
            Start Over
          </button>
        </div>
      </div>
    );
  }

  return (
    <AIRecommendationsPage surveyData={surveyData} onRestart={handleRestart} />
  );
}
