import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const Header = () => {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>PawParazzi</Text>
            <View style={styles.rightIcons}>
                <TouchableOpacity style={styles.icon}>
                    <Icon name="notifications" size={24} color="black" />
                </TouchableOpacity>
                <Image source={{ uri: 'https://your-profile-image-url.com' }} style={styles.profileImage} />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15 },
    title: { fontSize: 24, fontWeight: 'bold' },
    rightIcons: { flexDirection: 'row', alignItems: 'center' },
    icon: { marginRight: 10 },
    profileImage: { width: 35, height: 35, borderRadius: 50 },
});

export default Header;
