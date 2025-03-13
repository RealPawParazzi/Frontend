import React, { useState } from 'react';
import LottieView from 'lottie-react-native';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/AppNavigator';

type TutorialScreenNavigationProp = StackNavigationProp<RootStackParamList, "Tutorial">;

interface Props {
    navigation: TutorialScreenNavigationProp;
}

const TutorialScreen: React.FC<Props> = ({ navigation }) => {
    const [page, setPage] = useState(0);

    const tutorialData = [
        {
            id: 1,
            animation: require('../../assets/animations/tutorial1.json'), // 🔥 강아지 & 고양이 애니메이션
            text: '앱을 사용하면 귀여운 동물 친구들을 만날 수 있어요! 🐶🐱',
        },
        {
            id: 2,
            animation: require('../../assets/animations/tutorial1.json'), // 🔥 체크리스트 애니메이션
            text: '다양한 기능을 통해 반려동물 정보를 쉽게 관리할 수 있어요! 📋',
        },
        {
            id: 3,
            animation: require('../../assets/animations/paws.json'), // 🔥 발바닥 찍히는 애니메이션
            text: '지금 바로 시작해보세요! 🐾',
        },
    ];

    const handleNext = () => {
        if (page < tutorialData.length - 1) {
            setPage(page + 1);
        } else {
            navigation.replace('Login'); // ✅ 로그인 화면으로 이동
        }
    };

    return (
        <View style={styles.container}>
            <LottieView source={tutorialData[page].animation} autoPlay loop style={styles.lottie} />
            <Text style={styles.text}>{tutorialData[page].text}</Text>
            <TouchableOpacity style={styles.button} onPress={handleNext}>
                <Text style={styles.buttonText}>{page === tutorialData.length - 1 ? '시작하기' : '다음'}</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFF3E0', padding: 20 },
    lottie: { width: 250, height: 250, marginBottom: 20 },
    text: { fontSize: 18, textAlign: 'center', marginBottom: 30 },
    button: { backgroundColor: '#FF5733', paddingVertical: 12, paddingHorizontal: 30, borderRadius: 10 },
    buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});

export default TutorialScreen;
