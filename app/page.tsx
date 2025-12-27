import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <div className="container">
      <div className="home-logo">
        <Image src="/e-bate-logo.png" alt="E-Bate" width={160} height={52} />
      </div>
      <div className="hero">
        <h1 className="hero-title">Sharpen Your Debate Skills</h1>
        <p className="hero-description">
          Practice with AI, compete with real opponents, or collaborate in team debates.
          Build confidence, master arguments, and become a better debater.
        </p>
      </div>

      <div className="home-actions revamped">
        <Link href="/ai-debate" className="action-card large">
          <h3>Practice Mode</h3>
          <p className="action-punchline">Master your arguments with AI-driven coaching</p>
          <span className="cta btn-primary">Start Practice</span>
        </Link>
        <Link href="/realtime-debate" className="action-card large">
          <h3>1v1 Mode</h3>
          <p className="action-punchline">Challenge real opponents live and earn rankings</p>
          <span className="cta btn-secondary">Find a Match</span>
        </Link>
      </div>
    </div>
  );
}
