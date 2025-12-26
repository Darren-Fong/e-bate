import Link from "next/link";

export default function Home() {
  return (
    <div className="container">
      <div className="hero">
        <h1 className="hero-title">Sharpen Your Debate Skills</h1>
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
    </div>
  );
}
