import React, { useCallback, useState } from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import ArchitectureContent, {
  ALL_SECTION_IDS,
} from '@/components/ArchitectureContent';

export default function ArchitectureScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [open, setOpen] = useState<Set<string>>(new Set(['final']));

  const onToggle = useCallback((id: string) => {
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const expandAll = useCallback(() => setOpen(new Set(ALL_SECTION_IDS)), []);
  const collapseAll = useCallback(() => setOpen(new Set()), []);

  const topInset = Platform.OS === 'web' ? 67 : insets.top;
  const bottomInset = Platform.OS === 'web' ? 34 : insets.bottom;

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: topInset + 16, paddingBottom: bottomInset + 32 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View
            style={[
              styles.badge,
              {
                backgroundColor: colors.secondary,
                borderColor: colors.border,
              },
            ]}
          >
            <Feather name="cpu" size={13} color={colors.accent} />
            <Text style={[styles.badgeText, { color: colors.accent }]}>
              AUTONOMOUS · MULTI-AGENT
            </Text>
          </View>

          <Text style={[styles.title, { color: colors.primary }]}>
            Final Architectural Decision
          </Text>
          <Text style={[styles.subtitle, { color: colors.foreground }]}>
            Autonomous Agentic Test Maintenance System v3.0
          </Text>
          <Text style={[styles.description, { color: colors.mutedForeground }]}>
            Full review of every concept — LangGraph multi-agent, AWS
            AgentCore deployment, 7 stacked optimizations, new tech, and
            final metrics.
          </Text>

          <View style={styles.actionsRow}>
            <Pressable
              onPress={expandAll}
              style={({ pressed }) => [
                styles.actionButton,
                {
                  backgroundColor: colors.accent + '22',
                  borderColor: colors.accent + '66',
                  opacity: pressed ? 0.7 : 1,
                },
              ]}
            >
              <Feather name="maximize-2" size={14} color={colors.accent} />
              <Text style={[styles.actionText, { color: colors.accent }]}>
                Expand All
              </Text>
            </Pressable>
            <Pressable
              onPress={collapseAll}
              style={({ pressed }) => [
                styles.actionButton,
                {
                  backgroundColor: colors.primary + '22',
                  borderColor: colors.primary + '66',
                  opacity: pressed ? 0.7 : 1,
                },
              ]}
            >
              <Feather name="minimize-2" size={14} color={colors.primary} />
              <Text style={[styles.actionText, { color: colors.primary }]}>
                Collapse All
              </Text>
            </Pressable>
          </View>
        </View>

        <ArchitectureContent open={open} onToggle={onToggle} />

        <Text style={[styles.footer, { color: colors.mutedForeground }]}>
          The final mindmap — every decision, every concept, every
          optimization in one place.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    maxWidth: 720,
    width: '100%',
    alignSelf: 'center',
  },
  header: {
    marginBottom: 18,
    alignItems: 'center',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderRadius: 20,
    paddingVertical: 5,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  badgeText: {
    fontSize: 11,
    fontFamily: 'Inter_700Bold',
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 22,
    fontFamily: 'Inter_700Bold',
    textAlign: 'center',
    lineHeight: 28,
  },
  subtitle: {
    fontSize: 14.5,
    fontFamily: 'Inter_600SemiBold',
    marginTop: 6,
    textAlign: 'center',
  },
  description: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 19,
    paddingHorizontal: 8,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  actionText: {
    fontSize: 12.5,
    fontFamily: 'Inter_700Bold',
  },
  footer: {
    fontSize: 11.5,
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
    marginTop: 20,
    paddingHorizontal: 12,
  },
});
