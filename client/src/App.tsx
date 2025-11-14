import { useEffect, useState } from "react";
import "./App.css";
import { FlowTimer } from "./Components/FlowTimer";

<FlowTimer />

function App() {
  const [apiMessage, setApiMessage] = useState("Checking connection...");

  useEffect(() => {
    fetch("http://localhost:3000/")
      .then((res) => res.text())
      .then((text) => setApiMessage(text))
      .catch(() => setApiMessage("Could not reach FlowSpace API 😢"));
  }, []);

  return (
    <div style={{ minHeight: "100vh", padding: "2rem" }}>
      <h1>FlowSpace</h1>
      <p>
        Backend status: <strong>{apiMessage}</strong>
      </p>

      <hr style={{ margin: "1.5rem 0" }} />

      <FlowTimer />
    </div>
  );
}

export default App;
