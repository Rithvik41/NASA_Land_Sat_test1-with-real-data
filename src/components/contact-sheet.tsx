
"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
import { CheckCircle, Mail } from "lucide-react";

interface ContactSheetProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function ContactSheet({ open, onOpenChange }: ContactSheetProps) {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    // Handle form submission logic here
    console.log("Form submitted");
    setSubmitted(true);
  };

  const handleClose = () => {
    onOpenChange(false);
    // Reset form after a short delay to allow closing animation
    setTimeout(() => {
        setSubmitted(false);
    }, 300);
  }

  return (
    <Sheet open={open} onOpenChange={handleClose}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Contact Us</SheetTitle>
          <SheetDescription>
            Have a question or want to work with us? Fill out the form below.
          </SheetDescription>
        </SheetHeader>
        {submitted ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
                <CheckCircle className="h-20 w-20 text-green-500" />
                <h3 className="text-xl font-semibold">Thank You!</h3>
                <p className="text-muted-foreground">Your message has been sent. We will get back to you soon.</p>
                 <Button onClick={handleClose}>Close</Button>
            </div>
        ) : (
            <form onSubmit={handleSubmit} className="py-4 space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input id="name" placeholder="Enter your name" required />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="Enter your email" required />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number (Optional)</Label>
                    <Input id="phone" type="tel" placeholder="Enter your phone number" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <Textarea id="message" placeholder="Your message" required />
                </div>
                 <SheetFooter>
                    <SheetClose asChild>
                        <Button type="button" variant="outline">Cancel</Button>
                    </SheetClose>
                    <Button type="submit">
                        <Mail className="mr-2 h-4 w-4" />
                        Send Message
                    </Button>
                </SheetFooter>
            </form>
        )}
      </SheetContent>
    </Sheet>
  );
}
