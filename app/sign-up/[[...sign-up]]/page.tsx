"use client";

import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="auth-page-container">
      <div className="auth-page-content">
        <div className="auth-page-header">
          <h1>Join E-Bate</h1>
          <p>Create your account and start debating</p>
        </div>
        <SignUp 
          appearance={{
            elements: {
              rootBox: "auth-clerk-root",
              card: "auth-clerk-card",
              headerTitle: "hidden",
              headerSubtitle: "hidden",
              socialButtonsBlockButton: "auth-social-button",
              formButtonPrimary: "auth-submit-button",
              footerActionLink: "auth-footer-link",
              formFieldInput: "auth-form-input",
              formFieldLabel: "auth-form-label",
              dividerLine: "auth-divider-line",
              dividerText: "auth-divider-text",
            }
          }}
          routing="path"
          path="/sign-up"
          signInUrl="/sign-in"
        />
      </div>
    </div>
  );
}
