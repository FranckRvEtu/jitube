import type { Request, Response } from 'express';
import type { Plugin, ViteDevServer } from 'vite';
import type { IncomingMessage, ServerResponse } from 'http';
import MistralAI from '@mistralai/mistralai';

// System messages for different phases (unchanged from original)
const SYSTEM_MESSAGES = {
  default: `Tu es un assistant pédagogique spécialisé en mathématiques, dédié aux enfants autistes de 8 ans. 
  Explique les concepts mathématiques de manière très simple, en utilisant des descriptions imagées et des exemples concrets issus de la vie quotidienne. 
  Décompose chaque problème en petites étapes numérotées, faciles à comprendre. Évite les métaphores complexes. Sois patient, encourageant et rassurant. 
  Après chaque explication, pose une question simple pour vérifier la compréhension de l'enfant. Structure tes réponses de manière claire et prévisible.

[IMPORTANT] **Formate tes réponses en utilisant le format suivant :**

\`\`\`json
{
    "quickrep": "réponse brève (exemple : '4 * 9 = 36')",
    "explication": "explication détaillée du raisonnement, avec des étapes numérotées et des descriptions imagées"
}
\`\`\`
`
};

// Interfaces (unchanged from original)
interface Message {
  role: 'user' | 'assistant';
  content: string;
  type?: 'collapsible';
  files?: {
    name: string;
    content: string;
    language: string;
  }[];
}

// Utility functions (unchanged from original)
function tryParseJSON(text: string): any {
  try {
    const start = text.indexOf('{');
    const end = text.lastIndexOf('}') + 1;
    if (start === -1 || end === 0) return null;
    
    const jsonPart = text.slice(start, end);
    return JSON.parse(jsonPart);
  } catch (error) {
    console.log('Not a valid JSON:', error);
    return null;
  }
}


// Main route handler for Vite.js (using Express-like middleware)
// Type for handler options
interface HandlerOptions {
  apiKey: string;
}

export const createChatHandler = (options: HandlerOptions) => async (req: Request, res: Response) => {
  try {
    const { apiKey } = options;
    if (!apiKey) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'API key is required' }));
      return;
    }
    
    // Initialize MistralClient
    const client = new MistralAI.Mistral({ apiKey });

    // Parse request body
    const { messages, isConsultantMode, projectId, consultantState } = req.body;
    
    // Handle system message based on mode and phase
    let systemMessage;
    systemMessage = {
    role: "system" as const,
    content: SYSTEM_MESSAGES.default  
    };

    // Include context from previous proposals if we're in detailed phase
    const messageHistory = [systemMessage];
    if (isConsultantMode && consultantState?.phase === 'detailed' && consultantState?.lastProposal) {
      messageHistory.push({
        role: "system" as const,
        content: `Context from previous discussion: ${consultantState.lastProposal}`
      });
    }
    messageHistory.push(...messages);

    // Call Mistral API
    const chatResponse = await client.chat.complete({
      model: "mistral-medium",
      messages: messageHistory,
    });

    // Validate and format response
    if (!chatResponse.choices || !chatResponse.choices[0]?.message?.content || typeof chatResponse.choices[0].message.content !== 'string') {
      throw new Error('Invalid response from Mistral API');
    }
    
    const aiResponse = chatResponse.choices[0].message.content;
    // Extract JSON content from the AI response
    const jsonMatch = aiResponse.match(/```json\n([\s\S]*?)\n```/);
    if (!jsonMatch) {
      throw new Error("Invalid AI response format");
    }

    const jsonContent = jsonMatch[1].trim();
    const parsedResponse = JSON.parse(jsonContent);

    // Ensure the structure is correct
    const formattedResponse = {
      quickrep: parsedResponse.quickrep || "",
      explication: parsedResponse.explication || ""
    };

    // Return response
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      choices: [{
        message: {
          role: 'assistant',
          content: JSON.stringify(formattedResponse)
        },
        index: 0,
        finish_reason: chatResponse.choices[0].finishReason
      }]
    }));
  } catch (error) {
    console.error('Chat API Error:', error);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      error: error instanceof Error ? error.message : 'An error occurred during chat processing'
    }));
  }
};

// Optional: Vite plugin for routing (if needed)
export const viteChatPlugin = (): Plugin => {
  return {
    name: 'vite-chat-plugin',
    configureServer(server: ViteDevServer) {
      // Get API key from environment variable during server startup
      const apiKey = process.env.VITE_MISTRAL_API_KEY;
      if (!apiKey) {
        console.error('Warning: VITE_MISTRAL_API_KEY environment variable is not set');
      }

      const handler = createChatHandler({ apiKey: apiKey || '' });

      server.middlewares.use('/api/chat', async (req: IncomingMessage, res: ServerResponse, next) => {
        if (req.method === 'POST') {
          let body = '';
          req.on('data', chunk => {
            body += chunk.toString();
          });
          
          req.on('end', async () => {
            try {
              (req as any).body = JSON.parse(body);
              await handler(req as Request, res as Response);
            } catch (error) {
              console.error('Error parsing request body:', error);
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: 'Invalid request body' }));
            }
          });
        } else {
          res.statusCode = 405;
          res.end('Method Not Allowed');
        }
      });
    }
  };
};
