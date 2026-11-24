import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  GraduationCap,
  School,
  User,
  Lock,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  ChevronDown,
} from 'lucide-react-native';
import { useEdzyStore } from '@/store/useEdzyStore';
import { useAppTheme, getCardShadow } from '@/theme/colors';

const SCHOOL_OPTIONS = [
  { code: 'DVPS01', name: 'Doon Valley Public School (New Delhi)' },
  { code: 'DPSRKP', name: 'Delhi Public School (R.K. Puram)' },
  { code: 'KV0042', name: 'Kendriya Vidyalaya No. 1 (IIT Powai)' },
  { code: 'STXAV', name: "St. Xavier's Senior Secondary (Kolkata)" },
];

export default function LoginScreen() {
  const router = useRouter();
  const { login, oneTapDemoLogin, studentProfile } = useEdzyStore();
  const { theme, isDark } = useAppTheme();

  const [selectedSchool, setSelectedSchool] = useState('DVPS01');
  const [studentId, setStudentId] = useState('SCH-2026-0104');
  const [password, setPassword] = useState('1234');
  const [showSchoolPicker, setShowSchoolPicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleStandardLogin = () => {
    if (!studentId.trim()) {
      Alert.alert('Missing Input', 'Please enter your Student Roll Number or Admission ID.');
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      const ok = login(selectedSchool, studentId, password);
      setIsLoading(false);
      if (ok) {
        router.replace('/(tabs)');
      } else {
        Alert.alert('Authentication Failed', 'Invalid credentials. You can use Demo Login.');
      }
    }, 400);
  };

  const handleOneTapLogin = () => {
    setIsLoading(true);
    setTimeout(() => {
      oneTapDemoLogin();
      setIsLoading(false);
      router.replace('/(tabs)');
    }, 250);
  };

  const cardShadow = getCardShadow(isDark);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: theme.canvas }]}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Brand Header */}
        <View style={styles.brandHeader}>
          <View style={[styles.logoBadge, { backgroundColor: theme.brandPrimary }]}>
            <GraduationCap size={32} color="#FFFFFF" />
          </View>
          <Text style={[styles.appName, { color: theme.textPrimary }]}>EDZY</Text>
          <Text style={[styles.appTagline, { color: theme.textSecondary }]}>Education Made Easy for Gen-Z</Text>
          <View style={[styles.affiliationPill, { backgroundColor: theme.successTint }]}>
            <ShieldCheck size={13} color={theme.success} />
            <Text style={[styles.affiliationText, { color: theme.success }]}>CBSE & ICSE Certified Campus Portal</Text>
          </View>
        </View>

        {/* Login Card */}
        <View
          style={[
            styles.loginCard,
            cardShadow,
            { backgroundColor: theme.surface, borderColor: theme.border },
          ]}
        >
          <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>Student & Parent Sign-In</Text>
          <Text style={[styles.cardSubtitle, { color: theme.textSecondary }]}>
            Access synced 3D spatial syllabi, smart timetables, and live fee passbooks.
          </Text>

          {/* School Code Selector */}
          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: theme.textMuted }]}>AFFILIATED INSTITUTION</Text>
            <TouchableOpacity
              style={[
                styles.schoolSelector,
                { backgroundColor: theme.surfaceSubtle, borderColor: theme.border },
              ]}
              onPress={() => setShowSchoolPicker(!showSchoolPicker)}
              activeOpacity={0.8}
            >
              <School size={18} color={theme.brandPrimary} />
              <View style={styles.schoolTextContainer}>
                <Text style={[styles.schoolCode, { color: theme.textPrimary }]}>{selectedSchool}</Text>
                <Text style={[styles.schoolName, { color: theme.textSecondary }]} numberOfLines={1}>
                  {SCHOOL_OPTIONS.find((s) => s.code === selectedSchool)?.name}
                </Text>
              </View>
              <ChevronDown size={16} color={theme.textMuted} />
            </TouchableOpacity>

            {showSchoolPicker && (
              <View style={[styles.schoolDropdown, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                {SCHOOL_OPTIONS.map((item) => (
                  <TouchableOpacity
                    key={item.code}
                    style={[
                      styles.schoolDropdownItem,
                      { borderBottomColor: theme.borderSubtle },
                      selectedSchool === item.code && { backgroundColor: theme.brandTint },
                    ]}
                    onPress={() => {
                      setSelectedSchool(item.code);
                      setShowSchoolPicker(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.dropdownItemText,
                        { color: selectedSchool === item.code ? theme.brandPrimary : theme.textPrimary },
                        selectedSchool === item.code && styles.dropdownItemTextActive,
                      ]}
                    >
                      {item.code} - {item.name}
                    </Text>
                    {selectedSchool === item.code && (
                      <CheckCircle2 size={16} color={theme.brandPrimary} />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Student ID / Roll No */}
          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: theme.textMuted }]}>ADMISSION ID / ROLL NUMBER</Text>
            <View style={[styles.inputWrapper, { backgroundColor: theme.surfaceSubtle, borderColor: theme.border }]}>
              <User size={18} color={theme.textMuted} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: theme.textPrimary }]}
                value={studentId}
                onChangeText={setStudentId}
                placeholder="e.g. SCH-2026-0104"
                placeholderTextColor={theme.textMuted}
                autoCapitalize="characters"
              />
            </View>
          </View>

          {/* Password or Parent PIN */}
          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: theme.textMuted }]}>PASSWORD / 4-DIGIT PIN</Text>
            <View style={[styles.inputWrapper, { backgroundColor: theme.surfaceSubtle, borderColor: theme.border }]}>
              <Lock size={18} color={theme.textMuted} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: theme.textPrimary }]}
                value={password}
                onChangeText={setPassword}
                placeholder="e.g. 1234"
                placeholderTextColor={theme.textMuted}
                secureTextEntry
                keyboardType="numeric"
              />
            </View>
          </View>

          {/* Primary Sign In Button */}
          <TouchableOpacity
            style={[styles.primaryButton, { backgroundColor: theme.brandPrimary }]}
            onPress={handleStandardLogin}
            disabled={isLoading}
            activeOpacity={0.85}
          >
            <Text style={styles.primaryButtonText}>
              {isLoading ? 'Signing In...' : 'Sign In to School Portal'}
            </Text>
            <ArrowRight size={18} color="#FFFFFF" />
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.dividerRow}>
            <View style={[styles.dividerLine, { backgroundColor: theme.border }]} />
            <Text style={[styles.dividerText, { color: theme.textMuted }]}>OR</Text>
            <View style={[styles.dividerLine, { backgroundColor: theme.border }]} />
          </View>

          {/* 1-Tap Demo Login Button */}
          <TouchableOpacity
            style={[
              styles.demoButton,
              { backgroundColor: theme.brandTint, borderColor: theme.brandBorder },
            ]}
            onPress={handleOneTapLogin}
            disabled={isLoading}
            activeOpacity={0.85}
          >
            <Sparkles size={16} color={theme.brandPrimary} />
            <View style={styles.demoButtonTextContainer}>
              <Text style={[styles.demoButtonTitle, { color: theme.brandPrimary }]}>
                Try Demo Student Account
              </Text>
              <Text style={[styles.demoButtonSub, { color: theme.textSecondary }]}>
                Preloaded: {studentProfile.name} ({studentProfile.classGrade})
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Footer Note */}
        <View style={styles.footerNote}>
          <Text style={[styles.footerText, { color: theme.textMuted }]}>
            Demo Roll No: SCH-2026-0104 • Parent PIN: 1234
          </Text>
          <Text style={[styles.footerSubText, { color: theme.textMuted }]}>
            Edzy Indian School OS • Encrypted with 256-bit AES
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 48,
    paddingBottom: 36,
  },
  brandHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  appName: {
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  appTagline: {
    fontSize: 13,
    marginTop: 3,
    fontWeight: '500',
  },
  affiliationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    marginTop: 10,
  },
  affiliationText: {
    fontSize: 11,
    fontWeight: '700',
  },
  loginCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 22,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  schoolSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 10,
  },
  schoolTextContainer: {
    flex: 1,
  },
  schoolCode: {
    fontSize: 12,
    fontWeight: '700',
  },
  schoolName: {
    fontSize: 12,
    marginTop: 1,
  },
  schoolDropdown: {
    marginTop: 6,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  schoolDropdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderBottomWidth: 1,
  },
  dropdownItemText: {
    fontSize: 12,
    fontWeight: '500',
    flex: 1,
  },
  dropdownItemTextActive: {
    fontWeight: '700',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 14,
    fontWeight: '500',
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
    marginTop: 6,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 18,
    gap: 10,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    fontSize: 11,
    fontWeight: '700',
  },
  demoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
  },
  demoButtonTextContainer: {
    flex: 1,
  },
  demoButtonTitle: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 2,
  },
  demoButtonSub: {
    fontSize: 11,
  },
  footerNote: {
    alignItems: 'center',
    marginTop: 24,
    gap: 4,
  },
  footerText: {
    fontSize: 11,
    fontWeight: '600',
  },
  footerSubText: {
    fontSize: 10,
  },
});
