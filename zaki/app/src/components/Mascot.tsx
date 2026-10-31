// Zaki: a friendly robot-owl. Clearly a cartoon machine, never a person.
// It is alive but gentle: a slow bob and the odd blink, a wave hello, a happy hop with
// sparkles when the child gets something right, a thoughtful head tilt when they don't.
// Everything is switched off when the phone asks for reduced motion (or animate={false}).
import { useEffect, useState } from 'react';
import { Animated, Easing, View } from 'react-native';
import Svg, { Circle, Ellipse, G, Path, Rect } from 'react-native-svg';

import { C } from '@/constants/theme';
import { NATIVE_DRIVER, useReducedMotion } from '@/lib/motion';

type Mood = 'happy' | 'thinking' | 'calm' | 'cheer';
/** One-off moves: 'wave' (hello), 'hop' (yay!). Re-run by changing actionKey. */
type Action = 'wave' | 'hop';

const IDLE: Record<Mood, { ms: number; dy: number }> = {
  calm: { ms: 2200, dy: -2 },
  happy: { ms: 1500, dy: -5 },
  thinking: { ms: 1800, dy: -2 },
  cheer: { ms: 700, dy: -4 },
};

export function Mascot({
  size = 120,
  mood = 'happy',
  animate = true,
  action,
  actionKey = 0,
}: {
  size?: number;
  mood?: Mood;
  animate?: boolean;
  action?: Action;
  actionKey?: number;
}) {
  const reduced = useReducedMotion();
  const live = animate && !reduced;
  const [bob] = useState(() => new Animated.Value(0));
  const [hop] = useState(() => new Animated.Value(0));
  const [twinkle] = useState(() => new Animated.Value(0));
  const [blink, setBlink] = useState(false);
  const [wing, setWing] = useState(0); // 0 = resting, 1/2 = waving frames

  // Gentle idle bob (and a slow head sway while thinking).
  useEffect(() => {
    if (!live) return;
    const { ms } = IDLE[mood];
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(bob, { toValue: 1, duration: ms, easing: Easing.inOut(Easing.quad), useNativeDriver: NATIVE_DRIVER }),
        Animated.timing(bob, { toValue: 0, duration: ms, easing: Easing.inOut(Easing.quad), useNativeDriver: NATIVE_DRIVER }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [live, mood, bob]);

  // Blink every few seconds (not when calm: the eyes are already softly closed).
  useEffect(() => {
    if (!live || mood === 'calm') return;
    let t: ReturnType<typeof setTimeout>;
    const next = () => {
      t = setTimeout(() => {
        setBlink(true);
        t = setTimeout(() => {
          setBlink(false);
          next();
        }, 140);
      }, 2600 + Math.random() * 2600);
    };
    next();
    return () => clearTimeout(t);
  }, [live, mood]);

  // Happy hop + twinkling sparkles: on 'cheer', and whenever a 'hop' action is asked for.
  const doHop = mood === 'cheer' || action === 'hop';
  useEffect(() => {
    if (!live || !doHop) return;
    const one = Animated.sequence([
      Animated.timing(hop, { toValue: 1, duration: 190, easing: Easing.out(Easing.quad), useNativeDriver: NATIVE_DRIVER }),
      Animated.timing(hop, { toValue: 0, duration: 380, easing: Easing.bounce, useNativeDriver: NATIVE_DRIVER }),
    ]);
    const anim = Animated.parallel([
      Animated.sequence([one, Animated.delay(60), Animated.timing(hop, { toValue: 0.55, duration: 160, easing: Easing.out(Easing.quad), useNativeDriver: NATIVE_DRIVER }), Animated.timing(hop, { toValue: 0, duration: 300, easing: Easing.bounce, useNativeDriver: NATIVE_DRIVER })]),
      Animated.loop(
        Animated.sequence([
          Animated.timing(twinkle, { toValue: 1, duration: 360, useNativeDriver: NATIVE_DRIVER }),
          Animated.timing(twinkle, { toValue: 0, duration: 360, useNativeDriver: NATIVE_DRIVER }),
        ]),
        { iterations: 3 },
      ),
    ]);
    anim.start();
    return () => anim.stop();
  }, [live, doHop, actionKey, hop, twinkle]);

  // Wave hello: flap the wing a few times, then rest.
  useEffect(() => {
    if (!live || action !== 'wave') return;
    const frames = [1, 2, 1, 2, 1, 2, 0];
    let i = 0;
    let t = setTimeout(function step() {
      setWing(frames[i]);
      i++;
      if (i < frames.length) t = setTimeout(step, 210);
    }, 300);
    return () => clearTimeout(t);
  }, [live, action, actionKey]);

  const dy = Animated.add(
    bob.interpolate({ inputRange: [0, 1], outputRange: [0, live ? IDLE[mood].dy : 0] }),
    hop.interpolate({ inputRange: [0, 1], outputRange: [0, -size * 0.14] }),
  );
  const rot = bob.interpolate({ inputRange: [0, 1], outputRange: mood === 'thinking' && live ? ['-9deg', '-3deg'] : ['0deg', '0deg'] });
  const scale = hop.interpolate({ inputRange: [0, 1], outputRange: [1, 1.06] });
  const sparkle = { opacity: twinkle, transform: [{ scale: twinkle.interpolate({ inputRange: [0, 1], outputRange: [0.5, 1.15] }) }] };

  const eyeLook = mood === 'thinking' ? -3 : 0;
  const lightColor = mood === 'thinking' ? C.mint : C.sun;
  const eyesClosed = mood === 'calm' || blink;

  return (
    <View
      // Decorative (the screen text says who Zaki is): hidden from TalkBack / VoiceOver.
      accessible={false}
      aria-hidden
      importantForAccessibility="no-hide-descendants"
      accessibilityElementsHidden
      style={{ width: size, height: size * 1.15, alignItems: 'center', justifyContent: 'center' }}>
      <Animated.View style={{ transform: [{ translateY: dy }, { rotate: mood === 'thinking' && !live ? '-6deg' : rot }, { scale }] }}>
        <Svg width={size} height={size * 1.15} viewBox="0 0 120 138">
          {/* antenna */}
          <Rect x={58} y={6} width={4} height={14} rx={2} fill={C.owlDark} />
          <Circle cx={60} cy={6} r={6} fill={lightColor} stroke="#E0A800" strokeWidth={1} />
          {/* ear tufts */}
          <Path d="M24 34 L30 14 L44 28 Z" fill={C.owlBody} />
          <Path d="M96 34 L90 14 L76 28 Z" fill={C.owlBody} />
          {/* wings (the right one waves hello) */}
          <Ellipse cx={18} cy={82} rx={10} ry={24} fill={C.owlDark} />
          {wing === 0 ? (
            <Ellipse cx={102} cy={82} rx={10} ry={24} fill={C.owlDark} />
          ) : (
            <Ellipse cx={98} cy={58} rx={8} ry={19} fill={C.owlDark} transform={`rotate(${wing === 1 ? 12 : 30} 98 74)`} />
          )}
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
            {eyesClosed ? (
              <>
                <Path d={mood === 'calm' ? 'M36 54 Q44 47 52 54' : 'M35 53 Q44 57 53 53'} stroke={C.text} strokeWidth={3.5} fill="none" strokeLinecap="round" />
                <Path d={mood === 'calm' ? 'M68 54 Q76 47 84 54' : 'M67 53 Q76 57 85 53'} stroke={C.text} strokeWidth={3.5} fill="none" strokeLinecap="round" />
              </>
            ) : (
              <>
                <Circle cx={44 + eyeLook} cy={52 + eyeLook} r={mood === 'cheer' ? 8 : 7} fill={C.text} />
                <Circle cx={76 + eyeLook} cy={52 + eyeLook} r={mood === 'cheer' ? 8 : 7} fill={C.text} />
                <Circle cx={46 + eyeLook} cy={49 + eyeLook} r={mood === 'cheer' ? 3 : 2.2} fill="#FFFFFF" />
                <Circle cx={78 + eyeLook} cy={49 + eyeLook} r={mood === 'cheer' ? 3 : 2.2} fill="#FFFFFF" />
              </>
            )}
          </G>
          {/* cheeks */}
          <Circle cx={30} cy={70} r={mood === 'cheer' ? 5 : 4} fill={C.cheek} opacity={0.85} />
          <Circle cx={90} cy={70} r={mood === 'cheer' ? 5 : 4} fill={C.cheek} opacity={0.85} />
          {/* beak */}
          <Path d="M54 64 L66 64 L60 74 Z" fill={C.beak} />
          {/* feet */}
          <Ellipse cx={46} cy={124} rx={9} ry={5} fill={C.beak} />
          <Ellipse cx={74} cy={124} rx={9} ry={5} fill={C.beak} />
          {mood === 'cheer' && !live ? (
            <>
              <Path d="M8 40 L12 32 L16 40 Z" fill={C.sun} />
              <Path d="M104 40 L108 32 L112 40 Z" fill={C.sun} />
            </>
          ) : null}
        </Svg>
      </Animated.View>
      {live && doHop ? (
        <>
          <Animated.Text style={[{ position: 'absolute', top: 0, left: 0, fontSize: size * 0.17 }, sparkle]}>✨</Animated.Text>
          <Animated.Text style={[{ position: 'absolute', top: size * 0.12, right: 0, fontSize: size * 0.14 }, sparkle]}>⭐</Animated.Text>
          <Animated.Text style={[{ position: 'absolute', bottom: size * 0.2, right: size * 0.02, fontSize: size * 0.12 }, sparkle]}>✨</Animated.Text>
        </>
      ) : null}
    </View>
  );
}
