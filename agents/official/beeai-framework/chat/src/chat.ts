import { z, ZodRawShape } from "zod";
import { Metadata } from "@i-am-bee/beeai-sdk/schemas/metadata";
import { Message } from "beeai-framework/backend/message";
import { API_BASE, API_KEY, MODEL } from "./config.js";
import {
  messageInputSchema,
  MessageOutput,
  messageOutputSchema,
} from "@i-am-bee/beeai-sdk/schemas/message";
import { UnconstrainedMemory } from "beeai-framework/memory/unconstrainedMemory";
import { ReActAgent } from "beeai-framework/agents/react/agent";
import { DuckDuckGoSearchTool } from "beeai-framework/tools/search/duckDuckGoSearch";
import { WikipediaTool } from "beeai-framework/tools/search/wikipedia";
import { OpenMeteoTool } from "beeai-framework/tools/weather/openMeteo";
import { AcpServer } from "@i-am-bee/acp-sdk/server/acp";
import { OpenAIChatModel } from "beeai-framework/adapters/openai/backend/chat";

const SupportedTool = {
  Search: "search",
  Wikipedia: "wikipedia",
  Weather: "weather",
} as const;
export type SupportedTools = (typeof SupportedTool)[keyof typeof SupportedTool];

const agentConfigSchema = z
  .object({ tools: z.array(z.nativeEnum(SupportedTool)).optional() })
  .passthrough()
  .optional();

const inputSchema = messageInputSchema.extend({ config: agentConfigSchema });
type Input = z.infer<typeof inputSchema>;
const outputSchema = messageOutputSchema;
type Output = z.infer<typeof outputSchema>;

function createTool(tool: SupportedTools) {
  switch (tool) {
    case SupportedTool.Search:
      return new DuckDuckGoSearchTool();
    case SupportedTool.Wikipedia:
      return new WikipediaTool();
    case SupportedTool.Weather:
      return new OpenMeteoTool();
  }
}

const run =
  (server: AcpServer) =>
  async (
    {
      params: { input, _meta },
    }: {
      params: {
        input: Input;
        _meta?: { progressToken?: string | number };
      };
    },
    { signal }: { signal?: AbortSignal }
  ) => {
    const { messages, config } = input;
    const memory = new UnconstrainedMemory();
    await memory.addMany(
      messages.map(({ role, content }) => Message.of({ role, text: content }))
    );
    const agent = new ReActAgent({
      llm: new OpenAIChatModel(
        MODEL,
        {},
        { baseURL: API_BASE, apiKey: API_KEY, compatibility: "compatible" }
      ),
      memory: memory ?? new UnconstrainedMemory(),
      tools: config?.tools?.map(createTool) ?? [],
    });
    let lastKey = "";
    let lastValue = "";
    const output = await agent
      .run({ prompt: null }, { signal })
      .observe((emitter) => {
        emitter.on("partialUpdate", async ({ update, meta, data }) => {
          if (_meta?.progressToken) {
            if (update.key === "final_answer") {
              await server.server.sendAgentRunProgress({
                progressToken: _meta.progressToken,
                delta: {
                  messages: [{ role: "assistant", content: update.value }],
                } as MessageOutput,
              });
            } else if (lastKey !== update.key) {
              lastKey &&
                (await server.server.sendAgentRunProgress({
                  progressToken: _meta.progressToken,
                  delta: {
                    logs: [
                      {
                        level: "info",
                        message: JSON.stringify(
                          { key: lastKey, value: lastValue },
                          null,
                          2
                        ),
                      },
                    ],
                  } as MessageOutput,
                }));
              lastKey = update.key;
              lastValue = "";
            }
            lastValue += update.value;
          }
        });
      });
    return {
      messages: [{ role: "assistant", content: output.result.text }],
    } as MessageOutput;
  };

const registerTools = async (server: AcpServer) => {
  for (const toolName of Object.values(SupportedTool)) {
    const tool = createTool(toolName);
    server.tool(
      toolName,
      tool.description,
      tool.inputSchema().shape as ZodRawShape,
      async (args, { signal }) => {
        const result = await createTool(toolName).run(args as any, { signal });
        return { content: [{ type: "text", text: result.toString() }] };
      }
    );
  }
};

const agentName = "chat";

const exampleInputText = "What is the weather like in Paris?";

const exampleInput: Input = {
  messages: [{ role: "user", content: exampleInputText }],
  config: {
    tools: ["weather"],
  },
};

const exampleOutput =
  "The current temperature in Paris is 12°C with partly cloudy skies.";
const processingSteps = [
  "The agent receives the user message and detects the weather query",
  "It invokes the OpenMeteoTool to fetch real-time weather data",
  "The response is generated and sent back to the user",
];

export const agent = {
  name: agentName,
  description:
    "The agent is an AI-powered conversational system with memory, supporting real-time search, Wikipedia lookups, and weather updates through integrated tools.",
  inputSchema,
  outputSchema,
  run,
  metadata: {
    framework: "BeeAI",
    license: "Apache 2.0",
    languages: ["TypeScript"],
    githubUrl:
      "https://github.com/i-am-bee/beeai/blob/main/agents/official/beeai-framework/src/chat",
    fullDescription: `The agent is an AI-powered conversational system designed to process user messages, maintain context, and generate intelligent responses. Built on the **BeeAI framework**, it leverages memory and external tools to enhance interactions. It supports real-time web search, Wikipedia lookups, and weather updates, making it a versatile assistant for various applications.  

## How It Works  
The agent processes incoming messages and maintains a conversation history using an **unconstrained memory module**. It utilizes a language model (\`CHAT_MODEL\`) to generate responses and can optionally integrate external tools for additional functionality.  

It supports:  
- **Web Search (DuckDuckGo)** – Retrieves real-time search results.  
- **Wikipedia Search** – Fetches summaries from Wikipedia.  
- **Weather Information (OpenMeteo)** – Provides real-time weather updates.  

The agent also includes an **event-based streaming mechanism**, allowing it to send partial responses to clients as they are generated.  

## Input Parameters  
The agent accepts structured input consisting of:  

- **messages** (array) – A list of user and assistant messages to maintain conversation context.  
- **config** (optional object) – Allows enabling external tools.  
  - **tools** (array of strings) – Specifies which tools to use (e.g., \`"search"\`, \`"wikipedia"\`, \`"weather"\`).  

## Output Structure  
The agent returns an object with:  

- **messages** (array) – A list of response messages from the assistant.  
  - **role** (string) – Always \`"assistant"\` for responses.  
  - **content** (string) – The generated response text.  

## Key Features  
- **Conversational AI** – Handles multi-turn conversations with memory.  
- **Tool Integration** – Supports real-time search, Wikipedia lookups, and weather updates.  
- **Event-Based Streaming** – Can send partial updates to clients as responses are generated.  
- **Customizable Configuration** – Users can enable or disable specific tools for enhanced responses.  

## Use Cases  
- **Chatbots** – Can be used in AI-powered chat applications with memory.  
- **Research Assistance** – Retrieves relevant information from web search and Wikipedia.  
- **Weather Inquiries** – Provides real-time weather updates based on location.  
- **AI Agents with Long-Term Memory** – Maintains context across conversations for improved interactions.  
`,

    avgRunTimeSeconds: 3,
    avgRunTokens: 89,
    examples: {
      cli: [
        {
          command: `beeai run ${agentName} "What is the capital of France?"`,
          name: "No tools",
          description: "Run agent with no tools.",
          output: exampleOutput,
          processingSteps,
        },
        {
          command: `beeai run ${agentName} '${JSON.stringify(exampleInput, null, 2)}'`,
          name: "With tools",
          description: "Run agent with tools.",
          output: exampleOutput,
          processingSteps,
        },
      ],
    },
    ui: { type: "chat", userGreeting: "How can I help you?" },
  } satisfies Metadata,
  registerTools,
};
