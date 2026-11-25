import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import {
  Send,
  Boxes,
  BookOpen,
  ShieldCheck,
  Bot,
  User,
} from 'lucide-react-native';
import { useEdzyStore } from '@/store/useEdzyStore';
import { useAppTheme, getCardShadow } from '@/theme/colors';

export default function SocraticTutorScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ roadmapId?: string }>();
  const insets = useSafeAreaInsets();
  const { theme, isDark } = useAppTheme();
  const cardShadow = getCardShadow(isDark);

  const {
    chatMessages,
    sendSocraticPrompt,
    updateArDirective,
    roadmaps,
    studentProfile,
  } = useEdzyStore();

  const activeRoadmap = useMemo(() => {
    if (params.roadmapId) {
      return roadmaps.find((r) => r.id === params.roadmapId) || roadmaps[0];
    }
    return roadmaps.find((r) => r.isCurrent) || roadmaps[0];
  }, [params.roadmapId, roadmaps]);

  const schoolBoard = (activeRoadmap?.board || studentProfile.schoolBoard || 'CBSE')
    .split(' ')[0]
    .toUpperCase();

  const quickPrompts = useMemo(() => {
    const subj = (activeRoadmap?.subject || '').toLowerCase();
    if (subj.includes('optic') || subj.includes('phy')) {
      return [
        'Why is focal length of a concave mirror negative?',
        'How does Snell Law govern air-to-glass bending?',
        'Difference between real inverted and virtual erect lens image?',
      ];
    }
    if (subj.includes('math')) {
      return [
        'When does discriminant D = b^2 - 4ac produce equal roots?',
        'Explain Shreedharacharya formula step by step',
        'How to reject invalid negative solutions in boat word problems?',
      ];
    }
    return [
      'Why is the left ventricle wall 3x thicker?',
      'What is the function of the bicuspid valve?',
      'Explain the pulmonary vein exception in humans',
      'How does the Aorta withstand 120 mmHg systolic pressure?',
    ];
  }, [activeRoadmap?.subject]);

  const [inputText, setInputText] = useState('');
  const scrollViewRef = useRef<any>(null);

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [chatMessages]);

  const handleSend = (textToSend?: string) => {
    const q = textToSend || inputText;
    if (!q.trim()) return;
    sendSocraticPrompt(q.trim(), {
      chapterTitle: activeRoadmap?.title,
      subject: activeRoadmap?.subject,
      board: schoolBoard,
    });
    setInputText('');
  };

  const handleInspectArNode = (targetNode: string, modelName?: string) => {
    updateArDirective({
      targetNode,
      modelName: modelName || 'Human Heart 3D',
      highlight: true,
      note: `Inspecting ${targetNode} referenced from Socratic AI conversation.`,
    });
    router.push('/study/ar-lab');
  };

  return (
    <SafeAreaView style={[styles.safeContainer, { backgroundColor: theme.canvas }]} edges={['bottom', 'left', 'right']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.container}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}
      >
        {/* Tutor Header Info */}
        <View style={[styles.tutorHeader, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
          <View style={styles.tutorHeaderRow}>
            <View style={[styles.botAvatar, { backgroundColor: theme.brandTint }]}>
              <Bot size={20} color={theme.brandPrimary} />
            </View>
            <View style={styles.botMeta}>
              <Text style={[styles.botTitle, { color: theme.textPrimary }]} numberOfLines={1}>
                Edzy Socratic AI • Ch {activeRoadmap?.chapterNumber || 6}
              </Text>
              <Text style={[styles.botSub, { color: theme.textSecondary }]} numberOfLines={1}>
                {activeRoadmap?.title || 'School Syllabus Grounded'} • Hinglish Ready
              </Text>
            </View>
            <View style={[styles.curriculumTag, { backgroundColor: theme.successTint }]}>
              <ShieldCheck size={12} color={theme.success} />
              <Text style={[styles.curriculumTagText, { color: theme.success }]}>{schoolBoard} Verified</Text>
            </View>
          </View>
        </View>

        {/* Message Stream */}
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={[
            styles.messagesScroll,
            { paddingBottom: Math.max(insets.bottom, 16) + 16 },
          ]}
          keyboardShouldPersistTaps="handled"
          contentInsetAdjustmentBehavior="never"
        >
          {chatMessages.map((msg) => {
            const isStudent = msg.sender === 'STUDENT';
            return (
              <View
                key={msg.id}
                style={[
                  styles.messageRow,
                  isStudent ? styles.messageRowStudent : styles.messageRowAI,
                ]}
              >
                {!isStudent && (
                  <View style={[styles.aiAvatarSmall, { backgroundColor: theme.brandTint }]}>
                    <Bot size={14} color={theme.brandPrimary} />
                  </View>
                )}

                <View
                  style={[
                    styles.bubble,
                    cardShadow,
                    isStudent
                      ? [styles.bubbleStudent, { backgroundColor: theme.brandPrimary }]
                      : [
                          styles.bubbleAI,
                          { backgroundColor: theme.surface, borderColor: theme.border },
                        ],
                  ]}
                >
                  <Text
                    style={[
                      styles.messageText,
                      isStudent
                        ? styles.messageTextStudent
                        : [styles.messageTextAI, { color: theme.textPrimary }],
                    ]}
                  >
                    {msg.text}
                  </Text>

                  {/* Grounded Citation & 3D Node Callout */}
                  {!isStudent && (msg.sourceDoc || msg.arTriggerNode) && (
                    <View style={[styles.aiFooterBox, { borderTopColor: theme.border }]}>
                      {msg.sourceDoc && (
                        <View style={styles.citationRow}>
                          <BookOpen size={11} color={theme.brandPrimary} />
                          <Text style={[styles.citationText, { color: theme.brandPrimary }]}>
                            Source: {msg.sourceDoc}
                          </Text>
                        </View>
                      )}

                      {msg.arTriggerNode && (
                        <TouchableOpacity
                          style={[
                            styles.inspectArButton,
                            { backgroundColor: theme.brandTint, borderColor: theme.brandBorder },
                          ]}
                          onPress={() => handleInspectArNode(msg.arTriggerNode!, msg.arModelName)}
                          activeOpacity={0.8}
                        >
                          <Boxes size={13} color={theme.brandPrimary} />
                          <Text style={[styles.inspectArButtonText, { color: theme.brandPrimary }]}>
                            Inspect {msg.arTriggerNode} in 3D Lab →
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  )}

                  <Text
                    style={[
                      styles.timestampText,
                      { color: isStudent ? 'rgba(255, 255, 255, 0.72)' : theme.textMuted },
                    ]}
                  >
                    {msg.timestamp}
                  </Text>
                </View>

                {isStudent && (
                  <View style={[styles.studentAvatarSmall, { backgroundColor: theme.brandPrimary }]}>
                    <User size={14} color="#FFFFFF" />
                  </View>
                )}
              </View>
            );
          })}
        </ScrollView>

        {/* Recommended Prompts */}
        <View style={[styles.suggestionsContainer, { backgroundColor: theme.surface, borderTopColor: theme.border }]}>
          <Text style={[styles.suggestionsTitle, { color: theme.textMuted }]}>
            {schoolBoard} FREQUENTLY ASKED DOUBTS
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.suggestionChipsScroll}
          >
            {quickPrompts.map((prompt, idx) => (
              <TouchableOpacity
                key={idx}
                style={[
                  styles.suggestionChip,
                  { backgroundColor: theme.canvas, borderColor: theme.border },
                ]}
                onPress={() => handleSend(prompt)}
                activeOpacity={0.8}
              >
                <Text style={[styles.suggestionChipText, { color: theme.textSecondary }]}>
                  {prompt}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Input Bar */}
        <View style={[styles.inputContainer, { backgroundColor: theme.surface, borderTopColor: theme.border }]}>
          <TextInput
            style={[
              styles.chatInput,
              {
                backgroundColor: theme.canvas,
                borderColor: theme.border,
                color: theme.textPrimary,
              },
            ]}
            placeholder={`Ask about ${activeRoadmap?.subject || 'your chapter'}...`}
            placeholderTextColor={theme.textMuted}
            value={inputText}
            onChangeText={setInputText}
            onSubmitEditing={() => handleSend()}
            returnKeyType="send"
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              {
                backgroundColor: inputText.trim() ? theme.brandPrimary : theme.border,
                opacity: inputText.trim() ? 1 : 0.7,
              },
            ]}
            onPress={() => handleSend()}
            disabled={!inputText.trim()}
            activeOpacity={0.8}
          >
            <Send size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  tutorHeader: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  tutorHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  botAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  botMeta: {
    flex: 1,
  },
  botTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  botSub: {
    fontSize: 11,
    marginTop: 1,
  },
  curriculumTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  curriculumTagText: {
    fontSize: 10,
    fontWeight: '700',
  },
  messagesScroll: {
    padding: 16,
    gap: 12,
  },
  messageRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'flex-end',
  },
  messageRowStudent: {
    justifyContent: 'flex-end',
  },
  messageRowAI: {
    justifyContent: 'flex-start',
  },
  aiAvatarSmall: {
    width: 26,
    height: 26,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  studentAvatarSmall: {
    width: 26,
    height: 26,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  bubble: {
    maxWidth: '82%',
    borderRadius: 16,
    padding: 14,
  },
  bubbleStudent: {
    borderBottomRightRadius: 4,
  },
  bubbleAI: {
    borderWidth: 1,
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 13,
    lineHeight: 19,
  },
  messageTextStudent: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  messageTextAI: {},
  aiFooterBox: {
    marginTop: 10,
    borderTopWidth: 1,
    paddingTop: 8,
    gap: 8,
  },
  citationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  citationText: {
    fontSize: 11,
    fontWeight: '600',
    flex: 1,
  },
  inspectArButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 7,
    gap: 6,
  },
  inspectArButtonText: {
    fontSize: 11,
    fontWeight: '700',
    flex: 1,
  },
  timestampText: {
    fontSize: 9,
    marginTop: 6,
    textAlign: 'right',
  },
  suggestionsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderTopWidth: 1,
  },
  suggestionsTitle: {
    fontSize: 10,
    fontWeight: '700',
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  suggestionChipsScroll: {
    gap: 8,
  },
  suggestionChip: {
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  suggestionChipText: {
    fontSize: 11,
    fontWeight: '500',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: 1,
    gap: 10,
  },
  chatInput: {
    flex: 1,
    height: 44,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 13,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
