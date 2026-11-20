import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
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
import { colors } from '@/theme/colors';

const QUICK_PROMPTS = [
  'Why is the left ventricle wall 3x thicker?',
  'What is the function of the bicuspid valve?',
  'Explain the pulmonary vein exception in humans',
  'How does the Aorta withstand 120 mmHg systolic pressure?',
];

export default function SocraticTutorScreen() {
  const router = useRouter();
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
    <SafeAreaView style={styles.safeContainer}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.container}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}
      >
        {/* Tutor Header Info */}
        <View style={styles.tutorHeader}>
          <View style={styles.tutorHeaderRow}>
            <View style={styles.botAvatar}>
              <Bot size={20} color={colors.student.secondaryLight} />
            </View>
            <View style={styles.botMeta}>
              <Text style={styles.botTitle}>Edzy Socratic Guru</Text>
              <Text style={styles.botSub}>
                NCERT Class 10 Syllabus Grounded • Bilingual Hinglish AI
              </Text>
            </View>
            <View style={styles.curriculumTag}>
              <ShieldCheck size={12} color={colors.parent.primaryLight} />
              <Text style={styles.curriculumTagText}>CBSE Verified</Text>
            </View>
          </View>
        </View>

        {/* Message Stream */}
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={styles.messagesScroll}
          keyboardShouldPersistTaps="handled"
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
                  <View style={styles.smallBotIcon}>
                    <Sparkles size={14} color={colors.student.secondaryLight} />
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

                  {/* Socratic Citations & AR Jump Pill */}
                  {!isStudent && msg.sourceDoc && (
                    <View style={styles.aiFooterBox}>
                      <View style={styles.citationRow}>
                        <BookOpen size={11} color={colors.student.primaryLight} />
                        <Text style={styles.citationText}>{msg.sourceDoc}</Text>
                      </View>

                      {msg.arTriggerNode && (
                        <TouchableOpacity
                          style={styles.inspectArButton}
                          onPress={() =>
                            handleInspectArNode(msg.arTriggerNode!, msg.arModelName)
                          }
                          activeOpacity={0.8}
                        >
                          <Boxes size={14} color={colors.spatial.nodeActive} />
                          <Text style={styles.inspectArButtonText}>
                            Inspect Node in 3D AR: {msg.arTriggerNode}
                          </Text>
                          <ArrowRight size={12} color={colors.spatial.nodeActive} />
                        </TouchableOpacity>
                      )}
                    </View>
                  )}

                  <Text style={styles.timestampText}>{msg.timestamp}</Text>
                </View>

                {isStudent && (
                  <View style={styles.smallUserIcon}>
                    <User size={14} color="#FFFFFF" />
                  </View>
                )}
              </View>
            );
          })}
        </ScrollView>

        {/* Quick Suggestion Chips */}
        <View style={styles.suggestionsContainer}>
          <Text style={styles.suggestionsTitle}>Syllabus Prompt Ideas:</Text>
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
            value={inputText}
            onChangeText={setInputText}
            placeholder="Ask doubts from Class 10 NCERT Life Processes..."
            placeholderTextColor={colors.text.disabled}
            multiline={false}
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
            <Send size={16} color="#FFFFFF" />
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
    paddingVertical: 12,
    borderBottomColor: colors.cardBorder,
    borderBottomWidth: 1,
  },
  tutorHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  botAvatar: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: colors.bentoCard,
    borderColor: colors.student.secondary,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  botMeta: {
    flex: 1,
  },
  botTitle: {
    fontSize: 14,
    fontWeight: '800',
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
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  curriculumTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.parent.primaryLight,
  },
  messagesScroll: {
    padding: 16,
    paddingBottom: 20,
    gap: 14,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  messageRowStudent: {
    justifyContent: 'flex-end',
  },
  messageRowAI: {
    justifyContent: 'flex-start',
  },
  smallBotIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: colors.surface,
    borderColor: colors.cardBorder,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  smallUserIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: colors.student.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bubble: {
    maxWidth: '82%',
    borderRadius: 16,
    padding: 14,
  },
  bubbleStudent: {
    backgroundColor: colors.student.primary,
    borderBottomRightRadius: 4,
  },
  bubbleAI: {
    backgroundColor: colors.bentoCard,
    borderColor: colors.cardBorder,
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
  messageTextAI: {
    color: colors.text.primary,
  },
  aiFooterBox: {
    marginTop: 10,
    borderTopColor: colors.cardBorder,
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
    fontSize: 10,
    color: colors.student.primaryLight,
    fontWeight: '600',
  },
  inspectArButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.spatial.telemetryBg,
    borderColor: colors.spatial.telemetryBorder,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 7,
    gap: 6,
  },
  inspectArButtonText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.spatial.nodeActive,
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
    backgroundColor: colors.background,
    borderTopColor: colors.cardBorder,
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
    backgroundColor: colors.surface,
    borderColor: colors.cardBorder,
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
    gap: 10,
  },
  chatInput: {
    flex: 1,
    height: 44,
    backgroundColor: colors.background,
    borderColor: colors.cardBorder,
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
  },
  sendButtonActive: {
    backgroundColor: colors.student.primary,
  },
  sendButtonDisabled: {
    backgroundColor: colors.bentoCard,
    opacity: 0.5,
  },
});
