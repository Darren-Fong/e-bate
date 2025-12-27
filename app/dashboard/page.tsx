"use client";

import { useUser } from "@clerk/nextjs";
import { useState, useEffect } from "react";
import Link from "next/link";
import { getTrialsRemaining, getTierInfo, getTrialsLimit } from "@/lib/access-control";

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
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container">
        <div className="auth-required">
          <h2>🔒 Authentication Required</h2>
          <p>Please sign in to view your dashboard</p>
          <Link href="/sign-in" className="btn-primary">
            Sign In
          </Link>
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
              <h1>Welcome back, {user.firstName || user.username}! 👋</h1>
              <p className="dashboard-subtitle">Here's your debate journey</p>
              {trialsRemaining !== null && (
                <p className="dashboard-trials">
                  {trialsLimit === Infinity ? (
                    <>✨ <strong>{tierName}</strong> Access - Admin AI Practice</>
                  ) : (
                    <>🎯 <strong>{tierName}</strong> tier: <strong>{trialsRemaining}</strong> / {trialsLimit} AI Practice rounds</>
                  )}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="stats-grid">
          <div className="stat-card highlight">
            <div className="stat-icon">🎯</div>
            <div className="stat-content">
              <div className="stat-number">{stats.totalDebates}</div>
              <div className="stat-label">Total Debates</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">🤖</div>
            <div className="stat-content">
              <div className="stat-number">{stats.aiDebates}</div>
              <div className="stat-label">AI Practice</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">⚔️</div>
            <div className="stat-content">
              <div className="stat-number">{stats.realtimeDebates}</div>
              <div className="stat-label">1v1 Debates</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">👥</div>
            <div className="stat-content">
              <div className="stat-number">{stats.teamDebates}</div>
              <div className="stat-label">Team Debates</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">🌍</div>
            <div className="stat-content">
              <div className="stat-number">{stats.munDebates}</div>
              <div className="stat-label">MUN Simulations</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">📅</div>
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
              <div className="action-icon">🤖</div>
              <h3>AI Practice</h3>
              <p>Sharpen your skills with AI</p>
            </Link>

            <Link href="/realtime-debate" className="action-card-dash">
              <div className="action-icon">⚔️</div>
              <h3>1v1 Debate</h3>
              <p>Challenge a real opponent</p>
            </Link>

            <Link href="/team-debate" className="action-card-dash">
              <div className="action-icon">👥</div>
              <h3>Team Debate</h3>
              <p>3v3 collaborative debate</p>
            </Link>

            <Link href="/mun-debate" className="action-card-dash">
              <div className="action-icon">🌍</div>
              <h3>MUN Simulation</h3>
              <p>Model United Nations</p>
            </Link>
          </div>
        </div>

        {stats.totalDebates === 0 && (
          <div className="empty-state">
            <div className="empty-icon">🎯</div>
            <h2>Start Your Debate Journey!</h2>
            <p>You haven't participated in any debates yet. Choose a mode above to get started!</p>
          </div>
        )}
      </div>
    </div>
  );
}
