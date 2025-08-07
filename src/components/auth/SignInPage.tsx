import { SignIn } from "@clerk/clerk-react";

const SignInPage = () => {
  return (
    <div className="min-h-screen bg-gradient-primary flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8 animate-fade-in">
          <h1 className="text-4xl font-bold text-white mb-2">AutoInspect AI</h1>
          <p className="text-white/80 text-lg">Document Verification System</p>
        </div>
        <div className="bg-card rounded-2xl shadow-large p-6 animate-scale-in">
          <SignIn 
            appearance={{
              elements: {
                rootBox: "w-full",
                card: "bg-transparent shadow-none",
                headerTitle: "text-foreground",
                headerSubtitle: "text-muted-foreground",
                socialButtonsBlockButton: "bg-secondary hover:bg-secondary/80 border-border",
                formButtonPrimary: "bg-primary hover:bg-primary-hover"
              }
            }}
            fallbackRedirectUrl="/dashboard"
          />
        </div>
      </div>
    </div>
  );
};

export default SignInPage;