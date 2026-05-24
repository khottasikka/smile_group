import React, { useState, useContext } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, StyleSheet, 
  KeyboardAvoidingView, Platform, SafeAreaView, Alert, 
  ScrollView, TouchableWithoutFeedback, Keyboard 
} from 'react-native';
import { ArrowRight, ArrowLeft, ShieldCheck, Calendar as CalendarIcon } from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { UserContext } from '../UserContext'; 

const AuthScreen = () => {
  // 1. Pull the login function from your context
  const { login } = useContext(UserContext); 
  
  const [isLogin, setIsLogin] = useState(true);
  const [step, setStep] = useState(1);

  // Form States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [vehicleModel, setVehicleModel] = useState('');
  const [vehicleNo, setVehicleNo] = useState('');
  const [dob, setDob] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [dobText, setDobText] = useState(''); 
  const [vehicleType, setVehicleType] = useState('Car');
  const [vehicleBrand, setVehicleBrand] = useState('');

  const handleLogin = () => {
    if ((email || phone) && password) {
      // Calling context login - this will trigger the screen switch automatically
      login({
        name: email.split('@')[0] || 'User',
        email: email,
        phone: phone,
        balance: 1250.75,
        vehicleBrand: 'Triumph', 
        vehicleModel: 'Speed 400',
        vehicleNo: 'OD-02-AX-1234'
      });
    } else {
      Alert.alert("Error", "Please enter your credentials");
    }
  };

  const handleRegister = () => {
    // Check all required fields including the new vehicle brand and dob
    if (vehicleBrand && vehicleModel && vehicleNo && name && dobText) {
      
      login({
        name: name,
        email: email || `${name.toLowerCase().replace(/\s/g, '')}@example.com`,
        phone: phone,
        dob: dobText, 
        vehicleNo: vehicleNo,
        vehicleBrand: vehicleBrand, 
        vehicleModel: vehicleModel, 
        vehicleType: vehicleType,
        balance: 500.00 
      });

      Alert.alert("Success", `Welcome ${name}! Your account is ready.`);
      
    } else {
      Alert.alert("Error", "Please fill in all details, including Date of Birth");
    }
  };

  const onDateChange = (event, selectedDate) => {
    if (Platform.OS === 'android') {
      setShowPicker(false);
    }
    
    if (selectedDate) {
      setDob(selectedDate);
      let fDate = selectedDate.getDate().toString().padStart(2, '0') + '/' + 
                  (selectedDate.getMonth() + 1).toString().padStart(2, '0') + '/' + 
                  selectedDate.getFullYear();
      setDobText(fDate);
    }
  };

  const formatVehicleNumber = (text) => {
    const cleaned = text.replace(/[^A-Z0-9]/gi, '').toUpperCase();
    let formatted = cleaned;
    if (cleaned.length > 2) formatted = cleaned.slice(0, 2) + '-' + cleaned.slice(2);
    if (cleaned.length > 4) formatted = formatted.slice(0, 5) + '-' + cleaned.slice(4);
    if (cleaned.length > 6) formatted = formatted.slice(0, 8) + '-' + cleaned.slice(6, 10);
    setVehicleNo(formatted.slice(0, 13));
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={{ flex: 1 }}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView 
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.header}>
              <View style={styles.logoBadge}>
                 <ShieldCheck size={40} color="#2563eb" />
              </View>
              <Text style={styles.title}>
                {isLogin ? 'Welcome Back' : (step === 1 ? 'Create Account' : 'Vehicle Details')}
              </Text>
              <Text style={styles.subtitle}>
                {isLogin 
                  ? 'Login to manage your parking sessions' 
                  : (step === 1 ? 'Enter your personal details to join' : 'Tell us what you drive')}
              </Text>
            </View>

            <View style={styles.form}>
              {isLogin ? (
                <>
                  <View style={styles.inputContainer}>
                    <Text style={styles.label}>Email or Phone</Text>
                    <TextInput 
                      style={styles.input}
                      placeholder="Enter email or phone" 
                      value={email}
                      onChangeText={setEmail}
                      keyboardType="email-address"
                      autoCapitalize="none"
                    />
                  </View>
                  <View style={styles.inputContainer}>
                    <Text style={styles.label}>Password</Text>
                    <TextInput 
                      style={styles.input}
                      placeholder="Enter password"
                      secureTextEntry
                      value={password}
                      onChangeText={setPassword}
                    />
                  </View>
                  <TouchableOpacity style={styles.button} onPress={handleLogin}>
                    <Text style={styles.buttonText}>Sign In</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  {step === 1 ? (
                    <>
                      <View style={styles.inputContainer}>
                        <Text style={styles.label}>Full Name</Text>
                        <TextInput style={styles.input} placeholder="Mayank" value={name} onChangeText={setName} />
                      </View>
                      <View style={styles.inputContainer}>
                        <Text style={styles.label}>Phone Number</Text>
                        <TextInput style={styles.input} placeholder="9876543210" keyboardType="phone-pad" value={phone} onChangeText={setPhone} />
                      </View>

                      <View style={styles.inputContainer}>
                        <Text style={styles.label}>Date of Birth</Text>
                        <TouchableOpacity 
                          style={[styles.input, { justifyContent: 'center' }]} 
                          onPress={() => setShowPicker(true)}
                        >
                          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Text style={{ color: dobText ? '#0f172a' : '#94a3b8', fontSize: 15 }}>
                              {dobText || "Select your birthday"}
                            </Text>
                            <CalendarIcon size={18} color="#94a3b8" />
                          </View>
                        </TouchableOpacity>

                        {showPicker && (
                          <View style={styles.pickerContainer}>
                            {Platform.OS === 'ios' && (
                              <TouchableOpacity 
                                style={styles.doneButton} 
                                onPress={() => setShowPicker(false)}
                              >
                                <Text style={styles.doneButtonText}>Done</Text>
                              </TouchableOpacity>
                            )}
                            <DateTimePicker
                              value={dob}
                              mode="date"
                              display={Platform.OS === 'ios' ? 'inline' : 'default'}
                              maximumDate={new Date()} 
                              onChange={onDateChange}
                            />
                          </View>
                        )}
                      </View>

                      <TouchableOpacity style={styles.button} onPress={() => setStep(2)}>
                        <Text style={styles.buttonText}>Next</Text>
                        <ArrowRight size={18} color="#fff" style={{marginLeft: 8}} />
                      </TouchableOpacity>
                    </>
                  ) : (
                    <>
                      <View style={styles.inputContainer}>
                        <Text style={styles.label}>Vehicle Type</Text>
                        <View style={styles.typeRow}>
                          {['Car', 'Bike', 'EV'].map((type) => (
                            <TouchableOpacity 
                              key={type} 
                              style={[styles.typeBtn, vehicleType === type && styles.typeBtnActive]} 
                              onPress={() => setVehicleType(type)}
                            >
                              <Text style={[styles.typeBtnText, vehicleType === type && styles.typeBtnTextActive]}>
                                {type === 'Car' ? '🚗 Car' : type === 'Bike' ? '🏍️ Bike' : '⚡ EV'}
                              </Text>
                            </TouchableOpacity>
                          ))}
                        </View>
                      </View>

                      <View style={styles.inputContainer}>
                        <Text style={styles.label}>Vehicle Brand & Name</Text>
                        <TextInput style={styles.input} placeholder="e.g. Triumph" value={vehicleBrand} onChangeText={setVehicleBrand} />
                      </View>

                      <View style={styles.inputContainer}>
                        <Text style={styles.label}>Model/Variant</Text>
                        <TextInput style={styles.input} placeholder="e.g. Speed 400" value={vehicleModel} onChangeText={setVehicleModel} />
                      </View>

                      <View style={styles.inputContainer}>
                        <Text style={styles.label}>Vehicle Number</Text>
                        <TextInput 
                          style={styles.input} 
                          placeholder="OD-02-XX-0000" 
                          autoCapitalize="characters" 
                          value={vehicleNo} 
                          onChangeText={formatVehicleNumber} 
                        />
                      </View>

                      <View style={styles.buttonRow}>
                        <TouchableOpacity style={[styles.button, styles.backBtn]} onPress={() => setStep(1)}>
                          <ArrowLeft size={18} color="#64748b" />
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.button, {flex: 1}]} onPress={handleRegister}>
                          <Text style={styles.buttonText}>Complete</Text>
                        </TouchableOpacity>
                      </View>
                    </>
                  )}
                </>
              )}

              <TouchableOpacity 
                onPress={() => {
                  setIsLogin(!isLogin);
                  setStep(1); 
                }} 
                style={styles.toggle}
              >
                <Text style={styles.toggleText}>
                  {isLogin ? "New user? " : "Already have an account? "}
                  <Text style={styles.toggleLink}>{isLogin ? 'Create an account' : 'Login'}</Text>
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  scrollContent: { padding: 24, paddingBottom: 40, justifyContent: 'center', flexGrow: 1 },
  header: { alignItems: 'center', marginBottom: 30, marginTop: 20 },
  logoBadge: { width: 80, height: 80, backgroundColor: '#eff6ff', borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  title: { fontSize: 26, fontWeight: '800', color: '#0f172a', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#64748b', textAlign: 'center', paddingHorizontal: 20 },
  form: { width: '100%', maxWidth: 400, alignSelf: 'center' },
  inputContainer: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '700', color: '#334155', marginBottom: 6 },
  input: { backgroundColor: '#f8fafc', borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0', paddingHorizontal: 16, height: 52, fontSize: 15, color: '#0f172a' },
  button: { backgroundColor: '#2563eb', height: 52, borderRadius: 12, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 8 },
  buttonRow: { flexDirection: 'row', gap: 12 },
  backBtn: { backgroundColor: '#f1f5f9', width: 52 },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  toggle: { marginTop: 24, alignItems: 'center' },
  toggleText: { color: '#64748b', fontSize: 13 },
  toggleLink: { color: '#2563eb', fontWeight: '700' },
  typeRow: { flexDirection: 'row', gap: 8, marginTop: 4 },
  typeBtn: { flex: 1, height: 48, borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0', justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  typeBtnActive: { backgroundColor: '#eff6ff', borderColor: '#2563eb' },
  typeBtnText: { fontSize: 14, fontWeight: '600', color: '#64748b' },
  typeBtnTextActive: { color: '#2563eb' },
  pickerContainer: { backgroundColor: '#f8fafc', borderRadius: 12, marginTop: 8, padding: 10, borderWidth: 1, borderColor: '#e2e8f0' },
  doneButton: { alignSelf: 'flex-end', padding: 8 },
  doneButtonText: { color: '#2563eb', fontWeight: '700', fontSize: 16 },
});

export default AuthScreen;