import { ChatGroq } from "@langchain/groq";
import { createEventTool, getEventTool } from "./tools";
import {
  END,
  MemorySaver,
  MessagesAnnotation,
  StateGraph,
} from "@langchain/langgraph";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import type { AIMessage } from "langchain";

const tools = [createEventTool, getEventTool];

const model = new ChatGroq({
  model: "openai/gpt-oss-120b",
  temperature: 0,
}).bindTools(tools);

/**
 * Assistant node
 */
async function callModel(state: typeof MessagesAnnotation.State) {
  const response = await model.invoke(state.messages);
  return { messages: [response] };
}

/*
 * Tool Node
 */
const toolNode = new ToolNode(tools);

/*
  Conditional Node
*/

async function shouldContinue(state: typeof MessagesAnnotation.State) {
  const lastMessage = state.messages[state.messages.length - 1] as AIMessage;

  if (lastMessage.tool_calls?.length) {
    return "tools";
  }

  return "__end__";
}

/**
 * Build the Graph
 */

const graph = new StateGraph(MessagesAnnotation)
  .addNode("assistant", callModel)
  .addNode("tools", toolNode)
  .addEdge("__start__", "assistant")
  .addEdge("tools", "assistant")
  .addConditionalEdges("assistant", shouldContinue, {
    __end__: END,
    tools: "tools",
  });

/*
  Memory
*/
const checkpointer = new MemorySaver();

/**
 * Compile the graph
 */

const app = graph.compile({
  checkpointer,
});

async function main() {
  const result = await app.invoke(
    {
      messages: [
        {
          role: "system",
          content: `You are a personal assistant. Use provided tools to get the information if you don't have it. Current date and time: ${new Date().toUTCString()}`,
        },
        {
          role: "user",
          content: "Do I have any meeting today",
        },
      ],
    },
    { configurable: { thread_id: 1 } },
  );

  console.log(result?.messages[result.messages.length - 1]?.content);
}

main();
