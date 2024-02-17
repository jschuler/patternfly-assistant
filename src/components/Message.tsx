// src/components/Message.tsx
import React, { Fragment } from "react";
import { MessageDto } from "../models/MessageDto";
import { Preview } from "./Preview";

interface MessageProps {
  message: MessageDto;
}

const Message: React.FC<MessageProps> = ({ message }) => {
  const regex = /```jsx\n([\s\S]*?)\n```/g;
  let match;
  let lastIndex = 0;
  const codeBlocks = [];
  const nonCodeBlocks = [];
  const renderChildren = [];
  // Iterate over all matches of code blocks
  while ((match = regex.exec(message.content)) !== null) {
    // Get the content before the current code block
    const beforeContent = message.content.substring(lastIndex, match.index);
    nonCodeBlocks.push(beforeContent.trim());
    renderChildren.push(beforeContent.trim());
    lastIndex = regex.lastIndex;

    codeBlocks.push(match[1]);
    renderChildren.push(<Preview code={match[1]} />);
  }
  // Get the content after the last code block
  const afterContent = message.content.substring(lastIndex);
  nonCodeBlocks.push(afterContent.trim());
  renderChildren.push(afterContent.trim());
  return (
    <div
      style={{ textAlign: message.isUser ? "right" : "left", margin: "8px" }}
    >
      <div
        style={{
          color: message.isUser ? "#ffffff" : "#000000",
          backgroundColor: message.isUser ? "#1186fe" : "#eaeaea",
          padding: "15px",
          borderRadius: "8px",
        }}
      >
        {renderChildren.map((child, index) => {
          if (typeof child === "string") {
            return child.split("\n").map((text, index) => (
              <Fragment key={index}>
                {text}
                <br />
              </Fragment>
            ));
          }
          return <Fragment key={index}>{child}</Fragment>;
        })}
      </div>
    </div>
  );
};

export default Message;
