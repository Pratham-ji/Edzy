import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import Svg, {
  Path,
  Circle,
  Line,
  Rect,
  G,
  Defs,
  LinearGradient,
  Stop,
  Text as SvgText,
} from 'react-native-svg';
import { colors } from '@/theme/colors';

interface HolographicHeartPreviewProps {
  targetNode?: string;
  fps?: number;
  latencyMs?: number;
  rotation?: string;
}

export const HolographicHeartPreview: React.FC<HolographicHeartPreviewProps> = ({
  targetNode = 'Aorta',
  fps = 60,
  latencyMs = 12,
  rotation = '0°, 45°, 0°',
}) => {
  return (
    <View style={styles.container}>
      <Svg viewBox="0 0 400 225" style={styles.svg}>
        <Defs>
          {/* Cyan Glow Gradient */}
          <LinearGradient id="cyanGlow" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#06B6D4" stopOpacity={0.9} />
            <Stop offset="100%" stopColor="#3B82F6" stopOpacity={0.4} />
          </LinearGradient>

          {/* Indigo Flow Gradient */}
          <LinearGradient id="indigoFlow" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor="#818CF8" stopOpacity={0.8} />
            <Stop offset="100%" stopColor="#4F46E5" stopOpacity={0.3} />
          </LinearGradient>

          {/* ECG Pulse Gradient */}
          <LinearGradient id="ecgGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <Stop offset="0%" stopColor="#06B6D4" stopOpacity={0.1} />
            <Stop offset="40%" stopColor="#06B6D4" stopOpacity={0.9} />
            <Stop offset="60%" stopColor="#10B981" stopOpacity={1} />
            <Stop offset="100%" stopColor="#06B6D4" stopOpacity={0.1} />
          </LinearGradient>
        </Defs>

        {/* 1. Subtle 3D Coordinate Grid Lines */}
        <G opacity={0.18}>
          <Line x1="40" y1="20" x2="360" y2="20" stroke="#06B6D4" strokeWidth="0.8" strokeDasharray="4 6" />
          <Line x1="40" y1="75" x2="360" y2="75" stroke="#06B6D4" strokeWidth="0.8" strokeDasharray="4 6" />
          <Line x1="40" y1="130" x2="360" y2="130" stroke="#06B6D4" strokeWidth="0.8" strokeDasharray="4 6" />
          <Line x1="40" y1="185" x2="360" y2="185" stroke="#06B6D4" strokeWidth="0.8" strokeDasharray="4 6" />

          <Line x1="80" y1="15" x2="80" y2="195" stroke="#06B6D4" strokeWidth="0.8" strokeDasharray="4 6" />
          <Line x1="160" y1="15" x2="160" y2="195" stroke="#06B6D4" strokeWidth="0.8" strokeDasharray="4 6" />
          <Line x1="240" y1="15" x2="240" y2="195" stroke="#06B6D4" strokeWidth="0.8" strokeDasharray="4 6" />
          <Line x1="320" y1="15" x2="320" y2="195" stroke="#06B6D4" strokeWidth="0.8" strokeDasharray="4 6" />
        </G>

        {/* Corner Viewport Framing Brackets */}
        <G stroke="#06B6D4" strokeWidth="1.5" opacity={0.6}>
          <Path d="M 15 28 L 15 15 L 28 15" fill="none" />
          <Path d="M 385 28 L 385 15 L 372 15" fill="none" />
          <Path d="M 15 197 L 15 210 L 28 210" fill="none" />
          <Path d="M 385 197 L 385 210 L 372 210" fill="none" />
        </G>

        {/* 2. Stylized Anatomical Heart Wireframe Meshes */}
        {/* Left Ventricle & Apex Contour */}
        <Path
          d="M 195 95 C 170 110, 145 135, 160 170 C 170 195, 195 208, 205 208 C 220 208, 255 180, 260 145 C 265 110, 235 95, 195 95 Z"
          fill="none"
          stroke="url(#cyanGlow)"
          strokeWidth="1.8"
        />

        {/* Inner Volumetric Wireframe Depth Contours */}
        <Path
          d="M 185 105 C 168 120, 160 145, 172 170 C 182 190, 200 200, 205 200 C 215 200, 242 175, 245 145 C 248 120, 225 105, 185 105 Z"
          fill="none"
          stroke="#06B6D4"
          strokeWidth="0.9"
          strokeDasharray="3 3"
          opacity={0.4}
        />

        {/* Right Atrium & Superior Vena Cava Branch */}
        <Path
          d="M 155 70 L 155 105 C 140 110, 132 125, 140 145 C 145 155, 155 160, 160 160"
          fill="none"
          stroke="url(#indigoFlow)"
          strokeWidth="1.5"
          opacity={0.8}
        />
        {/* Superior Vena Cava Tube Top */}
        <Path d="M 148 55 L 148 75 M 162 55 L 162 75" stroke="#818CF8" strokeWidth="1.2" opacity={0.6} />

        {/* Pulmonary Trunk & Left/Right Arteries */}
        <Path
          d="M 188 88 C 188 65, 175 52, 160 48 M 188 65 C 205 60, 225 62, 235 68"
          fill="none"
          stroke="#38BDF8"
          strokeWidth="2"
        />

        {/* =========================================================================
            AORTA ARCH (MAIN HIGHLIGHT & RETICLE FOCUS)
            ========================================================================= */}
        {/* Ascending Aorta -> Arch -> Descending Aorta */}
        <Path
          d="M 198 92 C 198 60, 202 38, 220 35 C 238 32, 252 48, 250 85 L 248 125"
          fill="none"
          stroke="#06B6D4"
          strokeWidth="2.8"
        />

        {/* Aortic Arch 3 Major Arteries (Brachiocephalic, Carotid, Subclavian) */}
        <Path d="M 215 36 L 210 20" stroke="#06B6D4" strokeWidth="1.8" strokeLinecap="round" />
        <Path d="M 226 34 L 226 18" stroke="#06B6D4" strokeWidth="1.8" strokeLinecap="round" />
        <Path d="M 237 36 L 242 20" stroke="#06B6D4" strokeWidth="1.8" strokeLinecap="round" />

        {/* Depth Grid Lines crossing the heart volume */}
        <Path d="M 160 140 C 190 155, 230 150, 255 135" stroke="#06B6D4" strokeWidth="0.8" opacity={0.35} />
        <Path d="M 168 165 C 195 178, 222 172, 240 158" stroke="#06B6D4" strokeWidth="0.8" opacity={0.35} />

        {/* 3. Real-time ECG Pulse Waveform across middle-lower section */}
        <Path
          d="M 25 180 L 105 180 L 115 170 L 122 195 L 132 142 L 142 205 L 150 176 L 160 180 L 260 180 L 270 172 L 278 192 L 288 150 L 298 200 L 305 178 L 375 180"
          fill="none"
          stroke="url(#ecgGrad)"
          strokeWidth="1.6"
        />

        {/* 4. AORTA TARGETING RETICLE & HUD CALLOUT */}
        {/* Reticle Rings centered at Arch (228, 42) */}
        <G>
          {/* Outer dashed radar circle */}
          <Circle
            cx="228"
            cy="42"
            r="20"
            fill="none"
            stroke="#06B6D4"
            strokeWidth="1.2"
            strokeDasharray="3 4"
            opacity={0.85}
          />
          {/* Inner ring */}
          <Circle
            cx="228"
            cy="42"
            r="11"
            fill="rgba(6, 182, 212, 0.15)"
            stroke="#22D3EE"
            strokeWidth="1"
          />
          {/* Center glowing dot */}
          <Circle cx="228" cy="42" r="3.5" fill="#22D3EE" />

          {/* Crosshairs */}
          <Line x1="202" y1="42" x2="212" y2="42" stroke="#22D3EE" strokeWidth="1.2" />
          <Line x1="244" y1="42" x2="254" y2="42" stroke="#22D3EE" strokeWidth="1.2" />
          <Line x1="228" y1="16" x2="228" y2="26" stroke="#22D3EE" strokeWidth="1.2" />
          <Line x1="228" y1="58" x2="228" y2="68" stroke="#22D3EE" strokeWidth="1.2" />

          {/* Leader line to HUD Callout */}
          <Path d="M 248 42 L 285 42 L 300 28 L 360 28" fill="none" stroke="#06B6D4" strokeWidth="1.2" />
          <Rect x="285" y="14" width="75" height="13" rx="3" fill="rgba(6, 182, 212, 0.2)" stroke="#06B6D4" strokeWidth="0.8" />
          <SvgText x="290" y="24" fill="#22D3EE" fontSize="7.5" fontWeight="bold" fontFamily="monospace">
            FOCUS: {targetNode.toUpperCase()}
          </SvgText>
        </G>

        {/* Top-Left Telemetry Tags */}
        <SvgText x="24" y="32" fill="#06B6D4" fontSize="8" fontWeight="bold" fontFamily="monospace" opacity={0.9}>
          AR SPATIAL NODE // 16:9 LAB
        </SvgText>
        <SvgText x="24" y="44" fill="#94A3B8" fontSize="7" fontFamily="monospace" opacity={0.8}>
          MODEL: HUMAN_HEART_VOLUMETRIC
        </SvgText>

        {/* Top-Right Spatial Telemetry */}
        <SvgText x="375" y="52" fill="#22D3EE" fontSize="7.5" fontWeight="bold" fontFamily="monospace" textAnchor="end">
          {fps} FPS • {latencyMs}ms WebRTC
        </SvgText>
        <SvgText x="375" y="63" fill="#64748B" fontSize="6.5" fontFamily="monospace" textAnchor="end">
          ROT: {rotation}
        </SvgText>

        {/* Bottom Labels */}
        <SvgText x="24" y="202" fill="#38BDF8" fontSize="7.5" fontWeight="bold" fontFamily="monospace">
          NCERT BIO CH 6.2 • SYSTEMIC CIRCULATION
        </SvgText>
        <SvgText x="375" y="202" fill="#10B981" fontSize="7" fontWeight="bold" fontFamily="monospace" textAnchor="end">
          [● AR ANCHOR LOCKED]
        </SvgText>
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  svg: {
    width: '100%',
    height: '100%',
  },
});

export default HolographicHeartPreview;
