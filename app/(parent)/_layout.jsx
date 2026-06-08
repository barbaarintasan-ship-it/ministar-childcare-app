import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { View, Text } from 'react-native';
import { useTheme } from '../../src/contexts/ThemeContext';
import { useLang } from '../../src/contexts/LangContext';
import { COLORS, getTheme } from '../../src/constants/colors';

function TabIcon({ name, focused, color, size, badge }) {
  return (
    <View style={{ alignItems: 'center' }}>
      <Ionicons name={focused ? name : name + '-outline'} size={size} color={color} />
      {badge ? (
        <View style={{
          position: 'absolute', top: -4, right: -8,
          backgroundColor: COLORS.accent, borderRadius: 8,
          minWidth: 16, height: 16, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 3,
        }}>
          <Text style={{ color: '#fff', fontSize: 9, fontWeight: '900' }}>{badge}</Text>
        </View>
      ) : null}
    </View>
  );
}

export default function ParentLayout() {
  const { isDark } = useTheme();
  const { t } = useLang();
  const theme = getTheme(isDark);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.tabBar,
          borderTopColor: theme.border,
          borderTopWidth: 1,
          height: 64,
          paddingBottom: 8,
          paddingTop: 4,
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: theme.textMuted,
        tabBarLabelStyle: { fontSize: 10, fontWeight: '700' },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('home'),
          tabBarIcon: ({ focused, color, size }) => (
            <TabIcon name="home" focused={focused} color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="reports"
        options={{
          title: t('reports'),
          tabBarIcon: ({ focused, color, size }) => (
            <TabIcon name="document-text" focused={focused} color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="photos"
        options={{
          title: t('photos'),
          tabBarIcon: ({ focused, color, size }) => (
            <TabIcon name="images" focused={focused} color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          title: t('messages'),
          tabBarIcon: ({ focused, color, size }) => (
            <TabIcon name="chatbubbles" focused={focused} color={color} size={size} badge={2} />
          ),
        }}
      />
<Tabs.Screen name="profile" options={{ href: null }} />
      <Tabs.Screen name="growth" options={{ href: null }} />
    </Tabs>
  );
}
