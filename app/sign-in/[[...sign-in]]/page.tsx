"use client";

import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="auth-page-container">
      <div className="auth-page-content">
        <div className="auth-page-header">
          <h1>Welcome Back to E-Bate</h1>
          <p>Sign in to continue your debate journey</p>
        </div>
        <SignIn 
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
          path="/sign-in"
          signUpUrl="/sign-up"
        />
      </div>
    </div>
  );
}
