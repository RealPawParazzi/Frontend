import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialIcons';
import CalendarScreen from '../screens/CalendarScreen';
import MapScreen from '../screens/MapScreen';
import MyPageScreen from '../screens/MyPageScreen';
import StorybookScreen from '../screens/StorybookScreen';
import HomeScreen from '../screens/HomeScreen';

const Tab = createBottomTabNavigator();

const BottomTabNavigator = () => {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                tabBarIcon: ({ color, size }) => {
                    let iconName;
                    if (route.name === 'Home') {iconName = 'home';}
                    else if (route.name === 'Calendar') {iconName = 'calendar-today';}
                    else if (route.name === 'Post') {iconName = 'add-box';}
                    else if (route.name === 'Map') {iconName = 'map';}
                    else if (route.name === 'MyPage') {iconName = 'person';}
                    return <Icon name={iconName as any} size={size} color={color} />;
                },
                tabBarActiveTintColor: '#000',
                tabBarInactiveTintColor: 'gray',
                tabBarStyle: { height: 70, paddingBottom: 10 },
            })}
        >
            <Tab.Screen name="Home" component={HomeScreen} options={{ title: '홈' }} />
            <Tab.Screen name="Calendar" component={CalendarScreen} options={{ title: '캘린더' }} />
            <Tab.Screen name="Post" component={StorybookScreen} options={{ title: '게시물 올리기' }} />
            <Tab.Screen name="Map" component={MapScreen} options={{ title: '지도' }} />
            <Tab.Screen name="MyPage" component={MyPageScreen} options={{ title: '마이페이지' }} />
        </Tab.Navigator>
    );
};

export default BottomTabNavigator;
