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
// import {
//   reactCoreImports,
//   reactChartsImports,
//   reactTableImports,
// } from "./Preview";

/*
    - The following imports only exist in '@patternfly/react-table': [${reactTableImports}]
    - The following imports only exist in '@patternfly/react-charts': [${reactChartsImports}]
    - The following imports only exist in '@patternfly/react-core': [${reactCoreImports}]
    */

const files = [
  "file-LvjCLQQyGVGxFceXH8f1DjYa", // combined-examples.md
  "file-67jZeUN2UdZDvzum7mnC9YrW", // patternfly-exports.md
];

const Chat = () => {
  const [isWaiting, setIsWaiting] = useState<boolean>(false);
  const [initialized, setInitialized] = useState<boolean>(false);
  const [messages, setMessages] = useState<Array<MessageDto>>(
    new Array<MessageDto>()
  );
  const [input, setInput] = useState<string>("Initializing assistant...");
  const [assistant, setAssistant] = useState<any>(null);
  const [thread, setThread] = useState<any>(null);
  const [openai, setOpenai] = useState<any>(null);

  const content = `Hi, I'm your PatternFly assistant. Let me write some code for you!
Some prompt examples:
- Which components exist in PatternFly?
- Create an alert
- Create a donut chart
- Create a page with a masthead and some card items in it`;

  const instructions = `You are a UI developer writing PatternFly react code. Observe all the following instructions:
- Always wrap code samples with backticks and set the language as jsx.
- You can only import from 'react', '@patternfly/react-core', '@patternfly/react-icons', '@patternfly/react-table', and '@patternfly/react-charts'.
- Try to return only a single code sample in your output.
- For styling, use inline styles only.
- Your knowledge of PatternFly should only come from the code samples within the retrieved files.
- When asked about page headers or mastheads, use the Masthead component imports.
- As an image placeholder or PatternFly logo, you can use this URL: "https://www.patternfly.org/assets/Favicon-Light-32x32.png".
- When importing from "@patternfly/react-icons", import from the root barrel file only. Example:
Bad: import BarsIcon from '@patternfly/react-icons/dist/esm/icons/bars-icon';
Good: import { BarsIcon } from '@patternfly/react-icons';
- When using the PageSideBar component, it should look similar to:
<PageSidebar isSidebarOpen={isSidebarOpen} id="vertical-sidebar"><PageSidebarBody>NAV HERE</PageSidebarBody></PageSidebar>
- A table should look similar to:
<Table>
  <Thead>
    <Tr>
      <Th>Header</Th>
    </Tr>
  </Thead>
  <Tbody>
    <Td>Cell</Td>
  </Tbody>
</Table>
- In your response, don't make source references (for example 【1†source】)'
- Do not import '@patternfly/react-core/dist/styles/base.css'.
- At the end of the code sample, add a default export.
- All components and references should exist within the same code sample. The code sample should not reference previous examples.
- Do not make mention of the retrieved / shared document.
- Icon imports come from '@patternfly/react-icons'.
- Do not mix imports with the wrong packages! For example, Table, Thead, Tbody, Tr, Th, Td are imported from '@patternfly/react-table', NOT '@patternfly/react-core'
- Do not use imports that are not found in the retrieved files.
`;

  useEffect(() => {
    initChatBot();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setMessages([
      {
        content,
        isUser: false,
      },
    ]);
  }, [assistant, content]);

  const initChatBot = async () => {
    const openai = new OpenAI({
      apiKey: process.env.REACT_APP_OPENAI_API_KEY,
      dangerouslyAllowBrowser: true,
    });

    // const list = await openai.files.list();
    // for await (const file of list) {
    //   console.log(file);
    // }

    // Create an assistant
    const assistant = await openai.beta.assistants.create({
      name: "PatternFly developer",
      instructions,
      tools: [{ type: "retrieval" }],
      model: "gpt-4-turbo-preview",
      file_ids: files,
    });

    // Create a thread
    const thread = await openai.beta.threads.create();

    setOpenai(openai);
    setAssistant(assistant);
    setThread(thread);
    setInitialized(true);
    setInput("");
  };

  const createNewMessage = (content: string, isUser: boolean) => {
    const newMessage = new MessageDto(isUser, content);
    return newMessage;
  };

  const handleSendMessage = async () => {
    messages.push(createNewMessage(input, true));
    setMessages([...messages]);
    setIsWaiting(true);
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

    const finishReasons = [
      "requires_action",
      "cancelling",
      "cancelled",
      "failed",
      "completed",
      "expired",
    ];
    // Wait for the response to be ready
    while (!finishReasons.includes(response.status)) {
      console.log("waiting...");
      await new Promise((resolve) => setTimeout(resolve, 2000));
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
      setMessages([...messages, createNewMessage(response, false)]);
    }
  };

  // detect enter key and send message
  const handleKeyPress = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  const notReady = isWaiting || !initialized;

  return (
    <Container maxWidth="xl">
      <Grid container direction="column" spacing={2} paddingBottom={2}>
        {messages.map((message, index) => (
          <Grid
            item
            sm={12}
            xs={12}
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
            label={
              !isWaiting
                ? "Type your message"
                : "Turtles are on their way to get an answer... this can take some time..."
            }
            variant="outlined"
            disabled={notReady}
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
                    onClick={() => handleSendMessage()}
                    disabled={notReady}
                  >
                    {notReady && <CircularProgress color="inherit" />}
                    {!notReady && <SendIcon fontSize="large" />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          {notReady && <LinearProgress color="inherit" />}
        </Grid>
      </Grid>
    </Container>
  );
};

export default Chat;
