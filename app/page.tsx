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

      <section className="about-section">
        <h2>About E‑Bate</h2>
        <br></br>
        <br></br>
        <p>
          Welcome to E‑Bate — an online debate training platform with integrated AI coaching. E‑Bate helps learners practice and improve their debating skills without needing another person to train with, by providing structured practice rounds, AI-generated rebuttals, and targeted feedback.
        </p>
        <br></br>
        <p>
          I’m an aspiring Computer Science student from Hong Kong with experience in Model United Nations. I built E‑Bate to make accessible, practical debate training available to anyone interested in improving their argumentation and public speaking.
        </p>
        <br></br>
        <p>
          This project is currently under active development. If you’d like to collaborate or contribute, please visit the <Link href="/contact">Contact</Link> page — I’d love to hear from you. If you have some feedback after using the platform, please share it via the <Link href="/feedback">Feedback</Link> page.
        </p>
      </section>
    </div>
  );
}
