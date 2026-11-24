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
import { colors } from '@/theme/colors';

const SCHOOL_OPTIONS = [
  { code: 'DVPS01', name: 'Doon Valley Public School (New Delhi)' },
  { code: 'DPSRKP', name: 'Delhi Public School (R.K. Puram)' },
  { code: 'KV0042', name: 'Kendriya Vidyalaya No. 1 (IIT Powai)' },
  { code: 'STXAV', name: "St. Xavier's Senior Secondary (Kolkata)" },
];

export default function LoginScreen() {
  const router = useRouter();
  const { login, oneTapDemoLogin, studentProfile } = useEdzyStore();

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

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Brand Header */}
        <View style={styles.brandHeader}>
          <View style={styles.logoBadge}>
            <GraduationCap size={32} color="#FFFFFF" />
          </View>
          <Text style={styles.appName}>EDZY</Text>
          <Text style={styles.appTagline}>Smart Learning & School ERP</Text>
          <View style={styles.affiliationPill}>
            <ShieldCheck size={13} color={colors.status.success} />
            <Text style={styles.affiliationText}>CBSE & ICSE Certified Campus Portal</Text>
          </View>
        </View>

        {/* Login Card */}
        <View style={styles.loginCard}>
          <Text style={styles.cardTitle}>Student & Parent Sign-In</Text>
          <Text style={styles.cardSubtitle}>
            Access synced 3D spatial syllabi, smart timetables, and live fee passbooks.
          </Text>

          {/* School Code Selector */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>AFFILIATED INSTITUTION</Text>
            <TouchableOpacity
              style={styles.schoolSelector}
              onPress={() => setShowSchoolPicker(!showSchoolPicker)}
              activeOpacity={0.8}
            >
              <School size={18} color={colors.brand.primary} />
              <View style={styles.schoolTextContainer}>
                <Text style={styles.schoolCode}>{selectedSchool}</Text>
                <Text style={styles.schoolName} numberOfLines={1}>
                  {SCHOOL_OPTIONS.find((s) => s.code === selectedSchool)?.name}
                </Text>
              </View>
              <ChevronDown size={16} color={colors.text.muted} />
            </TouchableOpacity>

            {showSchoolPicker && (
              <View style={styles.schoolDropdown}>
                {SCHOOL_OPTIONS.map((item) => (
                  <TouchableOpacity
                    key={item.code}
                    style={[
                      styles.schoolDropdownItem,
                      selectedSchool === item.code && styles.schoolDropdownItemActive,
                    ]}
                    onPress={() => {
                      setSelectedSchool(item.code);
                      setShowSchoolPicker(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.dropdownItemText,
                        selectedSchool === item.code && styles.dropdownItemTextActive,
                      ]}
                    >
                      {item.code} - {item.name}
                    </Text>
                    {selectedSchool === item.code && (
                      <CheckCircle2 size={16} color={colors.brand.primary} />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Student ID / Roll No */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>ADMISSION ID / ROLL NUMBER</Text>
            <View style={styles.inputWrapper}>
              <User size={18} color={colors.text.muted} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={studentId}
                onChangeText={setStudentId}
                placeholder="e.g. SCH-2026-0104"
                placeholderTextColor={colors.text.muted}
                autoCapitalize="characters"
              />
            </View>
          </View>

          {/* Password or Parent PIN */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>PASSWORD / 4-DIGIT PIN</Text>
            <View style={styles.inputWrapper}>
              <Lock size={18} color={colors.text.muted} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                placeholder="e.g. 1234"
                placeholderTextColor={colors.text.muted}
                secureTextEntry
                keyboardType="numeric"
              />
            </View>
          </View>

          {/* Primary Sign In Button */}
          <TouchableOpacity
            style={styles.primaryButton}
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
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* 1-Tap Demo Login Button */}
          <TouchableOpacity
            style={styles.demoButton}
            onPress={handleOneTapLogin}
            disabled={isLoading}
            activeOpacity={0.85}
          >
            <Sparkles size={16} color={colors.brand.primary} />
            <View style={styles.demoButtonTextContainer}>
              <Text style={styles.demoButtonTitle}>Try Demo Student Account</Text>
              <Text style={styles.demoButtonSub}>
                Preloaded: {studentProfile.name} ({studentProfile.classGrade})
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Footer Note */}
        <View style={styles.footerNote}>
          <Text style={styles.footerText}>
            Demo Roll No: SCH-2026-0104 • Parent PIN: 1234
          </Text>
          <Text style={styles.footerSubText}>
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
    backgroundColor: colors.background,
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
    backgroundColor: colors.brand.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: colors.brand.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  appName: {
    fontSize: 26,
    fontWeight: '900',
    color: colors.text.primary,
    letterSpacing: 1.5,
  },
  appTagline: {
    fontSize: 13,
    color: colors.text.secondary,
    marginTop: 3,
    fontWeight: '500',
  },
  affiliationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.status.successBg,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    marginTop: 10,
  },
  affiliationText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.status.success,
  },
  loginCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    padding: 22,
    shadowColor: colors.shadow.color,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text.primary,
  },
  cardSubtitle: {
    fontSize: 13,
    color: colors.text.secondary,
    lineHeight: 18,
    marginTop: 4,
    marginBottom: 18,
  },
  inputGroup: {
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.text.muted,
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  schoolSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 10,
  },
  schoolTextContainer: {
    flex: 1,
  },
  schoolCode: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.brand.primary,
  },
  schoolName: {
    fontSize: 11,
    color: colors.text.secondary,
    marginTop: 1,
  },
  schoolDropdown: {
    marginTop: 6,
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    overflow: 'hidden',
  },
  schoolDropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  schoolDropdownItemActive: {
    backgroundColor: colors.brand.tint,
  },
  dropdownItemText: {
    fontSize: 12,
    color: colors.text.primary,
    flex: 1,
  },
  dropdownItemTextActive: {
    color: colors.brand.primary,
    fontWeight: '700',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    paddingVertical: 11,
    fontSize: 14,
    color: colors.text.primary,
    fontWeight: '500',
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.brand.primary,
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 6,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginVertical: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.divider,
  },
  dividerText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.text.muted,
  },
  demoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.brand.tint,
    borderWidth: 1,
    borderColor: colors.brand.tintBorder,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 10,
  },
  demoButtonTextContainer: {
    flex: 1,
  },
  demoButtonTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.brand.primary,
  },
  demoButtonSub: {
    fontSize: 11,
    color: colors.text.secondary,
    marginTop: 1,
  },
  footerNote: {
    alignItems: 'center',
    marginTop: 20,
    gap: 4,
  },
  footerText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.text.muted,
  },
  footerSubText: {
    fontSize: 10,
    color: colors.text.muted,
  },
});
