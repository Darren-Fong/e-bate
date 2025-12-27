"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import { getTrialsUsed, getTrialsRemaining, isUnlimited, resetTrials, getTierInfo, getTrialsLimit, getUserTier, TIERS } from "@/lib/access-control";

export default function DebugTrials() {
  const { user, isLoaded } = useUser();
  const [trialsUsed, setTrialsUsed] = useState<number>(0);
  const [trialsRemaining, setTrialsRemaining] = useState<number>(0);
  const [trialsLimit, setTrialsLimit] = useState<number>(5);
  const [tierName, setTierName] = useState<string>('Free');
  const [tierType, setTierType] = useState<string>('free');
  const [isUnlimitedUser, setIsUnlimitedUser] = useState<boolean>(false);
  const [allTrials, setAllTrials] = useState<Array<{key: string, value: string}>>([]);

  const loadData = () => {
    if (user?.id) {
      const userEmail = user.primaryEmailAddress?.emailAddress;
      const tier = getTierInfo(userEmail);
      const type = getUserTier(userEmail);
      const used = getTrialsUsed(user.id);
      const remaining = getTrialsRemaining(user.id, userEmail);
      const limit = getTrialsLimit(userEmail);
      const unlimited = isUnlimited(userEmail);
      
      setTierName(tier.displayName);
      setTierType(type);
      setTrialsUsed(used);
      setTrialsRemaining(remaining);
      setTrialsLimit(limit);
      setIsUnlimitedUser(unlimited);

      // Get all trial entries from localStorage
      const trials: Array<{key: string, value: string}> = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('trials_used_')) {
          trials.push({
            key,
            value: localStorage.getItem(key) || '0'
          });
        }
      }
      setAllTrials(trials);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handleReset = () => {
    if (user?.id) {
      resetTrials(user.id);
      loadData();
      alert('Trials reset successfully!');
    }
  };

  const handleResetAll = () => {
    if (confirm('This will reset ALL user trials in localStorage. Continue?')) {
      allTrials.forEach(trial => {
        localStorage.removeItem(trial.key);
      });
      loadData();
      alert('All trials reset!');
    }
  };

  if (!isLoaded) {
    return (
      <div className="debate-container">
        <div className="loading-spinner">
          <div className="spinner-dot"></div>
          <div className="spinner-dot"></div>
          <div className="spinner-dot"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="debate-container">
        <Link href="/" className="back-link">← Back to Home</Link>
        <h1 className="page-title">Debug Trials</h1>
        <div className="auth-required">
          <h2>🔒 Sign In Required</h2>
          <p>Please sign in to view trial information.</p>
          <Link href="/sign-in" className="btn-primary">
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="debate-container">
      <Link href="/" className="back-link">← Back to Home</Link>
      
      <h1 className="page-title">Debug Trials</h1>

      <div className="setup-panel">
        <h2>Current User Information</h2>
        <div style={{marginBottom: '20px'}}>
          <p><strong>User ID:</strong> {user.id}</p>
          <p><strong>Email:</strong> {user.primaryEmailAddress?.emailAddress}</p>
          <p><strong>Tier:</strong> {tierName} <span style={{color: 'var(--text-secondary)'}}>({tierType})</span></p>
          <p><strong>Access Level:</strong> {isUnlimitedUser ? '✨ Unlimited Access' : `🎯 Limited (${trialsLimit} debates)`}</p>
        </div>

        <h2>All Available Tiers</h2>
        <div style={{marginBottom: '20px', display: 'grid', gap: '10px'}}>
          {Object.entries(TIERS).map(([key, tier]) => (
            <div key={key} style={{
              padding: '10px',
              background: tierType === key ? 'var(--primary-color)' : 'var(--card-bg)',
              color: tierType === key ? 'white' : 'var(--text-primary)',
              borderRadius: '8px',
              border: '1px solid var(--border-color)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span><strong>{tier.displayName}</strong> ({key})</span>
              <span>{tier.limit === Infinity ? '∞ Unlimited' : `${tier.limit} debates`}</span>
              {tierType === key && <span>✓ Your Tier</span>}
            </div>
          ))}
        </div>

        <h2>Trial Usage</h2>
        <div style={{marginBottom: '20px'}}>
          <p><strong>Trials Used:</strong> {trialsUsed}</p>
          <p><strong>Trials Remaining:</strong> {isUnlimitedUser ? '∞ (Unlimited)' : `${trialsRemaining} / ${trialsLimit}`}</p>
        </div>

        <div style={{display: 'flex', gap: '10px', marginBottom: '30px'}}>
          <button onClick={handleReset} className="btn-primary">
            Reset My Trials
          </button>
          <button onClick={loadData} className="btn-secondary">
            Refresh Data
          </button>
        </div>

        <h2>All Trial Data in localStorage</h2>
        {allTrials.length === 0 ? (
          <p style={{color: 'var(--text-secondary)'}}>No trial data found</p>
        ) : (
          <div style={{marginBottom: '20px'}}>
            {allTrials.map((trial, index) => (
              <div key={index} style={{
                padding: '10px',
                marginBottom: '10px',
                background: 'var(--card-bg)',
                borderRadius: '8px',
                border: '1px solid var(--border-color)'
              }}>
                <p style={{fontFamily: 'monospace', fontSize: '12px'}}><strong>Key:</strong> {trial.key}</p>
                <p><strong>Value:</strong> {trial.value} trials used</p>
              </div>
            ))}
            <button onClick={handleResetAll} className="btn-danger" style={{
              background: '#ff3b30',
              color: 'white',
              marginTop: '10px'
            }}>
              Reset All Users' Trials (Dangerous!)
            </button>
          </div>
        )}

        <h2>How to Test</h2>
        <ol style={{lineHeight: '1.8', color: 'var(--text-secondary)'}}>
          <li>Go to <code>lib/access-control.ts</code> to assign tiers to emails</li>
          <li>Sign in with different accounts to test each tier</li>
          <li>Start AI debates to consume trials</li>
          <li>Check the browser console (F12) for detailed logging</li>
          <li>Use "Reset My Trials" button to test again</li>
          <li>Free tier: 5 debates, Basic: 20 debates, Pro: 50 debates, Unlimited: ∞</li>
        </ol>

        <div style={{
          marginTop: '20px',
          padding: '15px',
          background: 'var(--info-bg)',
          borderRadius: '8px',
          border: '1px solid var(--primary-color)'
        }}>
          <p style={{margin: 0}}><strong>💡 Tip:</strong> Open the browser console (F12) and go to the Console tab to see detailed logs about trial counting and access control.</p>
        </div>
      </div>
    </div>
  );
}
