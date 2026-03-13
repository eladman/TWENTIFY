import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { buildSystemPrompt } from './systemPrompt.ts';
import { TOOL_SCHEMAS } from './toolSchemas.ts';
import { validatePlan } from './validation.ts';

const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY');
const MODEL = 'claude-haiku-4-5-20251001';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RequestBody {
  messages: { role: 'user' | 'assistant'; content: string }[];
  domains: string[];
  userContext?: Record<string, unknown>;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Auth is handled by Supabase API gateway (validates JWT/anon key)

    if (!ANTHROPIC_API_KEY) {
      return new Response(JSON.stringify({ error: 'AI service not configured' }), {
        status: 503,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Parse request
    const body: RequestBody = await req.json();
    const { messages, domains, userContext } = body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: 'Messages array is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!domains || !Array.isArray(domains) || domains.length === 0) {
      return new Response(JSON.stringify({ error: 'Domains array is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Build system prompt
    const systemPrompt = buildSystemPrompt({ domains });

    // Add user context to the first message if available
    let enrichedMessages = [...messages];
    if (userContext && Object.keys(userContext).length > 0) {
      const contextStr = Object.entries(userContext)
        .filter(([_, v]) => v != null)
        .map(([k, v]) => `${k}: ${v}`)
        .join(', ');
      if (contextStr && enrichedMessages.length > 0) {
        enrichedMessages[0] = {
          ...enrichedMessages[0],
          content: `[User context: ${contextStr}]\n\n${enrichedMessages[0].content}`,
        };
      }
    }

    // Call Claude API
    const claudeResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 4096,
        system: systemPrompt,
        messages: enrichedMessages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
        tools: TOOL_SCHEMAS,
      }),
    });

    if (!claudeResponse.ok) {
      const errorText = await claudeResponse.text();
      console.error('Claude API error:', errorText);
      return new Response(JSON.stringify({ error: 'AI service error' }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const claudeData = await claudeResponse.json();

    // Process response — extract text and tool_use blocks
    let responseMessage = '';
    let plan = null;
    let suggestedQuestions: string[] | undefined;
    let phase: 'gathering' | 'generating' | 'reviewing' | 'complete' = 'gathering';

    for (const block of claudeData.content) {
      if (block.type === 'text') {
        responseMessage += block.text;
      } else if (block.type === 'tool_use') {
        if (block.name === 'generate_fitness_plan') {
          const input = block.input;

          // Validate the plan
          const validation = validatePlan(input);
          if (!validation.valid) {
            console.warn('Plan validation warnings:', validation.errors);
            // Still return the plan but log warnings — don't block the response
          }

          plan = {
            weeklySchedule: input.weeklySchedule,
            gymPlan: input.gymPlan || undefined,
            runPlan: input.runPlan || undefined,
            nutritionPlan: input.nutritionPlan || undefined,
          };

          // Use the explanation as the message if no text block
          if (!responseMessage && input.explanation) {
            responseMessage = input.explanation;
          }

          phase = 'reviewing';
          suggestedQuestions = [
            'Looks great, I accept this plan!',
            'Can you adjust the schedule?',
            'Can you change some exercises?',
          ];
        } else if (block.name === 'ask_user_question') {
          const input = block.input;
          if (!responseMessage) {
            responseMessage = input.question;
          }
          suggestedQuestions = input.suggestedAnswers;
          phase = 'gathering';
        }
      }
    }

    // If no message was extracted, provide a fallback
    if (!responseMessage) {
      responseMessage = "I'm here to help you build your plan! What are your fitness goals?";
    }

    const response = {
      message: responseMessage,
      plan: plan || undefined,
      suggestedQuestions,
      phase,
    };

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Edge function error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  }
});
