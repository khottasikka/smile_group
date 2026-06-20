import React, { useState, useContext, useEffect } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, TouchableOpacity, 
  TextInput, KeyboardAvoidingView, Platform, Alert, SafeAreaView 
} from 'react-native';
import { User, Phone, Mail, Calendar, Edit3, Check, Car } from 'lucide-react-native';
import { UserContext } from '../UserContext'; 

const InfoRow = ({ icon: Icon, label, field, keyboardType = "default", isEditing, profileData, setProfileData }) => (
  <View style={styles.infoRow}>
    <View style={styles.leftRowContent}>
      <Icon size={16} color="#64748b" style={{ marginRight: 8 }} />
      <Text style={styles.label}>{label}</Text>
    </View>
    <View style={styles.rightRowContent}>
      {isEditing ? (
        <TextInput
          style={styles.input}
          value={profileData[field]}
          onChangeText={(text) => setProfileData({ ...profileData, [field]: text })}
          keyboardType={keyboardType}
          autoCorrect={false}
          placeholder={`Enter ${label.toLowerCase()}`}
          placeholderTextColor="#94a3b8"
        />
      ) : (
        <Text style={styles.value}>{profileData[field] || 'Not Set'}</Text>
      )}
    </View>
  </View>
);

const ProfileScreen = () => {
  const { user, login } = useContext(UserContext); 
  const [isEditing, setIsEditing] = useState(false);

  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    email: user?.email || '',
    dob: user?.dob || '', 
  });

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        phone: user.phone || '',
        email: user.email || '',
        dob: user.dob || '',
      });
    }
  }, [user]);

  const handleSave = () => {
    if (typeof login === 'function') {
      login({ ...user, ...profileData });
      setIsEditing(false);
      Alert.alert("Success", "Profile updated successfully!");
    } else {
      setIsEditing(false);
      Alert.alert("Local Save", "Profile states updated successfully.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          
          {/* Header Action Row Layout */}
          <View style={styles.headerActionRow}>
            <Text style={styles.headerTitle}>Profile</Text>
            <TouchableOpacity 
              style={[styles.headerIconButton, isEditing && styles.saveActiveButton]} 
              onPress={isEditing ? handleSave : () => setIsEditing(true)}
            >
              {isEditing ? (
                <Check size={20} color="#ffffff" />
              ) : (
                <Edit3 size={20} color="#1e293b" />
              )}
            </TouchableOpacity>
          </View>

          {/* Hero Profile Avatar Identity Layer */}
          <View style={styles.heroCenterBlock}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>
                {profileData.name ? profileData.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'U'}
              </Text>
            </View>
            
            {isEditing ? (
              <TextInput
                style={[styles.userNameInput]}
                value={profileData.name}
                onChangeText={(text) => setProfileData({ ...profileData, name: text })}
                autoCorrect={false}
                placeholder="Full Name"
                placeholderTextColor="#94a3b8"
              />
            ) : (
              <Text style={styles.userNameText}>{profileData.name || 'User'}</Text>
            )}

            {/* Premium Outlined Pill Badge */}
            <View style={styles.premiumBadge}>
              <Text style={styles.premiumBadgeText}>PREMIUM MEMBER</Text>
            </View>
          </View>

          {/* Account Credentials Info Block */}
          <View style={styles.section}>
            <View style={styles.card}>
              <InfoRow icon={User} label="NAME" field="name" isEditing={isEditing} profileData={profileData} setProfileData={setProfileData} />
              <InfoRow icon={Phone} label="PHONE" field="phone" isEditing={isEditing} profileData={profileData} setProfileData={setProfileData} keyboardType="phone-pad" />
              <InfoRow icon={Mail} label="EMAIL" field="email" isEditing={isEditing} profileData={profileData} setProfileData={setProfileData} keyboardType="email-address" />
              <InfoRow icon={Calendar} label="DATE OF BIRTH" field="dob" isEditing={isEditing} profileData={profileData} setProfileData={setProfileData} />
            </View>
          </View>

          {/* Primary Vehicle Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>
                VEHICLES ({user?.vehicles ? user.vehicles.length : (user?.vehicleBrand ? 1 : 0)})
              </Text>
              <View style={styles.sectionTitleLine} />
            </View>
            
            <View style={[styles.card, styles.vehicleCard]}>
              <View style={styles.vehicleIconBox}>
                <Car size={22} color="#facc15" />
              </View>
              <View style={styles.vehicleDetails}>
                {user?.vehicles && user.vehicles.length > 0 ? (
                  <>
                    <Text style={styles.vehicleName}>
                      {user.vehicles[0].brand || user.vehicles[0].vehicleBrand || 'Vehicle'} {user.vehicles[0].model || user.vehicles[0].vehicleModel || ''}
                    </Text>
                    <Text style={styles.vehiclePlate}>
                      {user.vehicles[0].plate || user.vehicles[0].vehicleNo || 'No Plate'}
                    </Text>
                  </>
                ) : user?.vehicleBrand ? (
                  <>
                    <Text style={styles.vehicleName}>
                      {user.vehicleBrand} {user.vehicleModel || ''}
                    </Text>
                    <Text style={styles.vehiclePlate}>{user.vehicleNo || 'No Plate'}</Text>
                  </>
                ) : (
                  <>
                    <Text style={styles.vehicleName}>No Vehicles Added</Text>
                    <Text style={styles.vehiclePlate}>Tap to link a vehicle</Text>
                  </>
                )}
              </View>
              {(user?.vehicles?.length > 0 || user?.vehicleBrand) && (
                <View style={styles.activeBadge}>
                  <Text style={styles.activeBadgeText}>PRIMARY</Text>
                </View>
              )}
            </View>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#f8fafc' 
  },
  scrollContent: { 
    paddingHorizontal: 24, 
    paddingTop: Platform.OS === 'android' ? 20 : 10,
    paddingBottom: 40 
  },
  headerActionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: '#0f172a'
  },
  headerIconButton: {
    backgroundColor: '#ffffff',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 1
  },
  saveActiveButton: {
    backgroundColor: '#10b981',
    borderColor: '#10b981'
  },
  heroCenterBlock: { 
    alignItems: 'center', 
    marginVertical: 12 
  },
  avatarCircle: { 
    width: 104, 
    height: 104, 
    borderRadius: 52, 
    backgroundColor: '#facc15', 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginBottom: 16,
    shadowColor: '#facc15',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4
  },
  avatarText: { 
    color: '#0f172a', 
    fontSize: 34, 
    fontWeight: '900' 
  },
  userNameText: { 
    fontSize: 24, 
    fontWeight: '900', 
    color: '#0f172a',
    letterSpacing: -0.5
  },
  userNameInput: {
    fontSize: 22,
    fontWeight: '900',
    color: '#2563eb',
    borderBottomWidth: 1.5,
    borderColor: '#2563eb',
    paddingHorizontal: 8,
    paddingVertical: 2,
    textAlign: 'center',
    minWidth: 160
  },
  premiumBadge: { 
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#ffffff',
    paddingVertical: 6, 
    paddingHorizontal: 16, 
    borderRadius: 50, 
    marginTop: 10
  },
  premiumBadgeText: { 
    color: '#facc15', 
    fontSize: 10, 
    fontWeight: '800', 
    letterSpacing: 1 
  },
  section: { 
    marginTop: 24 
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    paddingHorizontal: 4
  },
  sectionTitle: { 
    fontSize: 11, 
    fontWeight: '800', 
    color: '#94a3b8', 
    letterSpacing: 1 
  },
  sectionTitleLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e2e8f0',
    marginLeft: 12
  },
  card: { 
    backgroundColor: '#ffffff', 
    borderRadius: 28, 
    padding: 20, 
    borderWidth: 1,
    borderColor: '#edf2f7',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.03,
    shadowRadius: 16,
    elevation: 2 
  },
  infoRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between',
    alignItems: 'center', 
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9'
  },
  leftRowContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 0.35
  },
  rightRowContent: {
    flex: 0.65,
    alignItems: 'flex-end'
  },
  label: { 
    fontSize: 11, 
    color: '#94a3b8', 
    fontWeight: '700', 
    letterSpacing: 0.5 
  },
  value: { 
    fontSize: 15, 
    color: '#1e293b', 
    fontWeight: '700',
    textAlign: 'right'
  },
  input: { 
    fontSize: 15, 
    color: '#2563eb', 
    fontWeight: '700', 
    padding: 0,
    textAlign: 'right',
    width: '100%'
  },
  vehicleCard: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: 16 
  },
  vehicleIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#0f172a',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16
  },
  vehicleDetails: { 
    flex: 1 
  },
  vehicleName: { 
    fontSize: 16, 
    fontWeight: '800', 
    color: '#0f172a' 
  },
  vehiclePlate: { 
    fontSize: 12, 
    color: '#64748b', 
    fontWeight: '700', 
    marginTop: 2 
  },
  activeBadge: { 
    backgroundColor: '#e6fbf2', 
    paddingHorizontal: 12, 
    paddingVertical: 6, 
    borderRadius: 10 
  },
  activeBadgeText: { 
    color: '#10b981', 
    fontSize: 10, 
    fontWeight: '800',
    letterSpacing: 0.5 
  }
});

export default ProfileScreen;