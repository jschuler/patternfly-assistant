import * as React from "react";
import { useLiveRunner, CodeEditor } from "react-live-runner";
import * as reactCoreModule from "@patternfly/react-core";
import * as reactIconsModule from "@patternfly/react-icons";
import * as reactTableModule from "@patternfly/react-table";
import * as reactChartsModule from "@patternfly/react-charts";
import sdk from "@stackblitz/sdk";
import { Toast } from "./Toast";

export const reactCoreImports = `${Object.keys(reactCoreModule)}`;
export const reactChartsImports = `${Object.keys(reactChartsModule)}`;
export const reactTableImports = `${Object.keys(reactTableModule)}`;

const Button = reactCoreModule.Button;
const Modal = reactCoreModule.Modal;
const ExpandIcon = reactIconsModule.ExpandIcon;
const CopyIcon = reactIconsModule.CopyIcon;
const CodeIcon = reactIconsModule.CodeIcon;

const scope = {
  // ...reactCoreModule,
  // ...reactIconsModule,
  // ...reactTableModule,
  // ...reactChartsModule,
  import: {
    react: React,
    "@patternfly/react-core": reactCoreModule,
    "@patternfly/react-icons": reactIconsModule,
    "@patternfly/react-table": reactTableModule,
    "@patternfly/react-charts": reactChartsModule,
  },
};

export const Preview = ({ code: initialCode }) => {
  const transformCode = (code) => {
    return code;
  };
  const { element, error, code, onChange } = useLiveRunner({
    initialCode,
    scope,
    transformCode,
  });
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [modalToastOpen, setModalToastOpen] = React.useState(false);
  const [copyToastOpen, setCopyToastOpen] = React.useState(false);

  const onCodeIconClick = () => {
    sdk.openProject(
      {
        title: "PatternFly playground",
        description: "Sent here from PatternFly assistant",
        template: "create-react-app",
        files: {
          "index.html": `<div id="root"></div>`,
          "index.js": `import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import '@patternfly/react-core/dist/styles/base.css';
          
const rootElement = document.getElementById('root');
const root = createRoot(rootElement);
          
root.render(
  <StrictMode>
    <App />
  </StrictMode>
);`,
          "App.js": `${code}`,
        },
        dependencies: {
          "@patternfly/react-core": "^5.2.0",
          "@patternfly/react-icons": "^5.2.0",
          "@patternfly/react-table": "^5.2.0",
          "@patternfly/react-charts": "^7.2.0",
        },
        settings: {
          compile: {
            trigger: "auto",
            clearConsole: false,
          },
        },
      },
      {
        newWindow: true,
        openFile: ["App.js"],
      }
    );
  };

  return !code ? null : (
    <div className="code-wrapper">
      <div className="toolbar-section">
        <div className="code-toolbar">
          <Button
            variant="plain"
            aria-label="Expand"
            onClick={() => {
              navigator.clipboard.writeText(code);
              setCopyToastOpen(true);
            }}
          >
            <CopyIcon />
          </Button>
          <Button
            variant="plain"
            aria-label="Open in stackblitz"
            onClick={() => onCodeIconClick()}
          >
            <CodeIcon />
          </Button>
          <Toast
            message="Copied code to clipboard"
            open={copyToastOpen}
            setOpen={setCopyToastOpen}
          />
        </div>
        {!error && (
          <div className="preview-toolbar">
            <Button
              variant="plain"
              aria-label="Expand"
              onClick={() => {
                setIsModalOpen(true);
                setModalToastOpen(true);
              }}
            >
              <ExpandIcon />
            </Button>
          </div>
        )}
      </div>
      <div className="code-section">
        <CodeEditor value={code} onChange={onChange} className="code-editor" />
        {!error ? (
          <>
            {isModalOpen ? (
              <Modal
                variant="large"
                showClose={false}
                width="100%"
                className="code-preview-modal"
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                aria-label="Code preview"
                disableFocusTrap
              >
                <div className="code-preview">{element}</div>
              </Modal>
            ) : (
              <div className="code-preview">{element}</div>
            )}
            <Toast
              message="Press ESC to close the modal"
              open={modalToastOpen}
              setOpen={setModalToastOpen}
            />
          </>
        ) : (
          <div className="code-error">
            <pre style={{ whiteSpace: "pre-wrap" }}>{error}</pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default Preview;
