import type { HibanaClient } from "@hibana/client";
import type { profileType } from "@hibana/schema";
import {
  createContext,
  createEffect,
  createSignal,
  type ParentComponent,
  useContext,
} from "solid-js";
import { createClient, getCurrentUser } from "~/lib/client";

interface AuthContextType {
  client: () => HibanaClient;
  user: () => profileType | null;
  login: () => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>();

export const AuthProvider: ParentComponent = (props) => {
  const [client, setClient] = createSignal<HibanaClient>(
    createClient("http://localhost:8000"),
  );
  const [user, setUser] = createSignal<profileType | null>(null);

  const login = async () => {
    try {
      const userProfile = await getCurrentUser();
      setUser(userProfile);
      if (userProfile) {
        const hibanaClient = createClient(userProfile.repository);
        setClient(hibanaClient);
      }
    } catch (error) {
      console.error("Login failed:", error);
      setUser(null);
    }
  };

  const logout = () => {
    setUser(null);
  };

  createEffect(() => {
    login();
  });

  const value: AuthContextType = {
    client,
    user,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>{props.children}</AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
