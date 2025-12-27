"use client";

import { useUser } from "@clerk/nextjs";
import { useState, useEffect } from "react";
import Link from "next/link";
import { getTrialsRemaining, getTierInfo, getTrialsLimit } from "@/lib/access-control";
import dynamic from 'next/dynamic';

const SignIn = dynamic(() => import('@clerk/nextjs').then(mod => mod.SignIn), { ssr: false });
import { getDebateHistory, clearDebateHistory } from '@/lib/debate-history';

interface DebateStats {
  totalDebates: number;
  aiDebates: number;
  realtimeDebates: number;
  teamDebates: number;
  munDebates: number;
  lastDebateDate: string | null;
}

export default function DashboardPage() {
  const { user, isLoaded } = useUser();
  const [stats, setStats] = useState<DebateStats>({
    totalDebates: 0,
    aiDebates: 0,
    realtimeDebates: 0,
    teamDebates: 0,
    munDebates: 0,
    lastDebateDate: null,
  });
  const [trialsRemaining, setTrialsRemaining] = useState<number | null>(null);
  const [trialsLimit, setTrialsLimit] = useState<number>(5);
  const [tierName, setTierName] = useState<string>('Free');
  const [debateHistory, setDebateHistory] = useState<any[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<any | null>(null);

  useEffect(() => {
    if (user) {
      // Load stats from localStorage
      const userId = user.id;
      const savedStats = localStorage.getItem(`debate_stats_${userId}`);
      
      if (savedStats) {
        setStats(JSON.parse(savedStats));
      }

      // Load trial count and tier info from Clerk metadata
      const metadata = user.publicMetadata;
      const tier = getTierInfo(metadata);
      const remaining = getTrialsRemaining(userId, metadata);
      const limit = getTrialsLimit(metadata);
      
      setTierName(tier.displayName);
      setTrialsLimit(limit);
      setTrialsRemaining(remaining);
      // Load debate history
      try {
        const history = getDebateHistory(userId);
        setDebateHistory(history);
      } catch (err) {
        console.error('Error loading debate history:', err);
      }
    }
  }, [user]);

  if (!isLoaded) {
    return (
      <div className="container">
        <div className="loading-container">
          <div className="spinner-dot"></div>
          <div className="spinner-dot"></div>
          <div className="spinner-dot"></div>
        </div>

        <div className="history-section">
          <h2>Debate History</h2>
          {debateHistory.length === 0 ? (
            <p className="text-muted">No past debates recorded yet.</p>
          ) : (
            <div className="history-list">
              {debateHistory.map((rec, idx) => (
                <div key={rec.id} className="history-item">
                  <div>
                    <strong>{rec.topic}</strong>
                    <div className="text-muted">{new Date(rec.date).toLocaleString()} — {rec.type.toUpperCase()} — {rec.rounds} rounds</div>
                  </div>
                  <div className="history-actions">
                    <button className="btn-secondary" onClick={() => setSelectedRecord(rec)}>View Transcript</button>
                  </div>
                </div>
              ))}
            </div>
          )}
          {debateHistory.length > 0 && (
              <div style={{marginTop:12}}>
              <button className="btn-secondary" onClick={() => {
                if (!user) return;
                clearDebateHistory(user.id as string);
                setDebateHistory([]);
              }}>Clear History</button>
            </div>
          )}
        </div>
      </div>
    );
  }

  const [showSignIn, setShowSignIn] = useState(false);

  if (!user) {
    return (
      <div className="container">
        <div className="auth-required">
          <h2>Authentication Required</h2>
          <p>Please sign in to view your dashboard</p>
          <button
            className="btn-primary"
            onClick={() => setShowSignIn(true)}
          >
            Sign In
          </button>

          {showSignIn && (
            <div className="modal-overlay" role="dialog" aria-modal="true">
              <div className="modal-backdrop" onClick={() => setShowSignIn(false)} />
              <div className="modal-card">
                <button className="modal-close" onClick={() => setShowSignIn(false)} aria-label="Close">✕</button>
                <h3 className="modal-title">Sign in to E‑Bate</h3>
                {/* Clerk SignIn component */}
                {/* Importing locally here to avoid SSR issues */}
                <div className="modal-signin">
                  <SignIn routing="path" path="/sign-in" afterSignInUrl="/dashboard" />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="dashboard-container">
        <div className="dashboard-header">
          <div className="dashboard-user-info">
            <div className="dashboard-avatar">
              {user.imageUrl ? (
                <img src={user.imageUrl} alt={user.fullName || "User"} />
              ) : (
                <div className="avatar-placeholder">
                  {user.firstName?.[0] || user.username?.[0] || "U"}
                </div>
              )}
            </div>
            <div>
              <h1>Welcome back, {user.firstName || user.username}!</h1>
              <p className="dashboard-subtitle">Here's your debate journey</p>
              {trialsRemaining !== null && (
                <p className="dashboard-trials">
                  {trialsLimit === Infinity ? (
                    <><strong>{tierName}</strong> Access - Unlimited AI Practice</>
                  ) : (
                    <><strong>{tierName}</strong> tier: <strong>{trialsRemaining}</strong> / {trialsLimit} AI Practice rounds</>
                  )}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="stats-grid">
          <div className="stat-card highlight">
            <div className="stat-icon">
              <svg width="36" height="36" viewBox="0 0 24 24" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <rect x="3" y="13" width="4" height="8" rx="1" fill="currentColor" />
                <rect x="9" y="7" width="4" height="14" rx="1" fill="currentColor" />
                <rect x="15" y="3" width="4" height="18" rx="1" fill="currentColor" />
              </svg>
            </div>
            <div className="stat-content">
              <div className="stat-number">{stats.totalDebates}</div>
              <div className="stat-label">Total Debates</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <svg width="36" height="36" viewBox="0 0 24 24" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" fill="none">
                <rect x="3" y="4" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.4" />
                <circle cx="8.5" cy="10" r="1.2" fill="currentColor" />
                <circle cx="15.5" cy="10" r="1.2" fill="currentColor" />
                <rect x="8" y="13.5" width="8" height="1.6" rx="0.8" fill="currentColor" />
              </svg>
            </div>
            <div className="stat-content">
              <div className="stat-number">{stats.aiDebates}</div>
              <div className="stat-label">AI Practice</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <svg width="36" height="36" viewBox="0 0 24 24" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" fill="none">
                <path d="M3 21l8-8M21 3l-8 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M7 7l3 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M14 14l3 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div className="stat-content">
              <div className="stat-number">{stats.realtimeDebates}</div>
              <div className="stat-label">1v1 Debates</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <svg width="36" height="36" viewBox="0 0 24 24" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" fill="none">
                <circle cx="9" cy="9" r="2.2" fill="currentColor" />
                <path d="M4 18c1.5-2 4-3 5-3s3.5 1 5 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="17" cy="8" r="1.8" fill="currentColor" />
                <path d="M13.5 18c1-1.6 3-2.4 4-2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div className="stat-content">
              <div className="stat-number">{stats.teamDebates}</div>
              <div className="stat-label">Team Debates</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <svg width="36" height="36" viewBox="0 0 24 24" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" fill="none">
                <rect x="3" y="4" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.4" />
                <path d="M8 2v4M16 2v4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                <rect x="7" y="9" width="10" height="6" rx="1" fill="currentColor" opacity="0.06" />
              </svg>
            </div>
            <div className="stat-content">
              <div className="stat-number">{stats.munDebates}</div>
              <div className="stat-label">MUN Simulations</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <rect x="3" y="13" width="4" height="8" rx="1" fill="currentColor" />
                <rect x="9" y="7" width="4" height="14" rx="1" fill="currentColor" />
                <rect x="15" y="3" width="4" height="18" rx="1" fill="currentColor" />
              </svg>
            </div>
            <div className="stat-content">
              <div className="stat-number">
                {stats.lastDebateDate ? new Date(stats.lastDebateDate).toLocaleDateString() : "Never"}
              </div>
              <div className="stat-label">Last Debate</div>
            </div>
          </div>
        </div>

        <div className="dashboard-actions">
          <h2>Quick Actions</h2>
          <div className="action-grid">
            <Link href="/ai-debate" className="action-card-dash">
              <div className="action-icon">
                  <svg width="28" height="28" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" fill="none">
                    <rect x="3" y="4" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.2" />
                    <circle cx="8.5" cy="9" r="1" fill="currentColor" />
                    <circle cx="15.5" cy="9" r="1" fill="currentColor" />
                  </svg>
                </div>
              <h3>AI Practice</h3>
              <p>Sharpen your skills with AI</p>
            </Link>

            <Link href="/realtime-debate" className="action-card-dash">
              <div className="action-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" fill="none">
                  <path d="M3 21l8-8M21 3l-8 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M7 7l3 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <h3>1v1 Debate</h3>
              <p>Challenge a real opponent</p>
            </Link>

            <Link href="/team-debate" className="action-card-dash">
              <div className="action-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" fill="none">
                  <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.2" />
                  <path d="M4 12h16M12 4v16" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
                </svg>
              </div>
              <h3>Team Debate</h3>
              <p>3v3 collaborative debate</p>
            </Link>

            <Link href="/mun-debate" className="action-card-dash">
              <div className="action-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <rect x="3" y="13" width="4" height="8" rx="1" fill="currentColor" />
                  <rect x="9" y="7" width="4" height="14" rx="1" fill="currentColor" />
                  <rect x="15" y="3" width="4" height="18" rx="1" fill="currentColor" />
                </svg>
              </div>
              <h3>MUN Simulation</h3>
              <p>Model United Nations</p>
            </Link>
          </div>
        </div>

        {stats.totalDebates === 0 && (
          <div className="empty-state">
            <div className="empty-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <rect x="3" y="13" width="4" height="8" rx="1" fill="currentColor" />
                <rect x="9" y="7" width="4" height="14" rx="1" fill="currentColor" />
                <rect x="15" y="3" width="4" height="18" rx="1" fill="currentColor" />
              </svg>
            </div>
            <h2>Start Your Debate Journey!</h2>
            <p>You haven't participated in any debates yet. Choose a mode above to get started!</p>
          </div>
        )}

        {selectedRecord && (
          <div className="modal-overlay" role="dialog" aria-modal="true">
            <div className="modal-backdrop" onClick={() => setSelectedRecord(null)} />
            <div className="modal-card">
              <button className="modal-close" onClick={() => setSelectedRecord(null)} aria-label="Close">✕</button>
              <h3 className="modal-title">Transcript — {selectedRecord.topic}</h3>
              <div className="transcript-section">
                {selectedRecord.transcript.map((entry: any, i: number) => (
                  <div key={i} className={`transcript-entry ${entry.speaker === 'You' ? 'user' : 'ai'}`}>
                    <strong>Round {entry.round} — {entry.speaker}</strong>
                    <p>{entry.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
