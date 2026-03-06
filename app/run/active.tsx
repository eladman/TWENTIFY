import { useEffect, useRef, useState, useCallback } from 'react';
import { View, Alert, AppState, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import * as Location from 'expo-location';
import { RunTimer } from '@/components/run/RunTimer';
import { ZoneIndicator } from '@/components/run/ZoneIndicator';
import { IntervalProgress } from '@/components/run/IntervalProgress';
import { Button } from '@/components/ui/Button';
import { Text } from '@/components/ui/Text';
import { useRunStore } from '@/stores/useRunStore';
import { useUserStore } from '@/stores/useUserStore';
import { getRunSessionForDay, toRunTemplate } from '@/data/runTemplates';
import { calculateZone2HR } from '@/utils/calculations';
import { formatDistance } from '@/utils/formatters';
import { haptics } from '@/utils/haptics';
import { analytics } from '@/services/analytics';
import { colors } from '@/theme/colors';
import { spacing, screenPadding } from '@/theme/spacing';
import type { RunSessionType, RunSegment, RunSegmentType } from '@/types/run';

// ── Zone mapping helpers ───────────────────────────────────────────────

type TargetZone = 'zone2' | 'tempo' | 'interval_work' | 'interval_recovery' | 'walk' | 'run';

function segmentToZone(segType: RunSegmentType, sessionType: RunSessionType): TargetZone {
  switch (segType) {
    case 'warmup':
    case 'cooldown':
    case 'walk':
      return 'walk';
    case 'run':
      return sessionType === 'walk_run' ? 'run' : 'zone2';
    case 'work':
      return sessionType === 'intervals' ? 'interval_work' : 'tempo';
    case 'recovery':
      return 'interval_recovery';
  }
}

// ── Haversine distance ────────────────────────────────────────────────

function haversineMeters(
  lat1: number, lon1: number,
  lat2: number, lon2: number,
): number {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ── Session label ──────────────────────────────────────────────────────

const SESSION_LABELS: Record<RunSessionType, string> = {
  easy: 'Easy Run',
  tempo: 'Tempo Run',
  intervals: 'Intervals',
  walk_run: 'Walk / Run',
};

export default function ActiveRunScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    sessionType: RunSessionType;
    weekNumber?: string;
    sessionIndex?: string;
  }>();

  const sessionType = params.sessionType ?? 'easy';
  const weekNumber = params.weekNumber ? parseInt(params.weekNumber, 10) : 1;
  const sessionIndex = params.sessionIndex ? parseInt(params.sessionIndex, 10) : 0;

  const isSegmented = sessionType === 'intervals' || sessionType === 'walk_run';

  // ── Store ──────────────────────────────────────────────────────────
  const {
    activeSession,
    startRun,
    togglePause,
    finishRun,
    abandonRun,
    updateElapsed,
    updateDistance,
  } = useRunStore();

  const profile = useUserStore((s) => s.profile);
  const units = useUserStore((s) => s.settings.units);

  // ── Refs ──────────────────────────────────────────────────────────
  const startedAtRef = useRef<Date | null>(null);
  const segmentsRef = useRef<RunSegment[]>([]);
  const segmentStartWallRef = useRef(0);
  const segmentPausedMsRef = useRef(0);
  const segmentPauseStartRef = useRef<number | null>(null);
  const advancingRef = useRef(false);
  const locationSubRef = useRef<Location.LocationSubscription | null>(null);
  const lastCoordsRef = useRef<{ lat: number; lon: number } | null>(null);
  const cumulativeDistRef = useRef(0);

  // ── State ────────────────────────────────────────────────────────
  const [ready, setReady] = useState(false);
  const [currentSegmentIndex, setCurrentSegmentIndex] = useState(0);
  const [segmentTimeRemaining, setSegmentTimeRemaining] = useState(0);
  const [targetDurationMin, setTargetDurationMin] = useState(0);
  const [distanceMeters, setDistanceMeters] = useState<number | null>(null);
  const [locationDenied, setLocationDenied] = useState(false);

  const isPaused = activeSession?.isPaused ?? false;

  // ── isPausedRef for GPS callback (avoids stale closure) ──────────
  const isPausedRef = useRef(false);
  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);

  // ── Mount: load session, start run, keep-awake ──────────────────
  useEffect(() => {
    const session = getRunSessionForDay(sessionType, weekNumber, sessionIndex);
    const template = toRunTemplate(session);

    segmentsRef.current = session.segments;
    setTargetDurationMin(session.totalDurationMinutes);

    startRun(template);
    analytics.track('run_started', {
      session_type: sessionType,
      is_walk_run: sessionType === 'walk_run',
      week_number: weekNumber,
    });
    const now = new Date();
    startedAtRef.current = now;

    if (isSegmented && session.segments.length > 0) {
      setCurrentSegmentIndex(0);
      setSegmentTimeRemaining(session.segments[0].durationSeconds);
      segmentStartWallRef.current = Date.now();
      segmentPausedMsRef.current = 0;
      segmentPauseStartRef.current = null;
    }

    setReady(true);
    activateKeepAwakeAsync();

    return () => {
      deactivateKeepAwake();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── GPS tracking ────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        if (!cancelled) setLocationDenied(true);
        return;
      }
      if (cancelled) return;

      const sub = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 5000,
          distanceInterval: 5,
        },
        (loc) => {
          if (isPausedRef.current) return;
          const { latitude, longitude } = loc.coords;
          if (lastCoordsRef.current) {
            const delta = haversineMeters(
              lastCoordsRef.current.lat,
              lastCoordsRef.current.lon,
              latitude,
              longitude,
            );
            if (delta > 1) {
              cumulativeDistRef.current += delta;
              setDistanceMeters(cumulativeDistRef.current);
              updateDistance(cumulativeDistRef.current);
            }
          }
          lastCoordsRef.current = { lat: latitude, lon: longitude };
        },
      );

      if (!cancelled) {
        locationSubRef.current = sub;
      } else {
        sub.remove();
      }
    })();

    return () => {
      cancelled = true;
      locationSubRef.current?.remove();
      locationSubRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Elapsed pause tracking ─────────────────────────────────────
  const elapsedPausedMsRef = useRef(0);
  const elapsedPauseStartRef = useRef<number | null>(null);

  useEffect(() => {
    if (isPaused) {
      elapsedPauseStartRef.current = Date.now();
    } else if (elapsedPauseStartRef.current !== null) {
      elapsedPausedMsRef.current += Date.now() - elapsedPauseStartRef.current;
      elapsedPauseStartRef.current = null;
    }
  }, [isPaused]);

  // ── Segment pause tracking ─────────────────────────────────────
  useEffect(() => {
    if (!isSegmented) return;

    if (isPaused) {
      segmentPauseStartRef.current = Date.now();
    } else if (segmentPauseStartRef.current !== null) {
      segmentPausedMsRef.current += Date.now() - segmentPauseStartRef.current;
      segmentPauseStartRef.current = null;
    }
  }, [isPaused, isSegmented]);

  // ── Advance to next segment ────────────────────────────────────
  const advanceSegment = useCallback(() => {
    if (advancingRef.current) return;
    advancingRef.current = true;

    const segments = segmentsRef.current;
    const nextIndex = currentSegmentIndex + 1;

    if (nextIndex >= segments.length) {
      // Last segment done → finish
      finishRun(sessionType);
      router.replace('/run/summary');
      advancingRef.current = false;
      return;
    }

    const prevType = segments[currentSegmentIndex].type;
    const nextType = segments[nextIndex].type;

    // Haptic feedback based on transition
    if (
      (prevType === 'walk' && nextType === 'run') ||
      (prevType === 'recovery' && nextType === 'work')
    ) {
      haptics.warning(); // time to push
    } else if (
      (prevType === 'run' && nextType === 'walk') ||
      (prevType === 'work' && nextType === 'recovery') ||
      nextType === 'cooldown'
    ) {
      haptics.success(); // you can rest
    }

    setCurrentSegmentIndex(nextIndex);
    setSegmentTimeRemaining(segments[nextIndex].durationSeconds);
    segmentStartWallRef.current = Date.now();
    segmentPausedMsRef.current = 0;
    segmentPauseStartRef.current = isPaused ? Date.now() : null;

    advancingRef.current = false;
  }, [currentSegmentIndex, isPaused, sessionType, finishRun, router]);

  // ── Segment countdown ticker ────────────────────────────────────
  useEffect(() => {
    if (!isSegmented || !ready || isPaused) return;

    const tick = () => {
      const segment = segmentsRef.current[currentSegmentIndex];
      if (!segment) return;

      const elapsed =
        (Date.now() - segmentStartWallRef.current - segmentPausedMsRef.current) / 1000;
      const remaining = Math.max(0, segment.durationSeconds - elapsed);

      setSegmentTimeRemaining(remaining);

      if (remaining <= 0) {
        advanceSegment();
      }
    };

    tick();
    const id = setInterval(tick, 500);
    return () => clearInterval(id);
  }, [isSegmented, ready, isPaused, currentSegmentIndex, advanceSegment]);

  // ── Elapsed time updater (for store) ────────────────────────────
  useEffect(() => {
    if (!ready || !startedAtRef.current || isPaused) return;

    const tick = () => {
      if (!startedAtRef.current) return;
      const elapsed = Math.floor(
        (Date.now() - startedAtRef.current.getTime() - elapsedPausedMsRef.current) / 1000
      );
      updateElapsed(elapsed);
    };

    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [ready, isPaused, updateElapsed]);

  // ── AppState: force-update elapsed on foreground return ─────────
  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active' && startedAtRef.current && !isPaused) {
        const elapsed = Math.floor(
          (Date.now() - startedAtRef.current.getTime() - elapsedPausedMsRef.current) / 1000,
        );
        updateElapsed(elapsed);
      }
    });
    return () => sub.remove();
  }, [isPaused, updateElapsed]);

  // ── Derived values ──────────────────────────────────────────────
  const currentSegment = isSegmented ? segmentsRef.current[currentSegmentIndex] : null;
  const currentZone: TargetZone = currentSegment
    ? segmentToZone(currentSegment.type, sessionType)
    : sessionType === 'tempo'
      ? 'tempo'
      : 'zone2';

  // HR targets
  const age = profile?.age ?? 30;
  const restingHr = profile?.restingHr;
  const maxHR = 220 - age;
  const hasHrMonitor = profile?.hasHrMonitor ?? false;

  let hrTarget: { low: number; high: number } | undefined;
  if (sessionType === 'easy' || (sessionType === 'tempo' && !currentSegment)) {
    const z2 = calculateZone2HR(age, restingHr);
    hrTarget = { low: z2.low, high: z2.high };
  } else if (currentSegment?.targetHRPercent) {
    hrTarget = {
      low: Math.round(maxHR * (currentSegment.targetHRPercent.min / 100)),
      high: Math.round(maxHR * (currentSegment.targetHRPercent.max / 100)),
    };
  }

  // Walk/Run round counter
  let roundInfo: { current: number; total: number } | null = null;
  if (sessionType === 'walk_run') {
    const segments = segmentsRef.current;
    // Strip warmup (index 0) and cooldown (last)
    const coreSegments = segments.slice(1, segments.length - 1);
    const totalRounds = Math.ceil(coreSegments.length / 2);
    // Current segment index relative to core segments
    const coreIndex = currentSegmentIndex - 1; // subtract warmup
    const currentRound = coreIndex >= 0 ? Math.floor(coreIndex / 2) + 1 : 0;
    roundInfo = {
      current: Math.max(1, Math.min(currentRound, totalRounds)),
      total: totalRounds,
    };
  }

  // ── Handlers ───────────────────────────────────────────────────
  const handleEndRun = () => {
    Alert.alert('End Run?', 'Your progress will be lost.', [
      { text: 'Keep Going', style: 'cancel' },
      {
        text: 'End Run',
        style: 'destructive',
        onPress: () => {
          analytics.track('run_abandoned', {
            duration_seconds: activeSession?.elapsedSeconds ?? 0,
            session_type: sessionType,
          });
          locationSubRef.current?.remove();
          abandonRun();
          router.back();
        },
      },
    ]);
  };

  const handleFinish = () => {
    analytics.track('run_completed', {
      duration_seconds: activeSession?.elapsedSeconds ?? 0,
      distance_meters: cumulativeDistRef.current,
      session_type: sessionType,
      segments_completed: currentSegmentIndex + 1,
    });
    haptics.success();
    locationSubRef.current?.remove();
    finishRun(sessionType);
    router.replace('/run/summary');
  };

  const handleTogglePause = () => {
    haptics.light();
    togglePause();
  };

  // ── Loading state ──────────────────────────────────────────────
  if (!ready || !startedAtRef.current) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.centerContainer}>
          <Text variant="heading.lg" color={colors.textPrimary}>
            Starting...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // ── Render ─────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        {/* Top bar */}
        <View style={styles.topBar}>
          <Button variant="text" label="End Run" onPress={handleEndRun} />
          <Text variant="body.sm" color={colors.textSecondary}>
            {SESSION_LABELS[sessionType]}
          </Text>
        </View>

        {/* Center content */}
        <View style={styles.center}>
          {isSegmented ? (
            <>
              {/* Segment layout */}
              <IntervalProgress
                currentSegmentIndex={currentSegmentIndex}
                totalSegments={segmentsRef.current.length}
                currentSegmentType={currentSegment?.type ?? 'warmup'}
                segmentTimeRemaining={Math.ceil(segmentTimeRemaining)}
                segmentTotalTime={currentSegment?.durationSeconds ?? 0}
                nextSegmentType={segmentsRef.current[currentSegmentIndex + 1]?.type}
                nextSegmentDuration={segmentsRef.current[currentSegmentIndex + 1]?.durationSeconds}
              />

              <View style={styles.gap} />

              <ZoneIndicator
                targetZone={currentZone}
                hasHrMonitor={hasHrMonitor}
                targetHR={hrTarget}
              />

              <View style={styles.gap} />

              {sessionType === 'walk_run' && roundInfo ? (
                <Text variant="heading.md" color={colors.textPrimary} align="center">
                  Round {roundInfo.current} of {roundInfo.total}
                </Text>
              ) : (
                <RunTimer startedAt={startedAtRef.current} paused={isPaused} />
              )}
            </>
          ) : (
            <>
              {/* Simple layout (easy / tempo) */}
              <RunTimer startedAt={startedAtRef.current} paused={isPaused} />

              <View style={styles.gap} />

              <ZoneIndicator
                targetZone={currentZone}
                hasHrMonitor={hasHrMonitor}
                targetHR={hrTarget}
              />

              <View style={styles.gap} />

              <Text variant="body.md" color={colors.textSecondary} align="center">
                Target: {targetDurationMin} min
              </Text>
            </>
          )}

          {/* Distance */}
          {locationDenied ? (
            <Text
              variant="body.md"
              color={colors.textMuted}
              align="center"
              style={styles.distanceText}
            >
              Distance: —
            </Text>
          ) : distanceMeters != null ? (
            <Text
              variant="body.md"
              color={colors.textSecondary}
              align="center"
              style={styles.distanceText}
            >
              {formatDistance(distanceMeters, units)}
            </Text>
          ) : null}
        </View>

        {/* Bottom controls */}
        <View style={styles.bottom}>
          <Button
            variant="primary"
            label={isPaused ? 'Resume' : 'Pause'}
            onPress={handleTogglePause}
            fullWidth
          />
          {isPaused && (
            <Button
              variant="secondary"
              label="Finish Run"
              onPress={handleFinish}
              fullWidth
              style={styles.finishButton}
            />
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    paddingHorizontal: screenPadding.horizontal,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gap: {
    height: 24,
  },
  distanceText: {
    marginTop: spacing.lg,
  },
  bottom: {
    paddingBottom: spacing.xl,
  },
  finishButton: {
    marginTop: spacing.md,
  },
});
