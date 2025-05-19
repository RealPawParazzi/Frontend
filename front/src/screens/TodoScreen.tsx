import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

/**
 * ✅ 오늘 할 일 화면
 * - 사용자가 오늘 해야 할 일을 관리하는 페이지
 * - 현재는 단순한 텍스트로 구성되어 있음
 * - 추후에 실제 데이터와 연동하여 구현 예정
 */
const TodoScreen = () => (
    <View style={styles.container}>
        <Text style={styles.text}>오늘 할 일 페이지입니다 ✅</Text>
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

export default TodoScreen;
