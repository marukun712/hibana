import { Router } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";
import { Suspense } from "solid-js";
import "./app.css";
import Main from "./components/layout/main";
import Header from "./components/ui/header";
import { AuthProvider } from "./contexts/authContext";

export default function App() {
	return (
		<AuthProvider>
			<Router
				root={(props) => (
					<div data-theme="hibana">
						<Header />
						<Suspense>
							<Main>{props.children}</Main>
						</Suspense>
					</div>
				)}
			>
				<FileRoutes />
			</Router>
		</AuthProvider>
	);
}
