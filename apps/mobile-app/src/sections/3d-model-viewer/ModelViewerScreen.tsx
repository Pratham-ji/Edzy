/**
 * ModelViewerScreen
 * Standalone full-screen 3D model viewer wrapper.
 * Resolves any catalog model ID and renders the reusable GLModelViewer.
 */
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft } from 'lucide-react-native';

import { GLModelViewer } from './components/GLModelViewer';
import { resolveModelByIdOrName } from './data/models';

interface ModelViewerScreenProps {
  modelId?: string;
  onClose?: () => void;
}

export default function ModelViewerScreen({ modelId, onClose }: ModelViewerScreenProps = {}) {
  const params = useLocalSearchParams<{ id?: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const targetId = modelId ?? params.id;
  const modelEntry = resolveModelByIdOrName(targetId);

  const handleBack = () => {
    if (onClose) {
      onClose();
    } else {
      router.back();
    }
  };

  return (
    <View style={styles.root}>
      <GLModelViewer modelEntry={modelEntry} />

      <View
        style={[
          styles.header,
          { paddingTop: insets.top + (Platform.OS === 'android' ? 8 : 0) },
        ]}
        pointerEvents="box-none"
      >
        <Pressable
          style={({ pressed }) => [styles.backButton, pressed && { opacity: 0.65 }]}
          onPress={handleBack}
          accessibilityLabel="Go back"
          accessibilityRole="button"
        >
          <ChevronLeft size={20} color="#FFFFFF" />
        </Pressable>

        <View style={styles.headerInfo}>
          <Text style={styles.subjectLabel}>
            {modelEntry.subject} • Class {modelEntry.classLevel} • {modelEntry.chapter}
          </Text>
          <Text style={styles.modelName}>{modelEntry.name}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0B101B',
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 12,
    backgroundColor: 'rgba(11, 16, 27, 0.68)',
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
  },
  headerInfo: {
    flex: 1,
    gap: 2,
  },
  subjectLabel: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.9,
    fontWeight: '700',
  },
  modelName: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },
});
