import React from 'react';
import LottieView from 'lottie-react-native';

const Paws = () => {
    return (
        <LottieView
            source={require('../../assets/animations/paws.json')}
            autoPlay
            loop
            resizeMode="contain"
            speed={1}
            style={{ width: 250, height: 250 }}
        />
    );
};

export default Paws;
