// 📁 components/common/SnackbarDropdown.tsx
import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {useSnackbarStore} from '../context/snackbarStore';
import {useNavigation} from '@react-navigation/native';

const SnackbarDropdown = () => {
  const {logs} = useSnackbarStore();
  const [visible, setVisible] = useState(false);
  const navigation = useNavigation();

  const handleNavigate = (isBattle?: boolean) => {
    //@ts-ignore
    navigation.navigate(isBattle ? 'MiniGameScreen' : 'VideoEditorScreen');
    setVisible(false);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => setVisible(!visible)}>
        <Icon name="notifications" size={24} color="#666" />
      </TouchableOpacity>

      {visible && (
        <View style={styles.dropdown}>
          <ScrollView style={{maxHeight: 220}}>
            {logs.length === 0 ? (
              <Text style={styles.emptyText}>최근 알림이 없습니다.</Text>
            ) : (
              logs
                .slice()
                .reverse()
                .map((log, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.logItem}
                    onPress={() => handleNavigate(log.isBattle)}
                  >
                    <Text style={styles.logMessage}>{log.message}</Text>
                    {log.extra && (
                      <Text style={styles.logExtra}>{log.extra}</Text>
                    )}
                  </TouchableOpacity>
                ))
            )}
          </ScrollView>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  dropdown: {
    position: 'absolute',
    top: 30,
    right: 0,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 10,
    width: 240,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 6,
    zIndex: 999,
  },
  logItem: {
    marginBottom: 10,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  logMessage: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  logExtra: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  emptyText: {
    fontSize: 13,
    color: '#999',
    textAlign: 'center',
    paddingVertical: 8,
  },
});

export default SnackbarDropdown;
