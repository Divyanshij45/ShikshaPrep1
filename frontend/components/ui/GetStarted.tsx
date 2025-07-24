"use client";
import React from "react";
import Link from "next/link";
import { ArrowRight, Upload, Brain, Download, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";

const GetStarted = () => {
  const user = useAuth();
  return (
    <>
      <Link href={user.user ? "/dashboard" : "/signup"}>
        <Button size="lg" className="text-lg px-8 py-3">
          Get Started Free
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </Link>
    </>
  );
};

export default GetStarted;
