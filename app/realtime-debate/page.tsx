"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getPusherClient } from "@/lib/pusher-client";

type RoomStage = "lobby" | "waiting" | "debate" | "finished";
type Turn = "player1" | "player2";

export default function RealtimeDebate() {
  const [stage, setStage] = useState<RoomStage>("lobby");
  const [roomCode, setRoomCode] = useState("");
  const [username, setUsername] = useState("");
  const [topic, setTopic] = useState("");
  const [currentTurn, setCurrentTurn] = useState<Turn>("player1");
  const [timeRemaining, setTimeRemaining] = useState(300);
  const [round, setRound] = useState(1);
  const [myArgument, setMyArgument] = useState("");
  const [transcript, setTranscript] = useState<Array<{speaker: string, text: string, round: number}>>([]);
  const [spectatorCount, setSpectatorCount] = useState(0);
  const [opponent, setOpponent] = useState<string | null>(null);
  const [myRole, setMyRole] = useState<"player1" | "player2" | null>(null);
  const [isRecording, setIsRecording] = useState(false);

  useEffect(() => {
    if (roomCode && stage !== "lobby") {
      const client = getPusherClient();
      if (!client) {
        console.error("Pusher not available");
        return;
      }

      const channel = client.subscribe(`room-${roomCode}`);

      channel.bind("user-joined", (data: { username: string }) => {
        if (data.username !== username) {
          setOpponent(data.username);
          if (stage === "waiting") {
            setStage("debate");
          }
        }
      });

      channel.bind("room-created", (data: { topic: string; roomCode: string }) => {
        if (!topic) {
          setTopic(data.topic);
        }
      });

      channel.bind("argument-submitted", (data: { username: string; argument: string; round: number }) => {
        if (data.username !== username) {
          setTranscript(prev => [...prev, { 
            speaker: data.username, 
            text: data.argument, 
            round: data.round 
          }]);
          
          // Switch turn
          setCurrentTurn(prev => prev === "player1" ? "player2" : "player1");
          setTimeRemaining(300);
        }
      });

      return () => {
        channel.unbind_all();
        channel.unsubscribe();
      };
    }
  }, [roomCode, stage, username]);

  // Timer countdown
  useEffect(() => {
    if (stage === "debate" && timeRemaining > 0) {
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
      setMyArgument((prev) => prev + ' ' + transcript);
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

  const createRoom = async () => {
    if (username && topic) {
      const code = Math.random().toString(36).substring(2, 8).toUpperCase();
      setRoomCode(code);
      setMyRole("player1");
      setStage("waiting");
      
      // Create room on backend
      try {
        await fetch("/api/debate/create-room", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ roomCode: code, topic }),
        });
      } catch (error) {
        console.error("Failed to create room:", error);
      }
    }
  };

  const joinRoom = async () => {
    if (username && roomCode) {
      setMyRole("player2");
      setStage("waiting");
      
      // Subscribe to channel first to receive events
      const client = getPusherClient();
      if (client) {
        const channel = client.subscribe(`room-${roomCode}`);
        
        // Listen for room data
        channel.bind("room-created", (data: { topic: string }) => {
          setTopic(data.topic);
          setStage("debate");
        });
        
        channel.bind("user-joined", (data: { username: string }) => {
          if (data.username !== username) {
            setOpponent(data.username);
          }
        });
      }
      
      // Then join room on backend
      try {
        await fetch("/api/debate/join-room", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ roomCode, username }),
        });
      } catch (error) {
        console.error("Failed to join room:", error);
        setStage("lobby");
      }
    }
  };

  const submitArgument = async () => {
    const newEntry = { speaker: username, text: myArgument, round };
    setTranscript([...transcript, newEntry]);
    
    // Send to backend
    try {
      await fetch("/api/debate/submit-argument", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          roomCode, 
          username, 
          argument: myArgument, 
          round 
        }),
      });
    } catch (error) {
      console.error("Failed to submit argument:", error);
    }
    
    setMyArgument("");
    
    // Switch turns
    setCurrentTurn(currentTurn === "player1" ? "player2" : "player1");
    setTimeRemaining(300);
    
    // After 3 rounds, end debate
    if (round >= 3 && currentTurn === "player2") {
      setTimeout(() => setStage("finished"), 1000);
    } else if (currentTurn === "player2") {
      setRound(round + 1);
    }
  };

  const isMyTurn = (myRole === "player1" && currentTurn === "player1") || 
                   (myRole === "player2" && currentTurn === "player2");

  return (
    <div className="debate-container">
      <Link href="/" className="back-link">← Back to Home</Link>
      
      <h1 className="page-title">Real-Time Debate Mode</h1>

      {stage === "lobby" && (
        <div className="lobby-panel">
          <div className="form-group">
            <label>Your Name:</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your name"
              className="text-input"
            />
          </div>

          <div className="lobby-options">
            <div className="option-card">
              <h3>Create New Room</h3>
              <div className="form-group">
                <label>Debate Topic:</label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="Enter debate topic"
                  className="text-input"
                />
              </div>
              <button 
                className="btn-primary"
                onClick={createRoom}
                disabled={!username || !topic}
              >
                Create Room
              </button>
            </div>

            <div className="divider">OR</div>

            <div className="option-card">
              <h3>Join Existing Room</h3>
              <div className="form-group">
                <label>Room Code:</label>
                <input
                  type="text"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                  placeholder="Enter 6-digit code"
                  className="text-input"
                  maxLength={6}
                />
              </div>
              <button 
                className="btn-primary"
                onClick={joinRoom}
                disabled={!username || !roomCode}
              >
                Join Room
              </button>
            </div>
          </div>
        </div>
      )}

      {stage === "waiting" && (
        <div className="waiting-room">
          <h2>{myRole === "player1" ? "Waiting for Opponent..." : "Joining Room..."}</h2>
          {myRole === "player1" && (
            <div className="room-code-display">
              <p>Share this code with your opponent:</p>
              <div className="code-box">{roomCode}</div>
            </div>
          )}
          {topic && (
            <div className="topic-display">
              <strong>Topic:</strong> {topic}
            </div>
          )}
          <div className="spinner">⏳</div>
          <button className="btn-secondary" onClick={() => setStage("lobby")}>
            Cancel
          </button>
        </div>
      )}

      {stage === "debate" && (
        <div className="debate-active">
          <div className="debate-info-bar">
            <div className="room-info">Room: {roomCode}</div>
            <div className="spectators">👁️ {spectatorCount} watching</div>
          </div>

          <div className="debate-header">
            <h3>Round {round} - {isMyTurn ? "Your Turn" : "Opponent's Turn"}</h3>
            <div className={`timer ${timeRemaining < 30 ? 'warning' : ''}`}>
              {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}
            </div>
          </div>

          <div className="topic-display">
            <strong>Topic:</strong> {topic}
          </div>

          {isMyTurn ? (
            <div className="input-area">
              <textarea
                value={myArgument}
                onChange={(e) => setMyArgument(e.target.value)}
                placeholder="Type your argument..."
                className="argument-input"
                rows={10}
              />
              
              <div className="input-controls">
                <button 
                  className="btn-secondary"
                  onClick={startSpeechToText}
                >
                  {isRecording ? '⏹️ Stop Recording' : '🎤 Speech-to-Text'}
                </button>
                <button 
                  className="btn-primary"
                  onClick={submitArgument}
                  disabled={!myArgument.trim()}
                >
                  Submit Argument
                </button>
              </div>
            </div>
          ) : (
            <div className="opponent-turn">
              <p>🤔 Waiting for opponent to respond...</p>
              <div className="opponent-typing">Opponent is typing...</div>
            </div>
          )}

          <div className="transcript-live">
            <h4>Transcript</h4>
            {transcript.map((entry, idx) => (
              <div key={idx} className="transcript-entry">
                <strong>Round {entry.round} - {entry.speaker}:</strong>
                <p>{entry.text}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {stage === "finished" && (
        <div className="debate-finished">
          <h2>Debate Complete! 🎉</h2>
          
          <div className="results-section">
            <h3>Audience Vote</h3>
            <div className="vote-results">
              <div className="vote-bar">
                <div className="vote-fill player1" style={{width: "55%"}}>
                  Player 1: 55%
                </div>
              </div>
              <div className="vote-bar">
                <div className="vote-fill player2" style={{width: "45%"}}>
                  Player 2: 45%
                </div>
              </div>
            </div>
          </div>

          <div className="transcript-section">
            <h3>Full Transcript</h3>
            {transcript.map((entry, idx) => (
              <div key={idx} className="transcript-entry">
                <strong>Round {entry.round} - {entry.speaker}:</strong>
                <p>{entry.text}</p>
              </div>
            ))}
          </div>

          <div className="ai-analysis">
            <h3>AI Judge Analysis</h3>
            <ul>
              <li>✅ Both debaters used strong evidence</li>
              <li>📊 Player 1 had more logical structure</li>
              <li>💡 Player 2 delivered more persuasive rhetoric</li>
            </ul>
          </div>

          <div className="action-buttons">
            <button className="btn-primary" onClick={() => setStage("lobby")}>
              Start New Debate
            </button>
            <Link href="/" className="btn-secondary">Back to Home</Link>
          </div>
        </div>
      )}
    </div>
  );
}
