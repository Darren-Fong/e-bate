"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import { trackDebate } from "@/lib/debate-tracker";
import { canAccessPracticeMode, getTrialsRemaining, incrementTrialCount, isAdmin } from "@/lib/access-control";

type DebateStage = "setup" | "user-turn" | "ai-turn" | "finished";

export default function AIDebate() {
  const { user, isLoaded } = useUser();
  const [stage, setStage] = useState<DebateStage>("setup");
  const [topic, setTopic] = useState("");
  const [userSide, setUserSide] = useState<"for" | "against">("for");
  const [userArgument, setUserArgument] = useState("");
  const [aiArgument, setAIArgument] = useState("");
  const [timeRemaining, setTimeRemaining] = useState(300); // 5 minutes = 300 seconds
  const [round, setRound] = useState(1);
  const [transcript, setTranscript] = useState<Array<{speaker: string, text: string, round: number}>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<{strengths: string[], improvements: string[], score: number} | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [trialsRemaining, setTrialsRemaining] = useState<number>(0);
  const [hasAccess, setHasAccess] = useState(true);

  // Check access on mount and when user changes
  useEffect(() => {
    if (user?.id) {
      const userEmail = user.primaryEmailAddress?.emailAddress;
      const remaining = getTrialsRemaining(user.id, userEmail);
      const access = canAccessPracticeMode(user.id, userEmail);
      setTrialsRemaining(remaining);
      setHasAccess(access);
    }
  }, [user]);

  const startDebate = () => {
    if (topic.trim()) {
      // Increment trial count for non-admin users
      if (user?.id) {
        const userEmail = user.primaryEmailAddress?.emailAddress;
        incrementTrialCount(user.id, userEmail);
        
        // Update remaining trials display
        const remaining = getTrialsRemaining(user.id, userEmail);
        setTrialsRemaining(remaining);
        
        // Track debate participation
        trackDebate(user.id, 'ai');
      }
      setStage("user-turn");
      setTimeRemaining(300);
      setTranscript([]);
      setRound(1);
      setFeedback(null);
    }
  };

  // Timer countdown
  useEffect(() => {
    if (stage === "user-turn" && timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [stage, timeRemaining]);

  const startSpeechToText = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Speech recognition is not supported in this browser. Please use Chrome or Edge.');
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsRecording(true);
    };

    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((result: any) => result[0].transcript)
        .join(' ');
      setUserArgument((prev) => prev + ' ' + transcript);
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    if (isRecording) {
      recognition.stop();
    } else {
      recognition.start();
    }
  };

  const submitArgument = async () => {
    const newTranscript = [...transcript, { speaker: "You", text: userArgument, round }];
    setTranscript(newTranscript);
    setUserArgument("");
    setStage("ai-turn");
    setIsLoading(true);
    
    try {
      // Call API route
      const response = await fetch("/api/ai/generate-argument", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: topic,
          userSide,
          userArgument,
          round,
          conversationHistory: newTranscript
        })
      });

      if (!response.ok) throw new Error("Failed to generate response");
      
      const data = await response.json();
      const aiResponse = data.response;
      
      setAIArgument(aiResponse);
      setTranscript(prev => [...prev, { speaker: "AI", text: aiResponse, round }]);
      setIsLoading(false);
    } catch (error) {
      console.error("Error:", error);
      setIsLoading(false);
      setAIArgument("Sorry, I encountered an error. Please try again.");
    }
  };

  const proceedToNext = async () => {
    if (round < 3) {
      setRound(round + 1);
      setStage("user-turn");
      setTimeRemaining(300);
      setAIArgument("");
    } else {
      // Generate feedback at end of debate
      setIsLoading(true);
      try {
        const feedbackResponse = await fetch("/api/ai/generate-feedback", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            topic: topic,
            transcript: transcript
          })
        });
        
        if (feedbackResponse.ok) {
          const feedbackData = await feedbackResponse.json();
          setFeedback(feedbackData);
        }
      } catch (error) {
        console.error("Error generating feedback:", error);
      }
      setIsLoading(false);
      setStage("finished");
    }
  };

  return (
    <div className="debate-container">
      <Link href="/" className="back-link">← Back to Home</Link>
      
      <h1 className="page-title">AI Debate Mode</h1>

      {!isLoaded ? (
        <div className="loading-spinner">
          <div className="spinner-dot"></div>
          <div className="spinner-dot"></div>
          <div className="spinner-dot"></div>
        </div>
      ) : !hasAccess ? (
        <div className="auth-required">
          <h2>🔒 Trial Limit Reached</h2>
          <p>You've used all {5} free practice rounds.</p>
          <p>Thank you for trying E-Bate! This is currently a free demo version.</p>
          <Link href="/" className="btn-primary">
            Back to Home
          </Link>
        </div>
      ) : (
        <>
          {stage === "setup" && (
            <div className="setup-panel">
              <h2>Setup Your Debate</h2>
              
              {!isAdmin(user?.primaryEmailAddress?.emailAddress) && trialsRemaining < Infinity && (
                <div className="trial-notice">
                  <p>🎯 Practice rounds remaining: <strong>{trialsRemaining}</strong></p>
                </div>
              )}
              
              <div className="form-group">
                <label>Enter Your Debate Topic:</label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g., Social media does more harm than good"
                  className="select-input"
            />
          </div>

          <div className="form-group">
            <label>Your Position:</label>
            <div className="radio-group">
              <label>
                <input
                  type="radio"
                  value="for"
                  checked={userSide === "for"}
                  onChange={(e) => setUserSide(e.target.value as "for")}
                />
                For (Supporting)
              </label>
              <label>
                <input
                  type="radio"
                  value="against"
                  checked={userSide === "against"}
                  onChange={(e) => setUserSide(e.target.value as "against")}
                />
                Against (Opposing)
              </label>
            </div>
          </div>

          <button 
            className="btn-primary"
            onClick={startDebate}
            disabled={!topic.trim()}
          >
            Start Debate
          </button>
        </div>
      )}

      {stage === "user-turn" && (
        <div className="debate-active">
          <div className="debate-header">
            <h3>Round {round} - Your Turn</h3>
            <div className="timer">{Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}</div>
          </div>
          
          <div className="topic-display">
            <strong>Topic:</strong> {topic}
          </div>

          <div className="input-area">
            <textarea
              value={userArgument}
              onChange={(e) => setUserArgument(e.target.value)}
              placeholder="Type your argument here... (or use speech-to-text)"
              className="argument-input"
              rows={10}
            />
            
            <div className="input-controls">
              <button 
                className="btn-secondary"
                onClick={startSpeechToText}
                disabled={isLoading}
              >
                {isRecording ? '⏹️ Stop Recording' : '🎤 Speech-to-Text'}
              </button>
              <button 
                className="btn-primary"
                onClick={submitArgument}
                disabled={!userArgument.trim()}
              >
                Submit Argument
              </button>
            </div>
          </div>
        </div>
      )}

      {stage === "ai-turn" && (
        <div className="debate-active">
          <div className="debate-header">
            <h3>Round {round} - AI's Turn</h3>
            <div className="timer-waiting">
              {isLoading ? "AI is thinking..." : "AI responded"}
            </div>
          </div>
          
          <div className="ai-response">
            {isLoading ? (
              <div className="loading-spinner">
                <div className="spinner-dot"></div>
                <div className="spinner-dot"></div>
                <div className="spinner-dot"></div>
              </div>
            ) : (
              <>
                <p>{aiArgument}</p>
                <div className="action-buttons">
                  <button 
                    className="btn-primary"
                    onClick={proceedToNext}
                  >
                    {round < 3 ? `Continue to Round ${round + 1} →` : 'View Results →'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {stage === "finished" && (
        <div className="debate-finished">
          <h2>Debate Complete! 🎉</h2>
          
          <div className="transcript-section">
            <h3>Full Transcript</h3>
            {transcript.map((entry, idx) => (
              <div key={idx} className={`transcript-entry ${entry.speaker === "You" ? "user" : "ai"}`}>
                <strong>Round {entry.round} - {entry.speaker}:</strong>
                <p>{entry.text}</p>
              </div>
            ))}
          </div>

          <div className="feedback-section">
            <h3>AI Feedback</h3>
            {feedback ? (
              <>
                <div className="score-display">
                  <div className="score-circle">
                    <span className="score-number">{feedback.score}</span>
                    <span className="score-label">/100</span>
                  </div>
                </div>
                <div className="feedback-group">
                  <h4>✅ Strengths</h4>
                  <ul>
                    {feedback.strengths.map((strength, idx) => (
                      <li key={idx}>{strength}</li>
                    ))}
                  </ul>
                </div>
                <div className="feedback-group">
                  <h4>💡 Areas to Improve</h4>
                  <ul>
                    {feedback.improvements.map((improvement, idx) => (
                      <li key={idx}>{improvement}</li>
                    ))}
                  </ul>
                </div>
              </>
            ) : (
              <p>Generating feedback...</p>
            )}
          </div>

          <div className="action-buttons">
            <button className="btn-primary" onClick={() => {
              setStage("setup");
              setTopic("");
              setRound(1);
              setTranscript([]);
              setFeedback(null);
            }}>
              Start New Debate
            </button>
            <Link href="/" className="btn-secondary">Back to Home</Link>
          </div>
        </div>
      )}
        </>
      )}
    </div>
  );
}
