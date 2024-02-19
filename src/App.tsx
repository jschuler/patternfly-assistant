// src/App.tsx
import React from "react";
import { ErrorBoundary } from "react-error-boundary";
import { TextContent, Text, Button } from "@patternfly/react-core";
import { GithubIcon } from "@patternfly/react-icons";
import Chat from "./components/Chat";
import "@patternfly/react-core/dist/styles/base.css";
import "./App.css";

const App: React.FC = () => {
  return (
    <ErrorBoundary fallback={<div>Something went wrong</div>}>
      <div className="App">
        <header className="App-header">
          {/* align center */}
          <TextContent style={{ textAlign: "center" }}>
            <Text component="h1">PatternFly assistant</Text>
            <Button
              variant="plain"
              component="a"
              href="https://github.com/jschuler/patternfly-assistant"
              target="_blank"
              rel="noopener noreferrer"
            >
              <GithubIcon />
            </Button>
          </TextContent>
        </header>
        <main>
          <Chat />
        </main>
      </div>
    </ErrorBoundary>
  );
};

export default App;
