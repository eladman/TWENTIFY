# Fix: AI Coach "Having trouble connecting" error

## Context
The edge function is deployed and ACTIVE (`supabase functions list` confirms). The user is authenticated before reaching the AI coach (auth → onboarding → domains → AI coach). The `ANTHROPIC_API_KEY` secret is set. Yet the user still sees "Having trouble connecting to the AI coach."

**Root cause**: The client catches ALL errors and shows a single generic message — we have zero visibility into what's actually failing. There are two likely culprits:

1. **15-second timeout is too short** — The system prompt is ~4000+ tokens (exercise bank, run templates, nutrition rules, research citations) plus tool schemas. Cold start (1-3s) + auth verification (~1s) + Claude API with this payload (5-15s) easily exceeds 15s.
2. **Edge function runtime error** — Could be an import issue, auth error, or Claude API error (wrong model ID, invalid key, etc.) but we can't tell because all errors show the same message.

## Plan

### Step 1: Get actual error visibility (diagnostic)
Run `supabase functions logs ai-coach --scroll` in terminal while testing the app to see what the edge function actually returns. This tells us immediately if it's a timeout, auth issue, API error, etc.

### Step 2: Increase client timeout from 15s → 45s
**File**: `src/services/aiCoach.ts` (line 31)

Change:
```ts
setTimeout(() => reject(new Error('timeout')), 15_000),
```
To:
```ts
setTimeout(() => reject(new Error('timeout')), 45_000),
```

The initial greeting makes a large request (system prompt ~4000 tokens + tool schemas). 45s gives enough room for cold start + Claude API latency.

### Step 3: Add error logging in client for debugging
**File**: `src/services/aiCoach.ts`

Add `console.error` before throwing `AiCoachError` at each throw site so we can see the actual error in the Expo console:
- Line 36-41 (invoke catch): Log `invokeErr`
- Line 43-47 (response error): Log `error` object with status
- Line 50-51 (invalid response): Log `data`

### Step 4: Show specific error in chat during development (optional)
**File**: `app/(ai-coach)/chat.tsx` (lines 91-94)

Improve the catch block to log the actual error:
```ts
} catch (error) {
  console.error('AI Coach error:', error);
  const fallbackMsg = error instanceof AiCoachError
    ? 'Having trouble connecting to the AI coach. You can try again or use the standard plan builder.'
    : 'Something went wrong. Please try again.';
```

## Files to modify
1. `src/services/aiCoach.ts` — Increase timeout, add error logging
2. `app/(ai-coach)/chat.tsx` — Add error logging in catch block

## Verification
1. Run `supabase functions logs ai-coach --scroll` in one terminal
2. Open app → sign in → select domains → enter AI Coach
3. Watch the logs: if the function is called, we'll see the request + any errors
4. If it's a timeout: the 45s timeout should fix it
5. If it's another error: the logs + console.error will reveal it
6. Success: AI greeting message appears instead of error
