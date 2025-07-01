import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import Constants from 'expo-constants';
import { Ionicons } from '@expo/vector-icons';
import { useAppUpdateCheck } from '../hooks/useAppUpdateCheck';

export const VersionInfo: React.FC = () => {
  const { updateInfo, isChecking, checkForUpdate, applyUpdate } = useAppUpdateCheck();
  const currentVersion = Constants.expoConfig?.version ?? updateInfo.currentVersion;

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Text style={styles.label}>App Version</Text>
        <View style={styles.versionContainer}>
          <Text style={styles.version}>v{currentVersion}</Text>
          {isChecking && (
            <ActivityIndicator size="small" color="#666" style={styles.loader} />
          )}
        </View>
      </View>

      {updateInfo.isUpdateAvailable && !updateInfo.isUpdateDismissed && (
        <TouchableOpacity
          style={styles.updateBanner}
          onPress={applyUpdate}
          activeOpacity={0.8}
        >
          <Ionicons name="rocket" size={18} color="#FF6B6B" />
          <Text style={styles.updateText}>
            {updateInfo.hasDownloadedUpdate 
              ? 'Update ready - Tap to restart app'
              : 'Update available - Downloading...'
            }
          </Text>
          <Ionicons name="chevron-forward" size={18} color="#FF6B6B" />
        </TouchableOpacity>
      )}

      <TouchableOpacity
        style={styles.checkButton}
        onPress={() => checkForUpdate(true)}
        disabled={isChecking}
        activeOpacity={0.7}
      >
        <Ionicons name="refresh" size={16} color="#666" />
        <Text style={styles.checkButtonText}>Check for updates</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  versionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  version: {
    fontSize: 16,
    color: '#666',
  },
  loader: {
    marginLeft: 8,
  },
  updateBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFE5E5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    gap: 8,
  },
  updateText: {
    flex: 1,
    fontSize: 14,
    color: '#FF6B6B',
    fontWeight: '500',
  },
  checkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 4,
  },
  checkButtonText: {
    fontSize: 14,
    color: '#666',
  },
});