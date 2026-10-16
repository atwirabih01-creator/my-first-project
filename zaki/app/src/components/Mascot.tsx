// Zaki: a friendly robot-owl. Clearly a cartoon machine, never a person.
import { useEffect, useState } from 'react';
import { Animated, Easing, Platform, View } from 'react-native';
import Svg, { Circle, Ellipse, G, Path, Rect } from 'react-native-svg';

import { C } from '@/constants/theme';

type Mood = 'happy' | 'thinking' | 'calm' | 'cheer';

export function Mascot({ size = 120, mood = 'happy', animate = true }: { size?: number; mood?: Mood; animate?: boolean }) {
  const [bob] = useState(() => new Animated.Value(0));

  useEffect(() => {
    if (!animate) return;
    const speed = mood === 'thinking' ? 600 : mood === 'cheer' ? 400 : 1400;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(bob, { toValue: 1, duration: speed, easing: Easing.inOut(Easing.quad), useNativeDriver: Platform.OS !== 'web' }),
        Animated.timing(bob, { toValue: 0, duration: speed, easing: Easing.inOut(Easing.quad), useNativeDriver: Platform.OS !== 'web' }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [animate, mood, bob]);

  const dy = bob.interpolate({ inputRange: [0, 1], outputRange: [0, mood === 'calm' ? -2 : -6] });
  const rot = bob.interpolate({ inputRange: [0, 1], outputRange: mood === 'thinking' ? ['-4deg', '4deg'] : ['0deg', '0deg'] });

  const eyeLook = mood === 'thinking' ? -3 : 0;
  const lightColor = mood === 'thinking' ? C.mint : C.sun;

  return (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel="Zaki, a friendly robot owl"
      style={{ width: size, height: size * 1.15, alignItems: 'center', justifyContent: 'center' }}>
      <Animated.View style={{ transform: [{ translateY: dy }, { rotate: rot }] }}>
        <Svg width={size} height={size * 1.15} viewBox="0 0 120 138">
          {/* antenna */}
          <Rect x={58} y={6} width={4} height={14} rx={2} fill={C.owlDark} />
          <Circle cx={60} cy={6} r={6} fill={lightColor} stroke="#E0A800" strokeWidth={1} />
          {/* ear tufts */}
          <Path d="M24 34 L30 14 L44 28 Z" fill={C.owlBody} />
          <Path d="M96 34 L90 14 L76 28 Z" fill={C.owlBody} />
          {/* wings */}
          <Ellipse cx={18} cy={82} rx={10} ry={24} fill={C.owlDark} />
          <Ellipse cx={102} cy={82} rx={10} ry={24} fill={C.owlDark} />
          {/* body */}
          <Rect x={18} y={22} width={84} height={100} rx={38} fill={C.owlBody} />
          {/* belly screen */}
          <Rect x={36} y={78} width={48} height={34} rx={14} fill={C.owlBelly} />
          {/* little star on belly screen */}
          <Path
            d="M60 85 L62.6 91 L69 91.5 L64 95.6 L65.6 102 L60 98.4 L54.4 102 L56 95.6 L51 91.5 L57.4 91 Z"
            fill={C.sun}
          />
          {/* bolts */}
          <Circle cx={26} cy={60} r={3} fill={C.owlDark} />
          <Circle cx={94} cy={60} r={3} fill={C.owlDark} />
          {/* eyes (owl rings) */}
          <G>
            <Circle cx={44} cy={52} r={17} fill="#FFFFFF" stroke={C.text} strokeWidth={3} />
            <Circle cx={76} cy={52} r={17} fill="#FFFFFF" stroke={C.text} strokeWidth={3} />
            {mood === 'calm' ? (
              <>
                <Path d="M36 54 Q44 47 52 54" stroke={C.text} strokeWidth={3.5} fill="none" strokeLinecap="round" />
                <Path d="M68 54 Q76 47 84 54" stroke={C.text} strokeWidth={3.5} fill="none" strokeLinecap="round" />
              </>
            ) : (
              <>
                <Circle cx={44 + eyeLook} cy={52 + eyeLook} r={7} fill={C.text} />
                <Circle cx={76 + eyeLook} cy={52 + eyeLook} r={7} fill={C.text} />
                <Circle cx={46 + eyeLook} cy={49 + eyeLook} r={2.2} fill="#FFFFFF" />
                <Circle cx={78 + eyeLook} cy={49 + eyeLook} r={2.2} fill="#FFFFFF" />
              </>
            )}
          </G>
          {/* cheeks */}
          <Circle cx={30} cy={70} r={4} fill={C.cheek} opacity={0.85} />
          <Circle cx={90} cy={70} r={4} fill={C.cheek} opacity={0.85} />
          {/* beak */}
          <Path d="M54 64 L66 64 L60 74 Z" fill={C.beak} />
          {/* feet */}
          <Ellipse cx={46} cy={124} rx={9} ry={5} fill={C.beak} />
          <Ellipse cx={74} cy={124} rx={9} ry={5} fill={C.beak} />
          {mood === 'cheer' ? (
            <>
              <Path d="M8 40 L12 32 L16 40 Z" fill={C.sun} />
              <Path d="M104 40 L108 32 L112 40 Z" fill={C.sun} />
            </>
          ) : null}
        </Svg>
      </Animated.View>
    </View>
  );
}
