import React, {useState} from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

interface TagInputModalProps {
  visible: boolean;
  onClose: () => void;
  onAddTag: (tag: string) => void;
}

const TagInputModal: React.FC<TagInputModalProps> = ({visible, onClose, onAddTag}) => {
  const [tagText, setTagText] = useState('');

  const handleAdd = () => {
    const trimmed = tagText.trim();
    if (trimmed) {
      onAddTag(trimmed);
      setTagText('');
      onClose();
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={modalStyles.overlay}>
        <View style={modalStyles.container}>
          <Text style={modalStyles.title}>태그 추가</Text>
          <TextInput
            value={tagText}
            onChangeText={setTagText}
            placeholder="태그 입력"
            style={modalStyles.input}
          />
          <View style={modalStyles.buttonRow}>
            <TouchableOpacity style={modalStyles.button} onPress={onClose}>
              <Text style={modalStyles.buttonText}>취소</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[modalStyles.button, {backgroundColor: '#4D7CFE'}]} onPress={handleAdd}>
              <Text style={[modalStyles.buttonText, {color: 'white'}]}>추가</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default TagInputModal;

const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '80%',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    elevation: 6,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    marginBottom: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  button: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginLeft: 8,
    borderRadius: 6,
    backgroundColor: '#eee',
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
