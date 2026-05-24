import 'react-native-gesture-handler';
import React, { useContext } from 'react'; // Removed useState, added useContext
import { View, Text, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { 
  Home as HomeIcon, 
  Wallet, 
  Map, 
  User, 
  LogOut, 
  Settings,
  Car
} from 'lucide-react-native';

// Import your screens
import HomeScreen from './src/screens/HomeScreen';
import AuthScreen from './src/screens/AuthScreen';
import QRScreen from './src/screens/QRScreen';
import MapScreen from './src/screens/MapScreen';
import VehicleScreen from './src/screens/VehicleScreen';
import ProfileScreen from './src/screens/ProfileScreen'; 
import WalletScreen from './src/screens/WalletScreen';
import { UserProvider, UserContext } from './src/UserContext'; // Import UserContext too

const Tab = createBottomTabNavigator();
const Drawer = createDrawerNavigator();

// --- 1. THE BOTTOM TAB NAVIGATION ---
function TabNavigator() {
  return (
    <Tab.Navigator 
      screenOptions={{
        tabBarActiveTintColor: '#2563eb', 
        tabBarInactiveTintColor: '#94a3b8',
        tabBarStyle: { 
          height: 70, 
          paddingBottom: 10,
          backgroundColor: '#FFFFFF',
          borderTopColor: '#f1f5f9'
        },
        headerShown: false
      }}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{ tabBarIcon: ({ color }) => <HomeIcon color={color} size={24} /> }}
      />
      <Tab.Screen 
        name="My Vehicles" 
        component={VehicleScreen} 
        options={{ tabBarIcon: ({ color }) => <Car color={color} size={24} /> }} 
      />
      <Tab.Screen 
        name="Map" 
        component={MapScreen} 
        options={{ tabBarIcon: ({ color }) => <Map color={color} size={24} /> }} 
      />
      <Tab.Screen 
        name="Wallet" 
        component={WalletScreen} 
        options={{ tabBarIcon: ({ color }) => <Wallet color={color} size={24} /> }} 
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{ tabBarIcon: ({ color }) => <User color={color} size={24} /> }} 
      />
    </Tab.Navigator>
  );
}

// --- 2. THE NAVIGATION LOGIC ---
// We create a separate component for the navigation so it can access UserContext
function AppNavigator() {
  const { user, isLoading, logout } = useContext(UserContext);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  // If no user is logged in, show AuthScreen
  if (!user) {
    return <AuthScreen />;
  }

  // If user exists, show the Main App
  return (
    <NavigationContainer>
      <Drawer.Navigator 
        screenOptions={{
          drawerStyle: { backgroundColor: '#FFFFFF', width: 280 },
          drawerActiveTintColor: '#2563eb',
          headerShown: true,
          headerTitle: "Smile Smart",
          headerStyle: { backgroundColor: '#FFFFFF' },
          headerShadowVisible: false,
        }}
      >
        <Drawer.Screen 
          name="MainTabs" 
          component={TabNavigator} 
          options={{ 
            drawerLabel: 'Home',
            drawerIcon: ({ color }) => <HomeIcon color={color} size={22} /> 
          }}
        />

        <Drawer.Screen 
          name="Entry Pass" 
          component={QRScreen} 
          options={{ 
            drawerItemStyle: { display: 'none' }, 
            headerShown: false 
          }}
        />

        <Drawer.Screen 
          name="Settings" 
          component={HomeScreen} 
          options={{ drawerIcon: ({ color }) => <Settings color={color} size={22} /> }}
        />

        {/* LOGOUT BUTTON */}
        <Drawer.Screen 
          name="Logout" 
          component={View} 
          options={{ 
            drawerIcon: ({ color }) => <LogOut color="#ef4444" size={22} />,
            drawerLabelStyle: { color: '#ef4444' }
          }}
          listeners={{
            focus: () => logout() // Calls the logout function from Context
          }}
        />
      </Drawer.Navigator>
    </NavigationContainer>
  );
}

// --- 3. FINAL EXPORT ---
export default function App() {
  return (
    <UserProvider>
      <AppNavigator />
    </UserProvider>
  );
}