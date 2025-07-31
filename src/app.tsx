import { Router } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";
import { Suspense } from "solid-js";
import "./app.css";
import Header from "./components/ui/header";
import Main from "./components/layout/main";

export default function App() {
  return (
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
  );
}
