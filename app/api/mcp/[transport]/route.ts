// "google-a2a": {
//   "command": "npx",
//   "args": [
//       "mcp-remote",
//       "https://google-a2a.vercel.app/api/mcp/sse",
//       "--header",
//       "Authorization: Bearer sbp_8301c6ef20e5f0bda2b6c12adfa29a4b941ad3dd"
//   ]
// },
// const withAuth = (handler: (request: Request) => Promise<Response>) => {
//   return async (request: Request): Promise<Response> => {
//     const authHeader = request.headers.get("authorization");
//     const token = authHeader?.replace("Bearer ", "");

//     if (!token || token !== process.env.BEAER_TOKEN) {
//       return new Response("Unauthorized", { status: 401 });
//     }

//     return handler(request);
//   };
// };

// const handler = withAuth(() => {
//   // const mcpHandler = createMcpHandler(
//   //   async (server) => {
//   //     server.tool(
//   //       "search_documents",
//   //       "Search the knowledge base for relevant information",
//   //       {
//   //         query: z.string(),
//   //       },
//   //       async ({ query }) => {
//   //         try {
//   //           const result = await searchForAgent(query);

//   //           return {
//   //             content: [
//   //               {
//   //                 type: "text",
//   //                 text: `Result: ${JSON.stringify(result.results)}`,
//   //               },
//   //             ],
//   //           };
//   //         } catch (error) {
//   //           console.error("Error calling n8n function:", error);
//   //           throw error;
//   //         }
//   //       }
//   //     );
//   //     server.tool(
//   //       "roll_dice",
//   //       "Rolls an N-sided die",
//   //       {
//   //         sides: z.number().int().min(2),
//   //       },
//   //       async ({ sides }) => {
//   //         const value = 1 + Math.floor(Math.random() * sides);
//   //         return {
//   //           content: [{ type: "text", text: `🎲 You rolled a ${value}!` }],
//   //         };
//   //       }
//   //     );
//   //   },
//   //   {
//   //     capabilities: {
//   //       tools: {
//   //         search_documents: {
//   //           description: "Retrieves information from knowledge base for docs",
//   //         },
//   //         roll_dice: {
//   //           description: "Roll a dice",
//   //         },
//   //       },
//   //     },
//   //   },
//   //   {
//   //     basePath: "/api/mcp",
//   //     maxDuration: 60,
//   //     redisUrl: process.env.REDIS_URL,
//   //   }
//   // );
//   return new Response("Endpoint disabled", { status: 404 });
//   //return mcpHandler(request);
// });

// export { handler as GET, handler as POST, handler as DELETE };

export async function GET() {
  return new Response("Endpoint disabled", { status: 404 });
}
