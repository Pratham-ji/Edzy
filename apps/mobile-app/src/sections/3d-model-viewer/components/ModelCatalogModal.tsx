/**
 * ModelCatalogModal
 *
 * Class (6-10), Subject (Biology, Physics, Chemistry, Mathematics), and Chapter
 * discovery drawer for the 3D Learning Workspace.
 */
import React, { useMemo, useState } from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Boxes, CheckCircle2, Search, X } from 'lucide-react-native';
import { useAppTheme } from '@/theme/colors';
import {
  CLASS_LEVELS,
  ClassLevel,
  filterModelCatalog,
  MODEL_SUBJECTS,
  ModelEntry,
  ModelSubject,
} from '../data/models';

interface ModelCatalogModalProps {
  visible: boolean;
  activeModelId: string;
  onSelectModel: (model: ModelEntry) => void;
  onClose: () => void;
}

export function ModelCatalogModal({
  visible,
  activeModelId,
  onSelectModel,
  onClose,
}: ModelCatalogModalProps) {
  const { theme } = useAppTheme();
  const [selectedClass, setSelectedClass] = useState<ClassLevel | 'ALL'>('ALL');
  const [selectedSubject, setSelectedSubject] = useState<ModelSubject | 'ALL'>('ALL');
  const [chapterQuery, setChapterQuery] = useState('');

  const filteredModels = useMemo(
    () =>
      filterModelCatalog({
        classLevel: selectedClass,
        subject: selectedSubject,
        chapterQuery,
      }),
    [selectedClass, selectedSubject, chapterQuery],
  );

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View
          style={[
            styles.sheet,
            { backgroundColor: theme.surface, borderColor: theme.border },
          ]}
        >
          {/* Sheet Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={[styles.iconBadge, { backgroundColor: theme.brandTint }]}>
                <Boxes size={18} color={theme.brandPrimary} />
              </View>
              <View>
                <Text style={[styles.title, { color: theme.textPrimary }]}>
                  3D Curriculum Catalog
                </Text>
                <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
                  Classes 6–10 • Biology, Physics, Chemistry & Maths
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={[styles.closeBtn, { backgroundColor: theme.surfaceSubtle }]}
              onPress={onClose}
              activeOpacity={0.7}
            >
              <X size={18} color={theme.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Search by Chapter or Concept */}
          <View
            style={[
              styles.searchBar,
              { backgroundColor: theme.canvas, borderColor: theme.border },
            ]}
          >
            <Search size={15} color={theme.textMuted} />
            <TextInput
              style={[styles.searchInput, { color: theme.textPrimary }]}
              placeholder="Search chapter, topic, or 3D model…"
              placeholderTextColor={theme.textMuted}
              value={chapterQuery}
              onChangeText={setChapterQuery}
              returnKeyType="search"
            />
            {chapterQuery.length > 0 && (
              <TouchableOpacity onPress={() => setChapterQuery('')}>
                <X size={14} color={theme.textMuted} />
              </TouchableOpacity>
            )}
          </View>

          {/* Class Filter Chips (6-10) */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterRow}
            style={styles.filterScroll}
          >
            <TouchableOpacity
              style={[
                styles.filterChip,
                {
                  backgroundColor:
                    selectedClass === 'ALL' ? theme.brandPrimary : theme.canvas,
                  borderColor:
                    selectedClass === 'ALL' ? theme.brandPrimary : theme.border,
                },
              ]}
              onPress={() => setSelectedClass('ALL')}
            >
              <Text
                style={[
                  styles.filterChipText,
                  { color: selectedClass === 'ALL' ? '#FFFFFF' : theme.textSecondary },
                ]}
              >
                All Classes
              </Text>
            </TouchableOpacity>
            {CLASS_LEVELS.map((cls) => {
              const active = selectedClass === cls;
              return (
                <TouchableOpacity
                  key={cls}
                  style={[
                    styles.filterChip,
                    {
                      backgroundColor: active ? theme.brandPrimary : theme.canvas,
                      borderColor: active ? theme.brandPrimary : theme.border,
                    },
                  ]}
                  onPress={() => setSelectedClass(cls)}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      { color: active ? '#FFFFFF' : theme.textSecondary },
                    ]}
                  >
                    Class {cls}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Subject Filter Chips */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterRow}
            style={styles.filterScroll}
          >
            <TouchableOpacity
              style={[
                styles.filterChip,
                {
                  backgroundColor:
                    selectedSubject === 'ALL' ? theme.textPrimary : theme.canvas,
                  borderColor:
                    selectedSubject === 'ALL' ? theme.textPrimary : theme.border,
                },
              ]}
              onPress={() => setSelectedSubject('ALL')}
            >
              <Text
                style={[
                  styles.filterChipText,
                  { color: selectedSubject === 'ALL' ? theme.surface : theme.textSecondary },
                ]}
              >
                All Subjects
              </Text>
            </TouchableOpacity>
            {MODEL_SUBJECTS.map((subj) => {
              const active = selectedSubject === subj;
              return (
                <TouchableOpacity
                  key={subj}
                  style={[
                    styles.filterChip,
                    {
                      backgroundColor: active ? theme.brandPrimary : theme.canvas,
                      borderColor: active ? theme.brandPrimary : theme.border,
                    },
                  ]}
                  onPress={() => setSelectedSubject(subj)}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      { color: active ? '#FFFFFF' : theme.textSecondary },
                    ]}
                  >
                    {subj}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Catalog Model List */}
          <ScrollView
            style={styles.listScroll}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          >
            {filteredModels.length === 0 ? (
              <View style={styles.emptyBox}>
                <Text style={[styles.emptyTitle, { color: theme.textPrimary }]}>
                  No matching 3D models
                </Text>
                <Text style={[styles.emptySub, { color: theme.textMuted }]}>
                  Try clearing the class or subject filter to see all models.
                </Text>
              </View>
            ) : (
              filteredModels.map((item) => {
                const isActive = item.id === activeModelId;
                return (
                  <TouchableOpacity
                    key={item.id}
                    style={[
                      styles.modelCard,
                      {
                        backgroundColor: theme.canvas,
                        borderColor: isActive ? item.accentColor : theme.border,
                      },
                    ]}
                    onPress={() => {
                      onSelectModel(item);
                      onClose();
                    }}
                    activeOpacity={0.82}
                  >
                    <View
                      style={[
                        styles.accentDot,
                        { backgroundColor: item.accentColor },
                      ]}
                    />
                    <View style={styles.modelBody}>
                      <View style={styles.metaRow}>
                        <View
                          style={[
                            styles.subjectPill,
                            { backgroundColor: `${item.accentColor}18` },
                          ]}
                        >
                          <Text style={[styles.subjectPillText, { color: item.accentColor }]}>
                            {item.subject} • Class {item.classes.join('/')}
                          </Text>
                        </View>
                        <Text style={[styles.chapterTag, { color: theme.textMuted }]}>
                          {item.asset !== undefined ? 'GLB 3D' : 'Interactive 3D'}
                        </Text>
                      </View>

                      <Text style={[styles.modelTitle, { color: theme.textPrimary }]}>
                        {item.name}
                      </Text>
                      <Text style={[styles.chapterText, { color: theme.brandPrimary }]}>
                        {item.chapter} • {item.components.length} Interactive Parts
                      </Text>
                      <Text
                        style={[styles.modelDesc, { color: theme.textSecondary }]}
                        numberOfLines={2}
                      >
                        {item.description}
                      </Text>
                    </View>
                    {isActive && (
                      <CheckCircle2 size={18} color={item.accentColor} />
                    )}
                  </TouchableOpacity>
                );
              })
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 28,
    maxHeight: '86%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  iconBadge: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 11,
    marginTop: 1,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    padding: 0,
  },
  filterScroll: {
    flexGrow: 0,
    marginBottom: 8,
  },
  filterRow: {
    gap: 8,
    paddingRight: 16,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
  },
  filterChipText: {
    fontSize: 11,
    fontWeight: '700',
  },
  listScroll: {
    marginTop: 4,
  },
  listContent: {
    gap: 10,
    paddingBottom: 12,
  },
  modelCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1.5,
    borderRadius: 14,
    padding: 12,
  },
  accentDot: {
    width: 10,
    height: 44,
    borderRadius: 5,
  },
  modelBody: {
    flex: 1,
    gap: 2,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  subjectPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  subjectPillText: {
    fontSize: 10,
    fontWeight: '700',
  },
  chapterTag: {
    fontSize: 10,
    fontWeight: '600',
  },
  modelTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  chapterText: {
    fontSize: 11,
    fontWeight: '600',
  },
  modelDesc: {
    fontSize: 12,
    lineHeight: 16,
    marginTop: 2,
  },
  emptyBox: {
    alignItems: 'center',
    paddingVertical: 32,
    gap: 4,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  emptySub: {
    fontSize: 12,
    textAlign: 'center',
  },
});

