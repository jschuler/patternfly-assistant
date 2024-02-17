// src/components/Chat.tsx
import React, { useEffect, useState } from "react";
import {
  TextField,
  Container,
  Grid,
  LinearProgress,
  CircularProgress,
  InputAdornment,
  IconButton,
} from "@mui/material";
import Message from "./Message";
import OpenAI from "openai";
import { MessageDto } from "../models/MessageDto";
import SendIcon from "@mui/icons-material/Send";

// eslint-disable-next-line import/no-webpack-loader-syntax
// const example = require("!!raw-loader!../examples/Page/PageCenteredSection.txt");

const Chat = () => {
  const [isWaiting, setIsWaiting] = useState<boolean>(false);
  const [messages, setMessages] = useState<Array<MessageDto>>(
    new Array<MessageDto>()
  );
  const [input, setInput] = useState<string>("");
  const [assistant, setAssistant] = useState<any>(null);
  const [thread, setThread] = useState<any>(null);
  const [openai, setOpenai] = useState<any>(null);

  useEffect(() => {
    initChatBot();
  }, []);

  useEffect(() => {
    setMessages([
      {
        content:
          "Hi, I'm your PatternFly assistant. Let me write some code for you!",
        isUser: false,
      },
    ]);
  }, [assistant]);

  const initChatBot = async () => {
    const openai = new OpenAI({
      apiKey: process.env.REACT_APP_OPENAI_API_KEY,
      dangerouslyAllowBrowser: true,
    });

    const list = await openai.files.list();
    for await (const file of list) {
      console.log(file);
    }

    // Create an assistant
    const assistant = await openai.beta.assistants.create({
      name: "PatternFly developer",
      instructions: `
You are a UI developer writing PatternFly react code.
Always wrap code samples with backticks and set the language as jsx.
Imports you can use are 'react', '@patternfly/react-core' and '@patternfly/react-icons'.
Try to return only a single code sample in your output.
Do not add any relative import paths. For styling, use inline styles only.
There should be no relative import paths.
`,
      tools: [{ type: "code_interpreter" }],
      model: "gpt-4-1106-preview",
      file_ids: [
        "file-NHMCUdwkI9Banf0i2vjyC2YD", // WizardDemo.tsx
        "file-o0RURRDaXsX6K16rVvrOagzJ", // PageManagedSidebarClosedDemo.tsx
        "file-ZyEg3x66wgzjWL5d95IusLoL", // PageCenteredSection.ts
      ],
    });

    // Create a thread
    const thread = await openai.beta.threads.create();

    setOpenai(openai);
    setAssistant(assistant);
    setThread(thread);
  };

  const createNewMessage = (content: string, isUser: boolean) => {
    const newMessage = new MessageDto(isUser, content);
    return newMessage;
  };

  const handleSendMessage = async () => {
    messages.push(createNewMessage(input, true));
    setMessages([...messages]);
    setInput("");

    // Send a message to the thread
    await openai.beta.threads.messages.create(thread.id, {
      role: "user",
      content: input,
    });

    // Run the assistant
    const run = await openai.beta.threads.runs.create(thread.id, {
      assistant_id: assistant.id,
    });

    // Create a response
    let response = await openai.beta.threads.runs.retrieve(thread.id, run.id);

    /*
    const finishReasons = ["requires_action", "cancelling", "cancelled", "failed", "completed", "expired"]
    while(!finishReasons.includes(run.status)){
      run = await openai.beta.threads.runs.retrieve(run.thread_id, run.id);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    */

    // Wait for the response to be ready
    while (response.status === "in_progress" || response.status === "queued") {
      console.log("waiting...");
      setIsWaiting(true);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      response = await openai.beta.threads.runs.retrieve(thread.id, run.id);
    }

    setIsWaiting(false);

    // Get the messages for the thread
    const messageList = await openai.beta.threads.messages.list(thread.id);

    // Find the last message for the current run
    const lastMessage = messageList.data
      .filter(
        (message: any) =>
          message.run_id === run.id && message.role === "assistant"
      )
      .pop();

    // Print the last message coming from the assistant
    if (lastMessage) {
      const response = lastMessage.content[0]["text"].value;
      console.log(response);
      setMessages([
        ...messages,
        createNewMessage(lastMessage.content[0]["text"].value, false),
      ]);
    }
  };

  // detect enter key and send message
  const handleKeyPress = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  return (
    <Container>
      <Grid container direction="column" spacing={2} paddingBottom={2}>
        {messages.map((message, index) => (
          <Grid
            item
            alignSelf={message.isUser ? "flex-end" : "flex-start"}
            key={index}
          >
            <Message key={index} message={message} />
          </Grid>
        ))}
      </Grid>
      <Grid
        container
        direction="row"
        paddingBottom={5}
        justifyContent={"space-between"}
      >
        <Grid item sm={12} xs={12}>
          <TextField
            label="Type your message"
            variant="outlined"
            disabled={isWaiting}
            fullWidth
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            size="small"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    edge="end"
                    color="primary"
                    onClick={handleSendMessage}
                    disabled={isWaiting}
                  >
                    {isWaiting && <CircularProgress color="inherit" />}
                    {!isWaiting && <SendIcon fontSize="large" />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          {isWaiting && <LinearProgress color="inherit" />}
        </Grid>
      </Grid>
    </Container>
  );
};

export default Chat;
