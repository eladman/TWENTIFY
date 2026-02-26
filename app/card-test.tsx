import { Alert, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '@/components/ui/Card';
import { Text } from '@/components/ui/Text';
import { Badge } from '@/components/ui/Badge';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { screenPadding } from '@/theme/spacing';

export default function CardTestScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: screenPadding.horizontal,
          paddingTop: screenPadding.top,
          paddingBottom: 40,
          gap: spacing.lg,
        }}
      >
        <Text variant="heading.lg">Card Test</Text>

        {/* Badge Variants */}
        <Text variant="body.sm" color={colors.textSecondary}>
          Badge Variants
        </Text>
        <View style={{ flexDirection: 'row', gap: spacing.sm }}>
          <Badge label="ACCENT" variant="accent" />
          <Badge label="SUCCESS" variant="success" />
          <Badge label="MUTED" variant="muted" />
        </View>

        {/* Workout - Static */}
        <Text variant="body.sm" color={colors.textSecondary}>
          Workout Card (static)
        </Text>
        <Card variant="workout">
          <Badge label="UPPER BODY" variant="accent" />
          <Text variant="heading.md" style={{ marginTop: spacing.sm }}>
            Push Day A
          </Text>
          <Text variant="body.sm" color={colors.textSecondary} style={{ marginTop: 4 }}>
            4 exercises · ~45 min
          </Text>
          <View style={{ marginTop: spacing.md, gap: 6 }}>
            <Text variant="body.md">Bench Press — 4×8</Text>
            <Text variant="body.md">OHP — 3×10</Text>
            <Text variant="body.md">Incline DB — 3×12</Text>
            <Text variant="body.md">Lateral Raise — 3×15</Text>
          </View>
        </Card>

        {/* Workout - Pressable */}
        <Text variant="body.sm" color={colors.textSecondary}>
          Workout Card (pressable)
        </Text>
        <Card
          variant="workout"
          onPress={() => Alert.alert('Workout Card', 'You tapped the workout card!')}
        >
          <Badge label="LEGS" variant="success" />
          <Text variant="heading.md" style={{ marginTop: spacing.sm }}>
            Leg Day B
          </Text>
          <Text variant="body.sm" color={colors.textSecondary} style={{ marginTop: 4 }}>
            5 exercises · ~55 min
          </Text>
          <View style={{ marginTop: spacing.md, gap: 6 }}>
            <Text variant="body.md">Squat — 4×6</Text>
            <Text variant="body.md">RDL — 3×10</Text>
            <Text variant="body.md">Leg Press — 3×12</Text>
            <Text variant="body.md">Leg Curl — 3×12</Text>
            <Text variant="body.md">Calf Raise — 4×15</Text>
          </View>
        </Card>

        {/* Info - Static */}
        <Text variant="body.sm" color={colors.textSecondary}>
          Info Card (static)
        </Text>
        <Card variant="info">
          <Text variant="overline" color={colors.textSecondary}>
            WEEKLY VOLUME
          </Text>
          <Text variant="data.xl" style={{ marginTop: 4 }}>
            24 sets
          </Text>
          <Text variant="body.sm" color={colors.textSecondary} style={{ marginTop: 4 }}>
            Target: 20-25 sets per muscle group
          </Text>
        </Card>

        {/* Info - Pressable */}
        <Text variant="body.sm" color={colors.textSecondary}>
          Info Card (pressable)
        </Text>
        <Card
          variant="info"
          onPress={() => Alert.alert('Info Card', 'You tapped the info card!')}
        >
          <Badge label="TIP" variant="muted" />
          <Text variant="body.md" style={{ marginTop: spacing.sm }}>
            Progressive overload is key — aim to increase weight or reps each week.
          </Text>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}
