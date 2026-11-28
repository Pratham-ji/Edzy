import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  BookOpen,
  Boxes,
  ChevronRight,
  Focus,
  Layers,
  Minimize2,
  RotateCw,
  SlidersHorizontal,
  Users,
  Volume2,
  X,
} from 'lucide-react-native';
import { useEdzyStore } from '@/store/useEdzyStore';
import { colors, getCardShadow, useAppTheme } from '@/theme/colors';
import {
  GLModelViewer,
  GLModelViewerHandle,
} from '@/sections/3d-model-viewer/components/GLModelViewer';
import { ModelCatalogModal } from '@/sections/3d-model-viewer/components/ModelCatalogModal';
import {
  MODEL_CATALOG,
  MODEL_SUBJECTS,
  ModelComponentNode,
  ModelEntry,
  ModelSubject,
  resolveModelByIdOrName,
} from '@/sections/3d-model-viewer/data/models';
import { BadgeTone, ExplorerViewMode } from '@/sections/3d-model-viewer/interactions/types';

const BADGE_TONE_HEX: Record<BadgeTone, string> = {
  danger: colors.status.error,
  info: '#0284C7',
  success: colors.status.success,
  warning: colors.status.warning,
  brand: colors.brand.primary,
};

export default function ArLabScreen() {
  const insets = useSafeAreaInsets();
  const { theme, isDark } = useAppTheme();
  const { activeArDirective, updateArDirective, studentProfile } = useEdzyStore();
  const viewerRef = useRef<GLModelViewerHandle | null>(null);

  // Resolve initial model from AI / Roadmap directive (defaults to Human Heart)
  const [activeModel, setActiveModel] = useState<ModelEntry>(() =>
    resolveModelByIdOrName(activeArDirective.modelName),
  );
  const [selectedComponentId, setSelectedComponentId] = useState<string | null>(
    () => {
      const initial = resolveModelByIdOrName(activeArDirective.modelName);
      const matched = initial.components.find(
        (c) => c.id.toLowerCase() === (activeArDirective.targetNode || '').toLowerCase(),
      );
      return matched?.id ?? null;
    },
  );

  const [rotationAngle, setRotationAngle] = useState(45);
  const [viewMode, setViewMode] = useState<ExplorerViewMode>('solid');
  const [isolateSelected, setIsolateSelected] = useState(false);
  const [audioNarration, setAudioNarration] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showCatalogModal, setShowCatalogModal] = useState(false);
  const [showCoStudyModal, setShowCoStudyModal] = useState(false);

  // Sync if an external AI Tutor or Roadmap directive changes the active model/node
  useEffect(() => {
    const resolved = resolveModelByIdOrName(activeArDirective.modelName);
    setActiveModel(resolved);

    const matchedNode = resolved.components.find(
      (c) =>
        c.id.toLowerCase() === (activeArDirective.targetNode || '').toLowerCase() ||
        c.label.toLowerCase() === (activeArDirective.targetNode || '').toLowerCase(),
    );
    if (matchedNode) {
      setSelectedComponentId(matchedNode.id);
    } else {
      setSelectedComponentId(null);
    }
  }, [activeArDirective.modelName, activeArDirective.targetNode]);

  const activeComponent: ModelComponentNode | undefined = useMemo(
    () => activeModel.components.find((c) => c.id === selectedComponentId),
    [activeModel, selectedComponentId],
  );

  const handleSelectModel = useCallback(
    (model: ModelEntry) => {
      setActiveModel(model);
      setSelectedComponentId(null);
      setViewMode('solid');
      setIsolateSelected(false);
      setRotationAngle(45);
      setAudioNarration(false);
      updateArDirective({
        modelName: model.name,
        targetNode: '',
        highlight: false,
        explodeFactor: 0,
        note: model.description,
      });
    },
    [updateArDirective],
  );

  const handleQuickSubjectSwitch = useCallback(
    (subject: ModelSubject) => {
      if (activeModel.subject === subject) {
        setShowCatalogModal(true);
        return;
      }
      const firstInSubject = MODEL_CATALOG.find((m) => m.subject === subject);
      if (firstInSubject) {
        handleSelectModel(firstInSubject);
      }
    },
    [activeModel.subject, handleSelectModel],
  );

  const handleSelectComponent = useCallback(
    (node: ModelComponentNode | null) => {
      if (!node) {
        setSelectedComponentId(null);
        setIsolateSelected(false);
        return;
      }
      setSelectedComponentId(node.id);
      updateArDirective({
        targetNode: node.id,
        highlight: true,
        note: node.fullDesc,
        rotation: `0°, ${rotationAngle}°, 0°`,
      });
    },
    [rotationAngle, updateArDirective],
  );

  const handleRotate = useCallback(() => {
    const nextAngle = (rotationAngle + 45) % 360;
    setRotationAngle(nextAngle);
    viewerRef.current?.rotateBy(45);
    updateArDirective({
      rotation: `0°, ${nextAngle}°, 0°`,
    });
  }, [rotationAngle, updateArDirective]);

  const handleCycleViewMode = useCallback(() => {
    const allowed: ExplorerViewMode[] = ['solid'];
    if (activeModel.capabilities.supportsCrossSection) allowed.push('cross-section');
    if (activeModel.capabilities.supportsExplode) allowed.push('exploded');

    const idx = allowed.indexOf(viewMode);
    const nextMode = allowed[(idx + 1) % allowed.length];
    setViewMode(nextMode);
    updateArDirective({
      explodeFactor: nextMode === 'solid' ? 0 : nextMode === 'cross-section' ? 0.5 : 1,
      note:
        nextMode === 'solid'
          ? 'Model assembled.'
          : nextMode === 'cross-section'
            ? 'Cross-section slice view.'
            : 'Exploded assembly view.',
    });
  }, [activeModel.capabilities, viewMode, updateArDirective]);

  const cardShadow = getCardShadow(isDark);
  const metricBadgeColor = activeComponent
    ? BADGE_TONE_HEX[activeComponent.badgeTone] ?? theme.brandPrimary
    : theme.brandPrimary;

  return (
    <SafeAreaView
      style={[styles.safeContainer, { backgroundColor: theme.canvas }]}
      edges={['bottom', 'left', 'right']}
    >
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: 12,
            paddingHorizontal: 16,
            paddingBottom: Math.max(insets.bottom, 24) + 16,
          },
        ]}
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="never"
      >
        {/* ─── WORKSPACE DISCOVERY BAR (Class 6-10 / Subject / Chapter) ─── */}
        <View
          style={[
            styles.workspaceHeaderCard,
            cardShadow,
            { backgroundColor: theme.surface, borderColor: theme.border },
          ]}
        >
          <View style={styles.workspaceTopRow}>
            <View style={styles.workspaceMetaCol}>
              <View style={styles.curriculumBadgeRow}>
                <View style={[styles.subjectChip, { backgroundColor: `${activeModel.accentColor}1A` }]}>
                  <BookOpen size={11} color={activeModel.accentColor} />
                  <Text style={[styles.subjectChipText, { color: activeModel.accentColor }]}>
                    {activeModel.subject} • Class {activeModel.classes.join('/')}
                  </Text>
                </View>
                <Text style={[styles.chapterMetaText, { color: theme.textMuted }]} numberOfLines={1}>
                  {activeModel.chapter}
                </Text>
              </View>
              <Text style={[styles.activeModelHeading, { color: theme.textPrimary }]} numberOfLines={1}>
                {activeModel.name}
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.catalogBtn, { backgroundColor: theme.brandTint, borderColor: theme.brandBorder }]}
              onPress={() => setShowCatalogModal(true)}
              activeOpacity={0.8}
            >
              <SlidersHorizontal size={14} color={theme.brandPrimary} />
              <Text style={[styles.catalogBtnText, { color: theme.brandPrimary }]}>
                Catalog ({MODEL_CATALOG.length})
              </Text>
            </TouchableOpacity>
          </View>

          {/* Quick Subject Switcher Pills */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.subjectSwitcherRow}
          >
            {MODEL_SUBJECTS.map((subj) => {
              const isSelected = activeModel.subject === subj;
              return (
                <TouchableOpacity
                  key={subj}
                  style={[
                    styles.quickSubjectPill,
                    {
                      backgroundColor: isSelected ? theme.brandPrimary : theme.canvas,
                      borderColor: isSelected ? theme.brandPrimary : theme.border,
                    },
                  ]}
                  onPress={() => handleQuickSubjectSwitch(subj)}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.quickSubjectText,
                      { color: isSelected ? '#FFFFFF' : theme.textSecondary },
                    ]}
                  >
                    {subj}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* ─── 3D VIEWPORT CONTAINER (Dark Charcoal Element) ─── */}
        <View style={styles.viewportOuterCard}>
          <View style={styles.viewport3D}>
            {/* Interactive Reusable GL Model Viewer (single active GLView at a time) */}
            <View style={styles.glCanvasContainer}>
              {!isFullscreen ? (
                <GLModelViewer
                  ref={viewerRef}
                  modelEntry={activeModel}
                  selectedComponentId={selectedComponentId}
                  onSelectComponent={handleSelectComponent}
                  viewMode={viewMode}
                  isolateSelected={isolateSelected}
                  onToggleIsolate={() => setIsolateSelected((v) => !v)}
                  isFullscreen={false}
                  onToggleFullscreen={() => setIsFullscreen(true)}
                  compact
                  showInlineInfoPanel={false}
                />
              ) : (
                <View style={styles.fullscreenSuspendedBox}>
                  <Boxes size={28} color="#94A3B8" />
                  <Text style={styles.fullscreenSuspendedText}>
                    Fullscreen 3D Workspace Active
                  </Text>
                </View>
              )}
            </View>

            {/* Top Overlay Badges — left-aligned to avoid covering the GL expand FAB */}
            <View style={styles.viewportTopOverlay} pointerEvents="box-none">
              <View style={styles.modelTagBadge}>
                <Boxes size={12} color="#FFFFFF" />
                <Text style={styles.modelTagText}>
                  {activeModel.asset !== undefined ? '3D GLB Lab' : '3D Spatial Lab'}
                </Text>
              </View>
              {activeComponent && (
                <View style={[styles.focusPill, { backgroundColor: activeModel.accentColor }]}>
                  <Text style={styles.focusPillText} numberOfLines={1}>
                    Target: {activeComponent.label}
                  </Text>
                </View>
              )}
            </View>

            {/* Bottom Viewport Action Bar */}
            <View style={styles.viewportControlsBar}>
              <TouchableOpacity
                style={styles.vpButton}
                onPress={handleRotate}
                activeOpacity={0.8}
              >
                <RotateCw size={13} color="#FFFFFF" />
                <Text style={styles.vpButtonText}>Rotate {rotationAngle}°</Text>
              </TouchableOpacity>

              {(activeModel.capabilities.supportsCrossSection ||
                activeModel.capabilities.supportsExplode) && (
                  <TouchableOpacity
                    style={[
                      styles.vpButton,
                      viewMode !== 'solid' && { backgroundColor: activeModel.accentColor },
                    ]}
                    onPress={handleCycleViewMode}
                    activeOpacity={0.8}
                  >
                    <Layers size={13} color="#FFFFFF" />
                    <Text style={styles.vpButtonText}>
                      {viewMode === 'solid'
                        ? 'Solid'
                        : viewMode === 'cross-section'
                          ? 'Cross-Section'
                          : 'Exploded'}
                    </Text>
                  </TouchableOpacity>
                )}

              {activeModel.capabilities.supportsPartIsolation && activeComponent && (
                <TouchableOpacity
                  style={[
                    styles.vpButton,
                    isolateSelected && { backgroundColor: activeModel.accentColor },
                  ]}
                  onPress={() => setIsolateSelected((v) => !v)}
                  activeOpacity={0.8}
                >
                  <Focus size={13} color="#FFFFFF" />
                  <Text style={styles.vpButtonText}>
                    {isolateSelected ? 'Isolated' : 'Isolate'}
                  </Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={[styles.vpButton, audioNarration && styles.vpButtonActive]}
                onPress={() => {
                  const next = !audioNarration;
                  setAudioNarration(next);
                  Alert.alert(
                    next ? 'Voice Explainer' : 'Audio Paused',
                    next
                      ? `${activeModel.name} — ${activeComponent?.label ?? ''}: ${activeComponent?.fullDesc ?? activeModel.description}`
                      : 'Narrator stopped.',
                  );
                }}
                activeOpacity={0.8}
              >
                <Volume2 size={13} color="#FFFFFF" />
                <Text style={styles.vpButtonText}>
                  {audioNarration ? 'Audio ON' : 'Audio'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* ─── INTERACTIVE COMPONENT SELECTOR ─── */}
        <View
          style={[
            styles.selectorCard,
            cardShadow,
            { backgroundColor: theme.surface, borderColor: theme.border },
          ]}
        >
          <View style={styles.selectorHeaderRow}>
            <Text style={[styles.sectionTitle, { color: theme.textMuted }]}>
              Select {activeModel.subject} Component
            </Text>
            <Text style={[styles.gestureHint, { color: theme.textMuted }]}>
              Drag to orbit • Pinch to zoom • Double-tap reset
            </Text>
          </View>
          <View style={styles.nodesRow}>
            {activeModel.components.map((node) => {
              const isSelected = node.id === activeComponent?.id;
              return (
                <TouchableOpacity
                  key={node.id}
                  style={[
                    styles.nodeChip,
                    {
                      backgroundColor: isSelected ? activeModel.accentColor : theme.canvas,
                      borderColor: isSelected ? activeModel.accentColor : theme.border,
                    },
                  ]}
                  onPress={() => handleSelectComponent(node)}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.nodeChipText,
                      { color: isSelected ? '#FFFFFF' : theme.textSecondary },
                      isSelected && styles.nodeChipTextActive,
                    ]}
                  >
                    {node.number}. {node.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* ─── COMPONENT DETAIL CARD ─── */}
        {activeComponent && (
          <View
            style={[
              styles.detailCard,
              cardShadow,
              { backgroundColor: theme.surface, borderColor: theme.border },
            ]}
          >
            <View style={styles.detailCardHeader}>
              <View style={{ flex: 1, paddingRight: 10 }}>
                <Text style={[styles.detailTitle, { color: theme.textPrimary }]}>
                  {activeComponent.label}
                </Text>
                <Text style={[styles.detailRole, { color: theme.textSecondary }]}>
                  {activeComponent.role} • {activeComponent.category}
                </Text>
              </View>
              <View style={[styles.pressureBadge, { backgroundColor: theme.brandTint }]}>
                <Text style={[styles.pressureBadgeText, { color: theme.brandPrimary }]}>
                  {activeComponent.keyMetricValue}
                </Text>
              </View>
            </View>

            <Text style={[styles.detailDescription, { color: theme.textSecondary }]}>
              {activeComponent.fullDesc}
            </Text>

            <View style={[styles.detailStatsRow, { backgroundColor: theme.canvas }]}>
              <View style={styles.statBox}>
                <Text style={[styles.statBoxLabel, { color: theme.textMuted }]}>
                  {activeComponent.keyMetricLabel}
                </Text>
                <Text style={[styles.statBoxValue, { color: metricBadgeColor }]}>
                  {activeComponent.badgeLabel}
                </Text>
              </View>
              <View style={[styles.statBoxDivider, { backgroundColor: theme.border }]} />
              <View style={styles.statBox}>
                <Text style={[styles.statBoxLabel, { color: theme.textMuted }]}>
                  BOARD EXAM RELEVANCE
                </Text>
                <Text style={[styles.statBoxValue, { color: theme.brandPrimary }]}>
                  {activeComponent.examRelevance ?? activeModel.boardRelevance}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* ─── CO-STUDY PEER SESSION CARD ─── */}
        <TouchableOpacity
          style={[
            styles.coStudyCard,
            cardShadow,
            { backgroundColor: theme.surface, borderColor: theme.border },
          ]}
          onPress={() => setShowCoStudyModal(true)}
          activeOpacity={0.85}
        >
          <View style={styles.coStudyLeft}>
            <View style={[styles.iconCircleIndigo, { backgroundColor: theme.brandTint }]}>
              <Users size={18} color={theme.brandPrimary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.coStudyTitle, { color: theme.textPrimary }]}>
                Collaborative Classroom Session
              </Text>
              <Text style={[styles.coStudySub, { color: theme.textSecondary }]}>
                Sync {activeModel.name} orientation with classmates
              </Text>
            </View>
          </View>
          <ChevronRight size={16} color={theme.brandPrimary} />
        </TouchableOpacity>
      </ScrollView>

      {/* ─── FULLSCREEN 3D VIEWER MODAL ─── */}
      <Modal
        visible={isFullscreen}
        animationType="slide"
        statusBarTranslucent
        onRequestClose={() => setIsFullscreen(false)}
      >
        <View style={styles.fullscreenRoot}>
          {isFullscreen && (
            <GLModelViewer
              modelEntry={activeModel}
              selectedComponentId={selectedComponentId}
              onSelectComponent={handleSelectComponent}
              viewMode={viewMode}
              isolateSelected={isolateSelected}
              onToggleIsolate={() => setIsolateSelected((v) => !v)}
              isFullscreen
              onToggleFullscreen={() => setIsFullscreen(false)}
              showInlineInfoPanel
            />
          )}

          {/* Slim top-left header — doesn't cover the GLView's top-right FAB */}
          <View
            style={[
              styles.fullscreenHeader,
              { paddingTop: insets.top + (Platform.OS === 'android' ? 10 : 4) },
            ]}
            pointerEvents="box-none"
          >
            <View style={styles.fullscreenHeaderInfo}>
              <Text style={styles.fullscreenSubLabel}>
                {activeModel.subject} • Class {activeModel.classLevel} • {activeModel.chapter}
              </Text>
              <Text style={styles.fullscreenTitle} numberOfLines={1}>
                {activeModel.name}
              </Text>
            </View>
            {/* Close button positioned at left side only — FAB handles right side */}
            <TouchableOpacity
              style={styles.fullscreenCloseBtn}
              onPress={() => setIsFullscreen(false)}
              activeOpacity={0.75}
              accessibilityLabel="Exit fullscreen"
            >
              <Minimize2 size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ─── CLASS 6-10 CATALOG BROWSER MODAL ─── */}
      <ModelCatalogModal
        visible={showCatalogModal}
        activeModelId={activeModel.id}
        onSelectModel={handleSelectModel}
        onClose={() => setShowCatalogModal(false)}
      />

      {/* ─── CO-STUDY MODAL ─── */}
      <Modal visible={showCoStudyModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: theme.surface }]}>
            <View style={styles.modalHeader}>
              <View style={[styles.iconCircleIndigo, { backgroundColor: theme.brandTint }]}>
                <Users size={20} color={theme.brandPrimary} />
              </View>
              <View style={styles.modalHeaderText}>
                <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>
                  {studentProfile?.classGrade || 'Class 10-A'} Lab Session
                </Text>
                <Text style={[styles.modalSubtitle, { color: theme.textMuted }]}>
                  {studentProfile?.schoolName || 'Doon Valley Public School'}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setShowCoStudyModal(false)}
                style={[styles.closeBtn, { backgroundColor: theme.canvas }]}
                activeOpacity={0.7}
              >
                <X size={18} color={theme.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.peerList}>
              <View style={[styles.peerRow, { backgroundColor: theme.canvas }]}>
                <View style={[styles.peerAvatar, { backgroundColor: theme.brandPrimary }]}>
                  <Text style={styles.peerAvatarText}>AS</Text>
                </View>
                <View style={styles.peerInfo}>
                  <Text style={[styles.peerName, { color: theme.textPrimary }]}>
                    {studentProfile?.name || 'Aarav Sharma'} (You)
                  </Text>
                  <Text style={[styles.peerStatus, { color: theme.textMuted }]}>
                    Inspecting {activeComponent?.label ?? activeModel.name}
                  </Text>
                </View>
                <View style={[styles.hostBadge, { backgroundColor: theme.brandTint }]}>
                  <Text style={[styles.hostBadgeText, { color: theme.brandPrimary }]}>Host</Text>
                </View>
              </View>

              <View style={[styles.peerRow, { backgroundColor: theme.canvas }]}>
                <View style={[styles.peerAvatar, { backgroundColor: colors.parent.primary }]}>
                  <Text style={styles.peerAvatarText}>AG</Text>
                </View>
                <View style={styles.peerInfo}>
                  <Text style={[styles.peerName, { color: theme.textPrimary }]}>Ananya Gupta</Text>
                  <Text style={[styles.peerStatus, { color: theme.textMuted }]}>
                    Synced to {activeModel.name}
                  </Text>
                </View>
              </View>

              <View style={[styles.peerRow, { backgroundColor: theme.canvas }]}>
                <View style={[styles.peerAvatar, { backgroundColor: colors.streak.primary }]}>
                  <Text style={styles.peerAvatarText}>RM</Text>
                </View>
                <View style={styles.peerInfo}>
                  <Text style={[styles.peerName, { color: theme.textPrimary }]}>Rohan Mehra</Text>
                  <Text style={[styles.peerStatus, { color: theme.textMuted }]}>
                    Following {activeModel.chapter}
                  </Text>
                </View>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.modalActionBtn, { backgroundColor: theme.brandPrimary }]}
              onPress={() => {
                setShowCoStudyModal(false);
                Alert.alert(
                  'Session Synced',
                  `Your ${activeModel.name} (${activeComponent?.label ?? 'full view'}) perspective is now broadcasted to 2 peers.`,
                );
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
  },
  scrollContent: {
    gap: 12,
  },

  // Workspace Discovery Header
  workspaceHeaderCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 12,
    gap: 10,
  },
  workspaceTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  workspaceMetaCol: {
    flex: 1,
    gap: 4,
  },
  curriculumBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  subjectChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  subjectChipText: {
    fontSize: 10,
    fontWeight: '700',
  },
  chapterMetaText: {
    fontSize: 11,
    fontWeight: '600',
    flexShrink: 1,
  },
  activeModelHeading: {
    fontSize: 17,
    fontWeight: '800',
  },
  catalogBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 11,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
  },
  catalogBtnText: {
    fontSize: 11,
    fontWeight: '700',
  },
  subjectSwitcherRow: {
    gap: 8,
  },
  quickSubjectPill: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
  },
  quickSubjectText: {
    fontSize: 11,
    fontWeight: '700',
  },

  // 3D Viewport Card
  viewportOuterCard: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.14,
    shadowRadius: 10,
    elevation: 4,
  },
  viewport3D: {
    height: 330,
    backgroundColor: '#0B101B',
    justifyContent: 'space-between',
  },
  glCanvasContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 48,
  },
  fullscreenSuspendedBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  fullscreenSuspendedText: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '600',
  },
  viewportTopOverlay: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingRight: 54,   // leave room for the GLModelViewer expand FAB (36px + 10px gap + 8px buffer)
    gap: 8,
  },
  modelTagBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(15, 23, 42, 0.72)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.16)',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 8,
  },
  modelTagText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  focusPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    maxWidth: '58%',
  },
  focusPillText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  viewportControlsBar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#111827',
    paddingHorizontal: 10,
    paddingVertical: 9,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
  },
  vpButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.14)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  vpButtonActive: {
    backgroundColor: colors.brand.primary,
  },
  vpButtonText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },

  // Component Selector
  selectorCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
  },
  selectorHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  gestureHint: {
    fontSize: 10,
    fontWeight: '500',
  },
  nodesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  nodeChip: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 11,
    paddingVertical: 7,
  },
  nodeChipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  nodeChipTextActive: {
    fontWeight: '700',
  },

  // Detail Card
  detailCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
  },
  detailCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  detailTitle: {
    fontSize: 17,
    fontWeight: '800',
  },
  detailRole: {
    fontSize: 12,
    marginTop: 2,
    fontWeight: '500',
  },
  pressureBadge: {
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 8,
  },
  pressureBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  detailDescription: {
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 14,
  },
  detailStatsRow: {
    flexDirection: 'row',
    borderRadius: 10,
    paddingVertical: 10,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  statBoxDivider: {
    width: 1,
  },
  statBoxLabel: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 2,
    textAlign: 'center',
  },
  statBoxValue: {
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },

  // Co-Study Card
  coStudyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  coStudyTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  coStudySub: {
    fontSize: 11,
    marginTop: 1,
  },

  // Fullscreen Modal
  fullscreenRoot: {
    flex: 1,
    backgroundColor: '#0B101B',
  },
  fullscreenHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: 'rgba(11, 16, 27, 0.72)',
    gap: 12,
  },
  fullscreenHeaderInfo: {
    flex: 1,
    gap: 2,
  },
  fullscreenSubLabel: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.7,
  },
  fullscreenTitle: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
  },
  fullscreenCloseBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Co-Study Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
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
  },
  modalSubtitle: {
    fontSize: 11,
  },
  closeBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
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
    padding: 10,
    borderRadius: 12,
  },
  peerAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
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
  },
  peerStatus: {
    fontSize: 11,
  },
  hostBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  hostBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  modalActionBtn: {
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
