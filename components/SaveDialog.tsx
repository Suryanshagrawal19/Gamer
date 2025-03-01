import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  Modal,
  ActivityIndicator 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

interface SaveDialogProps {
  visible: boolean;
  onClose: () => void;
  onSave: (title: string) => Promise<void>;
  initialTitle: string;
  characterName: string;
}

const SaveDialog: React.FC<SaveDialogProps> = ({ 
  visible, 
  onClose, 
  onSave, 
  initialTitle,
  characterName 
}) => {
  const [title, setTitle] = useState(initialTitle);
  const [saving, setSaving] = useState(false);
  
  const handleSave = async () => {
    if (!title.trim()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    
    try {
      setSaving(true);
      await onSave(title);
      setSaving(false);
      onClose();
    } catch (error) {
      console.error('Error saving story:', error);
      setSaving(false);
    }
  };
  
  const generateDefaultTitle = () => {
    const date = new Date();
    const formattedDate = `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
    setTitle(`${characterName}'s Journey - ${formattedDate}`);
  };
  
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Save Your Story</Text>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={onClose}
              disabled={saving}
            >
              <Ionicons name="close" size={24} color="#ccc" />
            </TouchableOpacity>
          </View>
          
          <Text style={styles.inputLabel}>Story Title</Text>
          <TextInput
            style={styles.titleInput}
            value={title}
            onChangeText={setTitle}
            placeholder="Enter a title for your story"
            placeholderTextColor="#999"
            autoFocus={true}
            selectTextOnFocus={true}
            editable={!saving}
          />
          
          {!title.trim() && (
            <TouchableOpacity 
              style={styles.generateButton}
              onPress={generateDefaultTitle}
            >
              <Ionicons name="refresh" size={16} color="#6200ee" />
              <Text style={styles.generateButtonText}>Generate Title</Text>
            </TouchableOpacity>
          )}
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={onClose}
              disabled={saving}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.saveButton,
                (!title.trim() || saving) && styles.disabledSaveButton
              ]}
              onPress={handleSave}
              disabled={!title.trim() || saving}
            >
              {saving ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Ionicons name="save" size={18} color="#fff" style={styles.saveIcon} />
                  <Text style={styles.saveButtonText}>Save</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#1e1e1e',
    borderRadius: 12,
    width: '85%',
    padding: 20,
    borderWidth: 1,
    borderColor: '#444',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 4,
  },
  inputLabel: {
    color: '#ccc',
    marginBottom: 8,
  },
  titleInput: {
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    padding: 12,
    color: '#fff',
    borderWidth: 1,
    borderColor: '#444',
    fontSize: 16,
  },
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  generateButtonText: {
    color: '#6200ee',
    marginLeft: 4,
    fontSize: 14,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  cancelButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#444',
    marginRight: 8,
  },
  cancelButtonText: {
    color: '#ccc',
    fontWeight: 'bold',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6200ee',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    flex: 1,
    justifyContent: 'center',
  },
  disabledSaveButton: {
    backgroundColor: '#444',
  },
  saveIcon: {
    marginRight: 8,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default SaveDialog;