import React, { useState, useContext, useRef, useEffect } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, StyleSheet, 
  KeyboardAvoidingView, Platform, SafeAreaView, Alert, 
  ScrollView, TouchableWithoutFeedback, Keyboard, ActivityIndicator,
  FlatList, LayoutAnimation
} from 'react-native';
import { 
  ArrowRight, ArrowLeft, ShieldCheck, Calendar as CalendarIcon, 
  Eye, EyeOff, CheckSquare, Square, CheckCircle2 
} from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { UserContext } from '../UserContext'; 

// Luxury brand suggestion constants based on vehicleType selection
const CAR_BRANDS = ['Tata', 'Mahindra', 'Hyundai', 'Toyota', 'BMW', 'Mercedes'];
const BIKE_BRANDS = ['Triumph', 'Royal Enfield', 'KTM', 'Honda', 'Yamaha', 'Kawasaki'];

const AuthScreen = () => {
  const { login } = useContext(UserContext); 
  
  const [isLogin, setIsLogin] = useState(true);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [secureText, setSecureText] = useState(true);

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

  // New States for requested premium upgrades
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [hsrpVerifying, setHsrpVerifying] = useState(false);
  const [hsrpVerified, setHsrpVerified] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Upgrade States: OTP Verification Layout
  const [showOtpScreen, setShowOtpScreen] = useState(false);
  const [otpCode, setOtpCode] = useState(['', '', '', '']);
  const [timer, setTimer] = useState(59);
  const otpInputs = useRef([]);

  // Smooth cinematic layout transition handler
  const navigateToStep = (nextStep) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setStep(nextStep);
  };

  // OTP Countdown Clock Timer effect
  useEffect(() => {
    let interval;
    if (showOtpScreen && timer > 0) {
      interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [showOtpScreen, timer]);

  const handleLogin = () => {
    if ((email || phone) && password) {
      setLoading(true);
      setTimeout(() => {
        login({
          name: email.split('@')[0] || 'User',
          email: email,
          phone: phone,
          balance: 1250.75,
          vehicleBrand: 'Triumph', 
          vehicleModel: 'Speed 400',
          vehicleNo: 'OD-02-AX-1234'
        });
        setLoading(false);
      }, 1000);
    } else {
      Alert.alert("Error", "Please enter your credentials");
    }
  };

  const handleRegister = () => {
    if (!agreeTerms) {
      Alert.alert("Terms & Conditions", "Please accept the Terms of Service and Privacy Policy to create your account.");
      return;
    }
    if (!hsrpVerified) {
      Alert.alert("Verification Needed", "Please verify your High-Security Registration Plate (HSRP) number before completing.");
      return;
    }

    if (vehicleBrand && vehicleModel && vehicleNo && name && dobText) {
      // Divert into verification passkey timeline screen layout
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setShowOtpScreen(true);
      setTimer(59);
    } else {
      Alert.alert("Error", "Please fill in all details, including Date of Birth");
    }
  };

  const handleOtpChange = (text, index) => {
    const cleanedText = text.replace(/[^0-9]/g, '');
    const newOtp = [...otpCode];
    newOtp[index] = cleanedText;
    setOtpCode(newOtp);

    // Forward Focus matrix shifting lookahead logic
    if (cleanedText && index < 3) {
      otpInputs.current[index + 1]?.focus();
    }
  };

  const verifyOtpAndLogin = () => {
    if (otpCode.join('').length < 4) {
      Alert.alert("Invalid Passcode", "Please populate all 4 code block placeholders first.");
      return;
    }
    
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
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
      Alert.alert("Success", `Welcome ${name}! Your profile verification is complete.`);
    }, 1200);
  };

  const verifyVehicleHSRP = () => {
    if (vehicleNo.length < 6) {
      Alert.alert("Invalid Number", "Please complete typing a valid vehicle plate format first.");
      return;
    }
    setHsrpVerifying(true);
    setTimeout(() => {
      setHsrpVerifying(false);
      setHsrpVerified(true);
    }, 1500);
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
    setHsrpVerified(false); // Reset lookup verification signature if text fields morph
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
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.header}>
              <View style={styles.logoBadge}>
                 <ShieldCheck size={38} color="#D4AF37" />
              </View>
              <Text style={styles.title}>
                {showOtpScreen ? 'Security Check' : isLogin ? 'Welcome Back' : (step === 1 ? 'Create Account' : 'Vehicle Details')}
              </Text>
              <Text style={styles.subtitle}>
                {showOtpScreen 
                  ? 'Verify authentication request identity'
                  : isLogin 
                    ? 'Login to manage your premium parking sessions' 
                    : (step === 1 ? 'Enter your personal details to join us' : 'Tell us what you drive')}
              </Text>
            </View>

            <View style={styles.form}>
              {showOtpScreen ? (
                <>
                  <Text style={[styles.subtitle, { textAlign: 'left', paddingHorizontal: 0, marginBottom: 20 }]}>
                    We sent an elegant passcode to <Text style={{ fontWeight: '700', color: '#1C1C1E' }}>{phone || 'your mobile device'}</Text>.
                  </Text>
                  
                  <View style={styles.otpRow}>
                    {[0, 1, 2, 3].map((index) => (
                      <TextInput
                        key={index}
                        ref={(el) => (otpInputs.current[index] = el)}
                        style={styles.otpInput}
                        keyboardType="number-pad"
                        maxLength={1}
                        value={otpCode[index]}
                        onChangeText={(text) => handleOtpChange(text, index)}
                        onKeyPress={({ nativeEvent }) => {
                          if (nativeEvent.key === 'Backspace' && !otpCode[index] && index > 0) {
                            otpInputs.current[index - 1]?.focus();
                          }
                        }}
                      />
                    ))}
                  </View>

                  <Text style={styles.mockHint}>
                    * Please enter any 4 digit number for the mock OTP validation.
                  </Text>

                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 15, marginBottom: 25 }}>
                    <Text style={{ color: '#6A6A6E', fontSize: 13 }}>
                      {timer > 0 ? `Resend code in ${timer}s` : "Didn't receive the passcode?"}
                    </Text>
                    {timer === 0 && (
                      <TouchableOpacity onPress={() => setTimer(59)}>
                        <Text style={[styles.goldText, { fontSize: 13, fontWeight: '700' }]}>Resend OTP</Text>
                      </TouchableOpacity>
                    )}
                  </View>

                  <TouchableOpacity style={styles.button} onPress={verifyOtpAndLogin} disabled={loading}>
                    {loading ? <ActivityIndicator color="#D4AF37" /> : <Text style={styles.buttonText}>Verify & Authorize</Text>}
                  </TouchableOpacity>

                  <TouchableOpacity 
                    onPress={() => {
                      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                      setShowOtpScreen(false);
                    }} 
                    style={[styles.toggle, { marginTop: 16 }]}
                  >
                    <Text style={styles.toggleLink}>Modify Registry Profile</Text>
                  </TouchableOpacity>
                </>
              ) : isLogin ? (
                <>
                  <View style={styles.inputContainer}>
                    <Text style={styles.label}>Email or Phone</Text>
                    <TextInput 
                      style={styles.input}
                      placeholder="Enter email or phone" 
                      placeholderTextColor="#A4A4A4"
                      value={email}
                      onChangeText={setEmail}
                      keyboardType="email-address"
                      autoCapitalize="none"
                    />
                  </View>
                  <View style={styles.inputContainer}>
                    <Text style={styles.label}>Password</Text>
                    <View style={styles.passwordWrapper}>
                      <TextInput 
                        style={styles.passwordInput}
                        placeholder="Enter password"
                        placeholderTextColor="#A4A4A4"
                        secureTextEntry={secureText}
                        value={password}
                        onChangeText={setPassword}
                      />
                      <TouchableOpacity style={styles.eyeIcon} onPress={() => setSecureText(!secureText)}>
                        {secureText ? <Eye size={20} color="#A4A4A4" /> : <EyeOff size={20} color="#D4AF37" />}
                      </TouchableOpacity>
                    </View>
                  </View>
                  <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
                    {loading ? <ActivityIndicator color="#D4AF37" /> : <Text style={styles.buttonText}>Sign In</Text>}
                  </TouchableOpacity>

                  {/* MINIMAL BRAND SOCIAL SSO PORTAL */}
                  <View style={styles.dividerContainer}>
                    <View style={styles.dividerLine} />
                    <Text style={styles.dividerText}>or continue with</Text>
                    <View style={styles.dividerLine} />
                  </View>

                  <View style={styles.ssoRow}>
                    <TouchableOpacity style={styles.ssoButton} onPress={() => Alert.alert("SSO", "Connecting Apple Identity Engine...")}>
                      <Text style={styles.ssoButtonText}> Apple</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.ssoButton} onPress={() => Alert.alert("SSO", "Connecting Google Identity Engine...")}>
                      <Text style={styles.ssoButtonText}>G Google</Text>
                    </TouchableOpacity>
                  </View>
                </>
              ) : (
                <>
                  {step === 1 ? (
                    <>
                      <View style={styles.inputContainer}>
                        <Text style={styles.label}>Full Name</Text>
                        <TextInput style={styles.input} placeholder="Mayank" placeholderTextColor="#A4A4A4" value={name} onChangeText={setName} />
                      </View>
                      <View style={styles.inputContainer}>
                        <Text style={styles.label}>Phone Number</Text>
                        <TextInput style={styles.input} placeholder="9876543210" placeholderTextColor="#A4A4A4" keyboardType="phone-pad" value={phone} onChangeText={setPhone} />
                      </View>

                      <View style={styles.inputContainer}>
                        <Text style={styles.label}>Date of Birth</Text>
                        <TouchableOpacity 
                          style={[styles.input, { justifyContent: 'center' }]} 
                          onPress={() => setShowPicker(true)}
                        >
                          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Text style={{ color: dobText ? '#1C1C1E' : '#A4A4A4', fontSize: 15 }}>
                              {dobText || "Select your birthday"}
                            </Text>
                            <CalendarIcon size={18} color="#D4AF37" />
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
                              accentColor="#D4AF37"
                            />
                          </View>
                        )}
                      </View>

                      <TouchableOpacity style={styles.button} onPress={() => navigateToStep(2)}>
                        <Text style={styles.buttonText}>Next Step</Text>
                        <ArrowRight size={18} color="#D4AF37" style={{marginLeft: 8}} />
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
                              onPress={() => {
                                setVehicleType(type);
                                setVehicleBrand('');
                                setVehicleModel('');
                              }}
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
                        <TextInput 
                          style={styles.input} 
                          placeholder={vehicleType === 'Bike' ? "e.g. Triumph" : "e.g. Tata"} 
                          placeholderTextColor="#A4A4A4"
                          value={vehicleBrand} 
                          onChangeText={setVehicleBrand}
                          onFocus={() => setShowSuggestions(true)}
                        />
                        
                        {showSuggestions && (
                          <FlatList
                            data={vehicleType === 'Bike' ? BIKE_BRANDS : CAR_BRANDS}
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            keyExtractor={(item) => item}
                            style={styles.suggestionList}
                            contentContainerStyle={{ gap: 8, paddingRight: 16 }}
                            renderItem={({ item }) => (
                              <TouchableOpacity 
                                style={styles.suggestionBadge} 
                                onPress={() => {
                                  setVehicleBrand(item);
                                  setShowSuggestions(false);
                                  Keyboard.dismiss();
                                }}
                              >
                                <Text style={styles.suggestionBadgeText}>{item}</Text>
                              </TouchableOpacity>
                            )}
                          />
                        )}
                      </View>

                      <View style={styles.inputContainer}>
                        <Text style={styles.label}>Model/Variant</Text>
                        <TextInput 
                          style={styles.input} 
                          placeholder={vehicleType === 'Bike' ? "e.g. Speed 400" : "e.g. Nexon"} 
                          placeholderTextColor="#A4A4A4"
                          value={vehicleModel} 
                          onChangeText={setVehicleModel} 
                        />
                      </View>

                      <View style={styles.inputContainer}>
                        <Text style={styles.label}>Vehicle Number</Text>
                        <TextInput 
                          style={styles.input} 
                          placeholder="OD-02-XX-0000" 
                          placeholderTextColor="#A4A4A4"
                          autoCapitalize="characters" 
                          value={vehicleNo} 
                          onChangeText={formatVehicleNumber} 
                        />
                      </View>

                      {vehicleNo.length > 0 && (
                        <View style={styles.plateWrapper}>
                          <View style={styles.plateBorderContainer}>
                            <View style={styles.plateBlueStripe}>
                              <Text style={styles.plateIndText}>IND</Text>
                              <View style={styles.plateChakra} />
                            </View>
                            <View style={styles.plateMainContent}>
                              <Text style={styles.plateNumberText}>{vehicleNo || "OD-02-XX-0000"}</Text>
                            </View>
                          </View>
                          
                          <TouchableOpacity 
                            style={[styles.verifyBadge, hsrpVerified && styles.verifyBadgeSuccess]} 
                            onPress={verifyVehicleHSRP}
                            disabled={hsrpVerifying || hsrpVerified}
                          >
                            {hsrpVerifying ? (
                              <ActivityIndicator size="small" color="#1C1C1E" />
                            ) : hsrpVerified ? (
                              <View style={{flexDirection: 'row', alignItems: 'center', gap: 4}}>
                                <CheckCircle2 size={14} color="#155724" />
                                <Text style={styles.verifyBadgeTextSuccess}>Verified RTO Data</Text>
                              </View>
                            ) : (
                              <Text style={styles.verifyBadgeText}>Verify Plate</Text>
                            )}
                          </TouchableOpacity>
                        </View>
                      )}

                      <TouchableOpacity 
                        style={styles.checkboxContainer} 
                        onPress={() => setAgreeTerms(!agreeTerms)}
                        activeOpacity={0.8}
                      >
                        {agreeTerms ? (
                          <CheckSquare size={22} color="#D4AF37" />
                        ) : (
                          <Square size={22} color="#A4A4A4" />
                        )}
                        <Text style={styles.checkboxLabel}>
                          I agree to the premium <Text style={styles.goldText}>Terms of Service</Text> and <Text style={styles.goldText}>Privacy Guidelines</Text>.
                        </Text>
                      </TouchableOpacity>

                      <View style={styles.buttonRow}>
                        <TouchableOpacity style={[styles.button, styles.backBtn]} onPress={() => navigateToStep(1)}>
                          <ArrowLeft size={18} color="#1C1C1E" />
                        </TouchableOpacity>
                        <TouchableOpacity 
                          style={[styles.button, {flex: 1}, (!agreeTerms || !hsrpVerified) && styles.buttonDisabled]} 
                          onPress={handleRegister} 
                          disabled={loading || !agreeTerms || !hsrpVerified}
                        >
                          {loading ? <ActivityIndicator color="#D4AF37" /> : <Text style={styles.buttonText}>Complete Setup</Text>}
                        </TouchableOpacity>
                      </View>
                    </>
                  )}
                </>
              )}

              {!showOtpScreen && (
                <TouchableOpacity 
                  onPress={() => {
                    setIsLogin(!isLogin);
                    navigateToStep(1); 
                  }} 
                  style={styles.toggle}
                >
                  <Text style={styles.toggleText}>
                    {isLogin ? "New user? " : "Already have an account? "}
                    <Text style={styles.toggleLink}>{isLogin ? 'Create an account' : 'Login'}</Text>
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF9F6' },
  scrollContent: { padding: 24, paddingBottom: 40, justifyContent: 'center', flexGrow: 1 },
  header: { alignItems: 'center', marginBottom: 35, marginTop: 10 },
  logoBadge: { width: 74, height: 74, backgroundColor: '#FFFDF0', borderRadius: 22, justifyContent: 'center', alignItems: 'center', marginBottom: 16, borderWidth: 1, borderColor: '#F3E5AB' },
  title: { fontSize: 28, fontWeight: '800', color: '#1C1C1E', marginBottom: 8, letterSpacing: -0.5 },
  subtitle: { fontSize: 14, color: '#6A6A6E', textAlign: 'center', paddingHorizontal: 15, lineHeight: 20 },
  form: { width: '100%', maxWidth: 400, alignSelf: 'center' },
  inputContainer: { marginBottom: 18 },
  label: { fontSize: 13, fontWeight: '700', color: '#2C2C2E', marginBottom: 8, letterSpacing: 0.3 },
  input: { backgroundColor: '#FFFFFF', borderRadius: 14, borderWidth: 1, borderColor: '#E5E5EA', paddingHorizontal: 16, height: 54, fontSize: 15, color: '#1C1C1E' },
  passwordWrapper: { flexDirection: 'row', backgroundColor: '#FFFFFF', borderRadius: 14, borderWidth: 1, borderColor: '#E5E5EA', alignItems: 'center', paddingHorizontal: 16, height: 54 },
  passwordInput: { flex: 1, height: '100%', fontSize: 15, color: '#1C1C1E' },
  eyeIcon: { padding: 4 },
  
  // Suggestion chips layout
  suggestionList: { marginTop: 8, flexDirection: 'row' },
  suggestionBadge: { backgroundColor: '#FFFDF0', borderColor: '#F3E5AB', borderWidth: 1, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 },
  suggestionBadgeText: { fontSize: 13, color: '#1C1C1E', fontWeight: '600' },
  
  // High Security Registration Plate (HSRP) Component Graphics
  plateWrapper: { width: '100%', alignItems: 'center', gap: 10, marginBottom: 18, marginTop: 4 },
  plateBorderContainer: { width: '100%', height: 50, backgroundColor: '#FFFFFF', borderRadius: 6, borderWidth: 2, borderColor: '#1C1C1E', flexDirection: 'row', overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 1 },
  plateBlueStripe: { width: 34, height: '100%', backgroundColor: '#0033A0', justifyContent: 'center', alignItems: 'center', paddingBottom: 2 },
  plateIndText: { color: '#FFFFFF', fontSize: 8, fontWeight: '700' },
  plateChakra: { width: 6, height: 6, borderRadius: 3, borderWidth: 1, borderColor: '#D4AF37', marginTop: 2 },
  plateMainContent: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  plateNumberText: { fontSize: 20, fontWeight: '700', color: '#1C1C1E', letterSpacing: 3, fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace' },
  
  // Mock RTO validation system UI
  verifyBadge: { backgroundColor: '#F3E5AB', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, alignSelf: 'flex-end' },
  verifyBadgeSuccess: { backgroundColor: '#D4EDDA', borderColor: '#C3E6CB', borderWidth: 1 },
  verifyBadgeText: { fontSize: 12, fontWeight: '700', color: '#1C1C1E' },
  verifyBadgeTextSuccess: { fontSize: 12, fontWeight: '700', color: '#155724' },
  
  // Interactive Terms Checkbox View Layer
  checkboxContainer: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 4, marginBottom: 20, paddingHorizontal: 2 },
  checkboxLabel: { flex: 1, fontSize: 13, color: '#6A6A6E', lineHeight: 18 },
  goldText: { color: '#D4AF37', fontWeight: '600' },
  
  // Action triggers
  button: { backgroundColor: '#1C1C1E', height: 54, borderRadius: 14, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 4, elevation: 2 },
  buttonDisabled: { backgroundColor: '#A4A4A4', shadowOpacity: 0, elevation: 0 },
  buttonRow: { flexDirection: 'row', gap: 12 },
  backBtn: { backgroundColor: '#E5E5EA', width: 54, shadowOpacity: 0 },
  buttonText: { color: '#D4AF37', fontSize: 16, fontWeight: '700', letterSpacing: 0.2 },
  toggle: { marginTop: 26, alignItems: 'center' },
  toggleText: { color: '#6A6A6E', fontSize: 14 },
  toggleLink: { color: '#D4AF37', fontWeight: '700' },
  typeRow: { flexDirection: 'row', gap: 10, marginTop: 4 },
  typeBtn: { flex: 1, height: 50, borderRadius: 14, borderWidth: 1, borderColor: '#E5E5EA', justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFFFF' },
  typeBtnActive: { backgroundColor: '#FFFDF0', borderColor: '#D4AF37' },
  typeBtnText: { fontSize: 14, fontWeight: '600', color: '#6A6A6E' },
  typeBtnTextActive: { color: '#1C1C1E', fontWeight: '700' },
  pickerContainer: { backgroundColor: '#FFFFFF', borderRadius: 14, marginTop: 8, padding: 10, borderWidth: 1, borderColor: '#E5E5EA' },
  doneButton: { alignSelf: 'flex-end', padding: 8 },
  doneButtonText: { color: '#D4AF37', fontWeight: '700', fontSize: 16 },

  // Luxury SSO Dividers & Grid System
  dividerContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 28, marginBottom: 18 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#E5E5EA' },
  dividerText: { color: '#A4A4A4', fontSize: 12, paddingHorizontal: 12, textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: '600' },
  ssoRow: { flexDirection: 'row', gap: 12 },
  ssoButton: { flex: 1, height: 48, borderRadius: 12, borderWidth: 1, borderColor: '#E5E5EA', backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center' },
  ssoButtonText: { fontSize: 14, fontWeight: '600', color: '#1C1C1E' },

  // OTP Display Matrix
  otpRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 10, marginVertical: 12 },
  otpInput: { flex: 1, height: 60, backgroundColor: '#FFFFFF', borderRadius: 12, borderWidth: 1.5, borderColor: '#E5E5EA', textAlign: 'center', fontSize: 22, fontWeight: '700', color: '#1C1C1E' },
  mockHint: { fontSize: 12, color: '#6A6A6E', fontStyle: 'italic', marginTop: 8, lineHeight: 16 }
});

export default AuthScreen;