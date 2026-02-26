"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useOrganisations } from "@/hooks";
import { useAuth } from "@/providers/auth-provider";

export function AuthRedirect({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const router = useRouter();
  const { data } = useOrganisations(!!user);

  useEffect(() => {
    if (user && data) {
      const hasOrgs = data.organisations?.length > 0;
      router.push(hasOrgs ? "/organisation" : "/onboarding");
    }
  }, [user, data, router]);

  if (user) return null;

  return <>{children}</>;
}
