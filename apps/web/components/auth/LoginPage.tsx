"use client";

import { signIn } from "next-auth/react";
import { motion } from "framer-motion";
import { Zap, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function LoginPage() {
  return (
    <div className="min-h-screen bg-nb-bg flex items-center justify-center p-4">
      {/* Background pattern */}
      <div className="fixed inset-0 opacity-5" style={{
        backgroundImage: `repeating-linear-gradient(
          45deg,
          #0A0A0A 0px,
          #0A0A0A 1px,
          transparent 1px,
          transparent 40px
        )`,
      }} />

      <motion.div
        initial={{ opacity: 0, y: 32, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="relative w-full max-w-sm"
      >
        <div className="nb-card p-8 shadow-nb-xl">
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-nb-primary rounded-nb-lg border-2 border-nb-border shadow-nb flex items-center justify-center mb-4">
              <Zap size={32} className="text-white" strokeWidth={2.5} />
            </div>
            <h1 className="text-3xl font-black tracking-tight">TaskFlow</h1>
            <p className="text-muted-foreground text-sm mt-1 font-medium">
              Get things done, beautifully.
            </p>
          </div>

          <Button
            size="lg"
            className="w-full gap-3 text-base"
            onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continue with Google
            <ArrowRight size={18} />
          </Button>

          <p className="text-center text-xs text-muted-foreground mt-6 font-medium">
            By signing in, you agree to our{" "}
            <span className="underline cursor-pointer">Terms</span> and{" "}
            <span className="underline cursor-pointer">Privacy Policy</span>
          </p>
        </div>

        {/* Decorative accent */}
        <div className="absolute -z-10 -bottom-3 -right-3 w-full h-full bg-nb-accent rounded-nb-xl border-2 border-nb-border" />
      </motion.div>
    </div>
  );
}
