import React from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { RestaurantProvider } from './src/context/RestaurantContext';
import { AppNavigator } from './src/navigation/AppNavigator';
import { colors } from './src/constants/theme';

function App(): React.JSX.Element {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" />
      <RestaurantProvider>
        <AppNavigator />
      </RestaurantProvider>
    </SafeAreaProvider>
  );
}

export default App;
