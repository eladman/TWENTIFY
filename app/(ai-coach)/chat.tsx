import React, { useRef, useCallback, useEffect } from 'react';
import { View, FlatList, StyleSheet, KeyboardAvoidingView, Platform, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Text } from '@/components/ui/Text';
import { MessageBubble } from '@/components/chat/MessageBubble';
import { PlanPreviewCard } from '@/components/chat/PlanPreviewCard';
import { QuickReplyBar } from '@/components/chat/QuickReplyBar';
import { ChatInput } from '@/components/chat/ChatInput';
import { TypingIndicator } from '@/components/chat/TypingIndicator';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { useChatStore } from '@/stores/useChatStore';
import { useUserStore } from '@/stores/useUserStore';
import { usePlanStore } from '@/stores/usePlanStore';
import { sendChatMessage, AiCoachError } from '@/services/aiCoach';
import { generateUUID } from '@/utils/uuid';
import { haptics } from '@/utils/haptics';
import type { ChatMessage, AiGeneratedPlan } from '@/types/chat';

export default function ChatScreen() {
  const router = useRouter();
  const flatListRef = useRef<FlatList>(null);

  const messages = useChatStore((s) => s.messages);
  const phase = useChatStore((s) => s.phase);
  const pendingPlan = useChatStore((s) => s.pendingPlan);
  const isLoading = useChatStore((s) => s.isLoading);
  const addMessage = useChatStore((s) => s.addMessage);
  const setPhase = useChatStore((s) => s.setPhase);
  const setPendingPlan = useChatStore((s) => s.setPendingPlan);
  const setLoading = useChatStore((s) => s.setLoading);
  const clearChat = useChatStore((s) => s.clearChat);

  const domains = useUserStore((s) => s.domains);
  const profile = useUserStore((s) => s.profile);
  const goal = useUserStore((s) => s.goal);
  const fitnessLevel = useUserStore((s) => s.fitnessLevel);
  const completeOnboarding = useUserStore((s) => s.completeOnboarding);
  const setPlan = usePlanStore((s) => s.setPlan);

  // Send initial greeting when chat is empty
  useEffect(() => {
    if (messages.length === 0) {
      sendInitialGreeting();
    }
  }, []);

  const sendInitialGreeting = async () => {
    setLoading(true);
    try {
      const userContext = {
        age: profile?.age,
        weightKg: profile?.weightKg,
        heightCm: profile?.heightCm,
        sex: profile?.sex,
        fitnessLevel: fitnessLevel ?? undefined,
        goal: goal ?? undefined,
        equipmentAccess: profile?.equipmentAccess,
        runningLevel: profile?.runningLevel,
      };

      const response = await sendChatMessage({
        messages: [{ role: 'user', content: `Hi! I'd like to create a plan for: ${domains.join(', ')}` }],
        domains,
        userContext,
      });

      // Add the user's initial message (hidden preamble)
      addMessage({
        id: generateUUID(),
        role: 'user',
        content: `I'd like to create a plan for: ${domains.join(', ')}`,
        timestamp: Date.now(),
      });

      // Add AI response
      addMessage({
        id: generateUUID(),
        role: 'assistant',
        content: response.message,
        timestamp: Date.now(),
        suggestedQuestions: response.suggestedQuestions,
        plan: response.plan,
      });

      if (response.plan) {
        setPendingPlan(response.plan);
      }
      setPhase(response.phase);
    } catch (error) {
      const fallbackMsg = error instanceof AiCoachError
        ? 'Having trouble connecting to the AI coach. You can try again or use the standard plan builder.'
        : 'Something went wrong. Please try again.';
      addMessage({
        id: generateUUID(),
        role: 'assistant',
        content: fallbackMsg,
        timestamp: Date.now(),
        suggestedQuestions: ['Try again', 'Use standard plan builder'],
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSend = useCallback(async (text: string) => {
    if (isLoading) return;

    // Handle special actions
    if (text === 'Use standard plan builder') {
      clearChat();
      router.replace('/(onboarding)/assessment');
      return;
    }

    if (text === 'Try again' && messages.length <= 2) {
      clearChat();
      sendInitialGreeting();
      return;
    }

    // Add user message
    const userMessage: ChatMessage = {
      id: generateUUID(),
      role: 'user',
      content: text,
      timestamp: Date.now(),
    };
    addMessage(userMessage);

    setLoading(true);
    try {
      // Build conversation history for the API
      const allMessages = [...messages, userMessage];
      const apiMessages = allMessages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const response = await sendChatMessage({
        messages: apiMessages,
        domains,
        userContext: {
          age: profile?.age,
          weightKg: profile?.weightKg,
          heightCm: profile?.heightCm,
          sex: profile?.sex,
          fitnessLevel: fitnessLevel ?? undefined,
          goal: goal ?? undefined,
          equipmentAccess: profile?.equipmentAccess,
          runningLevel: profile?.runningLevel,
        },
      });

      addMessage({
        id: generateUUID(),
        role: 'assistant',
        content: response.message,
        timestamp: Date.now(),
        suggestedQuestions: response.suggestedQuestions,
        plan: response.plan,
      });

      if (response.plan) {
        setPendingPlan(response.plan);
      }
      setPhase(response.phase);
    } catch (error) {
      addMessage({
        id: generateUUID(),
        role: 'assistant',
        content: 'Sorry, I had trouble processing that. Could you try again?',
        timestamp: Date.now(),
      });
    } finally {
      setLoading(false);
    }
  }, [isLoading, messages, domains, profile, fitnessLevel, goal]);

  const handleAcceptPlan = useCallback(() => {
    if (!pendingPlan) return;
    haptics.success();

    setPlan({
      weeklySchedule: pendingPlan.weeklySchedule,
      gymPlan: pendingPlan.gymPlan,
      runPlan: pendingPlan.runPlan,
      nutritionPlan: pendingPlan.nutritionPlan,
    });

    setPhase('complete');
    completeOnboarding();
    clearChat();
    router.replace('/(tabs)/today');
  }, [pendingPlan]);

  // Get latest suggested questions
  const latestAssistantMsg = [...messages].reverse().find((m) => m.role === 'assistant');
  const suggestions = latestAssistantMsg?.suggestedQuestions ?? [];

  const scrollToEnd = () => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  useEffect(() => {
    scrollToEnd();
  }, [messages.length, isLoading]);

  const renderItem = useCallback(({ item }: { item: ChatMessage }) => {
    return (
      <View>
        <MessageBubble message={item} />
        {item.plan && (
          <PlanPreviewCard plan={item.plan} onAccept={handleAcceptPlan} />
        )}
      </View>
    );
  }, [handleAcceptPlan]);

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      <View style={styles.header}>
        <Text variant="heading.sm">AI Coach</Text>
        <Pressable
          onPress={() => {
            clearChat();
            router.back();
          }}
          hitSlop={12}
        >
          <Text variant="body.md" color={colors.textSecondary}>
            Close
          </Text>
        </Pressable>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          style={styles.flex}
          contentContainerStyle={styles.messageList}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={isLoading ? <TypingIndicator /> : null}
          onContentSizeChange={scrollToEnd}
        />

        {suggestions.length > 0 && !isLoading && (
          <QuickReplyBar
            suggestions={suggestions}
            onSelect={handleSend}
            disabled={isLoading}
          />
        )}

        <ChatInput onSend={handleSend} disabled={isLoading} />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  messageList: {
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
  },
});
