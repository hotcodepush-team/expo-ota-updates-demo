import { HotCodePush, useUpdates } from '@hotcodepush/expo-ota-updates';
import type {
  CheckResult,
  Release,
  SyncResult,
} from '@hotcodepush/expo-ota-updates';
import { useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

// Change it, release: the label is how you see the update land.
const VERSION = 'v1';

export default function App() {
  const { isSyncing, lastSync, state } = useUpdates();
  const [deviceId, setDeviceId] = useState('…');
  const [rollbackText, setRollbackText] = useState('none');
  const [syncText, setSyncText] = useState<string | null>(null);

  useEffect(() => {
    HotCodePush.getDevice().then(
      device => setDeviceId(device.id),
      error => setDeviceId(resolveErrorText(error)),
    );
    // Fired once, on the start that follows a rollback: the release that failed and why.
    const listening = HotCodePush.addListener('rolledBack', event =>
      setRollbackText(
        `from ${resolveReleaseText(event.from)} · ${event.reason}`,
      ),
    );
    return () => {
      void listening.then(({ remove }) => remove());
    };
  }, []);

  const syncNow = useCallback(async () => {
    try {
      setSyncText(resolveResultText(await HotCodePush.sync()));
    } catch (error) {
      setSyncText(resolveErrorText(error));
    }
  }, []);

  return (
    <View style={styles.screen}>
      <Text style={styles.eyebrow}>Bundle version</Text>
      <Text style={styles.version}>{VERSION}</Text>
      <Row
        label="Current release"
        value={resolveReleaseText(state.currentRelease)}
      />
      <Row label="Device id" value={deviceId} />
      <Row
        label="Last sync"
        value={
          isSyncing
            ? 'syncing…'
            : (syncText ??
              (lastSync ? resolveResultText(lastSync) : 'none yet'))
        }
      />
      <Row label="Last rollback" value={rollbackText} />
      <Pressable
        accessibilityRole="button"
        disabled={isSyncing}
        onPress={syncNow}
        style={styles.button}
      >
        <Text style={styles.buttonText}>Sync now</Text>
      </Pressable>
      <Pressable
        accessibilityRole="button"
        onPress={() => void HotCodePush.showDebugScreen()}
        style={styles.secondaryButton}
      >
        <Text style={styles.secondaryButtonText}>Debug screen</Text>
      </Pressable>
    </View>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

function resolveReleaseText(release: Release | null): string {
  return release ? `#${release.number} · ${release.bundleVersion}` : 'embedded';
}

function resolveResultText(result: CheckResult | SyncResult): string {
  switch (result.status) {
    case 'UP_TO_DATE':
      return 'UP_TO_DATE';
    case 'AVAILABLE':
      return `AVAILABLE · ${resolveReleaseText(result.release)}`;
    case 'UPDATED':
      return `UPDATED · ${resolveReleaseText(result.release)}, installs ${result.installAt}`;
    case 'SKIPPED':
      return `SKIPPED · ${result.reason}`;
    case 'FAILED':
      return `FAILED · ${result.reason}: ${result.message}`;
  }
}

function resolveErrorText(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    backgroundColor: '#f2572b',
    borderRadius: 12,
    marginTop: 32,
    paddingVertical: 16,
  },
  buttonText: { color: '#ffffff', fontSize: 17, fontWeight: '600' },
  eyebrow: {
    color: '#6b6f76',
    fontSize: 13,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  label: { color: '#6b6f76', fontSize: 13 },
  row: {
    borderBottomColor: '#e6e7ea',
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingVertical: 14,
  },
  screen: {
    backgroundColor: '#ffffff',
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 96,
  },
  secondaryButton: { alignItems: 'center', paddingVertical: 16 },
  secondaryButtonText: { color: '#b33a14', fontSize: 15 },
  value: { color: '#111318', fontSize: 17, marginTop: 4 },
  version: {
    color: '#111318',
    fontSize: 64,
    fontWeight: '700',
    marginBottom: 24,
  },
});
