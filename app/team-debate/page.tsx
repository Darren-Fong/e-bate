"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getPusherClient } from "@/lib/pusher-client";

type DebateStage = "lobby" | "waiting" | "debate" | "finished";

export default function TeamDebate() {
  const [stage, setStage] = useState<DebateStage>("lobby");
  const [roomCode, setRoomCode] = useState("");
  const [inputRoomCode, setInputRoomCode] = useState("");
  const [myName, setMyName] = useState("");
  const [myTeam, setMyTeam] = useState<"proposition" | "opposition">("proposition");
  const [topic, setTopic] = useState("");
  const [timeRemaining, setTimeRemaining] = useState(300);
  const [currentSpeakerIndex, setCurrentSpeakerIndex] = useState(0);
  const [propositionTeam, setPropositionTeam] = useState<string[]>([]);
  const [oppositionTeam, setOppositionTeam] = useState<string[]>([]);
  const [transcript, setTranscript] = useState<Array<{speaker: string, team: string, text: string}>>([]);
  const [currentSpeech, setCurrentSpeech] = useState("");
  const [isRecording, setIsRecording] = useState(false);

  // Speaking order in 3v3 debate
  const speakingOrder = [
    { team: "proposition", speakerIndex: 0, role: "First Proposition" },
    { team: "opposition", speakerIndex: 0, role: "First Opposition" },
    { team: "proposition", speakerIndex: 1, role: "Second Proposition" },
    { team: "opposition", speakerIndex: 1, role: "Second Opposition" },
    { team: "proposition", speakerIndex: 2, role: "Third Proposition" },
    { team: "opposition", speakerIndex: 2, role: "Third Opposition" }
  ];

  const getCurrentSpeaker = () => {
    if (currentSpeakerIndex >= 6) return null;
    const current = speakingOrder[currentSpeakerIndex];
    const team = current.team === "proposition" ? propositionTeam : oppositionTeam;
    return team[current.speakerIndex] || null;
  };

  const isMyTurn = () => {
    const currentSpeaker = getCurrentSpeaker();
    return currentSpeaker === myName;
  };

  // Pusher real-time sync
  useEffect(() => {
    if (roomCode && stage !== "lobby") {
      const client = getPusherClient();
      if (!client) return;

      const channel = client.subscribe(`team-room-${roomCode}`);

      channel.bind("room-created", (data: any) => {
        if (!topic) setTopic(data.topic);
        setPropositionTeam(data.roomData.propositionTeam);
        setOppositionTeam(data.roomData.oppositionTeam);
      });

      channel.bind("player-joined", (data: any) => {
        setPropositionTeam(data.roomData.propositionTeam);
        setOppositionTeam(data.roomData.oppositionTeam);
        
        // Start debate if both teams are full
        if (data.roomData.propositionTeam.length === 3 && data.roomData.oppositionTeam.length === 3) {
          setStage("debate");
          setTimeRemaining(300);
        }
      });

      channel.bind("speech-submitted", (data: any) => {
        setTranscript(data.transcript);
        setCurrentSpeakerIndex(data.nextSpeakerIndex);
        setTimeRemaining(300);
        
        if (data.nextSpeakerIndex >= 6) {
          setStage("finished");
        }
      });

      return () => {
        channel.unbind_all();
        channel.unsubscribe();
      };
    }
  }, [roomCode, stage, topic]);

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
  }, [stage, timeRemaining, currentSpeakerIndex, myName]);

  const createRoom = async () => {
    if (!topic.trim() || !myName.trim()) return;

    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    setRoomCode(code);

    try {
      const response = await fetch("/api/team-debate/create-room", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomCode: code,
          topic,
          creatorName: myName,
          creatorTeam: myTeam
        })
      });

      if (response.ok) {
        setStage("waiting");
        const data = await response.json();
        setPropositionTeam(data.roomData.propositionTeam);
        setOppositionTeam(data.roomData.oppositionTeam);
      }
    } catch (error) {
      console.error("Error creating room:", error);
    }
  };

  const joinRoom = async () => {
    if (!inputRoomCode.trim() || !myName.trim()) return;

    try {
      const response = await fetch("/api/team-debate/join-room", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomCode: inputRoomCode,
          playerName: myName,
          team: myTeam
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        setRoomCode(inputRoomCode);
        setTopic(data.roomData.topic);
        setPropositionTeam(data.roomData.propositionTeam);
        setOppositionTeam(data.roomData.oppositionTeam);
        
        if (data.roomData.propositionTeam.length === 3 && data.roomData.oppositionTeam.length === 3) {
          setStage("debate");
        } else {
          setStage("waiting");
        }
      } else {
        alert(data.error || "Failed to join room");
      }
    } catch (error) {
      console.error("Error joining room:", error);
      alert("Failed to join room");
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
      setCurrentSpeech((prev) => prev + ' ' + transcript);
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

  const submitSpeech = async () => {
    if (!currentSpeech.trim() || !isMyTurn()) return;

    try {
      const current = speakingOrder[currentSpeakerIndex];
      await fetch("/api/team-debate/submit-speech", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomCode,
          speaker: myName,
          team: current.team,
          speech: currentSpeech,
          speakerIndex: currentSpeakerIndex
        })
      });

      setCurrentSpeech("");
    } catch (error) {
      console.error("Error submitting speech:", error);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const currentSpeaker = getCurrentSpeaker();
  const currentSpeakerTeam = currentSpeakerIndex < 6 ? speakingOrder[currentSpeakerIndex].team : null;

  return (
    <div className="debate-container">
      <Link href="/modes" className="back-link">← Back to Modes</Link>
      
      <h1 className="page-title">Team Debate (3v3)</h1>

      {stage === "lobby" && (
        <div className="lobby-panel">
          <div className="form-group">
            <label>Your Name:</label>
            <input
              type="text"
              value={myName}
              onChange={(e) => setMyName(e.target.value)}
              placeholder="Enter your name"
              className="text-input"
            />
          </div>

          <div className="form-group">
            <label>Choose Your Team:</label>
            <div className="radio-group">
              <label>
                <input
                  type="radio"
                  value="proposition"
                  checked={myTeam === "proposition"}
                  onChange={(e) => setMyTeam(e.target.value as "proposition")}
                />
                Proposition
              </label>
              <label>
                <input
                  type="radio"
                  value="opposition"
                  checked={myTeam === "opposition"}
                  onChange={(e) => setMyTeam(e.target.value as "opposition")}
                />
                Opposition
              </label>
            </div>
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
                disabled={!topic.trim() || !myName.trim()}
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
                  value={inputRoomCode}
                  onChange={(e) => setInputRoomCode(e.target.value.toUpperCase())}
                  placeholder="Enter room code"
                  className="text-input"
                />
              </div>
              <button
                className="btn-primary"
                onClick={joinRoom}
                disabled={!inputRoomCode.trim() || !myName.trim()}
              >
                Join Room
              </button>
            </div>
          </div>
        </div>
      )}

      {stage === "waiting" && (
        <div className="waiting-room">
          <h2>Waiting for Players...</h2>
          <div className="room-code-display">
            <p>Room Code:</p>
            <div className="code-box">{roomCode}</div>
          </div>
          <p>Topic: {topic}</p>
          
          <div className="team-status">
            <div className="team-list">
              <h3>Proposition Team ({propositionTeam.length}/3)</h3>
              {propositionTeam.map((name, idx) => (
                <p key={idx}>{name}</p>
              ))}
            </div>
            <div className="team-list">
              <h3>Opposition Team ({oppositionTeam.length}/3)</h3>
              {oppositionTeam.map((name, idx) => (
                <p key={idx}>{name}</p>
              ))}
            </div>
          </div>
          
          <p className="spinner">⏳</p>
          <p>Waiting for all 6 players to join...</p>
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
              <span className="speaker-name">{currentSpeaker || "Unknown"}</span>
              <span className="speaker-team">({currentSpeakerTeam === "proposition" ? "Proposition" : "Opposition"})</span>
            </div>
            <div className="speaker-progress">
              Speaker {currentSpeakerIndex + 1} of 6
            </div>
          </div>

          {isMyTurn() ? (
            <div className="argument-input">
              <textarea
                value={currentSpeech}
                onChange={(e) => setCurrentSpeech(e.target.value)}
                placeholder="Enter your speech..."
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
                  onClick={submitSpeech}
                  disabled={!currentSpeech.trim()}
                >
                  Submit Speech
                </button>
              </div>
            </div>
          ) : (
            <div className="opponent-turn">
              <p>Waiting for {currentSpeaker} to speak...</p>
            </div>
          )}

          <div className="transcript">
            <h3>Debate Transcript</h3>
            {transcript.map((entry, idx) => (
              <div key={idx} className="transcript-entry">
                <strong>{entry.speaker} ({entry.team === "proposition" ? "Prop" : "Opp"}):</strong> {entry.text}
              </div>
            ))}
          </div>
        </div>
      )}

      {stage === "finished" && (
        <div className="results-panel">
          <h2>Debate Complete!</h2>
          <p>All speakers have presented their arguments.</p>
          
          <div className="transcript">
            <h3>Full Transcript</h3>
            {transcript.map((entry, idx) => (
              <div key={idx} className="transcript-entry">
                <strong>{entry.speaker} ({entry.team === "proposition" ? "Proposition" : "Opposition"}):</strong>
                <p>{entry.text}</p>
              </div>
            ))}
          </div>

          <button className="btn-primary" onClick={() => {
            setStage("lobby");
            setRoomCode("");
            setInputRoomCode("");
            setTopic("");
            setTranscript([]);
            setCurrentSpeakerIndex(0);
            setPropositionTeam([]);
            setOppositionTeam([]);
          }}>
            Start New Team Debate
          </button>
        </div>
      )}
    </div>
  );
}
