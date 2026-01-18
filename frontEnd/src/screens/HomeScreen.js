import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  StatusBar,
  SafeAreaView,
  Alert,
} from 'react-native';
import { Feather, MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';

const HomeScreen = ({ navigation }) => {
  const { user, logout } = useAuth();

  const menuItems = [
    {
      id: 'reading',
      title: 'Okuma Modu',
      subtitle: 'Metinleri keşfet',
      icon: 'book-open-page-variant',
      iconType: 'material-community',
      bgColor: '#FFFFFF',
      iconColor: '#000000',
    },
    {
      id: 'upload',
      title: 'Kaynak Yükleme',
      subtitle: 'PDF veya Resim',
      icon: 'file-upload',
      iconType: 'material-community',
      bgColor: '#FFFFFF',
      iconColor: '#000000',
    },
    {
      id: 'vocabulary',
      title: 'Kelime Çalış',
      subtitle: 'Flashcard & Eşle',
      icon: 'head-cog',
      iconType: 'material-community',
      bgColor: '#FFFFFF',
      iconColor: '#000000',
    },
    {
      id: 'lists',
      title: 'Kelime Listelerim',
      subtitle: 'Kaydedilenler',
      icon: 'format-list-bulleted',
      iconType: 'material-community',
      bgColor: '#FFFFFF',
      iconColor: '#000000',
    },
  ];

  const handleMenuPress = (itemId) => {
    console.log('Menu item pressed:', itemId);
    switch (itemId) {
      case 'vocabulary':
        navigation.navigate('StudyWord');
        break;
      case 'reading':
        navigation.navigate('ReadingMode');
        break;
      case 'upload':
        navigation.navigate('UploadResource');
        break;
      case 'lists':
        navigation.navigate('WordLists');
        break;
      default:
        break;
    }
  };

  const handleNotificationPress = () => {
    console.log('Notifications pressed');
  };

  const handleLogout = () => {
    Alert.alert(
      'Çıkış Yap',
      'Çıkış yapmak istediğinize emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Çıkış Yap',
          style: 'destructive',
          onPress: () => logout(),
        },
      ]
    );
  };

  const handleProfilePress = () => {
    Alert.alert(
      'Profil',
      `Ad: ${user?.name || 'Bilinmiyor'}\nEmail: ${user?.email || 'Bilinmiyor'}`,
      [
        { text: 'Tamam' },
        { text: 'Çıkış Yap', style: 'destructive', onPress: () => logout() },
      ]
    );
  };

  const renderIcon = (item) => {
    return (
      <MaterialCommunityIcons
        name={item.icon}
        size={26}
        color={item.iconColor}
      />
    );
  };

  // Kullanıcı adının ilk harfini al
  const getInitial = () => {
    if (user?.name) {
      return user.name.charAt(0).toUpperCase();
    }
    return 'U';
  };

  // Kullanıcı adının sadece ilk kısmını al
  const getFirstName = () => {
    if (user?.name) {
      return user.name.split(' ')[0];
    }
    return 'Kullanıcı';
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity 
            style={styles.avatar}
            onPress={handleProfilePress}
            activeOpacity={0.8}
          >
            <Text style={styles.avatarText}>{getInitial()}</Text>
          </TouchableOpacity>
          <View style={styles.headerTextContainer}>
            <Text style={styles.greeting}>Merhaba, {getFirstName()}!</Text>
            <Text style={styles.subtitle}>Gelişimini sürdür 🔥</Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.notificationButton}
          onPress={handleNotificationPress}
          activeOpacity={0.7}
        >
          <Feather name="bell" size={22} color="#475569" />
        </TouchableOpacity>
      </View>

      {/* Main Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionTitle}>Bugün ne yapmak istersin?</Text>

        {/* Menu Grid */}
        <View style={styles.menuGrid}>
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.menuCard}
              onPress={() => handleMenuPress(item.id)}
              activeOpacity={0.9}
            >
              <View style={[styles.iconContainer, { backgroundColor: item.bgColor }]}>
                {renderIcon(item)}
              </View>
              <View style={styles.menuTextContainer}>
                <Text style={styles.menuTitle}>{item.title}</Text>
                <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} activeOpacity={0.7}>
          <Ionicons name="home" size={26} color="#2ECC71" />
          <Text style={styles.navTextActive}>Ana Sayfa</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.navItem} 
          activeOpacity={0.7}
          onPress={handleProfilePress}
        >
          <Ionicons name="person-outline" size={26} color="#94A3B8" />
          <Text style={styles.navText}>Profil</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 48,
    paddingBottom: 24,
    backgroundColor: '#F8FAFC',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#2ECC71',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#2ECC71',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontFamily: 'Poppins_700Bold',
  },
  headerTextContainer: {
    marginLeft: 4,
  },
  greeting: {
    fontSize: 20,
    fontFamily: 'Poppins_700Bold',
    color: '#1E293B',
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'Poppins_500Medium',
    color: '#64748B',
  },
  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#BACD92',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0,
    shadowColor: '#475569',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 6,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 120,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Poppins_700Bold',
    color: '#1E293B',
    marginBottom: 20,
    paddingLeft: 4,
  },
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  menuCard: {
    width: '48%',
    backgroundColor: '#A8DF8E',
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    minHeight: 176,
    justifyContent: 'space-between',
    borderWidth: 0,
    shadowColor: '#475569',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#94A3B8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  menuTextContainer: {
    marginTop: 'auto',
  },
  menuTitle: {
    fontSize: 17,
    fontFamily: 'Poppins_700Bold',
    color: '#1E293B',
    marginBottom: 4,
    lineHeight: 22,
  },
  menuSubtitle: {
    fontSize: 12,
    fontFamily: 'Poppins_500Medium',
    color: '#64748B',
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 90,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 48,
    paddingBottom: 24,
    borderTopWidth: 0,
    shadowColor: '#475569',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 12,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  navTextActive: {
    fontSize: 10,
    fontFamily: 'Poppins_700Bold',
    color: '#2ECC71',
  },
  navText: {
    fontSize: 10,
    fontFamily: 'Poppins_500Medium',
    color: '#94A3B8',
  },
});

export default HomeScreen;
