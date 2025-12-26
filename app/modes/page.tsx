import Link from "next/link";

export default function Modes() {
  return (
    <div className="container">
      <h1 className="page-title">Choose Your Mode</h1>
      <p className="page-subtitle">Select how you want to practice your debate skills</p>

      <div className="modes-grid">
        <Link href="/ai-debate" className="mode-card ai-mode">
          <div className="card-header">
            <h3>Practice Mode</h3>
          </div>
          <p className="card-description">Debate an AI opponent that challenges your logic and helps you improve</p>
          <div className="card-footer">
            <span className="arrow">→</span>
          </div>
        </Link>

        <Link href="/realtime-debate" className="mode-card live-mode">
          <div className="card-header">
            <h3>1v1 Competition</h3>
          </div>
          <p className="card-description">Compete against a real debater in structured timed matches</p>
          <div className="card-footer">
            <span className="arrow">→</span>
          </div>
        </Link>

        <Link href="/team-debate" className="mode-card team-mode">
          <div className="card-header">
            <h3>Team Debate (3v3)</h3>
          </div>
          <p className="card-description">Engage in structured team debates with three speakers per side</p>
          <div className="card-footer">
            <span className="arrow">→</span>
          </div>
        </Link>

        <Link href="/mun-debate" className="mode-card mun-mode">
          <div className="card-header">
            <h3>Model United Nations</h3>
          </div>
          <p className="card-description">Simulate UN sessions with multiple countries and voting on resolutions</p>
          <div className="card-footer">
            <span className="arrow">→</span>
          </div>
        </Link>
      </div>
    </div>
  );
}
