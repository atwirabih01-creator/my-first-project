// Preset cartoon avatars only (never photos).
import { Text, View } from 'react-native';

import type { AvatarId } from '@/lib/types';

export const AVATARS: { id: AvatarId; emoji: string; bg: string; label: string }[] = [
  { id: 'lion', emoji: '🦁', bg: '#FFE7B3', label: 'Lion' },
  { id: 'fox', emoji: '🦊', bg: '#FFD9C7', label: 'Fox' },
  { id: 'cat', emoji: '🐱', bg: '#FDE2F3', label: 'Cat' },
  { id: 'panda', emoji: '🐼', bg: '#E4E9F2', label: 'Panda' },
  { id: 'turtle', emoji: '🐢', bg: '#D9F5DF', label: 'Turtle' },
  { id: 'rocket', emoji: '🚀', bg: '#DCE6FF', label: 'Rocket' },
  { id: 'star', emoji: '⭐', bg: '#FFF4C2', label: 'Star' },
  { id: 'owl', emoji: '🦉', bg: '#E8DFFF', label: 'Owl' },
];

export function Avatar({ id, size = 64 }: { id: AvatarId; size?: number }) {
  const a = AVATARS.find((x) => x.id === id) ?? AVATARS[0];
  return (
    <View
      accessibilityLabel={a.label}
      style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: a.bg, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ fontSize: size * 0.55 }}>{a.emoji}</Text>
    </View>
  );
}
