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
import { School, User, Lock, Sparkles, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react-native';
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
        Alert.alert('Authentication Failed', 'Invalid credentials. You can use 1-Tap Demo Login.');
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
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Brand Header */}
        <View style={styles.brandHeader}>
          <View style={styles.logoBadge}>
            <School size={28} color={colors.student.secondaryLight} />
          </View>
          <Text style={styles.appName}>EDZY</Text>
          <Text style={styles.appTagline}>B2B K-12 Spatial Learning & School ERP</Text>
          <View style={styles.affiliationPill}>
            <ShieldCheck size={13} color={colors.parent.primaryLight} />
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
            <Text style={styles.inputLabel}>SELECT AFFILIATED INSTITUTION</Text>
            <TouchableOpacity
              style={styles.schoolSelector}
              onPress={() => setShowSchoolPicker(!showSchoolPicker)}
              activeOpacity={0.8}
            >
              <School size={18} color={colors.student.primaryLight} />
              <View style={styles.schoolTextContainer}>
                <Text style={styles.schoolCode}>{selectedSchool}</Text>
                <Text style={styles.schoolName} numberOfLines={1}>
                  {SCHOOL_OPTIONS.find((s) => s.code === selectedSchool)?.name}
                </Text>
              </View>
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
                      <CheckCircle2 size={16} color={colors.student.secondaryLight} />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Student ID / Roll No */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>STUDENT ADMISSION ID / ROLL NUMBER</Text>
            <View style={styles.inputWrapper}>
              <User size={18} color={colors.text.muted} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={studentId}
                onChangeText={setStudentId}
                placeholder="e.g. SCH-2026-0104"
                placeholderTextColor={colors.text.disabled}
                autoCapitalize="characters"
              />
            </View>
          </View>

          {/* Password or Parent PIN */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>PASSWORD / 4-DIGIT PARENT PIN</Text>
            <View style={styles.inputWrapper}>
              <Lock size={18} color={colors.text.muted} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                placeholder="e.g. 1234"
                placeholderTextColor={colors.text.disabled}
                secureTextEntry
                keyboardType="numeric"
              />
            </View>
          </View>

          {/* Standard Sign In Button */}
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleStandardLogin}
            disabled={isLoading}
            activeOpacity={0.85}
          >
            <Text style={styles.primaryButtonText}>Sign In to School Portal</Text>
            <ArrowRight size={18} color="#FFFFFF" />
          </TouchableOpacity>

          {/* 1-Tap Demo Login Button */}
          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>EVALUATION MODE</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity
            style={styles.demoButton}
            onPress={handleOneTapLogin}
            disabled={isLoading}
            activeOpacity={0.85}
          >
            <Sparkles size={18} color={colors.student.secondaryLight} />
            <View style={styles.demoButtonTextContainer}>
              <Text style={styles.demoButtonTitle}>1-Tap Instant Demo Login</Text>
              <Text style={styles.demoButtonSub}>
                Preloaded: {studentProfile.name} ({studentProfile.classGrade})
              </Text>
            </View>
          </TouchableOpacity>

          {/* Helper Credentials Box */}
          <View style={styles.demoBadgeBox}>
            <Text style={styles.demoBadgeTitle}>Pre-Configured Demo Credentials:</Text>
            <Text style={styles.demoBadgeCode}>Roll No: SCH-2026-0104  •  Parent PIN: 1234</Text>
            <Text style={styles.demoBadgeSub}>Dual Persona: Student Study Space & Parent ERP</Text>
          </View>
        </View>

        {/* Footer info */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Edzy Indian School OS • 2026-2027 Academic Session</Text>
          <Text style={styles.footerSubText}>Encrypted with 256-bit AES & Supabase Postgres RLS</Text>
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
    paddingTop: 60,
    paddingBottom: 40,
    alignItems: 'center',
  },
  brandHeader: {
    alignItems: 'center',
    marginBottom: 28,
  },
  logoBadge: {
    width: 60,
    height: 60,
    borderRadius: 16,
    backgroundColor: colors.bentoCard,
    borderColor: colors.student.secondary,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: colors.student.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  appName: {
    fontSize: 30,
    fontWeight: '900',
    color: colors.text.primary,
    letterSpacing: 3,
  },
  appTagline: {
    fontSize: 13,
    color: colors.text.secondary,
    marginTop: 4,
    fontWeight: '500',
  },
  affiliationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    borderColor: 'rgba(16, 185, 129, 0.3)',
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    marginTop: 12,
  },
  affiliationText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.parent.primaryLight,
  },
  loginCard: {
    width: '100%',
    maxWidth: 440,
    backgroundColor: colors.bentoCard,
    borderColor: colors.cardBorder,
    borderWidth: 1,
    borderRadius: 22,
    padding: 24,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 18,
    elevation: 8,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 6,
  },
  cardSubtitle: {
    fontSize: 13,
    color: colors.text.secondary,
    lineHeight: 18,
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.text.muted,
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  schoolSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderColor: colors.cardBorder,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 12,
  },
  schoolTextContainer: {
    flex: 1,
  },
  schoolCode: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.student.secondaryLight,
  },
  schoolName: {
    fontSize: 12,
    color: colors.text.secondary,
    marginTop: 2,
  },
  schoolDropdown: {
    marginTop: 6,
    backgroundColor: colors.surface,
    borderColor: colors.cardBorder,
    borderWidth: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  schoolDropdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  schoolDropdownItemActive: {
    backgroundColor: 'rgba(6, 182, 212, 0.08)',
  },
  dropdownItemText: {
    fontSize: 12,
    color: colors.text.secondary,
    flex: 1,
  },
  dropdownItemTextActive: {
    color: colors.student.secondaryLight,
    fontWeight: '600',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderColor: colors.cardBorder,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 48,
    color: colors.text.primary,
    fontSize: 14,
    fontWeight: '500',
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.student.primary,
    height: 50,
    borderRadius: 14,
    marginTop: 8,
    shadowColor: colors.student.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 4,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
    gap: 10,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.cardBorder,
  },
  dividerText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.text.muted,
    letterSpacing: 1,
  },
  demoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(6, 182, 212, 0.1)',
    borderColor: colors.student.secondary,
    borderWidth: 1.2,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  demoButtonTextContainer: {
    flex: 1,
  },
  demoButtonTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.student.secondaryLight,
  },
  demoButtonSub: {
    fontSize: 11,
    color: colors.text.secondary,
    marginTop: 2,
  },
  demoBadgeBox: {
    backgroundColor: 'rgba(30, 41, 59, 0.6)',
    borderRadius: 10,
    padding: 10,
    marginTop: 16,
    alignItems: 'center',
  },
  demoBadgeTitle: {
    fontSize: 11,
    color: colors.text.muted,
    fontWeight: '600',
  },
  demoBadgeCode: {
    fontSize: 12,
    color: colors.text.primary,
    fontWeight: '700',
    marginTop: 2,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  demoBadgeSub: {
    fontSize: 10,
    color: colors.student.primaryLight,
    marginTop: 2,
  },
  footer: {
    marginTop: 32,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 11,
    color: colors.text.muted,
    fontWeight: '500',
  },
  footerSubText: {
    fontSize: 10,
    color: colors.text.disabled,
    marginTop: 4,
  },
});
