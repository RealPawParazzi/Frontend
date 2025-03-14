import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { Paws, DogWalking } from '../../components/Tutorial';


type TutorialScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Tutorial'>;

interface Props {
    navigation: TutorialScreenNavigationProp;
}

const TutorialScreen: React.FC<Props> = ({ navigation }) => {
    const [page, setPage] = useState(0);

    const tutorialData = [
        { id: 1, Animation: DogWalking, text: 'Meet adorable pet friends! 🐶🐱' },
        { id: 2, Animation: DogWalking, text: 'Manage pet information easily! 📋' },
        { id: 3, Animation: Paws, text: 'Start your journey now! 🐾' },
    ];

    const handleNext = () => {
        if (page < tutorialData.length - 1) { setPage(page + 1); }
        else { navigation.replace('Login'); }
    };

    const CurrentAnimation = tutorialData[page].Animation;

    return (
        <View style={styles.container}>
            <CurrentAnimation />
            <Paws/>
            <Text style={styles.text}>{tutorialData[page].text}</Text>
            <TouchableOpacity style={styles.button} onPress={handleNext}>
                <Text style={styles.buttonText}>{page === tutorialData.length - 1 ? 'Get Started' : 'Next'}</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFF', padding: 20 },
    text: { fontSize: 18, textAlign: 'center', marginBottom: 40 },
    button: { backgroundColor: '#6A4BBC', paddingVertical: 12, paddingHorizontal: 30, borderRadius: 10 },
    buttonText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
});

export default TutorialScreen;
