import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import React from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { useAppUpdateCheck } from '../hooks/useAppUpdateCheck';

export const AppUpdatePrompt: React.FC = () => {
  const { updateInfo, applyUpdate, dismissUpdate } = useAppUpdateCheck();

  // Don't show if no update available or if user dismissed this version
  if (!updateInfo.isUpdateAvailable || updateInfo.isUpdateDismissed) {
    return null;
  }

  return (
    <Modal
      visible={true}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <View style={styles.container}>
        <BlurView intensity={90} style={StyleSheet.absoluteFillObject} />
        
        <View style={styles.content}>
          {/* Icon */}
          <View style={styles.iconContainer}>
            <Ionicons name="rocket" size={50} color="#FF6B6B" />
          </View>

          {/* Title */}
          <Text style={styles.title}>Update Available! 🎉</Text>

          {/* Description */}
          <Text style={styles.description}>
            {updateInfo.hasDownloadedUpdate 
              ? 'A new version of Snatched has been downloaded and is ready to install!'
              : 'A new version of Snatched is available with awesome new features and improvements.'
            }
          </Text>

          {/* Version info */}
          <View style={styles.versionContainer}>
            <Text style={styles.versionText}>
              Current: v{updateInfo.currentVersion}
            </Text>
            <Ionicons name="arrow-forward" size={16} color="#666" style={styles.arrow} />
            <Text style={[styles.versionText, styles.newVersion]}>
              {updateInfo.hasDownloadedUpdate ? 'Ready to install' : 'Downloading...'}
            </Text>
          </View>

          {/* Action buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.updateButton]}
              onPress={applyUpdate}
              activeOpacity={0.8}
            >
              <Text style={styles.updateButtonText}>
                {updateInfo.hasDownloadedUpdate ? 'Restart App' : 'Download & Install'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.laterButton]}
              onPress={dismissUpdate}
              activeOpacity={0.8}
            >
              <Text style={styles.laterButtonText}>Maybe Later</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  content: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    marginHorizontal: 20,
    maxWidth: 350,
    width: '90%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFE5E5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 12,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  versionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  versionText: {
    fontSize: 14,
    color: '#666666',
  },
  arrow: {
    marginHorizontal: 8,
  },
  newVersion: {
    color: '#FF6B6B',
    fontWeight: '600',
  },
  buttonContainer: {
    width: '100%',
    gap: 12,
  },
  button: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  updateButton: {
    backgroundColor: '#FF6B6B',
  },
  updateButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  laterButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  laterButtonText: {
    color: '#666666',
    fontSize: 16,
  },
});