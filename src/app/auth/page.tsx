"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { auth } from "@/lib/firebase/config";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";

// Define the form component outside of the page component to prevent re-creation on state change
const AuthForm = ({ 
  isSignUp, 
  handleAuthAction, 
  loading, 
  email,
  setEmail,
  password,
  setPassword
}: { 
  isSignUp: boolean;
  handleAuthAction: (isSignUp: boolean) => void;
  loading: boolean;
  email: string;
  setEmail: (val: string) => void;
  password: string;
  setPassword: (val: string) => void;
}) => (
    <form onSubmit={(e: FormEvent) => { e.preventDefault(); handleAuthAction(isSignUp); }}>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor={isSignUp ? "signup-email" : "signin-email"}>Email</Label>
          <Input id={isSignUp ? "signup-email" : "signin-email"} type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor={isSignUp ? "signup-password" : "signin-password"}>Password</Label>
          <Input id={isSignUp ? "signup-password" : "signin-password"} type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        <Button type="submit" disabled={loading} className="w-full">
           {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          {isSignUp ? "Sign Up" : "Sign In"}
        </Button>
      </div>
    </form>
  );

export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();

  if (!auth) {
    return (
        <div className="flex items-center justify-center min-h-screen bg-background">
            <Alert variant="destructive" className="w-[400px]">
              <Terminal className="h-4 w-4" />
              <AlertTitle>Firebase Not Configured</AlertTitle>
              <AlertDescription>
                Please add your Firebase project configuration to the .env file to enable authentication.
              </AlertDescription>
            </Alert>
        </div>
    )
  }

  if (user) {
    router.push("/");
    return null;
  }

  const handleAuthAction = async (isSignUp: boolean) => {
    setLoading(true);
    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      router.push("/");
      toast({ title: "Success", description: `Successfully ${isSignUp ? 'signed up' : 'signed in'}.` });
    } catch (error: any) {
      toast({ title: "Authentication Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Tabs defaultValue="sign-in" className="w-[400px]">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="sign-in">Sign In</TabsTrigger>
          <TabsTrigger value="sign-up">Sign Up</TabsTrigger>
        </TabsList>
        <TabsContent value="sign-in">
            <Card>
                <CardHeader>
                    <CardTitle>Sign In</CardTitle>
                    <CardDescription>Enter your credentials to access your dashboard.</CardDescription>
                </CardHeader>
                <CardContent>
                    <AuthForm 
                        isSignUp={false} 
                        handleAuthAction={handleAuthAction} 
                        loading={loading}
                        email={email}
                        setEmail={setEmail}
                        password={password}
                        setPassword={setPassword}
                    />
                </CardContent>
            </Card>
        </TabsContent>
        <TabsContent value="sign-up">
             <Card>
                <CardHeader>
                    <CardTitle>Sign Up</CardTitle>
                    <CardDescription>Create an account to get started.</CardDescription>
                </CardHeader>
                <CardContent>
                    <AuthForm 
                        isSignUp={true} 
                        handleAuthAction={handleAuthAction}
                        loading={loading}
                        email={email}
                        setEmail={setEmail}
                        password={password}
                        setPassword={setPassword}
                    />
                </CardContent>
            </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
