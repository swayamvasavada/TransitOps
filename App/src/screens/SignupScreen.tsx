import React, {useState} from 'react';
import {Alert} from 'react-native';
import AppTextInput from '../components/AppTextInput';
import PrimaryButton from '../components/PrimaryButton';
import RoleSelector from '../components/RoleSelector';
import Screen from '../components/Screen';
import {roleMap} from '../constants/roles';
import useAuthStore from '../store/AuthStore';

export default function SignupScreen() {
  const signup = useAuthStore(state => state.signup);
  const [name, setName] = useState('');
  const [phoneNo, setPhoneNo] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Dispatcher');
  const [licenseNo, setLicenseNo] = useState('');
  const [licenseExpiryDate, setLicenseExpiryDate] = useState('');

  const handleSubmit = async () => {
    if (!name.trim() || !/^\d{10}$/.test(phoneNo) || !email.includes('@') || password.length < 8) {
      Alert.alert('Check details', 'Name, 10 digit phone, valid email, and 8 character password are required.');
      return;
    }
    const result = await signup({
      name,
      email,
      password,
      phoneNo,
      licenseNo: role === 'Driver' ? licenseNo : '',
      licenseExpiryDate: role === 'Driver' && licenseExpiryDate ? new Date(licenseExpiryDate).toISOString() : null,
      role: roleMap[role],
    });
    Alert.alert(result.success ? 'Signup complete' : 'Signup failed', result.success ? 'Account created.' : result.message);
  };

  return (
    <Screen>
      <AppTextInput label="Full Name" value={name} onChangeText={setName} />
      <AppTextInput label="Phone" value={phoneNo} onChangeText={setPhoneNo} keyboardType="phone-pad" />
      <AppTextInput label="Email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
      <AppTextInput label="Password" value={password} onChangeText={setPassword} secureTextEntry />
      <RoleSelector value={role} onChange={setRole} />
      {role === 'Driver' ? (
        <>
          <AppTextInput label="License Number" value={licenseNo} onChangeText={setLicenseNo} />
          <AppTextInput label="License Expiry Date" value={licenseExpiryDate} onChangeText={setLicenseExpiryDate} placeholder="YYYY-MM-DD" />
        </>
      ) : null}
      <PrimaryButton title="Create User" onPress={handleSubmit} />
    </Screen>
  );
}
