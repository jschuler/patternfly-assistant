import * as React from "react";
import { useLiveRunner, CodeEditor } from "react-live-runner";
import * as reactCoreModule from "@patternfly/react-core";
import * as reactIconsModule from "@patternfly/react-icons";
import { Toast } from "./Toast";

const Button = reactCoreModule.Button;
const Modal = reactCoreModule.Modal;
const ExpandIcon = reactIconsModule.ExpandIcon;
const CopyIcon = reactIconsModule.CopyIcon;

const scope = {
  ...reactCoreModule,
  ...reactIconsModule,
  import: {
    react: React,
    "@patternfly/react-core": reactCoreModule,
    "@patternfly/react-icons": reactIconsModule,
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
