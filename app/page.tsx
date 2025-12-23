import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="container">
      <div className="hero">
        <Image
          src="/e-bate-logo.png"
          alt="E-Bate Logo"
          width={300}
          height={100}
          priority
        />
        <h1 className="hero-title">Sharpen Your Debate Skills</h1>
        <p className="hero-subtitle">
          Train with AI or challenge live opponents • Track your progress • Become unstoppable
        </p>
      </div>

      <div className="modes-grid">
        <Link href="/ai-debate" className="mode-card ai-mode">
          <div className="card-header">
            <h3>Practice Mode</h3>
            <span className="card-badge">AI Powered</span>
          </div>
          <p className="card-description">Debate an AI opponent that challenges your logic and helps you improve</p>
          <div className="card-footer">
            <span className="arrow">→</span>
          </div>
        </Link>

        <Link href="/realtime-debate" className="mode-card live-mode">
          <div className="card-header">
            <h3>Live Competition</h3>
            <span className="card-badge live">Live</span>
          </div>
          <p className="card-description">Compete against real debaters in structured timed matches</p>
          <div className="card-footer">
            <span className="arrow">→</span>
          </div>
        </Link>
      </div>

      <div className="info-section">
        <div className="info-item">
          <div className="info-number">3</div>
          <div className="info-label">Minute<br/>Rounds</div>
        </div>
        <div className="info-item">
          <div className="info-number">∞</div>
          <div className="info-label">Practice<br/>Sessions</div>
        </div>
        <div className="info-item">
          <div className="info-number">⚡</div>
          <div className="info-label">Instant<br/>Feedback</div>
        </div>
      </div>
    </div>
  );
}
