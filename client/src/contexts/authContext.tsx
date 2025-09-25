import type { HibanaClient } from "@hibana/client";
import type { profileType } from "@hibana/schema";
import {
	createContext,
	createEffect,
	createSignal,
	type ParentComponent,
	useContext,
} from "solid-js";

interface AuthContextType {
	client: () => HibanaClient | null;
	user: () => profileType | null;
	isLoading: () => boolean;
	login: () => Promise<void>;
	logout: () => void;
}

const AuthContext = createContext<AuthContextType>();

export const AuthProvider: ParentComponent = (props) => {
	const [client, setClient] = createSignal<HibanaClient | null>(null);
	const [user, setUser] = createSignal<profileType | null>(null);
	const [isLoading, setIsLoading] = createSignal(true);

	const login = async () => {
		try {
			setIsLoading(true);
			const { getCurrentUser, createClient } = await import("~/lib/client");
			const userProfile = await getCurrentUser();
			const hibanaClient = createClient(userProfile.repository);
			setUser(userProfile);
			setClient(hibanaClient);
		} catch (error) {
			console.error("Login failed:", error);
			setUser(null);
			setClient(null);
		} finally {
			setIsLoading(false);
		}
	};

	const logout = () => {
		setUser(null);
		setClient(null);
	};

	createEffect(() => {
		login();
	});

	const value: AuthContextType = {
		client,
		user,
		isLoading,
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
