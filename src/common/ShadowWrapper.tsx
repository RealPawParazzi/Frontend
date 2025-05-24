// ShadowWrapper.tsx

import React from 'react';
import { Platform, View, StyleSheet, ViewStyle } from 'react-native';

interface Props {
    children: React.ReactNode;
    style?: ViewStyle;
}

/**
 * 📌 ShadowWrapper
 * - iOS & Android 모두에서 자연스러운 그림자 처리용 래퍼
 */
const ShadowWrapper = ({ children, style }: Props) => {
    return <View style={[styles.shadow, style]}>{children}</View>;
};

const styles = StyleSheet.create({
    shadow: {
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.06,
                shadowRadius: 14,
                backgroundColor: '#fff',
                borderRadius: 14,
            },
            android: {
                elevation: 5,
                backgroundColor: '#fff',
                borderRadius: 15,
            },
        }),
    },
});

export default ShadowWrapper;
