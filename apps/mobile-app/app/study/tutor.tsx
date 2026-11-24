import React, { useState, useRef, useEffect } from 'react';
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
import { useRouter } from 'expo-router';
import {
  Send,
  Sparkles,
  Boxes,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  Bot,
  User,
} from 'lucide-react-native';
import { useEdzyStore } from '@/store/useEdzyStore';
import { colors, useAppTheme } from '@/theme/colors';

const QUICK_PROMPTS = [
  'Why is the left ventricle wall 3x thicker?',
  'What is the function of the bicuspid valve?',
  'Explain the pulmonary vein exception in humans',
  'How does the Aorta withstand 120 mmHg systolic pressure?',
];

export default function SocraticTutorScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme } = useAppTheme();
  const { chatMessages, sendSocraticPrompt, updateArDirective } = useEdzyStore();
  const [inputText, setInputText] = useState('');
  const scrollViewRef = useRef<any>(null);

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [chatMessages]);

  const handleSend = (textToSend?: string) => {
    const q = textToSend || inputText;
    if (!q.trim()) return;
    sendSocraticPrompt(q.trim());
    setInputText('');
  };

  const handleInspectArNode = (targetNode: string, modelName?: string) => {
    updateArDirective({
      targetNode,
      modelName: modelName || 'Human Heart (3D Spatial Lab)',
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
        <View style={styles.tutorHeader}>
          <View style={styles.tutorHeaderRow}>
            <View style={styles.botAvatar}>
              <Bot size={20} color={colors.brand.primary} />
            </View>
            <View style={styles.botMeta}>
              <Text style={styles.botTitle}>Edzy Socratic AI Tutor</Text>
              <Text style={styles.botSub}>
                NCERT Class 10 Syllabus Grounded • Bilingual Hinglish AI
              </Text>
            </View>
            <View style={styles.curriculumTag}>
              <ShieldCheck size={12} color={colors.status.success} />
              <Text style={styles.curriculumTagText}>CBSE Verified</Text>
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
                  <View style={styles.aiAvatarSmall}>
                    <Bot size={14} color={colors.brand.primary} />
                  </View>
                )}

                <View
                  style={[
                    styles.bubble,
                    isStudent ? styles.bubbleStudent : styles.bubbleAI,
                  ]}
                >
                  <Text
                    style={[
                      styles.messageText,
                      isStudent ? styles.messageTextStudent : styles.messageTextAI,
                    ]}
                  >
                    {msg.text}
                  </Text>

                  {/* Grounded Citation & 3D Node Callout */}
                  {!isStudent && (msg.sourceDoc || msg.arTriggerNode) && (
                    <View style={styles.aiFooterBox}>
                      {msg.sourceDoc && (
                        <View style={styles.citationRow}>
                          <BookOpen size={11} color={colors.brand.primary} />
                          <Text style={styles.citationText}>Source: {msg.sourceDoc}</Text>
                        </View>
                      )}

                      {msg.arTriggerNode && (
                        <TouchableOpacity
                          style={styles.inspectArButton}
                          onPress={() => handleInspectArNode(msg.arTriggerNode!, msg.arModelName)}
                          activeOpacity={0.8}
                        >
                          <Boxes size={13} color={colors.brand.primary} />
                          <Text style={styles.inspectArButtonText}>
                            Inspect {msg.arTriggerNode} in 3D Lab →
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  )}

                  <Text
                    style={[
                      styles.timestampText,
                      isStudent && { color: 'rgba(255, 255, 255, 0.7)' },
                    ]}
                  >
                    {msg.timestamp}
                  </Text>
                </View>

                {isStudent && (
                  <View style={styles.studentAvatarSmall}>
                    <User size={14} color="#FFFFFF" />
                  </View>
                )}
              </View>
            );
          })}
        </ScrollView>

        {/* NCERT Recommended Prompts */}
        <View style={styles.suggestionsContainer}>
          <Text style={styles.suggestionsTitle}>CBSE BOARD FREQUENTLY ASKED DOUBTS</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.suggestionChipsScroll}
          >
            {QUICK_PROMPTS.map((prompt, idx) => (
              <TouchableOpacity
                key={idx}
                style={styles.suggestionChip}
                onPress={() => handleSend(prompt)}
                activeOpacity={0.8}
              >
                <Text style={styles.suggestionChipText}>{prompt}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Input Bar */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.chatInput}
            placeholder="Ask doubt about Science, Maths, or English..."
            placeholderTextColor={colors.text.muted}
            value={inputText}
            onChangeText={setInputText}
            onSubmitEditing={() => handleSend()}
            returnKeyType="send"
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              inputText.trim() ? styles.sendButtonActive : styles.sendButtonDisabled,
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
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
  },
  tutorHeader: {
    backgroundColor: colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceBorder,
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
    backgroundColor: colors.brand.tint,
    justifyContent: 'center',
    alignItems: 'center',
  },
  botMeta: {
    flex: 1,
  },
  botTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text.primary,
  },
  botSub: {
    fontSize: 11,
    color: colors.text.secondary,
    marginTop: 1,
  },
  curriculumTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.status.successBg,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  curriculumTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.status.success,
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
    backgroundColor: colors.brand.tint,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  studentAvatarSmall: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.brand.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  bubble: {
    maxWidth: '82%',
    borderRadius: 16,
    padding: 14,
    shadowColor: colors.shadow.color,
    shadowOffset: colors.shadow.offset,
    shadowOpacity: colors.shadow.opacity,
    shadowRadius: colors.shadow.radius,
    elevation: 1,
  },
  bubbleStudent: {
    backgroundColor: colors.brand.primary,
    borderBottomRightRadius: 4,
  },
  bubbleAI: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
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
  messageTextAI: {
    color: colors.text.primary,
  },
  aiFooterBox: {
    marginTop: 10,
    borderTopColor: colors.divider,
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
    color: colors.brand.primary,
    fontWeight: '600',
  },
  inspectArButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.brand.tint,
    borderWidth: 1,
    borderColor: colors.brand.tintBorder,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 7,
    gap: 6,
  },
  inspectArButtonText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.brand.primary,
    flex: 1,
  },
  timestampText: {
    fontSize: 9,
    color: colors.text.muted,
    marginTop: 6,
    textAlign: 'right',
  },
  suggestionsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: colors.surface,
    borderTopColor: colors.surfaceBorder,
    borderTopWidth: 1,
  },
  suggestionsTitle: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.text.muted,
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  suggestionChipsScroll: {
    gap: 8,
  },
  suggestionChip: {
    backgroundColor: colors.background,
    borderColor: colors.surfaceBorder,
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  suggestionChipText: {
    fontSize: 11,
    color: colors.text.secondary,
    fontWeight: '500',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceBorder,
    gap: 10,
  },
  chatInput: {
    flex: 1,
    height: 44,
    backgroundColor: colors.background,
    borderColor: colors.surfaceBorder,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    color: colors.text.primary,
    fontSize: 13,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.brand.primary,
  },
  sendButtonActive: {
    backgroundColor: colors.brand.primary,
  },
  sendButtonDisabled: {
    backgroundColor: colors.surfaceBorder,
    opacity: 0.7,
  },
});
