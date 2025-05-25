// 📁 components/GlobalSnackbar.tsx
import React, {useEffect, useRef} from 'react';
import {
  Animated,
  Text,
  StyleSheet,
  Dimensions,
  View,
} from 'react-native';

const SCREEN_WIDTH = Dimensions.get('window').width;

interface Props {
  message: string;
  visible: boolean;
  onHide: () => void;
}

const GlobalSnackbar = ({message, visible, onHide}: Props) => {
  const translateY = useRef(new Animated.Value(-80)).current;

  useEffect(() => {
    if (visible) {
      Animated.sequence([
        Animated.timing(translateY, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.delay(2500),
        Animated.timing(translateY, {
          toValue: -100,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(onHide);
    }
  }, [onHide, translateY, visible]);

  return (
    <Animated.View style={[styles.snackbar, {transform: [{translateY}]}]}>
      <Text style={styles.text}>{message}</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  snackbar: {
    position: 'absolute',
    top: 40, // Header 아래
    alignSelf: 'center',
    width: SCREEN_WIDTH - 40,
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: '#4D7CFE',
    borderRadius: 10,
    zIndex: 999,
    elevation: 5,
  },
  text: {
    color: '#fff',
    fontSize: 14,
    textAlign: 'center',
  },
});

export default GlobalSnackbar;

