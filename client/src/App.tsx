import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [apiMessage, setApiMessage] = useState("Checking connection...");

  useEffect(() => {
    // call your backend on http://localhost:3000/
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

      <p style={{ marginTop: "1.5rem" }}>
        This is the starter shell. Next we’ll add:
      </p>
      <ul>
        <li>FlowTimer (lock-in levels)</li>
        <li>FlowPractice (quiz generator)</li>
        <li>FlowCare (burnout-safe check-in)</li>
        <li>FlowPlan (time & priority coach)</li>
      </ul>
    </div>
  );
}

export default App;
