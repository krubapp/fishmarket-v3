"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";

import { auth } from "@/lib/firebase";
import { createUserProfile } from "@/lib/firestore";
import { useAuth } from "@/hooks/useAuth";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";
import { ROUTES } from "@/lib/routes";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormData = z.infer<typeof loginSchema>;

function getFirebaseErrorMessage(code: string): string {
  switch (code) {
    case "auth/invalid-email":
      return "Invalid email address.";
    case "auth/user-disabled":
      return "This account has been disabled.";
    case "auth/user-not-found":
    case "auth/invalid-credential":
      return "Invalid email or password.";
    case "auth/wrong-password":
      return "Invalid email or password.";
    case "auth/email-already-in-use":
      return "An account with this email already exists.";
    case "auth/weak-password":
      return "Password is too weak.";
    case "auth/too-many-requests":
      return "Too many attempts. Please try again later.";
    default:
      return "Something went wrong. Please try again.";
  }
}

export default function LoginPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [firebaseError, setFirebaseError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading && user) {
      router.replace(ROUTES.home);
    }
  }, [user, authLoading, router]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (data: LoginFormData) => {
    setFirebaseError("");
    setIsSubmitting(true);

    try {
      if (isSignUp) {
        const { user: newUser } = await createUserWithEmailAndPassword(
          auth,
          data.email,
          data.password,
        );
        await createUserProfile(newUser.uid, data.email);
      } else {
        await signInWithEmailAndPassword(auth, data.email, data.password);
      }
      router.replace(ROUTES.home);
    } catch (err: unknown) {
      const code =
        err instanceof Error && "code" in err
          ? (err as { code: string }).code
          : "";
      setFirebaseError(getFirebaseErrorMessage(code));
      setIsSubmitting(false);
    }
  };

  if (authLoading || user) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900" />
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-dvh max-w-[480px] flex-col items-center justify-center bg-white px-6">
      <div className="flex w-full flex-col gap-8">
        <div className="flex flex-col gap-1">
          <h1 className="font-medium text-text-default-headings text-paragraph-xl leading-(--line-height-h6)">
            {isSignUp ? "Create an account" : "Welcome back"}
          </h1>
          <p className="font-medium text-text-default-body text-paragraph-md leading-(--line-height-paragraph-md)">
            {isSignUp
              ? "Sign up to start selling"
              : "Sign in to manage your listings"}
          </p>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-6"
        >
          <Input
            {...register("email")}
            type="email"
            label="Email"
            placeholder="you@example.com"
            error={Boolean(errors.email)}
            helperText={errors.email?.message}
          />

          <Input
            {...register("password")}
            type="password"
            label="Password"
            placeholder="At least 6 characters"
            error={Boolean(errors.password)}
            helperText={errors.password?.message}
          />

          {firebaseError && (
            <p className="font-medium text-red-700 text-paragraph-sm leading-(--line-height-paragraph-sm)">
              {firebaseError}
            </p>
          )}

          <Button type="submit" size="large" loading={isSubmitting}>
            {isSignUp ? "Sign Up" : "Sign In"}
          </Button>
        </form>

        <p className="text-center font-medium text-text-default-body text-paragraph-sm leading-(--line-height-paragraph-sm)">
          {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
          <button
            type="button"
            className="font-semibold text-slate-900 underline underline-offset-2 hover:text-slate-950"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setFirebaseError("");
            }}
          >
            {isSignUp ? "Sign In" : "Sign Up"}
          </button>
        </p>
      </div>
    </div>
  );
}
