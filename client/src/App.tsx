import { useEffect, useState } from "react";
import "./App.css";
import { HomePage } from "./Components/Homepage";

type Theme = "light" | "dark";

function getInitialTheme(): Theme {
  if (typeof window === "undefined") return "light";
  const stored = window.localStorage.getItem("flowspace-theme") as Theme | null;
  if (stored === "light" || stored === "dark") return stored;

  const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)").matches;
  return prefersDark ? "dark" : "light";
}

function App() {
  const [apiMessage, setApiMessage] = useState("Checking connection...");
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  // 💡 THIS is the useEffect you were asking about:
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme); // "light" | "dark"
    window.localStorage.setItem("flowspace-theme", theme);
  }, [theme]);

  // existing API status effect
  useEffect(() => {
    fetch("http://localhost:3000/")
      .then((res) => res.text())
      .then((text) => setApiMessage(text))
      .catch(() => setApiMessage("Could not reach FlowSpace API 😢"));
  }, []);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  return (
    <div className="app-shell">
      <HomePage
        apiMessage={apiMessage}
        theme={theme}
        onToggleTheme={toggleTheme}
      />
    </div>
  );
}

export default App;
