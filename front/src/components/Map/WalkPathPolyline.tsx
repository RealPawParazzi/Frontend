// 📁 components/WalkPathPolyline.tsx
import React from 'react';
import {Polyline} from 'react-native-maps';

interface Props {
  route: {latitude: number; longitude: number, timestamp: string}[];
  color?: string;
  strokeWidth?: number;
}

const WalkPathPolyline: React.FC<Props> = ({
  route,
  color = '#FF5733',
  strokeWidth = 5,
}) => {
  if (route.length < 2) {
    return null;
  }
  return (
    <Polyline
      coordinates={route}
      strokeColor={color}
      strokeWidth={strokeWidth}
    />
  );
};

export default WalkPathPolyline;
