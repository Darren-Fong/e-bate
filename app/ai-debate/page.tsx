"use client";

import { useState } from "react";
import Link from "next/link";

type DebateStage = "setup" | "user-turn" | "ai-turn" | "finished";

export default function AIDebate() {
  const [stage, setStage] = useState<DebateStage>("setup");
  const [topic, setTopic] = useState("");
  const [customTopic, setCustomTopic] = useState("");
  const [userSide, setUserSide] = useState<"for" | "against">("for");
  const [userArgument, setUserArgument] = useState("");
  const [aiArgument, setAIArgument] = useState("");
  const [timeRemaining, setTimeRemaining] = useState(180); // 3 minutes = 180 seconds
  const [round, setRound] = useState(1);
  const [transcript, setTranscript] = useState<Array<{speaker: string, text: string, round: number}>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<{strengths: string[], improvements: string[], score: number} | null>(null);

  const topics = [
    "Social media does more harm than good",
    "Remote work is better than office work",
    "AI will create more jobs than it destroys",
    "College education should be free",
    "Climate change is the biggest threat to humanity"
  ];

  const finalTopic = customTopic.trim() || topic;

  const startDebate = () => {
    if (finalTopic) {
      setStage("user-turn");
      setTimeRemaining(180);
      setTranscript([]);
      setRound(1);
      setFeedback(null);
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
          topic: finalTopic,
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
      
      // Wait a moment before moving to next round or finishing
      setTimeout(async () => {
        if (round < 3) {
          setRound(round + 1);
          setStage("user-turn");
          setTimeRemaining(180);
        } else {
          // Generate feedback at end of debate
          const feedbackResponse = await fetch("/api/ai/generate-feedback", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              topic: finalTopic,
              transcript: [...newTranscript, { speaker: "AI", text: aiResponse, round }]
            })
          });
          
          if (feedbackResponse.ok) {
            const feedbackData = await feedbackResponse.json();
            setFeedback(feedbackData);
          }
          
          setStage("finished");
        }
      }, 2000);
    } catch (error) {
      console.error("Error:", error);
      setIsLoading(false);
      setAIArgument("Sorry, I encountered an error. Please try again.");
      setTimeout(() => setStage("user-turn"), 2000);
    }
  };

  return (
    <div className="debate-container">
      <Link href="/" className="back-link">← Back to Home</Link>
      
      <h1 className="page-title">🤖 AI Debate Mode</h1>

      {stage === "setup" && (
        <div className="setup-panel">
          <h2>Setup Your Debate</h2>
          
          <div className="form-group">
            <label>Choose a Topic:</label>
            <select 
              value={topic} 
              onChange={(e) => {
                setTopic(e.target.value);
                if (e.target.value) setCustomTopic("");
              }}
              className="select-input"
            >
              <option value="">-- Select a topic --</option>
              {topics.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Or Enter Your Own Topic:</label>
            <input
              type="text"
              value={customTopic}
              onChange={(e) => {
                setCustomTopic(e.target.value);
                if (e.target.value) setTopic("");
              }}
              placeholder="e.g., Universal basic income is necessary"
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
            disabled={!finalTopic}
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
            <strong>Topic:</strong> {finalTopic}
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
              <button className="btn-secondary">🎤 Speech-to-Text</button>
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
              <p>{aiArgument}</p>
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
                 CustomTopic("");
              set <h4>💡 Areas to Improve</h4>
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
              setCustomTopic("");
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
    </div>
  );
}
