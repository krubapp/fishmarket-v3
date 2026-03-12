"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { onAuthStateChanged, type User } from "firebase/auth";

import { auth } from "@/lib/firebase";
import { getUserProfile, type UserProfile } from "@/lib/firestore";

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  profile: UserProfile | null;
  profileLoading: boolean;
  refreshProfile: () => Promise<void>;
};

const noop = async () => {};

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  profile: null,
  profileLoading: true,
  refreshProfile: noop,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const userRef = useRef<User | null>(null);

  const fetchProfile = useCallback(async (uid: string) => {
    setProfileLoading(true);
    try {
      const p = await getUserProfile(uid);
      if (userRef.current?.uid === uid) {
        setProfile(p);
      }
    } catch {
      if (userRef.current?.uid === uid) {
        setProfile(null);
      }
    } finally {
      if (userRef.current?.uid === uid) {
        setProfileLoading(false);
      }
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    const uid = userRef.current?.uid;
    if (uid) await fetchProfile(uid);
  }, [fetchProfile]);

  useEffect(
    () =>
      onAuthStateChanged(auth, (u) => {
        userRef.current = u;
        setUser(u);
        setLoading(false);

        if (u) {
          fetchProfile(u.uid);
        } else {
          setProfile(null);
          setProfileLoading(false);
        }
      }),
    [fetchProfile],
  );

  return (
    <AuthContext.Provider
      value={{ user, loading, profile, profileLoading, refreshProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  return useContext(AuthContext);
}
