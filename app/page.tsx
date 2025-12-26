import Link from "next/link";

export default function Home() {
  return (
    <div className="container">
      <div className="hero">
        <h1 className="hero-title">Sharpen Your Debate Skills</h1>
        <p className="hero-description">
          Practice with AI, compete with real opponents, or collaborate in team debates.
          Build confidence, master arguments, and become a better debater.
        </p>
      </div>

      <div className="home-actions">
        <div className="action-card">
          <Link href="/ai-debate" className="btn-primary">
            Practice Mode
          </Link>
          <p className="action-punchline">Master your arguments with AI</p>
        </div>
        <div className="action-card">
          <Link href="/realtime-debate" className="btn-secondary">
            1v1 Mode
          </Link>
          <p className="action-punchline">Challenge real opponents live</p>
        </div>
      </div>

      <div className="features-section">
        <h2 className="section-title">Choose Your Arena</h2>
        <div className="features-grid">
          <Link href="/team-debate" className="feature-card">
            <h3>Team Debate</h3>
            <p>3v3 format with structured turns and collaborative strategy</p>
          </Link>
          <Link href="/mun-debate" className="feature-card">
            <h3>MUN Simulation</h3>
            <p>Model United Nations with voting and diplomatic resolution</p>
          </Link>
          <Link href="/modes" className="feature-card">
            <h3>All Modes</h3>
            <p>Explore every debate format and find your perfect match</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
