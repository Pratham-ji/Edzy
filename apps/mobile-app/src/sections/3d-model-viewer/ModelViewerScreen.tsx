/**
 * ModelViewerScreen
 * Full-screen 3D model viewer. Receives a model entry and renders
 * the GLModelViewer with a header overlay.
 */
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { GLModelViewer } from '@/sections/3d-models/components/GLModelViewer';
import { MODELS } from '@/sections/3d-models/data/models';

interface ModelViewerScreenProps {
  modelId?: string;
  onClose?: () => void;
}

export default function ModelViewerScreen({ modelId, onClose }: ModelViewerScreenProps = {}) {
  const params = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const targetId = modelId ?? params.id;
  const modelEntry = MODELS.find((m) => m.id === targetId) ?? MODELS[0];

  const handleBack = () => {
    if (onClose) {
      onClose();
    } else {
      router.back();
    }
  };

  return (
    <View style={styles.root}>
      {/* Full-screen GL viewer */}
      <GLModelViewer
        modelAsset={modelEntry.asset}
        accentColor={modelEntry.accentColor}
        annotations={modelEntry.annotations}
        attribution={modelEntry.attribution}
      />

      {/* Header overlay on top of GL canvas */}
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
          <ThemedText style={styles.backIcon}>‹</ThemedText>
        </Pressable>

        <View style={styles.headerInfo}>
          <ThemedText type="small" style={styles.subjectLabel}>
            {modelEntry.subject}
          </ThemedText>
          <ThemedText style={styles.modelName}>{modelEntry.name}</ThemedText>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0d0d1a',
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
    backgroundColor: 'rgba(13,13,26,0.6)',
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
  backIcon: {
    color: '#fff',
    fontSize: 24,
    lineHeight: 28,
    fontWeight: '300',
    marginTop: -2,
  },
  headerInfo: {
    gap: 2,
  },
  subjectLabel: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    fontWeight: '600',
  },
  modelName: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});
