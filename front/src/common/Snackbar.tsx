// 📁 components/common/Snackbar.tsx
import React from 'react';
import {StyleSheet, Text, View, TouchableOpacity} from 'react-native';
import {useSnackbarStore} from '../context/snackbarStore'; // 경로 수정 주의
import Icon from 'react-native-vector-icons/MaterialIcons';
import {useNavigation} from '@react-navigation/native';


const Snackbar = () => {
  const {visible, message, extra, isBattle, hideSnackbar} = useSnackbarStore();
  const navigation = useNavigation();

  if (!visible) {
    return null;
  }

  const handlePress = () => {
    if (isBattle) {
      //@ts-ignore
      navigation.navigate('MiniGameScreen');
    } else {
      //@ts-ignore
      navigation.navigate('VideoEditorScreen');
    }
    hideSnackbar();
  };

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.95}>
      <View style={styles.snackbar}>
        <View style={styles.contentRow}>
          <View style={{flex: 1}}>
            <Text style={styles.snackbarText}>{message}</Text>
            {extra && <Text style={styles.extraText}>{extra}</Text>}
          </View>
          <TouchableOpacity onPress={hideSnackbar} style={styles.closeButton}>
            <Icon name="close" size={18} color="#FFF" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  snackbar: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
    backgroundColor: '#323232',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    zIndex: 999,
    elevation: 6,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  snackbarText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  extraText: {
    marginTop: 4,
    color: '#ccc',
    fontSize: 12,
  },
  closeButton: {
    marginLeft: 12,
    padding: 4,
  },
});

export default Snackbar;
