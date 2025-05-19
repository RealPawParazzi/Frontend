import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

/**
 * ✅ 궁금해요 화면
 * - 사용자가 궁금한 점을 질문할 수 있는 페이지
 * - 현재는 단순한 텍스트로 구성되어 있음
 * - 추후에 실제 데이터와 연동하여 구현 예정
 */

const CuriousScreen = () => (
    <View style={styles.container}>
        <Text style={styles.text}>궁금해요 페이지입니다 🧐</Text>
    </View>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    text: {
        fontSize: 20,
        color: '#333',
    },
});

export default CuriousScreen;
