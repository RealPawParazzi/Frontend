// 📁 components/common/Snackbar.tsx
import React from 'react';
import {StyleSheet, Text, View, TouchableOpacity} from 'react-native';
import {useSnackbarStore} from '../context/snackbarStore'; // 경로 수정 주의
import Icon from 'react-native-vector-icons/MaterialIcons';

const Snackbar = () => {
  const {visible, message, extra, hideSnackbar} = useSnackbarStore();

  if (!visible) {
    return null;
  }

  return (
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
