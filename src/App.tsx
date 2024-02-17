// src/App.tsx
import React from "react";
import { ErrorBoundary } from "react-error-boundary";
import Chat from "./components/Chat";
import "@patternfly/react-core/dist/styles/base.css";
import "./App.css";

const App: React.FC = () => {
  return (
    <ErrorBoundary fallback={<div>Something went wrong</div>}>
      <div className="App">
        <header className="App-header">
          {/* align center */}
          <h1 style={{ textAlign: "center" }}><strong>PatternFly assistant</strong></h1>
        </header>
        <main>
          <Chat />
        </main>
      </div>
    </ErrorBoundary>
  );
};

export default App;
