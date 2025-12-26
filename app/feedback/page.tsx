"use client";

import { useState } from "react";
import Link from "next/link";

export default function Feedback() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically send the feedback to your backend
    setSubmitted(true);
    setTimeout(() => {
      setName("");
      setEmail("");
      setMessage("");
      setSubmitted(false);
    }, 3000);
  };

  return (
    <div className="container">
      <h1 className="page-title">Feedback</h1>
      <p className="page-subtitle">We'd love to hear your thoughts on E-Bate</p>

      <div className="feedback-form-container">
        {submitted ? (
          <div className="success-message">
            <h2>Thank you for your feedback!</h2>
            <p>We appreciate you taking the time to help us improve.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="feedback-form">
            <div className="form-group">
              <label htmlFor="name">Name</label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="text-input"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="text-input"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="message">Your Feedback</label>
              <textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="argument-input"
                rows={8}
                placeholder="Tell us what you think..."
                required
              />
            </div>

            <button type="submit" className="btn-primary">
              Submit Feedback
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
