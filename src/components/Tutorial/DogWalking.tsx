import React from 'react';
import LottieView from 'lottie-react-native';

const DogWalking = () => {
    return (
        <LottieView
            source={require('../../assets/animations/dogWalking.json')}
            autoPlay
            loop
            resizeMode="contain"
            speed={1}
            style={{ width: '50%', height: '50%' }}
        />
    );
};

export default DogWalking;
