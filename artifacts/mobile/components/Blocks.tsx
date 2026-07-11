import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';

function withAlpha(hex: string, alpha: string) {
  return hex + alpha;
}

export function SectionCard({
  id,
  title,
  icon,
  color,
  open,
  onToggle,
  depth = 0,
  children,
}: {
  id: string;
  title: string;
  icon: keyof typeof Feather.glyphMap;
  color: string;
  open: Set<string>;
  onToggle: (id: string) => void;
  depth?: number;
  children?: React.ReactNode;
}) {
  const colors = useColors();
  const isOpen = open.has(id);

  return (
    <View
      style={[
        styles.card,
        {
          marginLeft: depth * 12,
          borderColor: withAlpha(color, '55'),
          backgroundColor: isOpen ? withAlpha(color, '12') : colors.card,
          shadowColor: color,
          shadowOpacity: isOpen ? 0.35 : 0,
        },
      ]}
    >
      <Pressable
        onPress={() => onToggle(id)}
        style={({ pressed }) => [
          styles.cardHeader,
          {
            backgroundColor: isOpen ? withAlpha(color, '1a') : 'transparent',
            opacity: pressed ? 0.75 : 1,
          },
        ]}
      >
        <View style={[styles.iconBubble, { backgroundColor: withAlpha(color, '22') }]}>
          <Feather name={icon} size={16} color={color} />
        </View>
        <Text style={[styles.cardTitle, { color }]} numberOfLines={2}>
          {title}
        </Text>
        <Feather
          name={isOpen ? 'chevron-up' : 'chevron-down'}
          size={18}
          color={color}
        />
      </Pressable>
      {isOpen ? <View style={styles.cardBody}>{children}</View> : null}
    </View>
  );
}

export function Row({
  icon,
  children,
}: {
  icon: keyof typeof Feather.glyphMap;
  children: React.ReactNode;
}) {
  const colors = useColors();
  return (
    <View style={styles.row}>
      <Feather
        name={icon}
        size={14}
        color={colors.accent}
        style={styles.rowIcon}
      />
      <Text style={[styles.rowText, { color: colors.mutedForeground }]}>
        {children}
      </Text>
    </View>
  );
}

export function OldNew({
  oldLabel,
  oldText,
  newLabel,
  newText,
}: {
  oldLabel: string;
  oldText: string;
  newLabel: string;
  newText: string;
}) {
  const colors = useColors();
  return (
    <View style={styles.oldNewWrap}>
      <View
        style={[
          styles.oldNewBox,
          {
            borderColor: withAlpha(colors.destructive, '88'),
            backgroundColor: withAlpha(colors.destructive, '12'),
            borderStyle: 'dashed',
          },
        ]}
      >
        <Text style={[styles.oldNewLabel, { color: colors.destructive }]}>
          {oldLabel}
        </Text>
        <Text style={[styles.oldNewText, { color: colors.mutedForeground }]}>
          {oldText}
        </Text>
      </View>
      <View
        style={[
          styles.oldNewBox,
          {
            borderColor: withAlpha(colors.accent, 'aa'),
            backgroundColor: withAlpha(colors.accent, '12'),
          },
        ]}
      >
        <Text style={[styles.oldNewLabel, { color: colors.accent }]}>
          {newLabel}
        </Text>
        <Text style={[styles.oldNewText, { color: colors.mutedForeground }]}>
          {newText}
        </Text>
      </View>
    </View>
  );
}

export function CodeBlock({
  children,
  color,
}: {
  children: string;
  color?: string;
}) {
  const colors = useColors();
  const border = color ?? colors.border;
  return (
    <View
      style={[
        styles.codeBlock,
        {
          borderColor: withAlpha(border, '55'),
          backgroundColor: colors.background,
        },
      ]}
    >
      <Text style={[styles.codeText, { color: colors.accent }]}>
        {children}
      </Text>
    </View>
  );
}

export function Alert({
  color,
  icon,
  children,
}: {
  color: string;
  icon?: keyof typeof Feather.glyphMap;
  children: React.ReactNode;
}) {
  const colors = useColors();
  return (
    <View
      style={[
        styles.alert,
        { borderColor: withAlpha(color, '88'), backgroundColor: withAlpha(color, '15') },
      ]}
    >
      {icon ? (
        <Feather name={icon} size={16} color={color} style={styles.alertIcon} />
      ) : null}
      <Text style={[styles.alertText, { color: colors.foreground }]}>
        {children}
      </Text>
    </View>
  );
}

export function NodeBox({
  name,
  icon,
  model,
  tools,
  color,
  isNew,
}: {
  name: string;
  icon: keyof typeof Feather.glyphMap;
  model: string;
  tools: string;
  color: string;
  isNew?: boolean;
}) {
  const colors = useColors();
  return (
    <View
      style={[
        styles.nodeBox,
        { borderColor: withAlpha(color, '66'), backgroundColor: withAlpha(color, '0a') },
      ]}
    >
      {isNew ? (
        <View
          style={[
            styles.newBadge,
            {
              backgroundColor: withAlpha(colors.tint, '22'),
              borderColor: withAlpha(colors.tint, '44'),
            },
          ]}
        >
          <Text style={[styles.newBadgeText, { color: colors.tint }]}>NEW</Text>
        </View>
      ) : null}
      <View style={styles.nodeBoxHeader}>
        <Feather name={icon} size={16} color={color} />
        <Text style={[styles.nodeBoxTitle, { color }]}>{name}</Text>
      </View>
      <Text style={[styles.nodeBoxSub, { color: colors.mutedForeground }]}>
        Model: <Text style={{ color: colors.tint, fontFamily: 'Inter_600SemiBold' }}>{model}</Text>
      </Text>
      <Text style={[styles.nodeBoxSub, { color: colors.mutedForeground }]}>
        Tools: <Text style={{ color: colors.foreground }}>{tools}</Text>
      </Text>
    </View>
  );
}

export function OptCard({
  number,
  title,
  saving,
  effort,
  color,
  children,
}: {
  number: string;
  title: string;
  saving: string;
  effort: string;
  color: string;
  children?: React.ReactNode;
}) {
  const colors = useColors();
  return (
    <View
      style={[
        styles.optCard,
        { borderColor: withAlpha(color, '55'), backgroundColor: withAlpha(color, '08') },
      ]}
    >
      <View style={styles.optCardHeader}>
        <Text style={[styles.optNumber, { color }]}>{number}</Text>
        <Text style={[styles.optTitle, { color }]}>{title}</Text>
      </View>
      <View style={styles.optTagsRow}>
        <View style={[styles.tag, { backgroundColor: withAlpha(colors.accent, '22') }]}>
          <Text style={[styles.tagText, { color: colors.accent }]}>{saving}</Text>
        </View>
        <View style={[styles.tag, { backgroundColor: withAlpha(colors.tint, '22') }]}>
          <Text style={[styles.tagText, { color: colors.tint }]}>
            Effort: {effort}
          </Text>
        </View>
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 10,
    borderWidth: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  iconBubble: {
    width: 30,
    height: 30,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    flex: 1,
    fontSize: 13.5,
    fontFamily: 'Inter_700Bold',
  },
  cardBody: {
    paddingHorizontal: 14,
    paddingBottom: 14,
    paddingTop: 2,
  },
  row: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
    alignItems: 'flex-start',
  },
  rowIcon: {
    marginTop: 3,
  },
  rowText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 19,
    fontFamily: 'Inter_400Regular',
  },
  oldNewWrap: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
    marginBottom: 10,
  },
  oldNewBox: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    padding: 10,
  },
  oldNewLabel: {
    fontSize: 10.5,
    fontFamily: 'Inter_700Bold',
    marginBottom: 5,
  },
  oldNewText: {
    fontSize: 12,
    lineHeight: 17,
    fontFamily: 'Inter_400Regular',
  },
  codeBlock: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginTop: 8,
    marginBottom: 8,
  },
  codeText: {
    fontSize: 11.5,
    lineHeight: 18,
    fontFamily: 'Menlo',
  },
  alert: {
    flexDirection: 'row',
    borderWidth: 1.5,
    borderRadius: 12,
    padding: 12,
    marginTop: 10,
    marginBottom: 10,
    gap: 8,
  },
  alertIcon: {
    marginTop: 2,
  },
  alertText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 19,
    fontFamily: 'Inter_400Regular',
  },
  nodeBox: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 11,
    marginBottom: 8,
    position: 'relative',
  },
  newBadge: {
    position: 'absolute',
    top: 8,
    right: 10,
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 2,
    paddingHorizontal: 8,
  },
  newBadgeText: {
    fontSize: 9.5,
    fontFamily: 'Inter_700Bold',
  },
  nodeBoxHeader: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    marginBottom: 6,
  },
  nodeBoxTitle: {
    fontSize: 13,
    fontFamily: 'Inter_700Bold',
    flex: 1,
  },
  nodeBoxSub: {
    fontSize: 11.5,
    marginBottom: 2,
    fontFamily: 'Inter_400Regular',
  },
  optCard: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 11,
    marginBottom: 8,
  },
  optCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  optNumber: {
    fontSize: 20,
    fontFamily: 'Inter_700Bold',
  },
  optTitle: {
    flex: 1,
    fontSize: 13,
    fontFamily: 'Inter_700Bold',
  },
  optTagsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
    flexWrap: 'wrap',
  },
  tag: {
    borderRadius: 12,
    paddingVertical: 3,
    paddingHorizontal: 9,
  },
  tagText: {
    fontSize: 11,
    fontFamily: 'Inter_700Bold',
  },
});
