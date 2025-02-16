"use client";

import { Button } from "@/components/ui/button";

export default function AuthButton() {
  return (
    <Button asChild size="lg">
      <a href="/auth">Get Started</a>
    </Button>
  );
}
