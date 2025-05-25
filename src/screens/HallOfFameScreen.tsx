import React from 'react';
import { View, Text, StyleSheet } from 'react-native';


/**
 * ✅ 명예의 전당 화면
 * - 사용자들의 성과를 보여주는 페이지
 * - 현재는 단순한 텍스트로 구성되어 있음
 * - 추후에 실제 데이터와 연동하여 구현 예정
 */
const HallOfFameScreen = () => (
    <View style={styles.container}>
        <Text style={styles.text}>명예의 전당 페이지입니다 🏆</Text>
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

export default HallOfFameScreen;
