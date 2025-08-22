"use client";

import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase/config";
import { LogOut, LogIn } from "lucide-react";

export function AuthButton() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    if (auth) {
      await signOut(auth);
      router.push("/auth");
    }
  };

  const handleSignIn = () => {
    router.push("/auth");
  };

  if (loading) {
    return <Button variant="ghost" size="icon" disabled />;
  }

  if (user) {
    return (
      <Button variant="ghost" size="icon" onClick={handleSignOut}>
        <LogOut />
        <span className="sr-only">Sign Out</span>
      </Button>
    );
  }

  return (
    <Button variant="ghost" onClick={handleSignIn}>
      <LogIn className="mr-2" />
      Sign In
    </Button>
  );
}
