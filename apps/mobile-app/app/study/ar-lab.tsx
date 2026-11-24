import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  Alert,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Boxes,
  RotateCw,
  Maximize2,
  Users,
  Volume2,
  Share2,
  X,
  Check,
  ChevronRight,
  Sparkles,
  Info,
  Heart,
  Eye,
  Layers,
} from 'lucide-react-native';
import { useEdzyStore } from '@/store/useEdzyStore';
import { colors, useAppTheme } from '@/theme/colors';

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
  const insets = useSafeAreaInsets();
  const { theme } = useAppTheme();
  const { activeArDirective, updateArDirective } = useEdzyStore();

  const [rotationAngle, setRotationAngle] = useState(45);
  const [explodeLevel, setExplodeLevel] = useState(activeArDirective.explodeFactor || 0.15);
  const [audioNarration, setAudioNarration] = useState(false);
  const [showCoStudyModal, setShowCoStudyModal] = useState(false);

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
    <SafeAreaView style={[styles.safeContainer, { backgroundColor: theme.canvas }]} edges={['bottom', 'left', 'right']}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: 16,
            paddingHorizontal: 16,
            paddingBottom: Math.max(insets.bottom, 24) + 16,
          },
        ]}
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="never"
      >
        {/* ─── 3D VIEWPORT CONTAINER (Dark Charcoal inside only) ─── */}
        <View style={styles.viewportOuterCard}>
          <View style={styles.viewport3D}>
            {/* Model Title Overlay */}
            <View style={styles.viewportTopOverlay}>
              <View style={styles.modelTagBadge}>
                <Boxes size={12} color="#FFFFFF" />
                <Text style={styles.modelTagText}>3D Interactive Lab</Text>
              </View>
              <View style={styles.focusPill}>
                <Text style={styles.focusPillText}>Target: {activeNodeData.label}</Text>
              </View>
            </View>

            {/* Visual Placeholder for 3D model */}
            <View style={styles.centerGraphic}>
              <View style={styles.graphicCircle}>
                <Heart size={54} color="#EF4444" fill="rgba(239, 68, 68, 0.2)" />
              </View>
              <Text style={styles.graphicTitle}>{activeArDirective.modelName}</Text>
              <Text style={styles.graphicSubtitle}>
                Interactive 3D GLB viewport ready for AR rendering
              </Text>
            </View>

            {/* Viewport Control Bar */}
            <View style={styles.viewportControlsBar}>
              <TouchableOpacity
                style={styles.vpButton}
                onPress={handleRotate}
                activeOpacity={0.8}
              >
                <RotateCw size={14} color="#FFFFFF" />
                <Text style={styles.vpButtonText}>Rotate {rotationAngle}°</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.vpButton}
                onPress={() => handleExplodeToggle(explodeLevel === 0 ? 0.5 : explodeLevel === 0.5 ? 1 : 0)}
                activeOpacity={0.8}
              >
                <Layers size={14} color="#FFFFFF" />
                <Text style={styles.vpButtonText}>
                  {explodeLevel === 0 ? 'Solid' : explodeLevel === 0.5 ? 'Cross-Section' : 'Exploded'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.vpButton, audioNarration && styles.vpButtonActive]}
                onPress={() => {
                  setAudioNarration(!audioNarration);
                  Alert.alert(
                    audioNarration ? 'Audio Paused' : 'Voice Explainer',
                    audioNarration ? 'Narrator stopped.' : `Playing audio explanation for ${activeNodeData.label}.`
                  );
                }}
                activeOpacity={0.8}
              >
                <Volume2 size={14} color="#FFFFFF" />
                <Text style={styles.vpButtonText}>{audioNarration ? 'Audio ON' : 'Audio'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* ─── ANATOMICAL PART SELECTOR (Blinkit Style Chips) ─── */}
        <View style={styles.selectorCard}>
          <Text style={styles.sectionTitle}>Select Organ Component</Text>
          <View style={styles.nodesRow}>
            {ANATOMICAL_NODES.map((node) => {
              const isSelected = node.id === activeNodeData.id;
              return (
                <TouchableOpacity
                  key={node.id}
                  style={[styles.nodeChip, isSelected && styles.nodeChipActive]}
                  onPress={() => handleSelectNode(node.id)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.nodeChipText, isSelected && styles.nodeChipTextActive]}>
                    {node.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* ─── COMPONENT DETAIL CARD ─── */}
        <View style={styles.detailCard}>
          <View style={styles.detailCardHeader}>
            <View>
              <Text style={styles.detailTitle}>{activeNodeData.label}</Text>
              <Text style={styles.detailRole}>{activeNodeData.role}</Text>
            </View>
            <View style={styles.pressureBadge}>
              <Text style={styles.pressureBadgeText}>{activeNodeData.pressure}</Text>
            </View>
          </View>

          <Text style={styles.detailDescription}>{activeNodeData.description}</Text>

          <View style={styles.detailStatsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statBoxLabel}>BLOOD TYPE</Text>
              <Text style={[styles.statBoxValue, { color: colors.status.error }]}>
                Oxygen-Rich (O₂)
              </Text>
            </View>
            <View style={styles.statBoxDivider} />
            <View style={styles.statBox}>
              <Text style={styles.statBoxLabel}>CBSE EXAM RELEVANCE</Text>
              <Text style={[styles.statBoxValue, { color: colors.brand.primary }]}>
                Very High (5 Marks)
              </Text>
            </View>
          </View>
        </View>

        {/* ─── CO-STUDY PEER SESSION CARD ─── */}
        <TouchableOpacity
          style={styles.coStudyCard}
          onPress={() => setShowCoStudyModal(true)}
          activeOpacity={0.85}
        >
          <View style={styles.coStudyLeft}>
            <View style={styles.iconCircleIndigo}>
              <Users size={18} color={colors.brand.primary} />
            </View>
            <View>
              <Text style={styles.coStudyTitle}>Collaborative Classroom Session</Text>
              <Text style={styles.coStudySub}>Sync 3D model orientation with classmates</Text>
            </View>
          </View>
          <ChevronRight size={16} color={colors.brand.primary} />
        </TouchableOpacity>
      </ScrollView>

      {/* ─── CO-STUDY MODAL ─── */}
      <Modal visible={showCoStudyModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View style={styles.iconCircleIndigo}>
                <Users size={20} color={colors.brand.primary} />
              </View>
              <View style={styles.modalHeaderText}>
                <Text style={styles.modalTitle}>Class 10-A Lab Session</Text>
                <Text style={styles.modalSubtitle}>Doon Valley Public School</Text>
              </View>
              <TouchableOpacity
                onPress={() => setShowCoStudyModal(false)}
                style={styles.closeBtn}
                activeOpacity={0.7}
              >
                <X size={18} color={colors.text.secondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.peerList}>
              <View style={styles.peerRow}>
                <View style={styles.peerAvatar}>
                  <Text style={styles.peerAvatarText}>AS</Text>
                </View>
                <View style={styles.peerInfo}>
                  <Text style={styles.peerName}>Aarav Sharma (You)</Text>
                  <Text style={styles.peerStatus}>Active Presenter</Text>
                </View>
                <View style={styles.hostBadge}>
                  <Text style={styles.hostBadgeText}>Host</Text>
                </View>
              </View>

              <View style={styles.peerRow}>
                <View style={[styles.peerAvatar, { backgroundColor: colors.parent.primary }]}>
                  <Text style={styles.peerAvatarText}>AG</Text>
                </View>
                <View style={styles.peerInfo}>
                  <Text style={styles.peerName}>Ananya Gupta</Text>
                  <Text style={styles.peerStatus}>Viewing Aorta section</Text>
                </View>
              </View>

              <View style={styles.peerRow}>
                <View style={[styles.peerAvatar, { backgroundColor: colors.streak.primary }]}>
                  <Text style={styles.peerAvatarText}>RM</Text>
                </View>
                <View style={styles.peerInfo}>
                  <Text style={styles.peerName}>Rohan Mehra</Text>
                  <Text style={styles.peerStatus}>Viewing Left Ventricle</Text>
                </View>
              </View>
            </View>

            <TouchableOpacity
              style={styles.modalActionBtn}
              onPress={() => {
                setShowCoStudyModal(false);
                Alert.alert('Session Synced', 'Your 3D model perspective is now broadcasted to 2 peers.');
              }}
              activeOpacity={0.85}
            >
              <Text style={styles.modalActionBtnText}>Broadcast Perspective</Text>
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
    gap: 14,
  },
  viewportOuterCard: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: colors.shadow.color,
    shadowOffset: colors.shadow.offset,
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 4,
  },
  viewport3D: {
    height: 280,
    backgroundColor: '#111827', // Only dark charcoal element
    justifyContent: 'space-between',
    padding: 14,
  },
  viewportTopOverlay: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modelTagBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  modelTagText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  focusPill: {
    backgroundColor: colors.brand.primary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  focusPillText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  centerGraphic: {
    alignItems: 'center',
  },
  graphicCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  graphicTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  graphicSubtitle: {
    color: '#9CA3AF',
    fontSize: 11,
    marginTop: 2,
  },
  viewportControlsBar: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
  },
  vpButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 14,
  },
  vpButtonActive: {
    backgroundColor: colors.brand.primary,
  },
  vpButtonText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },

  // Selector Card
  selectorCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    padding: 16,
    shadowColor: colors.shadow.color,
    shadowOffset: colors.shadow.offset,
    shadowOpacity: colors.shadow.opacity,
    shadowRadius: colors.shadow.radius,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text.muted,
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  nodesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  nodeChip: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  nodeChipActive: {
    backgroundColor: colors.brand.primary,
    borderColor: colors.brand.primary,
  },
  nodeChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text.secondary,
  },
  nodeChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },

  // Detail Card
  detailCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    padding: 16,
    shadowColor: colors.shadow.color,
    shadowOffset: colors.shadow.offset,
    shadowOpacity: colors.shadow.opacity,
    shadowRadius: colors.shadow.radius,
    elevation: 2,
  },
  detailCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  detailTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text.primary,
  },
  detailRole: {
    fontSize: 12,
    color: colors.text.secondary,
    marginTop: 2,
    fontWeight: '500',
  },
  pressureBadge: {
    backgroundColor: colors.brand.tint,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  pressureBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.brand.primary,
  },
  detailDescription: {
    fontSize: 13,
    color: colors.text.secondary,
    lineHeight: 18,
    marginBottom: 14,
  },
  detailStatsRow: {
    flexDirection: 'row',
    backgroundColor: colors.background,
    borderRadius: 10,
    paddingVertical: 10,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statBoxDivider: {
    width: 1,
    backgroundColor: colors.surfaceBorder,
  },
  statBoxLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.text.muted,
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  statBoxValue: {
    fontSize: 12,
    fontWeight: '700',
  },

  // Co-Study Card
  coStudyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    padding: 14,
    shadowColor: colors.shadow.color,
    shadowOffset: colors.shadow.offset,
    shadowOpacity: colors.shadow.opacity,
    shadowRadius: colors.shadow.radius,
    elevation: 2,
  },
  coStudyLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  iconCircleIndigo: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.brand.tint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  coStudyTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text.primary,
  },
  coStudySub: {
    fontSize: 11,
    color: colors.text.secondary,
    marginTop: 1,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 20,
    width: '100%',
    maxWidth: 360,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  modalHeaderText: {
    flex: 1,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text.primary,
  },
  modalSubtitle: {
    fontSize: 11,
    color: colors.text.muted,
  },
  closeBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  peerList: {
    gap: 10,
    marginBottom: 18,
  },
  peerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.background,
    padding: 10,
    borderRadius: 12,
  },
  peerAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.brand.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  peerAvatarText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  peerInfo: {
    flex: 1,
  },
  peerName: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text.primary,
  },
  peerStatus: {
    fontSize: 11,
    color: colors.text.muted,
  },
  hostBadge: {
    backgroundColor: colors.brand.tint,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  hostBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.brand.primary,
  },
  modalActionBtn: {
    backgroundColor: colors.brand.primary,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalActionBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});
