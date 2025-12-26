"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getPusherClient } from "@/lib/pusher-client";

type Stage = "lobby" | "waiting" | "debate" | "voting" | "results";

export default function MUNDebate() {
  const [stage, setStage] = useState<Stage>("lobby");
  const [roomCode, setRoomCode] = useState("");
  const [inputRoomCode, setInputRoomCode] = useState("");
  const [myCountry, setMyCountry] = useState("");
  const [myDelegate, setMyDelegate] = useState("");
  const [topic, setTopic] = useState("");
  const [countries, setCountries] = useState<Array<{country: string, delegate: string}>>([]);
  const [currentSpeakerIndex, setCurrentSpeakerIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(300);
  const [transcript, setTranscript] = useState<Array<{country: string, delegate: string, text: string}>>([]);
  const [currentStatement, setCurrentStatement] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [votes, setVotes] = useState<{[country: string]: "yes" | "no" | "abstain"}>({});
  const [votingResults, setVotingResults] = useState<{yes: number, no: number, abstain: number} | null>(null);

  const getCurrentSpeaker = () => {
    if (currentSpeakerIndex >= countries.length) return null;
    return countries[currentSpeakerIndex];
  };

  const isMyTurn = () => {
    const current = getCurrentSpeaker();
    return current?.country === myCountry;
  };

  // Pusher real-time sync
  useEffect(() => {
    if (roomCode && stage !== "lobby") {
      const client = getPusherClient();
      if (!client) return;

      const channel = client.subscribe(`mun-room-${roomCode}`);

      channel.bind("room-created", (data: any) => {
        if (!topic) setTopic(data.topic);
        setCountries(data.roomData.countries);
      });

      channel.bind("country-joined", (data: any) => {
        setCountries(data.roomData.countries);
      });

      channel.bind("statement-submitted", (data: any) => {
        setTranscript(data.transcript);
        setCurrentSpeakerIndex(data.nextSpeakerIndex);
        setTimeRemaining(300);
        
        if (data.nextSpeakerIndex >= countries.length) {
          // All countries have spoken, move to voting
          startVoting();
        }
      });

      channel.bind("voting-started", () => {
        setStage("voting");
      });

      channel.bind("vote-submitted", (data: any) => {
        setVotes(data.votes);
      });

      return () => {
        channel.unbind_all();
        channel.unsubscribe();
      };
    }
  }, [roomCode, stage, topic, countries.length]);

  // Timer countdown
  useEffect(() => {
    if (stage === "debate" && timeRemaining > 0 && isMyTurn()) {
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
  }, [stage, timeRemaining, currentSpeakerIndex, myCountry]);

  const createRoom = async () => {
    if (!topic.trim() || !myCountry.trim() || !myDelegate.trim()) return;

    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    setRoomCode(code);

    try {
      const response = await fetch("/api/mun-debate/create-room", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomCode: code,
          topic,
          creatorCountry: myCountry,
          creatorDelegate: myDelegate
        })
      });

      if (response.ok) {
        const data = await response.json();
        setCountries(data.roomData.countries);
        setStage("waiting");
      }
    } catch (error) {
      console.error("Error creating room:", error);
    }
  };

  const joinRoom = async () => {
    if (!inputRoomCode.trim() || !myCountry.trim() || !myDelegate.trim()) return;

    try {
      const response = await fetch("/api/mun-debate/join-room", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomCode: inputRoomCode,
          country: myCountry,
          delegate: myDelegate
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        setRoomCode(inputRoomCode);
        setTopic(data.roomData.topic);
        setCountries(data.roomData.countries);
        setStage("waiting");
      } else {
        alert(data.error || "Failed to join room");
      }
    } catch (error) {
      console.error("Error joining room:", error);
      alert("Failed to join room");
    }
  };

  const startDebateSession = () => {
    if (countries.length >= 2) {
      setStage("debate");
      setTimeRemaining(300);
    }
  };

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
      setCurrentStatement((prev) => prev + ' ' + transcript);
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

  const submitStatement = async () => {
    if (!currentStatement.trim() || !isMyTurn()) return;

    try {
      await fetch("/api/mun-debate/submit-statement", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomCode,
          country: myCountry,
          delegate: myDelegate,
          statement: currentStatement,
          speakerIndex: currentSpeakerIndex
        })
      });

      setCurrentStatement("");
    } catch (error) {
      console.error("Error submitting statement:", error);
    }
  };

  const startVoting = async () => {
    try {
      await fetch("/api/mun-debate/start-voting", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomCode })
      });
    } catch (error) {
      console.error("Error starting voting:", error);
    }
  };

  const submitVote = async (vote: "yes" | "no" | "abstain") => {
    try {
      await fetch("/api/mun-debate/submit-vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomCode,
          country: myCountry,
          vote
        })
      });
    } catch (error) {
      console.error("Error submitting vote:", error);
    }
  };

  const finishVoting = () => {
    const results = {
      yes: Object.values(votes).filter(v => v === "yes").length,
      no: Object.values(votes).filter(v => v === "no").length,
      abstain: Object.values(votes).filter(v => v === "abstain").length
    };
    setVotingResults(results);
    setStage("results");
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const currentSpeaker = getCurrentSpeaker();
  const allVotesSubmitted = countries.every(c => votes[c.country]);

  return (
    <div className="debate-container">
      <Link href="/modes" className="back-link">← Back to Modes</Link>
      
      <h1 className="page-title">Model United Nations</h1>

      {stage === "lobby" && (
        <div className="lobby-panel">
          <div className="form-group">
            <label>Country Name:</label>
            <input
              type="text"
              value={myCountry}
              onChange={(e) => setMyCountry(e.target.value)}
              placeholder="Enter your country"
              className="text-input"
            />
          </div>

          <div className="form-group">
            <label>Delegate Name:</label>
            <input
              type="text"
              value={myDelegate}
              onChange={(e) => setMyDelegate(e.target.value)}
              placeholder="Enter your name"
              className="text-input"
            />
          </div>

          <div className="lobby-options">
            <div className="option-card">
              <h3>Create New Session</h3>
              <div className="form-group">
                <label>Resolution Topic:</label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="Enter resolution topic"
                  className="text-input"
                />
              </div>
              <button
                className="btn-primary"
                onClick={createRoom}
                disabled={!topic.trim() || !myCountry.trim() || !myDelegate.trim()}
              >
                Create Session
              </button>
            </div>

            <div className="divider">OR</div>

            <div className="option-card">
              <h3>Join Existing Session</h3>
              <div className="form-group">
                <label>Session Code:</label>
                <input
                  type="text"
                  value={inputRoomCode}
                  onChange={(e) => setInputRoomCode(e.target.value.toUpperCase())}
                  placeholder="Enter session code"
                  className="text-input"
                />
              </div>
              <button
                className="btn-primary"
                onClick={joinRoom}
                disabled={!inputRoomCode.trim() || !myCountry.trim() || !myDelegate.trim()}
              >
                Join Session
              </button>
            </div>
          </div>
        </div>
      )}

      {stage === "waiting" && (
        <div className="waiting-room">
          <h2>Waiting for Countries...</h2>
          <div className="room-code-display">
            <p>Session Code:</p>
            <div className="code-box">{roomCode}</div>
          </div>
          <p>Resolution: {topic}</p>
          
          <div className="countries-list">
            <h3>Participating Countries ({countries.length})</h3>
            {countries.map((c, idx) => (
              <p key={idx}><strong>{c.country}</strong> - {c.delegate}</p>
            ))}
          </div>
          
          <p className="spinner">⏳</p>
          
          {countries.length >= 2 && (
            <button className="btn-primary" onClick={startDebateSession}>
              Start MUN Session
            </button>
          )}
        </div>
      )}

      {stage === "debate" && (
        <div className="debate-panel">
          <div className="debate-info">
            <div className="timer">
              <span className="timer-label">Time Remaining</span>
              <span className="timer-value">{formatTime(timeRemaining)}</span>
            </div>
            <div className="current-speaker">
              <span className="speaker-label">Current Speaker</span>
              <span className="speaker-name">{currentSpeaker?.country || "Unknown"}</span>
              <span className="speaker-team">Delegate: {currentSpeaker?.delegate}</span>
            </div>
            <div className="speaker-progress">
              Country {currentSpeakerIndex + 1} of {countries.length}
            </div>
          </div>

          {isMyTurn() ? (
            <div className="argument-input">
              <textarea
                value={currentStatement}
                onChange={(e) => setCurrentStatement(e.target.value)}
                placeholder="Enter your country's statement on this resolution..."
                className="argument-textarea"
              />
              <div className="input-actions">
                <button 
                  className="btn-secondary"
                  onClick={startSpeechToText}
                >
                  {isRecording ? "Stop Recording" : "Start Recording"}
                </button>
                <button 
                  className="btn-primary"
                  onClick={submitStatement}
                  disabled={!currentStatement.trim()}
                >
                  Submit Statement
                </button>
              </div>
            </div>
          ) : (
            <div className="opponent-turn">
              <p>Waiting for {currentSpeaker?.country} to speak...</p>
            </div>
          )}

          <div className="transcript">
            <h3>Session Transcript</h3>
            {transcript.map((entry, idx) => (
              <div key={idx} className="transcript-entry">
                <strong>{entry.country} ({entry.delegate}):</strong> {entry.text}
              </div>
            ))}
          </div>
        </div>
      )}

      {stage === "voting" && (
        <div className="voting-panel">
          <h2>Voting on Resolution</h2>
          <p className="voting-topic"><strong>Topic:</strong> {topic}</p>
          
          <div className="voting-grid">
            <div className="voting-card">
              <h4>{myCountry}</h4>
              <p className="delegate-name">{myDelegate}</p>
              <div className="vote-buttons">
                <button
                  className={`vote-btn yes ${votes[myCountry] === "yes" ? "active" : ""}`}
                  onClick={() => submitVote("yes")}
                >
                  Yes
                </button>
                <button
                  className={`vote-btn no ${votes[myCountry] === "no" ? "active" : ""}`}
                  onClick={() => submitVote("no")}
                >
                  No
                </button>
                <button
                  className={`vote-btn abstain ${votes[myCountry] === "abstain" ? "active" : ""}`}
                  onClick={() => submitVote("abstain")}
                >
                  Abstain
                </button>
              </div>
            </div>
          </div>

          <div className="vote-status">
            <p>Votes submitted: {Object.keys(votes).length} / {countries.length}</p>
          </div>

          {allVotesSubmitted && (
            <button className="btn-primary" onClick={finishVoting}>
              View Results
            </button>
          )}
        </div>
      )}

      {stage === "results" && votingResults && (
        <div className="results-panel">
          <h2>Voting Results</h2>
          <p className="voting-topic"><strong>Resolution:</strong> {topic}</p>
          
          <div className="results-summary">
            <div className="result-item yes">
              <span className="result-label">Yes</span>
              <span className="result-count">{votingResults.yes}</span>
            </div>
            <div className="result-item no">
              <span className="result-label">No</span>
              <span className="result-count">{votingResults.no}</span>
            </div>
            <div className="result-item abstain">
              <span className="result-label">Abstain</span>
              <span className="result-count">{votingResults.abstain}</span>
            </div>
          </div>

          <div className="resolution-outcome">
            {votingResults.yes > votingResults.no ? (
              <h3 className="passed">Resolution Passed</h3>
            ) : votingResults.yes < votingResults.no ? (
              <h3 className="failed">Resolution Failed</h3>
            ) : (
              <h3 className="tied">Resolution Tied</h3>
            )}
          </div>

          <div className="transcript">
            <h3>Session Transcript</h3>
            {transcript.map((entry, idx) => (
              <div key={idx} className="transcript-entry">
                <strong>{entry.country} ({entry.delegate}):</strong>
                <p>{entry.text}</p>
              </div>
            ))}
          </div>

          <button className="btn-primary" onClick={() => {
            setStage("lobby");
            setRoomCode("");
            setInputRoomCode("");
            setMyCountry("");
            setMyDelegate("");
            setTopic("");
            setCountries([]);
            setTranscript([]);
            setVotes({});
            setVotingResults(null);
            setCurrentSpeakerIndex(0);
          }}>
            Start New MUN Session
          </button>
        </div>
      )}
    </div>
  );
}
