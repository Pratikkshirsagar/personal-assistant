import { tool } from "langchain";
import * as z from "zod";

export const createEventTool = tool(
  () => {
    // google calander logic goes
    return "The meeting has being created";
  },
  {
    name: "create-event",
    description: "Call to create calender events",
    schema: z.object({}),
  },
);

export const getEventTool = tool(
  () => {
    // google calender logic goes
    return JSON.stringify({
      title: "Meeting with Akshay and Akash",
      date: "25 Nov 2025",
      time: "2PM IST",
      location: "Gmeet",
    });
  },
  {
    name: "get-events",
    description: "Call to get the calender events",
    schema: z.object({}),
  },
);
