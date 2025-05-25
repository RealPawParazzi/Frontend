// CustomDropdown.tsx
import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  StyleSheet,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface Option {
  label: string;
  value: string | number;
}

interface Props {
  options: Option[];
  selectedValue: string | number | null;
  onSelect: (value: string | number) => void;
  placeholder?: string;
}

const CustomDropdown: React.FC<Props> = ({
  options,
  selectedValue,
  onSelect,
  placeholder = '선택하세요',
}) => {
  const [visible, setVisible] = useState(false);

  const selectedLabel = options.find(opt => opt.value === selectedValue)?.label;

  return (
    <>
      <TouchableOpacity style={styles.box} onPress={() => setVisible(true)}>
        <Text style={styles.text}>{selectedLabel || placeholder}</Text>
        <Icon name="arrow-drop-down" size={24} color="#888" />
      </TouchableOpacity>

      <Modal visible={visible} transparent animationType="fade">
        <TouchableOpacity
          style={styles.overlay}
          onPress={() => setVisible(false)}>
          <View style={styles.dropdown}>
            <FlatList
              data={options}
              keyExtractor={item => item.value.toString()}
              renderItem={({item}) => (
                <TouchableOpacity
                  style={styles.item}
                  onPress={() => {
                    onSelect(item.value);
                    setVisible(false);
                  }}>
                  <Text style={styles.itemText}>{item.label}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  box: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    backgroundColor: '#F0F0F0',
    marginBottom: 8,
  },
  text: {
    fontSize: 14,
    color: '#444',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    padding: 20,
  },
  dropdown: {
    backgroundColor: '#fff',
    borderRadius: 10,
    maxHeight: 300,
    overflow: 'hidden',
  },
  item: {
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  itemText: {
    fontSize: 14,
  },
});

export default CustomDropdown;
