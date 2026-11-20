import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Modal,
  Alert,
} from 'react-native';
import {
  Boxes,
  RotateCw,
  Maximize2,
  Users,
  Volume2,
  Radio,
  Share2,
  X,
  Check,
  ChevronRight,
  Sparkles,
  Info,
} from 'lucide-react-native';
import { useEdzyStore } from '@/store/useEdzyStore';
import { colors } from '@/theme/colors';

const ANATOMICAL_NODES = [
  {
    id: 'Aorta',
    label: 'Aorta',
    role: 'Systemic Circulation',
    description: 'Main systemic arterial arch delivering high-pressure oxygenated blood to the body.',
    oxygenated: true,
    pressure: '120 mmHg',
  },
  {
    id: 'Left Ventricle',
    label: 'Left Ventricle',
    role: 'High-Pressure Pump',
    description: 'Features a 3x thicker muscular wall (myocardium) to overcome systemic vascular resistance.',
    oxygenated: true,
    pressure: '120 mmHg',
  },
  {
    id: 'Pulmonary Vein',
    label: 'Pulmonary Vein',
    role: 'Oxygen Inflow',
    description: 'Crucial exception: only vein carrying oxygen-rich blood directly from lungs to left atrium.',
    oxygenated: true,
    pressure: '8-10 mmHg',
  },
  {
    id: 'Bicuspid Valve',
    label: 'Bicuspid Valve',
    role: 'Atrioventricular Gate',
    description: 'Also called the Mitral Valve. Prevents backflow of oxygenated blood into left atrium.',
    oxygenated: true,
    pressure: 'One-Way Flap',
  },
];

export default function ArLabScreen() {
  const { activeArDirective, updateArDirective } = useEdzyStore();

  const [rotationAngle, setRotationAngle] = useState(45);
  const [explodeLevel, setExplodeLevel] = useState(activeArDirective.explodeFactor || 0.15);
  const [audioNarration, setAudioNarration] = useState(false);
  const [showCoStudyModal, setShowCoStudyModal] = useState(false);
  const [crdtSyncEnabled, setCrdtSyncEnabled] = useState(true);

  const activeNodeData =
    ANATOMICAL_NODES.find((n) => n.id === activeArDirective.targetNode) || ANATOMICAL_NODES[0];

  const handleSelectNode = (nodeId: string) => {
    const node = ANATOMICAL_NODES.find((n) => n.id === nodeId);
    if (!node) return;
    updateArDirective({
      targetNode: node.id,
      highlight: true,
      note: node.description,
      rotation: `0°, ${rotationAngle}°, 0°`,
    });
  };

  const handleRotate = () => {
    const nextAngle = (rotationAngle + 45) % 360;
    setRotationAngle(nextAngle);
    updateArDirective({
      rotation: `0°, ${nextAngle}°, 0°`,
    });
  };

  const handleExplodeToggle = (level: number) => {
    setExplodeLevel(level);
    updateArDirective({
      explodeFactor: level,
      note: level === 0 ? 'Model assembled.' : level === 0.5 ? 'Cross-section slice view.' : 'Fully exploded assembly view.',
    });
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Top Header & Session Bar */}
        <View style={styles.topBar}>
          <View>
            <Text style={styles.screenTitle}>{activeArDirective.modelName}</Text>
            <Text style={styles.screenSubtitle}>NCERT Biology Chapter 6 • Class 10</Text>
          </View>
          <TouchableOpacity
            style={styles.coStudyButton}
            onPress={() => setShowCoStudyModal(true)}
            activeOpacity={0.8}
          >
            <Users size={16} color={colors.student.secondaryLight} />
            <Text style={styles.coStudyButtonText}>Co-Study P2P</Text>
          </TouchableOpacity>
        </View>

        {/* 1. STRICT 16:9 SPATIAL AR VIEWPORT */}
        <View style={styles.viewportOuterWrapper}>
          <View style={styles.aspect169Container}>
            {/* Live WebRTC Telemetry HUD Overlay */}
            <View style={styles.telemetryOverlay}>
              <View style={styles.liveIndicator}>
                <View style={styles.greenPulse} />
                <Text style={styles.liveText}>
                  {activeArDirective.fps} FPS • {activeArDirective.latencyMs}ms WebRTC Sync
                </Text>
              </View>
              <View style={styles.aspectBadge}>
                <Text style={styles.aspectBadgeText}>16:9 SPATIAL COMPANION</Text>
              </View>
            </View>

            {/* Simulated 3D Spatial Geometry & Reticle */}
            <View style={styles.spatialScene}>
              {/* Coordinate Grid Lines */}
              <View style={styles.gridPlane}>
                <View style={[styles.axisLine, styles.axisX]} />
                <View style={[styles.axisLine, styles.axisY]} />
              </View>

              {/* Spatial 3D Heart Representation */}
              <View
                style={[
                  styles.heart3DRepresentation,
                  {
                    transform: [
                      { rotate: `${rotationAngle}deg` },
                      { scale: explodeLevel > 0.5 ? 1.15 : 1.0 },
                    ],
                  },
                ]}
              >
                {/* Aorta Arch */}
                <View
                  style={[
                    styles.meshPart,
                    styles.meshAorta,
                    activeNodeData.id === 'Aorta' && styles.meshHighlighted,
                  ]}
                >
                  <Text style={styles.meshLabel}>Aorta Arch</Text>
                </View>

                {/* Left Ventricle Chamber */}
                <View
                  style={[
                    styles.meshPart,
                    styles.meshLeftVentricle,
                    activeNodeData.id === 'Left Ventricle' && styles.meshHighlighted,
                  ]}
                >
                  <Text style={styles.meshLabel}>Left Ventricle</Text>
                </View>

                {/* Pulmonary Vein Trunk */}
                <View
                  style={[
                    styles.meshPart,
                    styles.meshPulmonary,
                    activeNodeData.id === 'Pulmonary Vein' && styles.meshHighlighted,
                  ]}
                >
                  <Text style={styles.meshLabel}>Pulmonary Vein</Text>
                </View>

                {/* Bicuspid Valve Flap */}
                <View
                  style={[
                    styles.meshPart,
                    styles.meshValve,
                    activeNodeData.id === 'Bicuspid Valve' && styles.meshHighlighted,
                  ]}
                >
                  <Text style={styles.meshLabel}>Bicuspid Valve</Text>
                </View>
              </View>

              {/* Target Reticle Pin */}
              <View style={styles.floatingReticleBox}>
                <View style={styles.reticleCrosshair} />
                <View style={styles.reticleTag}>
                  <Text style={styles.reticleTagText}>TARGET: {activeNodeData.label}</Text>
                  <Text style={styles.reticleTagMeta}>{activeNodeData.pressure}</Text>
                </View>
              </View>
            </View>

            {/* Bottom HUD Bar in Viewport */}
            <View style={styles.viewportBottomBar}>
              <Text style={styles.hudCoords}>
                ROT: {activeArDirective.rotation} • EXP: {Math.round(explodeLevel * 100)}%
              </Text>
              <TouchableOpacity
                style={styles.audioToggleButton}
                onPress={() => {
                  setAudioNarration(!audioNarration);
                  Alert.alert(
                    audioNarration ? 'Narration Muted' : 'Audio Narration Active',
                    audioNarration
                      ? 'Spatial audio disabled.'
                      : 'Playing CBSE NCERT pronunciation & functional breakdown in English/Hindi.'
                  );
                }}
              >
                <Volume2
                  size={14}
                  color={audioNarration ? colors.student.secondaryLight : colors.text.muted}
                />
                <Text
                  style={[
                    styles.audioToggleText,
                    audioNarration && { color: colors.student.secondaryLight },
                  ]}
                >
                  {audioNarration ? 'Narration ON' : 'Audio Guide'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* 2. INTERACTIVE ANATOMICAL NODE PILLS */}
        <View style={styles.sectionBlock}>
          <Text style={styles.sectionHeader}>Inspect Anatomical Nodes</Text>
          <View style={styles.nodePillsGrid}>
            {ANATOMICAL_NODES.map((node) => {
              const isSelected = node.id === activeNodeData.id;
              return (
                <TouchableOpacity
                  key={node.id}
                  style={[styles.nodePill, isSelected && styles.nodePillSelected]}
                  onPress={() => handleSelectNode(node.id)}
                  activeOpacity={0.8}
                >
                  <View
                    style={[
                      styles.nodeDot,
                      { backgroundColor: node.oxygenated ? '#EF4444' : '#3B82F6' },
                    ]}
                  />
                  <Text style={[styles.nodePillText, isSelected && styles.nodePillTextSelected]}>
                    {node.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* 3. ACTIVE NODE SYLLABUS CARD */}
        <View style={styles.activeNodeCard}>
          <View style={styles.nodeCardTopRow}>
            <View>
              <Text style={styles.nodeCardTitle}>{activeNodeData.label}</Text>
              <Text style={styles.nodeCardRole}>{activeNodeData.role}</Text>
            </View>
            <View style={styles.pressureBadge}>
              <Text style={styles.pressureBadgeText}>{activeNodeData.pressure}</Text>
            </View>
          </View>
          <Text style={styles.nodeCardDescription}>{activeNodeData.description}</Text>
          <View style={styles.ncertCitationRow}>
            <Info size={12} color={colors.student.primaryLight} />
            <Text style={styles.ncertCitationText}>
              Prescribed in NCERT Class 10 Biology Figure 6.10 (Section 6.4)
            </Text>
          </View>
        </View>

        {/* 4. 3D AXIS ROTATION & EXPLODE CONTROLS */}
        <View style={styles.sectionBlock}>
          <Text style={styles.sectionHeader}>3D Spatial Transformations</Text>

          {/* Rotation Controls */}
          <View style={styles.controlsRow}>
            <TouchableOpacity style={styles.controlBtn} onPress={handleRotate} activeOpacity={0.8}>
              <RotateCw size={16} color={colors.student.secondaryLight} />
              <Text style={styles.controlBtnText}>Orbit +45° ({rotationAngle}°)</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.controlBtn}
              onPress={() => {
                setRotationAngle(0);
                updateArDirective({ rotation: '0°, 0°, 0°' });
              }}
              activeOpacity={0.8}
            >
              <Maximize2 size={16} color={colors.text.secondary} />
              <Text style={styles.controlBtnText}>Reset Frustum</Text>
            </TouchableOpacity>
          </View>

          {/* Explode Factor Segmented Buttons */}
          <Text style={styles.subControlLabel}>EXPLOSION FACTOR (DISASSEMBLY):</Text>
          <View style={styles.explodeSegmentRow}>
            <TouchableOpacity
              style={[styles.segmentBtn, explodeLevel === 0 && styles.segmentBtnActive]}
              onPress={() => handleExplodeToggle(0)}
            >
              <Text style={[styles.segmentText, explodeLevel === 0 && styles.segmentTextActive]}>
                0% Intact
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.segmentBtn, explodeLevel === 0.5 && styles.segmentBtnActive]}
              onPress={() => handleExplodeToggle(0.5)}
            >
              <Text style={[styles.segmentText, explodeLevel === 0.5 && styles.segmentTextActive]}>
                50% Section
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.segmentBtn, explodeLevel === 1.0 && styles.segmentBtnActive]}
              onPress={() => handleExplodeToggle(1.0)}
            >
              <Text style={[styles.segmentText, explodeLevel === 1.0 && styles.segmentTextActive]}>
                100% Exploded
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* 5. CO-STUDY WITH CLASSMATE (P2P ROOM) MODAL */}
      <Modal
        visible={showCoStudyModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCoStudyModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <View style={styles.modalTitleRow}>
                <Users size={20} color={colors.student.secondaryLight} />
                <Text style={styles.modalTitle}>Co-Study P2P Spatial Room</Text>
              </View>
              <TouchableOpacity onPress={() => setShowCoStudyModal(false)}>
                <X size={20} color={colors.text.muted} />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSubtitle}>
              Collaborate in a synchronized 16:9 AR lab session with your classmates.
            </Text>

            {/* Room Code Card */}
            <View style={styles.roomCodeBox}>
              <Text style={styles.roomCodeLabel}>SECURE PEER-TO-PEER ROOM CODE</Text>
              <Text style={styles.roomCodeValue}>ROOM-DVPS-10A-HEART</Text>
              <Text style={styles.roomCodeSub}>WebRTC Low-Latency DataChannel Active</Text>
            </View>

            {/* Connected Peers List */}
            <Text style={styles.peersSectionTitle}>CONNECTED CLASSMATES (2 ACTIVE)</Text>
            <View style={styles.peersList}>
              <View style={styles.peerItem}>
                <View style={styles.peerAvatar}>
                  <Text style={styles.peerAvatarText}>A</Text>
                </View>
                <View style={styles.peerInfo}>
                  <Text style={styles.peerName}>Aarav Sharma (You - Host)</Text>
                  <Text style={styles.peerRole}>Class 10-A • Roll 24</Text>
                </View>
                <View style={styles.peerStatusPill}>
                  <Text style={styles.peerStatusText}>Transmitting</Text>
                </View>
              </View>

              <View style={styles.peerItem}>
                <View style={[styles.peerAvatar, { backgroundColor: colors.student.secondary }]}>
                  <Text style={styles.peerAvatarText}>P</Text>
                </View>
                <View style={styles.peerInfo}>
                  <Text style={styles.peerName}>Priya Patel (Peer)</Text>
                  <Text style={styles.peerRole}>Class 10-A • Roll 18</Text>
                </View>
                <View style={styles.peerStatusPill}>
                  <Text style={styles.peerStatusText}>Syncing 18ms</Text>
                </View>
              </View>
            </View>

            {/* CRDT Toggle */}
            <TouchableOpacity
              style={styles.crdtToggleRow}
              onPress={() => setCrdtSyncEnabled(!crdtSyncEnabled)}
              activeOpacity={0.8}
            >
              <View style={styles.crdtTextCol}>
                <Text style={styles.crdtTitle}>Mirrored CRDT Spatial Viewport</Text>
                <Text style={styles.crdtSub}>
                  When enabled, rotating the heart model mirrors Priya's screen simultaneously.
                </Text>
              </View>
              <View
                style={[
                  styles.toggleCheckbox,
                  crdtSyncEnabled && styles.toggleCheckboxActive,
                ]}
              >
                {crdtSyncEnabled && <Check size={14} color="#FFFFFF" />}
              </View>
            </TouchableOpacity>

            {/* Modal Actions */}
            <TouchableOpacity
              style={styles.modalPrimaryBtn}
              onPress={() => {
                setShowCoStudyModal(false);
                Alert.alert('P2P Spatial Sync Live', 'Your 3D viewport is now locked with Priya Patel.');
              }}
              activeOpacity={0.85}
            >
              <Text style={styles.modalPrimaryBtnText}>Resume Synced Lab Session</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  screenTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text.primary,
  },
  screenSubtitle: {
    fontSize: 11,
    color: colors.text.muted,
    marginTop: 2,
  },
  coStudyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(6, 182, 212, 0.12)',
    borderColor: colors.student.secondary,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    gap: 6,
  },
  coStudyButtonText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.student.secondaryLight,
  },
  viewportOuterWrapper: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    borderColor: colors.spatial.telemetryBorder,
    borderWidth: 1.5,
    backgroundColor: '#040711',
    shadowColor: colors.student.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  aspect169Container: {
    width: '100%',
    aspectRatio: 16 / 9,
    position: 'relative',
    justifyContent: 'space-between',
    padding: 10,
  },
  telemetryOverlay: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 10,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    borderColor: colors.cardBorder,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 6,
  },
  greenPulse: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.parent.primary,
  },
  liveText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.parent.primaryLight,
    fontFamily: 'Menlo',
  },
  aspectBadge: {
    backgroundColor: colors.spatial.telemetryBg,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },
  aspectBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.spatial.nodeActive,
    letterSpacing: 0.8,
  },
  spatialScene: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  gridPlane: {
    position: 'absolute',
    width: '80%',
    height: '80%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  axisLine: {
    position: 'absolute',
    backgroundColor: colors.spatial.gridLine,
  },
  axisX: {
    width: '100%',
    height: 1,
  },
  axisY: {
    width: 1,
    height: '100%',
  },
  heart3DRepresentation: {
    width: 140,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  meshPart: {
    position: 'absolute',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
  },
  meshAorta: {
    top: 0,
    width: 90,
    height: 36,
    backgroundColor: 'rgba(239, 68, 68, 0.3)',
    borderColor: '#EF4444',
  },
  meshLeftVentricle: {
    bottom: 0,
    right: 10,
    width: 65,
    height: 70,
    backgroundColor: 'rgba(220, 38, 38, 0.4)',
    borderColor: '#DC2626',
  },
  meshPulmonary: {
    top: 25,
    left: 10,
    width: 60,
    height: 40,
    backgroundColor: 'rgba(59, 130, 246, 0.35)',
    borderColor: '#3B82F6',
  },
  meshValve: {
    top: 45,
    width: 48,
    height: 24,
    backgroundColor: 'rgba(245, 158, 11, 0.3)',
    borderColor: '#F59E0B',
  },
  meshHighlighted: {
    borderColor: '#FFFFFF',
    borderWidth: 2.5,
    shadowColor: colors.student.secondaryLight,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 10,
    elevation: 8,
  },
  meshLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  floatingReticleBox: {
    position: 'absolute',
    bottom: 4,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(9, 13, 22, 0.9)',
    borderColor: colors.spatial.nodeActive,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  reticleCrosshair: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.spatial.nodeActive,
  },
  reticleTag: {},
  reticleTagText: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.spatial.nodeActive,
  },
  reticleTagMeta: {
    fontSize: 8,
    color: colors.text.muted,
  },
  viewportBottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 10,
  },
  hudCoords: {
    fontSize: 9,
    fontFamily: 'Menlo',
    color: colors.text.muted,
  },
  audioToggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  audioToggleText: {
    fontSize: 10,
    color: colors.text.muted,
    fontWeight: '600',
  },
  sectionBlock: {
    marginBottom: 16,
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 10,
  },
  nodePillsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  nodePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bentoCard,
    borderColor: colors.cardBorder,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  nodePillSelected: {
    borderColor: colors.student.secondaryLight,
    backgroundColor: 'rgba(6, 182, 212, 0.12)',
  },
  nodeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  nodePillText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text.secondary,
  },
  nodePillTextSelected: {
    color: colors.text.primary,
    fontWeight: '700',
  },
  activeNodeCard: {
    backgroundColor: colors.surface,
    borderColor: colors.cardBorder,
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
  },
  nodeCardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  nodeCardTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.text.primary,
  },
  nodeCardRole: {
    fontSize: 11,
    color: colors.student.secondaryLight,
    fontWeight: '600',
    marginTop: 1,
  },
  pressureBadge: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  pressureBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#EF4444',
  },
  nodeCardDescription: {
    fontSize: 12,
    color: colors.text.secondary,
    lineHeight: 17,
    marginBottom: 10,
  },
  ncertCitationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderTopColor: colors.cardBorder,
    borderTopWidth: 1,
    paddingTop: 8,
  },
  ncertCitationText: {
    fontSize: 10,
    color: colors.student.primaryLight,
  },
  controlsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  controlBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.bentoCard,
    borderColor: colors.cardBorder,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 10,
  },
  controlBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text.primary,
  },
  subControlLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.text.muted,
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  explodeSegmentRow: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 10,
    padding: 3,
    gap: 4,
  },
  segmentBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 8,
  },
  segmentBtnActive: {
    backgroundColor: colors.student.primary,
  },
  segmentText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.text.muted,
  },
  segmentTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: colors.bentoCard,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderColor: colors.cardBorder,
    borderWidth: 1,
    padding: 20,
    paddingBottom: 36,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text.primary,
  },
  modalSubtitle: {
    fontSize: 12,
    color: colors.text.secondary,
    marginTop: 4,
    marginBottom: 16,
  },
  roomCodeBox: {
    backgroundColor: colors.surface,
    borderColor: colors.student.secondary,
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  roomCodeLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.text.muted,
    letterSpacing: 1,
  },
  roomCodeValue: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.student.secondaryLight,
    letterSpacing: 1,
    marginVertical: 4,
    fontFamily: 'Menlo',
  },
  roomCodeSub: {
    fontSize: 10,
    color: colors.parent.primaryLight,
  },
  peersSectionTitle: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.text.muted,
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  peersList: {
    gap: 8,
    marginBottom: 16,
  },
  peerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 10,
    padding: 10,
    gap: 10,
  },
  peerAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.student.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  peerAvatarText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  peerInfo: {
    flex: 1,
  },
  peerName: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text.primary,
  },
  peerRole: {
    fontSize: 10,
    color: colors.text.muted,
  },
  peerStatusPill: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  peerStatusText: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.parent.primaryLight,
  },
  crdtToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(99, 102, 241, 0.08)',
    borderColor: colors.student.border,
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 18,
    gap: 12,
  },
  crdtTextCol: {
    flex: 1,
  },
  crdtTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text.primary,
  },
  crdtSub: {
    fontSize: 10,
    color: colors.text.secondary,
    marginTop: 2,
    lineHeight: 14,
  },
  toggleCheckbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderColor: colors.cardBorder,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.surface,
  },
  toggleCheckboxActive: {
    backgroundColor: colors.student.primary,
    borderColor: colors.student.primary,
  },
  modalPrimaryBtn: {
    backgroundColor: colors.student.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  modalPrimaryBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
