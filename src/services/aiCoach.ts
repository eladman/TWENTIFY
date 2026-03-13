import Constants from 'expo-constants';

import type { AiCoachRequest, AiCoachResponse } from '@/types/chat';

const supabaseUrl = Constants.expoConfig?.extra?.SUPABASE_URL as string | undefined;
const supabaseAnonKey = Constants.expoConfig?.extra?.SUPABASE_ANON_KEY as string | undefined;

export class AiCoachError extends Error {
  constructor(
    message: string,
    public readonly statusCode?: number,
  ) {
    super(message);
    this.name = 'AiCoachError';
  }
}

/**
 * Sends a chat message to the AI coach edge function and returns the response.
 * Uses direct fetch instead of supabase.functions.invoke() to avoid RN timeout issues.
 */
export async function sendChatMessage(
  request: AiCoachRequest,
): Promise<AiCoachResponse> {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new AiCoachError('Supabase is not configured', 503);
  }

  const url = `${supabaseUrl}/functions/v1/ai-coach`;

  const messageCount = request.messages.length;
  const timeoutMs = messageCount > 10 ? 60_000 : 30_000;
  console.log('[AiCoach] Sending request:', JSON.stringify({ domains: request.domains, messageCount, timeoutMs }));

  const controller = new AbortController();
  const timer = setTimeout(() => {
    console.log(`[AiCoach] Request timed out after ${timeoutMs / 1000}s`);
    controller.abort();
  }, timeoutMs);

  let response: Response;
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseAnonKey}`,
        'apikey': supabaseAnonKey,
      },
      body: JSON.stringify(request),
      signal: controller.signal,
    });
    clearTimeout(timer);
  } catch (err) {
    clearTimeout(timer);
    console.log('[AiCoach] Fetch failed:', err);
    throw new AiCoachError(
      'AI coach is not available. Please try again later.',
      504,
    );
  }

  console.log('[AiCoach] Response received:', { status: response.status, ok: response.ok });

  if (!response.ok) {
    const errorText = await response.text().catch(() => 'unknown error');
    console.log('[AiCoach] Error response:', errorText);
    throw new AiCoachError(
      `Failed to reach AI coach: ${response.status}`,
      response.status,
    );
  }

  let data: any;
  try {
    data = await response.json();
  } catch {
    console.log('[AiCoach] Failed to parse response JSON');
    throw new AiCoachError('Invalid response from AI coach');
  }

  if (!data || !data.message) {
    console.log('[AiCoach] Invalid response data:', JSON.stringify(data));
    throw new AiCoachError('Invalid response from AI coach');
  }

  console.log('[AiCoach] Success — phase:', data.phase, 'message length:', data.message?.length);
  return data as AiCoachResponse;
}

/**
 * Checks if the AI coach service is available (Supabase configured + online).
 */
export function isAiCoachAvailable(): boolean {
  return Boolean(supabaseUrl && supabaseAnonKey);
}
