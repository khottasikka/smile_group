import React, { useState, useContext, useEffect } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, TouchableOpacity, 
  TextInput, KeyboardAvoidingView, Platform, Alert, SafeAreaView 
} from 'react-native';
import { User, Phone, Mail, Calendar, Edit3, Check, Car } from 'lucide-react-native';
import { UserContext } from '../UserContext'; 

// --- FIX 1: MOVE THIS COMPONENT OUTSIDE THE MAIN FUNCTION ---
const InfoRow = ({ icon: Icon, label, field, keyboardType = "default", isEditing, profileData, setProfileData }) => (
  <View style={styles.infoRow}>
    <View style={styles.iconContainer}>
      <Icon size={20} color="#2563eb" />
    </View>
    <View style={styles.textContainer}>
      <Text style={styles.label}>{label}</Text>
      {isEditing ? (
        <TextInput
          style={styles.input}
          value={profileData[field]}
          onChangeText={(text) => setProfileData({ ...profileData, [field]: text })}
          keyboardType={keyboardType}
          autoCorrect={false} // Prevents some keyboard glitches
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
    login({ ...user, ...profileData });
    setIsEditing(false);
    Alert.alert("Success", "Profile updated successfully!");
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>
                {profileData.name ? profileData.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U'}
              </Text>
            </View>
            <Text style={styles.userName}>{user?.name || 'User'}</Text>
            <Text style={styles.userRole}>Premium Member</Text>
          </View>

          <TouchableOpacity 
            style={[styles.editBtn, isEditing && styles.saveBtn]} 
            onPress={isEditing ? handleSave : () => setIsEditing(true)}
          >
            {isEditing ? (
              <><Check size={18} color="#fff" /><Text style={styles.editBtnText}>Save Changes</Text></>
            ) : (
              <><Edit3 size={18} color="#fff" /><Text style={styles.editBtnText}>Edit Profile</Text></>
            )}
          </TouchableOpacity>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Personal Information</Text>
            <View style={styles.card}>
              {/* Pass all necessary props to the now-external InfoRow */}
              <InfoRow icon={User} label="Full Name" field="name" isEditing={isEditing} profileData={profileData} setProfileData={setProfileData} />
              <InfoRow icon={Phone} label="Phone Number" field="phone" isEditing={isEditing} profileData={profileData} setProfileData={setProfileData} keyboardType="phone-pad" />
              <InfoRow icon={Mail} label="Email Address" field="email" isEditing={isEditing} profileData={profileData} setProfileData={setProfileData} keyboardType="email-address" />
              <InfoRow icon={Calendar} label="Date of Birth" field="dob" isEditing={isEditing} profileData={profileData} setProfileData={setProfileData} />
            </View>
          </View>

          {/* ... Vehicle section and Styles remain the same ... */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Primary Vehicle</Text>
            <View style={[styles.card, styles.vehicleCard]}>
                <Car size={24} color="#2563eb" />
                <View style={styles.vehicleDetails}>
                <Text style={styles.vehicleName}>
                    {user?.vehicleBrand || 'Vehicle'} {user?.vehicleModel || ''}
                </Text>
                <Text style={styles.vehiclePlate}>{user?.vehicleNo || 'Not Set'}</Text>
                </View>
                <View style={styles.activeBadge}>
                <Text style={styles.activeBadgeText}>Verified</Text>
                </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};


const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  scrollContent: { padding: 20, paddingBottom: 40 },
  header: { alignItems: 'center', marginBottom: 20 },
  avatarCircle: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#2563eb', justifyContent: 'center', alignItems: 'center', marginBottom: 15, elevation: 5 },
  avatarText: { color: '#fff', fontSize: 32, fontWeight: '800' },
  userName: { fontSize: 24, fontWeight: '800', color: '#0f172a' },
  userRole: { fontSize: 14, color: '#64748b', marginTop: 4 },
  editBtn: { backgroundColor: '#2563eb', flexDirection: 'row', paddingVertical: 12, paddingHorizontal: 20, borderRadius: 12, justifyContent: 'center', alignItems: 'center', alignSelf: 'center', marginTop: 10, gap: 8 },
  saveBtn: { backgroundColor: '#22c55e' },
  editBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  section: { marginTop: 30 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#64748b', marginBottom: 12, marginLeft: 4 },
  card: { backgroundColor: '#fff', borderRadius: 20, padding: 16, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 10 },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  iconContainer: { width: 40, height: 40, borderRadius: 10, backgroundColor: '#eff6ff', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  textContainer: { flex: 1, borderBottomWidth: 1, borderBottomColor: '#f1f5f9', paddingBottom: 10 },
  label: { fontSize: 12, color: '#94a3b8', fontWeight: '600', textTransform: 'uppercase' },
  value: { fontSize: 16, color: '#1e293b', fontWeight: '600', marginTop: 2 },
  input: { fontSize: 16, color: '#2563eb', fontWeight: '600', marginTop: 2, padding: 0 },
  vehicleCard: { flexDirection: 'row', alignItems: 'center', gap: 15 },
  vehicleDetails: { flex: 1 },
  vehicleName: { fontSize: 18, fontWeight: '700', color: '#1e293b' },
  vehiclePlate: { fontSize: 14, color: '#64748b', fontWeight: '600' },
  activeBadge: { backgroundColor: '#f0fdf4', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  activeBadgeText: { color: '#22c55e', fontSize: 12, fontWeight: '700' }
});

export default ProfileScreen;