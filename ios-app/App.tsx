import { StatusBar } from 'expo-status-bar';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useFonts } from 'expo-font';
import { Poppins_400Regular } from '@expo-google-fonts/poppins/400Regular';
import { Poppins_500Medium } from '@expo-google-fonts/poppins/500Medium';
import { Poppins_600SemiBold } from '@expo-google-fonts/poppins/600SemiBold';
import { Poppins_700Bold } from '@expo-google-fonts/poppins/700Bold';
import { Poppins_800ExtraBold } from '@expo-google-fonts/poppins/800ExtraBold';
import { useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import type { TextInputProps, TextProps } from 'react-native';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text as NativeText,
  TextInput as NativeTextInput,
  useWindowDimensions,
  View,
} from 'react-native';

type Screen = 'home' | 'medicines' | 'scan' | 'reminders' | 'assistant' | 'support' | 'account' | 'staff-dashboard' | 'staff-patients' | 'prescription' | 'admin-dashboard' | 'admin-users' | 'admin-bhus' | 'reports';
type Role = 'Pasyente' | 'BHU Staff' | 'Admin';
type Medicine = { id: number; name: string; dose: string; time: string; note: string; taken: boolean };
type Reminder = { id: number; medicine: string; time: string; enabled: boolean };
type ChatMessage = { role: 'user' | 'assistant'; content: string; mode?: 'local' | 'gemini' };
type ScanFinding = { name: string; dosage?: string; form?: string; confidence: 'high' | 'medium' | 'low'; visibleText?: string; guidance: string };
type IconName = keyof typeof Ionicons.glyphMap;

function Text({ style, ...props }: TextProps) {
  const weight = String(StyleSheet.flatten(style)?.fontWeight || '400');
  const fontFamily = weight === '800' || weight === '900' ? 'Poppins_800ExtraBold'
    : weight === '700' ? 'Poppins_700Bold'
    : weight === '600' ? 'Poppins_600SemiBold'
    : weight === '500' ? 'Poppins_500Medium'
    : 'Poppins_400Regular';
  return <NativeText {...props} style={[style, { fontFamily }]} />;
}

function TextInput({ style, ...props }: TextInputProps) {
  return <NativeTextInput {...props} style={[style, { fontFamily: 'Poppins_400Regular' }]} />;
}

const COLORS = {
  ink: '#0D2B24', muted: '#4A7268', brand: '#1BAF8A', brandDark: '#0E6B54',
  mint: '#D4F2EA', mintSoft: '#F0FAF7', bg: '#F0FAF7', white: '#FFFFFF',
  line: '#D4EDE7', cream: '#FFF8ED', danger: '#E85454',
};

const SUPABASE_URL = 'https://zzuhgpzcdkigubowyxjd.supabase.co';
const SUPABASE_KEY = 'sb_publishable_NVzpI7OVt4ulDzOLodekIg_cfhT0voF';
const ASSISTANT_API = 'https://pharsayo.vercel.app/api/assistant';

const initialMedicines: Medicine[] = [
  { id: 1, name: 'Metformin', dose: '500mg', time: '7:00 AM', note: 'Kasabay ng almusal', taken: true },
  { id: 2, name: 'Amlodipine', dose: '5mg', time: '8:00 AM', note: 'Pagkatapos kumain', taken: false },
  { id: 3, name: 'Atorvastatin', dose: '20mg', time: '9:00 PM', note: 'Bago matulog', taken: false },
];

const initialReminders: Reminder[] = [
  { id: 1, medicine: 'Metformin', time: '7:00 AM', enabled: true },
  { id: 2, medicine: 'Amlodipine', time: '8:00 AM', enabled: true },
  { id: 3, medicine: 'Atorvastatin', time: '9:00 PM', enabled: true },
];

const navItems: { id: Screen; label: string; icon: IconName; activeIcon: IconName }[] = [
  { id: 'home', label: 'Home', icon: 'home-outline', activeIcon: 'home' },
  { id: 'medicines', label: 'Gamot', icon: 'medical-outline', activeIcon: 'medical' },
  { id: 'scan', label: 'I-scan', icon: 'scan-outline', activeIcon: 'scan' },
  { id: 'assistant', label: 'AI Tulong', icon: 'sparkles-outline', activeIcon: 'sparkles' },
  { id: 'account', label: 'Account', icon: 'person-outline', activeIcon: 'person' },
];

export default function App() {
  const { width, height } = useWindowDimensions();
  const [fontsLoaded] = useFonts({ Poppins_400Regular, Poppins_500Medium, Poppins_600SemiBold, Poppins_700Bold, Poppins_800ExtraBold });
  const [signedIn, setSignedIn] = useState(false);
  const [name, setName] = useState('Maria Angeles');
  const [role, setRole] = useState<Role>('Pasyente');
  const [screen, setScreen] = useState<Screen>('home');
  const [medicines, setMedicines] = useState(initialMedicines);
  const [reminders, setReminders] = useState(initialReminders);
  function enterApp(value: boolean) { setSignedIn(value); if (value) setScreen(role === 'Pasyente' ? 'home' : role === 'BHU Staff' ? 'staff-dashboard' : 'admin-dashboard'); }
  function logout() { setSignedIn(false); setScreen('home'); }

  const content = !fontsLoaded ? (
    <View style={styles.loadingScreen}><ActivityIndicator size="large" color={COLORS.brand} /></View>
  ) : !signedIn ? (
    <LoginScreen role={role} setRole={setRole} onLogin={enterApp} onName={setName} />
  ) : (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <View style={styles.appShell}>
        {role === 'Pasyente' && screen !== 'account' && <AppHeader name={name} onAccount={() => setScreen('account')} onReminders={() => setScreen('reminders')} />}
        <View style={styles.screenArea}>
          {screen === 'home' && <HomeScreen medicines={medicines} setMedicines={setMedicines} onNavigate={setScreen} />}
          {screen === 'medicines' && <MedicinesScreen medicines={medicines} setMedicines={setMedicines} />}
          {screen === 'scan' && <ScannerScreen onAddMedicine={(medicine) => setMedicines(items => [...items, medicine])} />}
          {screen === 'reminders' && <RemindersScreen reminders={reminders} setReminders={setReminders} medicines={medicines} />}
          {screen === 'assistant' && <AssistantScreen medicines={medicines} onSupport={() => setScreen('support')} />}
          {screen === 'support' && <SupportScreen />}
          {screen === 'account' && role === 'Pasyente' && <AccountScreen name={name} role={role} medicines={medicines} reminders={reminders} onNavigate={setScreen} onLogout={logout} />}
          {screen === 'account' && role !== 'Pasyente' && <TeamAccountScreen name={name} role={role} onBack={() => setScreen(role === 'BHU Staff' ? 'staff-dashboard' : 'admin-dashboard')} onLogout={logout} />}
          {screen === 'staff-dashboard' && <StaffDashboard onNavigate={setScreen} />}
          {screen === 'staff-patients' && <StaffPatientsScreen />}
          {screen === 'prescription' && <PrescriptionScreen onBack={() => setScreen('staff-dashboard')} />}
          {screen === 'admin-dashboard' && <AdminDashboard onNavigate={setScreen} />}
          {screen === 'admin-users' && <AdminDirectoryScreen type="users" />}
          {screen === 'admin-bhus' && <AdminDirectoryScreen type="bhus" />}
          {screen === 'reports' && <ReportsScreen role={role} />}
        </View>
        {role === 'Pasyente' && screen !== 'account' && <BottomNav active={screen} onChange={setScreen} />}
        {role === 'BHU Staff' && !['account', 'prescription'].includes(screen) && <StaffBottomNav active={screen} onChange={setScreen} />}
        {role === 'Admin' && screen !== 'account' && <AdminBottomNav active={screen} onChange={setScreen} />}
      </View>
    </SafeAreaView>
  );

  if (Platform.OS === 'web') {
    const previewScale = Math.min(1, Math.max(.2, (width - 16) / 390), Math.max(.2, (height - 16) / 820));
    return (
      <View style={styles.webStage}>
        <View style={[styles.webDevice, { transform: [{ scale: previewScale }] }]}>{content}</View>
      </View>
    );
  }

  return content;
}

function LoginScreen({ role, setRole, onLogin, onName }: { role: Role; setRole: (role: Role) => void; onLogin: (value: boolean) => void; onName: (name: string) => void }) {
  const { width } = useWindowDimensions();
  const previewWidth = Platform.OS === 'web' ? 390 : width;
  const contentWidth = Math.min(previewWidth - 44, 430);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [secure, setSecure] = useState(true);
  const [loading, setLoading] = useState(false);

  async function signIn() {
    if (!email || password.length < 6) return Alert.alert('Kulang ang detalye', 'Ilagay ang valid email at password.');
    setLoading(true);
    try {
      const response = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', apikey: SUPABASE_KEY },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.msg || data?.error_description || 'Hindi makapag-login.');
      onName(data?.user?.user_metadata?.full_name || email.split('@')[0]);
      onLogin(true);
    } catch (error) {
      Alert.alert('Hindi makapag-login', error instanceof Error ? error.message : 'Subukan ulit mamaya.');
    } finally { setLoading(false); }
  }

  return (
    <SafeAreaView style={styles.loginSafe}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView style={styles.loginKeyboard} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.loginScroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <View style={[styles.legacyHeroCard, { width: contentWidth }]}>
            <View style={styles.heroBubbleTop} /><View style={styles.heroBubbleBottom} />
            <View style={styles.legacyLogoFrame}><Ionicons name="layers-outline" size={34} color="#fff" /></View>
            <Text style={styles.legacyBrand}>PharSayo</Text>
            <Text style={styles.legacyTagline}>Your smart medication companion</Text>
          </View>
          <View style={[styles.loginForm, { width: contentWidth }]}>
            <Text style={styles.legacyWelcome}>Maligayang pagdating!</Text>
            <Text style={styles.legacySubtitle}>Mag-login para masubaybayan ang iyong mga gamot araw-araw.</Text>
            <View style={styles.roleTabs}>{(['Pasyente', 'BHU Staff', 'Admin'] as Role[]).map(item => <Pressable key={item} onPress={() => setRole(item)} style={[styles.roleTab, role === item && styles.roleTabActive]}><Text style={[styles.roleText, role === item && styles.roleTextActive]}>{item}</Text></Pressable>)}</View>
            <Text style={styles.label}>EMAIL / PHONE / ID</Text>
            <View style={styles.fieldWrap}><Ionicons name="person-outline" size={19} color="#86A69E" /><TextInput value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" autoComplete="email" placeholder="hal. maria@email.com" placeholderTextColor="#93A29D" style={styles.fieldInput} /></View>
            <Text style={styles.label}>PASSWORD</Text>
            <View style={styles.passwordWrap}><Ionicons name="lock-closed-outline" size={19} color="#86A69E" /><TextInput value={password} onChangeText={setPassword} secureTextEntry={secure} autoComplete="current-password" placeholder="Ilagay ang password" placeholderTextColor="#93A29D" style={styles.passwordInput} /><Pressable onPress={() => setSecure(!secure)}><Text style={styles.showPassword}>{secure ? 'Ipakita' : 'Itago'}</Text></Pressable></View>
            <Pressable onPress={() => Alert.alert('Password reset', 'Ilagay ang iyong email at ipapadala namin ang reset link.')} style={styles.forgotRow}><Text style={styles.forgotText}>Nakalimutan ang password?</Text></Pressable>
            <Pressable onPress={signIn} disabled={loading} style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed, loading && styles.disabled]}>{loading ? <ActivityIndicator color="#fff" /> : <View style={styles.buttonContent}><Text style={styles.primaryButtonText}>Mag-login</Text><Ionicons name="arrow-forward" size={17} color="#fff" /></View>}</Pressable>
            <View style={styles.loginDivider}><View style={styles.dividerLine} /><Text style={styles.dividerText}>o kaya</Text><View style={styles.dividerLine} /></View>
            <Pressable onPress={() => { onName(role === 'Pasyente' ? 'Maria Angeles' : role === 'BHU Staff' ? 'Nrs. Ana Reyes' : 'Admin Santos'); onLogin(true); }} style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}><Text style={styles.secondaryButtonText}>Tingnan muna ang demo</Text></Pressable>
            <Text style={styles.loginFooter}>Suporta sa Filipino at English · v1.0.0</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function AppHeader({ name, onAccount, onReminders }: { name: string; onAccount: () => void; onReminders: () => void }) {
  const firstName = name.trim().split(' ')[0] || 'Maria';
  return <View style={styles.header}><View><Text style={styles.greetingSmall}>Magandang umaga</Text><Text style={styles.headerTitle}>{name}</Text></View><View style={styles.headerActions}><Pressable onPress={onReminders} accessibilityLabel="Buksan ang mga paalaala" style={styles.headerIconButton}><Ionicons name="notifications-outline" size={19} color={COLORS.muted} /></Pressable><Pressable onPress={onAccount} accessibilityLabel="Buksan ang account settings" style={styles.avatar}><Text style={styles.avatarText}>{firstName[0].toUpperCase()}</Text></Pressable></View></View>;
}

function HomeScreen({ medicines, setMedicines, onNavigate }: { medicines: Medicine[]; setMedicines: React.Dispatch<React.SetStateAction<Medicine[]>>; onNavigate: (screen: Screen) => void }) {
  const next = medicines.find(item => !item.taken) || medicines[0];
  function takeDose() { if (!next) return; setMedicines(items => items.map(item => item.id === next.id ? { ...item, taken: true } : item)); Alert.alert('Naitala na', 'Magaling! Naitala ang pag-inom ng gamot.'); }
  const categories: { label: string; detail: string; icon: IconName; tone: string; target: Screen }[] = [
    { label: 'Mga Gamot', detail: `${medicines.length} active`, icon: 'shield-checkmark-outline', tone: COLORS.mint, target: 'medicines' },
    { label: 'Bitamina', detail: 'Daily wellness', icon: 'sunny-outline', tone: '#FEF3E4', target: 'medicines' },
    { label: 'AI Gabay', detail: 'Magtanong', icon: 'sparkles-outline', tone: '#EBF3FF', target: 'assistant' },
    { label: 'I-scan Gamot', detail: 'Camera scanner', icon: 'camera-outline', tone: '#FDEAEA', target: 'scan' },
  ];
  return <ScrollView contentContainerStyle={styles.legacyHomePage} showsVerticalScrollIndicator={false}>
    <View style={styles.legacyScanBanner}><View style={styles.heroBubbleTop} /><View style={styles.homeBubbleBottom} /><Text style={styles.legacyBannerLabel}>Tandaan ang iyong kalusugan</Text><Text style={styles.legacyBannerTitle}>I-scan ang gamot para{`\n`}malaman ang tamang gabay</Text><Pressable onPress={() => onNavigate('scan')} style={styles.legacyBannerButton}><Ionicons name="scan-outline" size={16} color={COLORS.brand} /><Text style={styles.legacyBannerButtonText}>I-scan ngayon</Text></Pressable></View>
    {next && <View style={styles.legacyReminder}><View style={styles.reminderIcon}><Ionicons name="time-outline" size={24} color="#fff" /></View><View style={styles.listCopy}><Text style={styles.reminderTitle}>Oras na para sa gamot mo!</Text><Text style={styles.reminderSub}>{next.name} {next.dose} · {next.time}</Text></View><Pressable onPress={takeDose} style={styles.reminderButton}><Text style={styles.reminderButtonText}>Kinuha</Text></Pressable></View>}
    <View style={styles.legacySectionRow}><Text style={styles.legacySectionTitle}>Kategorya ng Gamot</Text><Pressable onPress={() => onNavigate('medicines')}><Text style={styles.textAction}>Lahat</Text></Pressable></View>
    <View style={styles.categoryGrid}>{categories.map(item => <Pressable key={item.label} onPress={() => onNavigate(item.target)} style={styles.categoryCard}><View style={[styles.categoryIcon, { backgroundColor: item.tone }]}><Ionicons name={item.icon} size={23} color={item.label === 'Bitamina' ? '#F6A623' : item.label === 'I-scan Gamot' ? COLORS.danger : COLORS.brand} /></View><Text style={styles.categoryName}>{item.label}</Text><Text style={styles.categoryCount}>{item.detail}</Text></Pressable>)}</View>
    <View style={styles.legacySectionRow}><Text style={styles.legacySectionTitle}>Iskedyul ngayon</Text><Pressable onPress={() => onNavigate('medicines')}><Text style={styles.textAction}>Tingnan lahat</Text></Pressable></View>
    <View style={styles.homeMedicineList}>{medicines.slice(0, 3).map(item => <MedicineRow key={item.id} medicine={item} />)}</View>
  </ScrollView>;
}

function MedicinesScreen({ medicines, setMedicines }: { medicines: Medicine[]; setMedicines: React.Dispatch<React.SetStateAction<Medicine[]>> }) {
  const [modalVisible, setModalVisible] = useState(false);
  const [name, setName] = useState(''); const [dose, setDose] = useState(''); const [time, setTime] = useState('');
  function addMedicine() { if (!name || !dose || !time) return Alert.alert('Kulang ang detalye'); setMedicines(items => [...items, { id: Date.now(), name, dose, time, note: 'Ayon sa reseta', taken: false }]); setModalVisible(false); setName(''); setDose(''); setTime(''); }
  return <><ScrollView contentContainerStyle={styles.page}><PageTitle eyebrow="MEDICATION LIST" title="Mga gamot ko" copy="Lahat ng aktibong gamot at iskedyul." action onAction={() => setModalVisible(true)} />{medicines.map(item => <View key={item.id} style={styles.listRow}><View style={styles.medIcon}><Ionicons name="medical-outline" size={21} color={COLORS.brand} /></View><View style={styles.listCopy}><Text style={styles.listTitle}>{item.name}  <Text style={styles.listDose}>{item.dose}</Text></Text><Text style={styles.listSubtitle}>{item.note} · {item.time}</Text></View><Pressable onPress={() => setMedicines(items => items.filter(med => med.id !== item.id))} style={styles.iconButton}><Ionicons name="close" size={20} color="#9AACA6" /></Pressable></View>)}</ScrollView><Modal transparent visible={modalVisible} animationType="slide" onRequestClose={() => setModalVisible(false)}><View style={styles.modalBackdrop}><View style={styles.modalSheet}><View style={styles.modalHandle} /><Text style={styles.modalTitle}>Magdagdag ng gamot</Text><Text style={styles.label}>Pangalan</Text><TextInput value={name} onChangeText={setName} placeholder="hal. Losartan" style={styles.input} /><Text style={styles.label}>Dosage</Text><TextInput value={dose} onChangeText={setDose} placeholder="hal. 50mg" style={styles.input} /><Text style={styles.label}>Oras</Text><TextInput value={time} onChangeText={setTime} placeholder="hal. 8:00 AM" style={styles.input} /><Pressable onPress={addMedicine} style={styles.primaryButton}><Text style={styles.primaryButtonText}>Idagdag ang gamot</Text></Pressable><Pressable onPress={() => setModalVisible(false)} style={styles.modalCancel}><Text style={styles.modalCancelText}>Kanselahin</Text></Pressable></View></View></Modal></>;
}

function ScannerScreen({ onAddMedicine }: { onAddMedicine: (medicine: Medicine) => void }) {
  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [photo, setPhoto] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState('image/jpeg');
  const [finding, setFinding] = useState<ScanFinding | null>(null);
  const [scanError, setScanError] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraFacing, setCameraFacing] = useState<'front' | 'back'>('back');

  async function openCamera() {
    let granted = permission?.granted;
    if (!granted) granted = (await requestPermission()).granted;
    if (!granted) return setScanError('Hindi pinayagan ang camera. I-enable ang camera permission para sa localhost:8085 sa browser settings.');
    setPhoto(null); setImageBase64(null); setFinding(null); setScanError(''); setCameraReady(false); setCameraActive(true);
  }

  async function captureLabel() {
    if (!cameraRef.current || !cameraReady) return;
    try {
      const shot = await cameraRef.current.takePictureAsync({ base64: true, quality: .65, shutterSound: false });
      if (!shot) throw new Error('No photo captured');
      const encoded = shot.base64 || (shot.uri.includes(',') ? shot.uri.split(',')[1] : null);
      if (!encoded) throw new Error('No image data');
      setPhoto(shot.uri); setImageBase64(encoded); setMimeType('image/jpeg'); setCameraActive(false); setCameraReady(false); setScanError('');
    } catch {
      setScanError('Hindi makunan ang label. Subukan ulit at siguraduhing naka-enable ang camera.');
    }
  }

  async function attachImage() {
    const libraryPermission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!libraryPermission.granted) return setScanError('Hindi pinayagan ang photo library. I-enable ito sa device settings para makapag-attach ng larawan.');
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: .65, allowsEditing: true, base64: true });
    if (result.canceled) return;
    const asset = result.assets[0];
    const encoded = asset.base64 || (asset.uri.includes(',') ? asset.uri.split(',')[1] : null);
    if (!encoded) return setScanError('Hindi mabasa ang napiling image. Subukan ang JPG o PNG file.');
    setCameraActive(false); setCameraReady(false); setPhoto(asset.uri); setImageBase64(encoded); setMimeType(asset.mimeType || 'image/jpeg'); setFinding(null); setScanError('');
  }

  async function analyzePhoto() {
    if (!imageBase64 || analyzing) return setScanError('Hindi mabasa ang image data. Kunan ulit ang malinaw na label.');
    setAnalyzing(true); setScanError(''); setFinding(null);
    try {
      const response = await fetch(`${ASSISTANT_API.replace('/assistant', '/identify-medicine')}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64, mimeType }),
      });
      const data = await response.json();
      if (!response.ok || !data?.finding) throw new Error(data?.error || 'Hindi masuri ang larawan ngayon.');
      setFinding(data.finding);
    } catch (error) {
      setScanError(error instanceof Error ? error.message : 'Hindi masuri ang larawan ngayon.');
    } finally { setAnalyzing(false); }
  }

  function addFinding() {
    if (!finding) return;
    onAddMedicine({ id: Date.now(), name: finding.name, dose: finding.dosage || 'I-check ang label', time: '8:00 AM', note: 'Na-scan · kumpirmahin sa pharmacist', taken: false });
    Alert.alert('Idinagdag sa listahan', `${finding.name} ay naidagdag. I-check ang dosage at schedule ayon sa reseta.`);
  }

  return <ScrollView contentContainerStyle={[styles.page, styles.scanPage]} showsVerticalScrollIndicator={false}><PageTitle eyebrow="MEDICINE SCANNER" title="Kilalanin ang gamot" copy="Kunan ng malinaw na larawan ng pangalan at dosage sa label." />
    <View style={styles.scannerFrame}>{cameraActive ? <><CameraView ref={cameraRef} style={styles.liveCamera} facing={cameraFacing} mirror={cameraFacing === 'front'} onCameraReady={() => setCameraReady(true)} onMountError={() => { setCameraActive(false); setScanError('Hindi ma-start ang camera. I-check ang browser camera permission at subukan ulit.'); }} /><Pressable onPress={() => { setCameraReady(false); setCameraFacing(current => current === 'back' ? 'front' : 'back'); }} accessibilityLabel={cameraFacing === 'back' ? 'Gamitin ang front camera' : 'Gamitin ang back camera'} style={styles.cameraFlipButton}><Ionicons name="camera-reverse-outline" size={21} color="#fff" /></Pressable></> : photo ? <Image source={{ uri: photo }} style={styles.scannedImage} /> : <><Ionicons name="camera-outline" size={58} color={COLORS.brand} /><Text style={styles.scanHint}>Ilagay ang medicine label sa frame</Text></>}<View pointerEvents="none" style={[styles.corner, styles.cornerTL]} /><View pointerEvents="none" style={[styles.corner, styles.cornerTR]} /><View pointerEvents="none" style={[styles.corner, styles.cornerBL]} /><View pointerEvents="none" style={[styles.corner, styles.cornerBR]} /></View>
    <Text style={styles.scanCopy}>{cameraActive ? 'Itapat ang printed medicine name at dosage sa loob ng frame.' : photo ? 'I-tap ang “Kilalanin ang gamot” para basahin ng AI ang label.' : 'Hindi sapat ang itsura o kulay ng tableta—dapat kita ang printed label.'}</Text>
    <Pressable onPress={cameraActive ? captureLabel : openCamera} disabled={cameraActive && !cameraReady} style={[styles.primaryButton, cameraActive && !cameraReady && styles.disabled]}><View style={styles.buttonContent}><Ionicons name={cameraActive ? 'radio-button-on' : 'camera'} size={18} color="#fff" /><Text style={styles.primaryButtonText}>{cameraActive ? cameraReady ? 'Kunan ang label' : 'Binubuksan ang camera…' : photo ? 'Kunan ulit' : 'Buksan ang camera'}</Text></View></Pressable>
    {!cameraActive && <Pressable onPress={attachImage} style={styles.secondaryButton}><View style={styles.buttonContent}><Ionicons name="attach-outline" size={18} color={COLORS.brand} /><Text style={styles.secondaryButtonText}>Mag-attach ng larawan</Text></View></Pressable>}
    {photo && <Pressable onPress={analyzePhoto} disabled={analyzing} style={[styles.secondaryButton, analyzing && styles.disabled]}>{analyzing ? <View style={styles.buttonContent}><ActivityIndicator size="small" color={COLORS.brand} /><Text style={styles.secondaryButtonText}>Binabasa ang label…</Text></View> : <View style={styles.buttonContent}><Ionicons name="sparkles" size={17} color={COLORS.brand} /><Text style={styles.secondaryButtonText}>Kilalanin ang gamot</Text></View>}</Pressable>}
    {!!scanError && <View style={styles.scanError}><Ionicons name="information-circle-outline" size={20} color={COLORS.danger} /><Text style={styles.scanErrorText}>{scanError}</Text></View>}
    {finding && <View style={styles.scanResult}><View style={styles.scanResultTop}><View style={styles.scanResultIcon}><Ionicons name="medical" size={24} color={COLORS.brand} /></View><View style={styles.listCopy}><Text style={styles.smallEyebrow}>POSIBLENG MATCH · {finding.confidence.toUpperCase()}</Text><Text style={styles.scanResultName}>{finding.name}</Text><Text style={styles.listSubtitle}>{[finding.dosage, finding.form].filter(Boolean).join(' · ')}</Text></View></View>{!!finding.visibleText && <Text style={styles.visibleText}>Nabasa sa label: {finding.visibleText}</Text>}<Text style={styles.scanResultGuidance}>{finding.guidance}</Text><Pressable onPress={addFinding} style={styles.resultButton}><Text style={styles.primaryButtonText}>Idagdag sa mga gamot ko</Text></Pressable><Text style={styles.scanSafety}>Kumpirmahin palagi sa original packaging o pharmacist bago inumin.</Text></View>}
  </ScrollView>;
}

function RemindersScreen({ reminders, setReminders, medicines }: { reminders: Reminder[]; setReminders: React.Dispatch<React.SetStateAction<Reminder[]>>; medicines: Medicine[] }) {
  const enabledCount = useMemo(() => reminders.filter(item => item.enabled).length, [reminders]);
  return <ScrollView contentContainerStyle={styles.page}><PageTitle eyebrow="NOTIFICATIONS" title="Mga paalaala" copy={`${enabledCount} reminder ang kasalukuyang naka-on.`} action onAction={() => { const med = medicines[0]; if (!med) return Alert.alert('Magdagdag muna ng gamot'); setReminders(items => [...items, { id: Date.now(), medicine: med.name, time: med.time, enabled: true }]); }} />{reminders.map(item => <View key={item.id} style={styles.listRow}><View style={styles.timeBadge}><Text style={styles.timeText}>{item.time}</Text></View><View style={styles.listCopy}><Text style={styles.listTitle}>{item.medicine}</Text><Text style={styles.listSubtitle}>Daily medication reminder</Text></View><Switch value={item.enabled} onValueChange={enabled => setReminders(items => items.map(reminder => reminder.id === item.id ? { ...reminder, enabled } : reminder))} trackColor={{ false: '#DCE6E2', true: '#70CBB3' }} thumbColor={item.enabled ? COLORS.brand : '#fff'} /></View>)}</ScrollView>;
}

function offlineAssistantAnswer(question: string) {
  const q = question.toLowerCase();
  if (/hirap.*(?:hinga|huminga)|sakit.*dibdib|chest pain|nahimatay|overdose|allergic|(?:pamamaga|namamaga).*mukha|emergency/.test(q)) return 'Maaaring emergency ito. Tumawag agad sa 911 o pumunta sa pinakamalapit na emergency room.';
  if (/amlodipine/.test(q)) return 'Ang amlodipine ay karaniwang para sa mataas na presyon. Inumin ayon sa reseta at sa parehong oras araw-araw. Posibleng side effects ang hilo o pamamaga ng bukung-bukong. Kumonsulta sa doktor o BHU kung malala.';
  if (/metformin/.test(q)) return 'Ang metformin ay karaniwang tumutulong kontrolin ang blood sugar. Madalas itong iniinom kasabay o pagkatapos kumain para mabawasan ang pagsakit ng tiyan. Sundin ang iyong reseta.';
  if (/atorvastatin/.test(q)) return 'Ang atorvastatin ay tumutulong magpababa ng cholesterol. Kung may matinding pananakit o panghihina ng kalamnan, kumontak agad sa doktor.';
  if (/nakalim|missed|nalate|hindi.*nainom/.test(q)) return 'Sundin ang instruction sa label o tanungin ang pharmacist/BHU. Huwag mag-double dose maliban kung malinaw na sinabi ng clinician.';
  if (/side effect|epekto|hilo|pantal|suka/.test(q)) return 'I-check ang label para sa common side effects. Kung nagpapatuloy, tawagan ang doktor, pharmacist, o BHU. Kung hirap huminga o namamaga ang mukha, tumawag sa 911.';
  return 'Maaari kitang tulungan sa gamit ng gamot, schedule, missed dose, at general side effects. I-type ang eksaktong pangalan at dose. Para sa diagnosis o pagbabago ng reseta, kumonsulta sa doktor, pharmacist, o BHU.';
}

function AssistantScreen({ medicines, onSupport }: { medicines: Medicine[]; onSupport: () => void }) {
  const [messages, setMessages] = useState<ChatMessage[]>([{ role: 'assistant', content: 'Kumusta! Ako si Gabay. Tanungin mo ako tungkol sa gamit, schedule, o general safety ng iyong gamot.', mode: 'local' }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const suggestions = ['Para saan ang Amlodipine?', 'Paano kapag nakalimot ng dose?', 'Ano ang common side effects?'];

  async function ask(question = input) {
    const cleanQuestion = question.trim();
    if (!cleanQuestion || loading) return;
    const nextMessages: ChatMessage[] = [...messages, { role: 'user', content: cleanQuestion }];
    setMessages(nextMessages); setInput(''); setLoading(true);
    try {
      const response = await fetch(ASSISTANT_API, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: nextMessages, question: cleanQuestion, medications: medicines.map(({ name, dose, time }) => ({ name, dose, time })) }),
      });
      const data = await response.json();
      if (!response.ok || !data?.answer) throw new Error('Assistant unavailable');
      setMessages([...nextMessages, { role: 'assistant', content: data.answer, mode: data.mode === 'gemini' ? 'gemini' : 'local' }]);
    } catch {
      setMessages([...nextMessages, { role: 'assistant', content: offlineAssistantAnswer(cleanQuestion), mode: 'local' }]);
    } finally { setLoading(false); }
  }

  return <KeyboardAvoidingView style={styles.assistantScreen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
    <ScrollView contentContainerStyle={styles.assistantPage} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
      <View style={styles.assistantHeader}><View style={styles.assistantMark}><Ionicons name="sparkles" size={24} color="#fff" /></View><View style={styles.listCopy}><Text style={styles.assistantTitle}>AI Gabay</Text><Text style={styles.assistantStatus}>Handang tumulong · local fallback active</Text></View></View>
      <Text style={styles.assistantDisclaimer}>General medicine information lamang. Hindi ito kapalit ng doktor, pharmacist, o BHU.</Text>
      <View style={styles.suggestionWrap}>{suggestions.map(item => <Pressable key={item} onPress={() => ask(item)} style={styles.suggestionChip}><Text style={styles.suggestionText}>{item}</Text></Pressable>)}</View>
      <View style={styles.chatList}>{messages.map((message, index) => <View key={`${message.role}-${index}`} style={[styles.chatBubble, message.role === 'user' ? styles.userBubble : styles.assistantBubble]}><Text style={[styles.chatText, message.role === 'user' && styles.userChatText]}>{message.content}</Text>{message.role === 'assistant' && message.mode && <Text style={styles.responseMode}>{message.mode === 'gemini' ? 'GEMINI AI' : 'LOCAL GABAY'}</Text>}</View>)}{loading && <View style={[styles.chatBubble, styles.assistantBubble, styles.typingBubble]}><ActivityIndicator size="small" color={COLORS.brand} /><Text style={styles.typingText}>Nag-iisip si Gabay…</Text></View>}</View>
      <Pressable onPress={onSupport} style={styles.bhuLink}><Ionicons name="heart-outline" size={17} color={COLORS.brandDark} /><Text style={styles.bhuLinkText}>Kailangan ng tao? Makipag-ugnayan sa BHU</Text></Pressable>
    </ScrollView>
    <View style={styles.chatComposer}><TextInput value={input} onChangeText={setInput} placeholder="Magtanong tungkol sa gamot…" placeholderTextColor="#8AADA6" style={styles.chatInput} multiline maxLength={400} /><Pressable onPress={() => ask()} disabled={!input.trim() || loading} style={[styles.sendButton, (!input.trim() || loading) && styles.disabled]}><Ionicons name="send" size={19} color="#fff" /></Pressable></View>
  </KeyboardAvoidingView>;
}

function SupportScreen() { return <ScrollView contentContainerStyle={styles.page}><PageTitle eyebrow="BHU SUPPORT" title="Hindi ka nag-iisa." copy="Makipag-ugnayan sa inyong Barangay Health Unit para sa gabay." /><View style={styles.supportCard}><View style={styles.supportIcon}><Ionicons name="heart-outline" size={25} color={COLORS.brand} /></View><Text style={styles.supportTitle}>BHU San Isidro</Text><Text style={styles.supportCopy}>Barangay Health Center{`\n`}Bukas · 8:00 AM–5:00 PM</Text><Pressable onPress={() => Alert.alert('BHU San Isidro', '(02) 8123-4567')} style={styles.primaryButton}><Text style={styles.primaryButtonText}>Tumawag sa BHU</Text></Pressable></View><View style={[styles.supportCard, styles.emergencyCard]}><Text style={styles.supportTitle}>Emergency?</Text><Text style={styles.supportCopy}>Kung malubha ang nararamdaman, tumawag agad sa 911 o pumunta sa pinakamalapit na ospital.</Text></View></ScrollView>; }

const staffPatients = [
  { initials: 'JR', name: 'Jose Reyes, 72', meds: 'Amlodipine · Metformin', adherence: 42, tone: 'danger' as const },
  { initials: 'LC', name: 'Lita Cruz, 65', meds: 'Losartan · Aspirin', adherence: 61, tone: 'warning' as const },
  { initials: 'PM', name: 'Pedro Mendoza, 58', meds: 'Metformin', adherence: 92, tone: 'good' as const },
  { initials: 'MS', name: 'Maria Santos, 61', meds: 'Amlodipine · Metformin', adherence: 87, tone: 'good' as const },
];

function RoleDashboardHeader({ eyebrow, title, badge, onAccount }: { eyebrow: string; title: string; badge: string; onAccount: () => void }) { return <View style={styles.roleDashboardHeader}><View><Text style={styles.greetingSmall}>{eyebrow}</Text><Text style={styles.roleDashboardTitle}>{title}</Text></View><View style={styles.headerActions}><Pressable onPress={() => Alert.alert('Notifications', 'Wala pang bagong notification.')} style={styles.headerIconButton}><Ionicons name="notifications-outline" size={18} color={COLORS.muted} /></Pressable><Pressable onPress={onAccount} style={styles.roleBadge}><Text style={styles.roleBadgeText}>{badge}</Text></Pressable></View></View>; }

function StaffDashboard({ onNavigate }: { onNavigate: (screen: Screen) => void }) {
  const stats = [['Total Patients', '48', 'enrolled', COLORS.ink], ['Needs Follow-up', '7', 'flagged', COLORS.danger], ['Avg Adherence', '78%', 'this week', COLORS.brand], ['Confirmed Today', '31', 'doses logged', '#F6A623']];
  return <View style={styles.roleScreen}><RoleDashboardHeader eyebrow="BHU Dashboard" title="Brgy. Sta. Cruz" badge="BHU" onAccount={() => onNavigate('account')} /><ScrollView contentContainerStyle={styles.rolePage} showsVerticalScrollIndicator={false}>
    <View style={styles.staffStatsGrid}>{stats.map(([label, value, sub, color]) => <View key={label} style={styles.staffStatCard}><Text style={styles.staffStatLabel}>{label}</Text><Text style={[styles.staffStatValue, { color }]}>{value}</Text><Text style={styles.staffStatSub}>{sub}</Text></View>)}</View>
    <Pressable onPress={() => onNavigate('staff-patients')} style={styles.staffAlert}><View style={styles.staffAlertIcon}><Ionicons name="warning-outline" size={21} color={COLORS.danger} /></View><View style={styles.listCopy}><Text style={styles.staffAlertTitle}>3 patients need counseling</Text><Text style={styles.staffAlertSub}>Adherence below 50% this week</Text></View><Ionicons name="chevron-forward" size={18} color={COLORS.danger} /></Pressable>
    <View style={styles.roleSectionRow}><Text style={styles.roleSectionTitle}>Patient Adherence</Text><Pressable onPress={() => onNavigate('staff-patients')}><Text style={styles.textAction}>View All</Text></Pressable></View>
    <View style={styles.patientList}>{staffPatients.slice(0, 3).map(patient => <PatientAdherenceRow key={patient.name} patient={patient} />)}</View>
    <Pressable onPress={() => onNavigate('prescription')} style={styles.staffPrimaryButton}><Text style={styles.primaryButtonText}>Mag-add ng Prescription</Text></Pressable>
  </ScrollView></View>;
}

function PatientAdherenceRow({ patient }: { patient: typeof staffPatients[number] }) { const color = patient.tone === 'danger' ? COLORS.danger : patient.tone === 'warning' ? '#F6A623' : COLORS.brand; return <View style={styles.patientRow}><View style={[styles.patientAvatar, { backgroundColor: `${color}20` }]}><Text style={[styles.patientInitials, { color }]}>{patient.initials}</Text></View><View style={styles.listCopy}><Text style={styles.patientName}>{patient.name}</Text><Text style={styles.patientMeds}>{patient.meds}</Text></View><View style={styles.adherenceColumn}><View style={styles.adherenceTrack}><View style={[styles.adherenceFill, { width: `${patient.adherence}%`, backgroundColor: color }]} /></View><Text style={[styles.adherencePercent, { color }]}>{patient.adherence}%</Text></View>{patient.tone === 'danger' && <View style={styles.flagPill}><Text style={styles.flagText}>Flag</Text></View>}</View>; }

function StaffPatientsScreen() { return <View style={styles.roleScreen}><View style={styles.simpleRoleHeader}><Text style={styles.roleDashboardTitle}>Mga Pasyente</Text><Text style={styles.greetingSmall}>48 enrolled · 7 need follow-up</Text></View><ScrollView contentContainerStyle={styles.rolePage}><View style={styles.searchField}><Ionicons name="search-outline" size={18} color="#8AADA6" /><TextInput placeholder="Hanapin ang pasyente" style={styles.searchInput} /></View><View style={styles.patientList}>{staffPatients.map(patient => <PatientAdherenceRow key={patient.name} patient={patient} />)}</View></ScrollView></View>; }

function PrescriptionScreen({ onBack }: { onBack: () => void }) { const [patient, setPatient] = useState(''); const [medicine, setMedicine] = useState(''); const [dose, setDose] = useState(''); const [schedule, setSchedule] = useState(''); function save() { if (!patient || !medicine || !dose || !schedule) return Alert.alert('Kulang ang detalye', 'Kumpletuhin ang prescription form.'); Alert.alert('Nai-save na', 'Makakatanggap na ng medication reminders ang pasyente.'); onBack(); } return <View style={styles.roleScreen}><View style={styles.profileTopbar}><Pressable onPress={onBack} style={styles.profileBack}><Ionicons name="chevron-back" size={20} color={COLORS.ink} /></Pressable><Text style={styles.profilePageTitle}>Magdagdag ng Reseta</Text></View><ScrollView contentContainerStyle={styles.prescriptionPage} keyboardShouldPersistTaps="handled"><Text style={styles.formSectionLabel}>PASYENTE</Text><TextInput value={patient} onChangeText={setPatient} placeholder="Pangalan o BHU ID ng pasyente" style={styles.rxInput} /><Text style={styles.formSectionLabel}>DETALYE NG GAMOT</Text><TextInput value={medicine} onChangeText={setMedicine} placeholder="Pangalan ng gamot" style={styles.rxInput} /><View style={styles.formTwoColumns}><TextInput value={dose} onChangeText={setDose} placeholder="Dosage" style={[styles.rxInput, styles.halfInput]} /><TextInput value={schedule} onChangeText={setSchedule} placeholder="Oras / frequency" style={[styles.rxInput, styles.halfInput]} /></View><TextInput placeholder="Tagubilin (hal. pagkatapos kumain)" style={styles.rxInput} /><Text style={styles.formSectionLabel}>WIKA NG PAALALA</Text><View style={styles.languagePills}><View style={styles.languagePillActive}><Text style={styles.languagePillActiveText}>Filipino</Text></View><View style={styles.languagePill}><Text style={styles.languagePillText}>English</Text></View></View><Pressable onPress={save} style={styles.staffPrimaryButton}><Text style={styles.primaryButtonText}>I-save ang Reseta</Text></Pressable></ScrollView></View>; }

function AdminDashboard({ onNavigate }: { onNavigate: (screen: Screen) => void }) { const stats = [['Total Users', '1,284', '+32 this month', COLORS.brand], ['Active BHUs', '18', 'all online', COLORS.ink], ['Pending Review', '6', 'needs action', '#F6A623'], ['System Health', '99.9%', 'operational', COLORS.brand]]; return <View style={styles.roleScreen}><RoleDashboardHeader eyebrow="Admin Dashboard" title="PharSayo System" badge="ADM" onAccount={() => onNavigate('account')} /><ScrollView contentContainerStyle={styles.rolePage} showsVerticalScrollIndicator={false}><View style={styles.adminHero}><Text style={styles.adminHeroLabel}>SYSTEM OVERVIEW</Text><Text style={styles.adminHeroTitle}>Lahat ng serbisyo ay operational</Text><View style={styles.systemStatus}><View style={styles.statusDot} /><Text style={styles.systemStatusText}>Live monitoring active</Text></View></View><View style={styles.staffStatsGrid}>{stats.map(([label, value, sub, color]) => <View key={label} style={styles.staffStatCard}><Text style={styles.staffStatLabel}>{label}</Text><Text style={[styles.staffStatValue, { color }]}>{value}</Text><Text style={styles.staffStatSub}>{sub}</Text></View>)}</View><View style={styles.roleSectionRow}><Text style={styles.roleSectionTitle}>Management</Text><Text style={styles.textAction}>Quick access</Text></View><View style={styles.adminActions}><AdminAction icon="people-outline" label="User Accounts" detail="1,284 registered" onPress={() => onNavigate('admin-users')} /><AdminAction icon="business-outline" label="Barangay Health Units" detail="18 active facilities" onPress={() => onNavigate('admin-bhus')} /><AdminAction icon="bar-chart-outline" label="Reports & Analytics" detail="Monthly performance" onPress={() => onNavigate('reports')} /><AdminAction icon="shield-checkmark-outline" label="Security Logs" detail="No critical alerts" onPress={() => Alert.alert('Security Logs', 'No critical security alerts detected.')} /></View></ScrollView></View>; }

function AdminAction({ icon, label, detail, onPress }: { icon: IconName; label: string; detail: string; onPress: () => void }) { return <Pressable onPress={onPress} style={styles.adminAction}><View style={styles.directoryIcon}><Ionicons name={icon} size={20} color={COLORS.brand} /></View><View style={styles.listCopy}><Text style={styles.listTitle}>{label}</Text><Text style={styles.listSubtitle}>{detail}</Text></View><Ionicons name="chevron-forward" size={18} color="#91A39D" /></Pressable>; }

function AdminDirectoryScreen({ type }: { type: 'users' | 'bhus' }) { const rows = type === 'users' ? [['Maria Angeles', 'Pasyente · Active'], ['Nrs. Ana Reyes', 'BHU Staff · Active'], ['Dr. Jose Santos', 'Clinician · Pending']] : [['Brgy. Sta. Cruz Health Center', 'Quezon City · 48 patients'], ['BHU San Isidro', 'Manila · 36 patients'], ['BHU Bagong Silang', 'Caloocan · 72 patients']]; return <View style={styles.roleScreen}><View style={styles.simpleRoleHeader}><Text style={styles.roleDashboardTitle}>{type === 'users' ? 'User Accounts' : 'Barangay Health Units'}</Text><Text style={styles.greetingSmall}>{type === 'users' ? 'Manage roles and access' : 'Facilities and enrollment'}</Text></View><ScrollView contentContainerStyle={styles.rolePage}><View style={styles.searchField}><Ionicons name="search-outline" size={18} color="#8AADA6" /><TextInput placeholder={type === 'users' ? 'Search users' : 'Search BHUs'} style={styles.searchInput} /></View><View style={styles.patientList}>{rows.map(([title, detail], index) => <View key={title} style={styles.directoryRow}><View style={styles.directoryIcon}><Ionicons name={type === 'users' ? 'person-outline' : 'business-outline'} size={19} color={COLORS.brand} /></View><View style={styles.listCopy}><Text style={styles.patientName}>{title}</Text><Text style={styles.patientMeds}>{detail}</Text></View><Pressable onPress={() => Alert.alert(title, 'Management controls will be connected to the production database.')}><Ionicons name="ellipsis-horizontal" size={19} color="#8AADA6" /></Pressable></View>)}</View><Pressable onPress={() => Alert.alert(type === 'users' ? 'Add user' : 'Register BHU', 'Form ready for backend integration.')} style={styles.staffPrimaryButton}><Text style={styles.primaryButtonText}>{type === 'users' ? 'Mag-add ng User' : 'Mag-register ng BHU'}</Text></Pressable></ScrollView></View>; }

function ReportsScreen({ role }: { role: Role }) { return <View style={styles.roleScreen}><View style={styles.simpleRoleHeader}><Text style={styles.roleDashboardTitle}>Reports & Analytics</Text><Text style={styles.greetingSmall}>{role === 'Admin' ? 'System-wide performance' : 'BHU patient adherence'}</Text></View><ScrollView contentContainerStyle={styles.rolePage}><View style={styles.reportCard}><Text style={styles.staffStatLabel}>AVERAGE ADHERENCE</Text><Text style={styles.reportValue}>78%</Text><View style={styles.reportBars}>{[52, 68, 61, 76, 72, 88, 78].map((height, index) => <View key={index} style={[styles.reportBar, { height }]} />)}</View><Text style={styles.staffStatSub}>Last 7 days · trending upward</Text></View><View style={styles.adminActions}><AdminAction icon="document-text-outline" label="Monthly Summary" detail="July 2026" onPress={() => Alert.alert('Report', 'Monthly summary generated.')} /><AdminAction icon="download-outline" label="Export Data" detail="CSV or PDF" onPress={() => Alert.alert('Export', 'Export queued successfully.')} /></View></ScrollView></View>; }

function TeamAccountScreen({ name, role, onBack, onLogout }: { name: string; role: Role; onBack: () => void; onLogout: () => void }) { const initials = name.split(' ').filter(Boolean).slice(0, 2).map(part => part[0]).join('').toUpperCase(); return <View style={styles.profileScreen}><View style={styles.profileTopbar}><Pressable onPress={onBack} style={styles.profileBack}><Ionicons name="chevron-back" size={20} color={COLORS.ink} /></Pressable><Text style={styles.profilePageTitle}>Aking Profile</Text></View><ScrollView contentContainerStyle={styles.profileContent}><View style={styles.legacyProfileHero}><View style={styles.profileHeroBubble} /><View style={styles.legacyProfileAvatar}><Text style={styles.legacyProfileInitial}>{initials}</Text></View><View style={styles.listCopy}><Text style={styles.legacyProfileName}>{name}</Text><Text style={styles.legacyProfileRole}>{role} · PharSayo Team</Text><Text style={styles.legacyProfileId}>{role === 'Admin' ? 'System Administrator' : 'Brgy. Sta. Cruz Health Center'}</Text></View></View><ProfileSection title="Account Information"><ProfileRow icon="mail-outline" label="Email" value={role === 'Admin' ? 'admin@pharsayo.ph' : 'ana.reyes@bhu.gov.ph'} /><ProfileRow icon="shield-checkmark-outline" label="Access Level" value={role} /><ProfileRow icon="business-outline" label="Organization" value={role === 'Admin' ? 'PharSayo National System' : 'Brgy. Sta. Cruz Health Center'} /></ProfileSection><Pressable onPress={onLogout} style={styles.legacyLogoutButton}><Ionicons name="log-out-outline" size={18} color={COLORS.danger} /><Text style={styles.legacyLogoutText}>Mag-logout</Text></Pressable></ScrollView></View>; }

function AccountScreen({ name, role, medicines, reminders, onNavigate, onLogout }: { name: string; role: Role; medicines: Medicine[]; reminders: Reminder[]; onNavigate: (screen: Screen) => void; onLogout: () => void }) {
  const initials = name.split(' ').filter(Boolean).slice(0, 2).map(part => part[0]).join('').toUpperCase() || 'MA';
  const adherence = reminders.length ? Math.round(reminders.filter(item => item.enabled).length / reminders.length * 100) : 0;
  return <View style={styles.profileScreen}>
    <View style={styles.profileTopbar}><Pressable onPress={() => onNavigate('home')} style={styles.profileBack}><Ionicons name="chevron-back" size={20} color={COLORS.ink} /></Pressable><Text style={styles.profilePageTitle}>Aking Profile</Text></View>
    <ScrollView contentContainerStyle={styles.profileContent} showsVerticalScrollIndicator={false}>
      <View style={styles.legacyProfileHero}><View style={styles.profileHeroBubble} /><View style={styles.legacyProfileAvatar}><Text style={styles.legacyProfileInitial}>{initials}</Text></View><View style={styles.listCopy}><Text style={styles.legacyProfileName}>{name}</Text><Text style={styles.legacyProfileRole}>{role} · PharSayo Member</Text><Text style={styles.legacyProfileId}>BHU ID: BSC-2024-00147</Text></View></View>
      <ProfileSection title="Personal na Impormasyon">
        <ProfileRow icon="person-outline" label="Buong Pangalan" value={name} />
        <ProfileRow icon="calendar-outline" label="Petsa ng Kapanganakan" value="Marso 14, 1965 · 61 taong gulang" />
        <ProfileRow icon="call-outline" label="Contact" value="0917 123 4567" />
        <ProfileRow icon="location-outline" label="Address" value="123 Mabini St., Brgy. Sta. Cruz, Quezon City" />
      </ProfileSection>
      <ProfileSection title="Impormasyon sa Kalusugan">
        <ProfileRow icon="heart-outline" label="Kondisyon" value="Hypertension · Type 2 Diabetes" />
        <ProfileRow icon="water-outline" label="Blood Type" value="O Positive" />
        <View style={styles.legacyProfileRow}><View style={styles.legacyProfileRowIcon}><Ionicons name="medical-outline" size={18} color={COLORS.brand} /></View><View style={styles.listCopy}><Text style={styles.legacyProfileLabel}>Mga Kasalukuyang Gamot</Text><View style={styles.profileMedicineChips}>{medicines.map(item => <View key={item.id} style={styles.profileMedicineChip}><Text style={styles.profileMedicineText}>{item.name} {item.dose}</Text></View>)}</View></View></View>
        <ProfileRow icon="warning-outline" label="Allergy" value="Penicillin" danger />
      </ProfileSection>
      <ProfileSection title="Adherence at Status">
        <ProfileRow icon="pulse-outline" label="Adherence Ngayong Linggo" value={`${adherence}% ✓ Magaling!`} accent />
        <ProfileRow icon="shield-checkmark-outline" label="BHU" value="Brgy. Sta. Cruz Health Center" />
        <ProfileRow icon="people-outline" label="Health Worker" value="Nrs. Ana Reyes, RN" />
        <ProfileRow icon="calendar-outline" label="Susunod na Check-up" value="Abril 22, 2026 · 9:00 AM" />
      </ProfileSection>
      <Pressable onPress={onLogout} style={styles.legacyLogoutButton}><Ionicons name="log-out-outline" size={18} color={COLORS.danger} /><Text style={styles.legacyLogoutText}>Mag-logout</Text></Pressable>
    </ScrollView>
  </View>;
}

function ProfileSection({ title, children }: { title: string; children: ReactNode }) { return <View style={styles.legacyProfileSection}><Text style={styles.legacyProfileSectionTitle}>{title}</Text><View style={styles.legacyProfileCard}>{children}</View></View>; }
function ProfileRow({ icon, label, value, danger, accent }: { icon: IconName; label: string; value: string; danger?: boolean; accent?: boolean }) { return <View style={styles.legacyProfileRow}><View style={styles.legacyProfileRowIcon}><Ionicons name={icon} size={18} color={COLORS.brand} /></View><View style={styles.listCopy}><Text style={styles.legacyProfileLabel}>{label}</Text><Text style={[styles.legacyProfileValue, danger && styles.profileDanger, accent && styles.profileAccent]}>{value}</Text></View></View>; }

function AppHeaderPlaceholder() { return null; }
void AppHeaderPlaceholder;

function BottomNav({ active, onChange }: { active: Screen; onChange: (screen: Screen) => void }) { return <View style={styles.bottomNav}>{navItems.map(item => <Pressable key={item.id} onPress={() => onChange(item.id)} style={styles.navItem}><View style={[styles.navIconWrap, active === item.id && styles.navIconWrapActive]}><Ionicons name={active === item.id ? item.activeIcon : item.icon} size={20} color={active === item.id ? COLORS.brand : '#7EA39A'} /></View><Text style={[styles.navLabel, active === item.id && styles.navLabelActive]}>{item.label}</Text></Pressable>)}</View>; }
function RoleBottomNav({ items, active, onChange }: { items: { id: Screen; label: string; icon: IconName }[]; active: Screen; onChange: (screen: Screen) => void }) { return <View style={styles.bottomNav}>{items.map(item => <Pressable key={item.id} onPress={() => onChange(item.id)} style={styles.navItem}><View style={[styles.navIconWrap, active === item.id && styles.navIconWrapActive]}><Ionicons name={item.icon} size={20} color={active === item.id ? COLORS.brand : '#7EA39A'} /></View><Text style={[styles.navLabel, active === item.id && styles.navLabelActive]}>{item.label}</Text></Pressable>)}</View>; }
function StaffBottomNav({ active, onChange }: { active: Screen; onChange: (screen: Screen) => void }) { return <RoleBottomNav active={active} onChange={onChange} items={[{ id: 'staff-dashboard', label: 'Dashboard', icon: 'grid-outline' }, { id: 'staff-patients', label: 'Patients', icon: 'people-outline' }, { id: 'prescription', label: 'Meds', icon: 'medical-outline' }, { id: 'reports', label: 'Reports', icon: 'bar-chart-outline' }, { id: 'account', label: 'Account', icon: 'person-outline' }]} />; }
function AdminBottomNav({ active, onChange }: { active: Screen; onChange: (screen: Screen) => void }) { return <RoleBottomNav active={active} onChange={onChange} items={[{ id: 'admin-dashboard', label: 'Dashboard', icon: 'grid-outline' }, { id: 'admin-users', label: 'Users', icon: 'people-outline' }, { id: 'admin-bhus', label: 'BHUs', icon: 'business-outline' }, { id: 'reports', label: 'Reports', icon: 'bar-chart-outline' }, { id: 'account', label: 'Account', icon: 'person-outline' }]} />; }
function SectionHeading({ eyebrow, title, action, onAction }: { eyebrow: string; title: string; action?: string; onAction?: () => void }) { return <View style={styles.sectionHeading}><View><Text style={styles.smallEyebrow}>{eyebrow}</Text><Text style={styles.sectionTitle}>{title}</Text></View>{action && <Pressable onPress={onAction}><Text style={styles.textAction}>{action}</Text></Pressable>}</View>; }
function PageTitle({ eyebrow, title, copy, action, onAction }: { eyebrow: string; title: string; copy: string; action?: boolean; onAction?: () => void }) { return <View style={styles.pageTitleRow}><View style={styles.pageTitleCopy}><Text style={styles.smallEyebrow}>{eyebrow}</Text><Text style={styles.pageTitle}>{title}</Text><Text style={styles.mutedCopy}>{copy}</Text></View>{action && <Pressable onPress={onAction} style={styles.addButton}><Ionicons name="add" size={24} color="#fff" /></Pressable>}</View>; }
function MedicineRow({ medicine }: { medicine: Medicine }) { return <View style={styles.listRow}><View style={[styles.medIcon, medicine.taken && styles.medIconDone]}><Ionicons name={medicine.taken ? 'checkmark' : 'medical-outline'} size={21} color={medicine.taken ? '#fff' : COLORS.brand} /></View><View style={styles.listCopy}><Text style={styles.listTitle}>{medicine.name}  <Text style={styles.listDose}>{medicine.dose}</Text></Text><Text style={styles.listSubtitle}>{medicine.note}</Text></View><View style={styles.rowMeta}><Text style={styles.rowTime}>{medicine.time}</Text><Text style={styles.rowStatus}>{medicine.taken ? 'Nainom' : 'Naka-iskedyul'}</Text></View></View>; }

const styles = StyleSheet.create({
  webStage:{flex:1,alignItems:'center',justifyContent:'center',overflow:'hidden',backgroundColor:'#EAF7F3'},
  webDevice:{width:390,height:820,borderRadius:44,overflow:'hidden',backgroundColor:COLORS.bg,borderWidth:1,borderColor:COLORS.line,shadowColor:'#163A31',shadowOpacity:.16,shadowRadius:30,shadowOffset:{width:0,height:14},elevation:12},
  loadingScreen:{flex:1,alignItems:'center',justifyContent:'center',backgroundColor:COLORS.mintSoft},
  legacyHeroCard:{height:205,borderRadius:28,alignSelf:'center',alignItems:'center',justifyContent:'center',overflow:'hidden',backgroundColor:COLORS.brand,marginTop:8},
  heroBubbleTop:{position:'absolute',width:150,height:150,borderRadius:75,top:-65,right:-32,backgroundColor:'rgba(255,255,255,.08)'},
  heroBubbleBottom:{position:'absolute',width:100,height:100,borderRadius:50,bottom:-56,left:-32,backgroundColor:'rgba(255,255,255,.07)'},
  legacyLogoFrame:{width:64,height:64,borderRadius:19,alignItems:'center',justifyContent:'center',borderWidth:2,borderColor:'rgba(255,255,255,.45)',backgroundColor:'rgba(255,255,255,.12)'},
  legacyBrand:{fontSize:27,fontWeight:'800',color:'#fff',marginTop:13,letterSpacing:-.8},
  legacyTagline:{fontSize:11,color:'rgba(255,255,255,.9)',marginTop:2},
  loginForm:{alignSelf:'center',paddingTop:27,paddingBottom:8},
  legacyWelcome:{fontSize:23,fontWeight:'700',color:COLORS.ink,textAlign:'center'},
  legacySubtitle:{fontSize:12,lineHeight:19,color:COLORS.muted,textAlign:'center',maxWidth:310,alignSelf:'center',marginTop:6},
  forgotRow:{alignSelf:'flex-end',paddingTop:11,paddingBottom:1},
  forgotText:{fontSize:11,fontWeight:'500',color:COLORS.brand},
  loginDivider:{flexDirection:'row',alignItems:'center',gap:10,marginTop:20,marginBottom:4},
  dividerLine:{flex:1,height:1,backgroundColor:COLORS.line},
  dividerText:{fontSize:10,color:'#8AADA6'},
  loginFooter:{fontSize:9,color:'#8AADA6',textAlign:'center',marginTop:20},
  assistantScreen:{flex:1},
  assistantPage:{paddingHorizontal:18,paddingTop:6,paddingBottom:112},
  assistantHeader:{flexDirection:'row',alignItems:'center',gap:12,padding:17,borderRadius:20,backgroundColor:COLORS.brand},
  assistantMark:{width:45,height:45,borderRadius:14,alignItems:'center',justifyContent:'center',backgroundColor:'rgba(255,255,255,.16)'},
  assistantTitle:{fontSize:20,fontWeight:'700',color:'#fff'},
  assistantStatus:{fontSize:10,color:'rgba(255,255,255,.82)',marginTop:2},
  assistantDisclaimer:{fontSize:10,lineHeight:16,color:COLORS.muted,textAlign:'center',paddingHorizontal:16,marginTop:12},
  suggestionWrap:{flexDirection:'row',flexWrap:'wrap',gap:7,marginTop:16},
  suggestionChip:{paddingHorizontal:12,paddingVertical:9,borderWidth:1,borderColor:COLORS.line,borderRadius:999,backgroundColor:'#fff'},
  suggestionText:{fontSize:10,fontWeight:'500',color:COLORS.brandDark},
  chatList:{gap:10,marginTop:18},
  chatBubble:{maxWidth:'88%',paddingHorizontal:14,paddingVertical:11,borderRadius:17},
  assistantBubble:{alignSelf:'flex-start',borderWidth:1,borderColor:COLORS.line,backgroundColor:'#fff',borderTopLeftRadius:5},
  userBubble:{alignSelf:'flex-end',backgroundColor:COLORS.brand,borderTopRightRadius:5},
  chatText:{fontSize:12,lineHeight:19,color:COLORS.ink},
  userChatText:{color:'#fff'},
  responseMode:{fontSize:8,fontWeight:'700',letterSpacing:1,color:'#8AADA6',marginTop:7},
  typingBubble:{flexDirection:'row',alignItems:'center',gap:8},
  typingText:{fontSize:10,color:COLORS.muted},
  bhuLink:{alignSelf:'center',flexDirection:'row',alignItems:'center',gap:7,padding:11,marginTop:18},
  bhuLinkText:{fontSize:10,fontWeight:'500',color:COLORS.brandDark},
  chatComposer:{position:'absolute',left:12,right:12,bottom:82,minHeight:58,flexDirection:'row',alignItems:'flex-end',gap:8,padding:7,borderWidth:1,borderColor:COLORS.line,borderRadius:18,backgroundColor:'#fff',shadowColor:COLORS.ink,shadowOpacity:.08,shadowRadius:12,shadowOffset:{width:0,height:5}},
  chatInput:{flex:1,maxHeight:92,minHeight:42,paddingHorizontal:10,paddingVertical:10,fontSize:12,color:COLORS.ink},
  sendButton:{width:42,height:42,borderRadius:13,alignItems:'center',justifyContent:'center',backgroundColor:COLORS.brand},
  fieldWrap:{width:'100%',height:52,borderWidth:1,borderColor:COLORS.line,borderRadius:14,paddingHorizontal:14,flexDirection:'row',alignItems:'center',gap:10,backgroundColor:'#fff'},
  fieldInput:{flex:1,minWidth:0,height:50,fontSize:14,color:COLORS.ink},
  buttonContent:{flexDirection:'row',alignItems:'center',justifyContent:'center',gap:8},
  iconButton:{width:36,height:36,borderRadius:10,alignItems:'center',justifyContent:'center'},
  safeArea:{flex:1,backgroundColor:COLORS.bg},appShell:{flex:1},screenArea:{flex:1},loginSafe:{flex:1,backgroundColor:COLORS.mintSoft,overflow:'hidden'},loginKeyboard:{flex:1},loginScroll:{flexGrow:1,width:'100%',maxWidth:'100%',padding:22,paddingTop:18,paddingBottom:40},brandRow:{flexDirection:'row',alignItems:'center',gap:10},logo:{width:42,height:42,borderRadius:14,alignItems:'center',justifyContent:'center',backgroundColor:COLORS.brand},logoGlyph:{fontSize:25,color:'#fff',fontWeight:'700'},brand:{fontSize:23,fontWeight:'800',color:COLORS.ink,letterSpacing:-1},loginHero:{width:'100%',paddingVertical:34},eyebrow:{fontSize:11,fontWeight:'800',color:COLORS.brand,letterSpacing:2},loginTitle:{fontSize:34,lineHeight:39,fontWeight:'800',letterSpacing:-1.5,color:COLORS.ink,marginTop:12},loginIntro:{fontSize:15,lineHeight:23,color:COLORS.muted,marginTop:14},loginCard:{width:'100%',backgroundColor:'#fff',borderRadius:26,padding:22,shadowColor:'#17342D',shadowOpacity:.08,shadowRadius:24,shadowOffset:{width:0,height:10},elevation:4},cardEyebrow:{fontSize:10,fontWeight:'800',color:COLORS.brand,letterSpacing:1.6},formTitle:{fontSize:27,fontWeight:'800',color:COLORS.ink,marginTop:7},formSubtitle:{fontSize:14,color:COLORS.muted,marginTop:5},roleTabs:{width:'100%',flexDirection:'row',backgroundColor:'#EEF4F1',padding:4,borderRadius:14,marginTop:22,marginBottom:5},roleTab:{flex:1,minWidth:0,minHeight:42,alignItems:'center',justifyContent:'center',borderRadius:11},roleTabActive:{backgroundColor:'#fff',shadowColor:'#17342D',shadowOpacity:.08,shadowRadius:7,shadowOffset:{width:0,height:3}},roleText:{fontSize:11,fontWeight:'700',color:COLORS.muted},roleTextActive:{color:COLORS.brand},label:{fontSize:12,fontWeight:'700',color:COLORS.ink,marginBottom:8,marginTop:17},input:{width:'100%',height:52,borderWidth:1,borderColor:COLORS.line,borderRadius:14,paddingHorizontal:15,fontSize:14,color:COLORS.ink,backgroundColor:'#fff'},passwordWrap:{width:'100%',height:52,borderWidth:1,borderColor:COLORS.line,borderRadius:14,paddingLeft:15,paddingRight:13,flexDirection:'row',alignItems:'center'},passwordInput:{flex:1,minWidth:0,height:50,color:COLORS.ink},showPassword:{fontSize:11,fontWeight:'800',color:COLORS.brand},primaryButton:{minHeight:52,borderRadius:14,alignItems:'center',justifyContent:'center',backgroundColor:COLORS.brand,marginTop:22,paddingHorizontal:18},primaryButtonText:{fontSize:14,fontWeight:'800',color:'#fff'},secondaryButton:{minHeight:50,borderRadius:14,alignItems:'center',justifyContent:'center',borderWidth:1,borderColor:COLORS.line,backgroundColor:'#fff',marginTop:10},secondaryButtonText:{fontSize:14,fontWeight:'700',color:COLORS.ink},pressed:{opacity:.75,transform:[{scale:.99}]},disabled:{opacity:.55},header:{paddingHorizontal:20,paddingTop:14,paddingBottom:12,flexDirection:'row',alignItems:'center',justifyContent:'space-between',backgroundColor:COLORS.bg},greetingSmall:{fontSize:11,color:COLORS.muted},headerActions:{flexDirection:'row',alignItems:'center',gap:9},headerIconButton:{width:40,height:40,borderRadius:20,alignItems:'center',justifyContent:'center',backgroundColor:'#fff',borderWidth:1,borderColor:COLORS.line},headerTitle:{fontSize:18,fontWeight:'800',letterSpacing:-.3,color:COLORS.ink,marginTop:2},avatar:{width:40,height:40,borderRadius:20,alignItems:'center',justifyContent:'center',backgroundColor:COLORS.mint,borderWidth:2,borderColor:COLORS.brand},avatarText:{fontSize:13,fontWeight:'800',color:COLORS.brandDark},page:{paddingHorizontal:18,paddingTop:7,paddingBottom:96},heroCard:{minHeight:230,borderRadius:26,padding:25,backgroundColor:COLORS.brand,overflow:'hidden'},heroEyebrow:{fontSize:10,fontWeight:'800',letterSpacing:1.4,color:'#BDEADD'},heroTitle:{maxWidth:310,fontSize:29,lineHeight:34,fontWeight:'800',letterSpacing:-1,color:'#fff',marginTop:12},heroSubtitle:{fontSize:13,color:'#D2EEE7',marginTop:8},heroButton:{alignSelf:'flex-start',minHeight:45,justifyContent:'center',paddingHorizontal:18,borderRadius:13,backgroundColor:'#fff',marginTop:24},heroButtonText:{fontSize:13,fontWeight:'800',color:COLORS.brand},adherenceCard:{minHeight:126,borderRadius:21,padding:20,backgroundColor:'#fff',borderWidth:1,borderColor:COLORS.line,marginTop:13,flexDirection:'row',alignItems:'center',justifyContent:'space-between'},smallEyebrow:{fontSize:9,fontWeight:'800',letterSpacing:1.3,color:COLORS.brand,marginBottom:6},sectionTitle:{fontSize:19,fontWeight:'800',letterSpacing:-.4,color:COLORS.ink},mutedCopy:{fontSize:12,lineHeight:18,color:COLORS.muted,marginTop:5},scoreCircle:{width:72,height:72,borderRadius:36,borderWidth:8,borderColor:COLORS.brand,alignItems:'center',justifyContent:'center'},score:{fontSize:16,fontWeight:'800',color:COLORS.ink},sectionHeading:{flexDirection:'row',justifyContent:'space-between',alignItems:'flex-end',marginTop:28,marginBottom:12,paddingHorizontal:2},textAction:{fontSize:12,fontWeight:'800',color:COLORS.brand},listRow:{minHeight:76,borderRadius:18,padding:14,backgroundColor:'#fff',borderWidth:1,borderColor:COLORS.line,flexDirection:'row',alignItems:'center',gap:12,marginBottom:10},medIcon:{width:45,height:45,borderRadius:14,backgroundColor:COLORS.mint,alignItems:'center',justifyContent:'center'},medIconDone:{backgroundColor:COLORS.brand},medIconText:{fontSize:20,fontWeight:'700',color:COLORS.brand},medIconTextDone:{color:'#fff'},listCopy:{flex:1},listTitle:{fontSize:14,fontWeight:'800',color:COLORS.ink},listDose:{fontSize:11,fontWeight:'600',color:COLORS.muted},listSubtitle:{fontSize:11,color:COLORS.muted,marginTop:4},rowMeta:{alignItems:'flex-end'},rowTime:{fontSize:11,fontWeight:'800',color:COLORS.ink},rowStatus:{fontSize:9,fontWeight:'700',color:COLORS.brand,marginTop:5},quickGrid:{gap:9},quickCard:{minHeight:72,borderRadius:18,padding:13,backgroundColor:'#fff',borderWidth:1,borderColor:COLORS.line,flexDirection:'row',alignItems:'center',gap:12},quickIcon:{width:43,height:43,borderRadius:13,alignItems:'center',justifyContent:'center',backgroundColor:COLORS.mint},quickIconText:{fontSize:21,color:COLORS.brand},quickLabel:{flex:1,fontSize:13,fontWeight:'800',color:COLORS.ink},quickArrow:{fontSize:25,color:'#91A39D'},bottomNav:{position:'absolute',left:0,right:0,bottom:0,minHeight:76,backgroundColor:'#fff',borderTopWidth:1,borderTopColor:COLORS.line,flexDirection:'row',alignItems:'center',justifyContent:'space-around',paddingHorizontal:5,paddingTop:8,paddingBottom:12,shadowColor:COLORS.brand,shadowOpacity:.07,shadowRadius:16,shadowOffset:{width:0,height:-4},elevation:10},navItem:{flex:1,alignItems:'center',justifyContent:'center',gap:2},navIconWrap:{width:32,height:30,borderRadius:11,alignItems:'center',justifyContent:'center'},navIconWrapActive:{backgroundColor:COLORS.mint},navLabel:{fontSize:8,fontWeight:'700',color:'#8AADA6'},navLabelActive:{color:COLORS.brand},pageTitleRow:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',marginBottom:22,paddingHorizontal:2},pageTitleCopy:{flex:1,paddingRight:12},pageTitle:{fontSize:29,fontWeight:'800',letterSpacing:-1,color:COLORS.ink},addButton:{width:45,height:45,borderRadius:14,alignItems:'center',justifyContent:'center',backgroundColor:COLORS.brand},addButtonText:{fontSize:24,color:'#fff'},remove:{fontSize:24,color:'#9AAC A6'.replace(' ',''),padding:7},modalBackdrop:{flex:1,justifyContent:'flex-end',backgroundColor:'rgba(15,38,32,.5)'},modalSheet:{backgroundColor:'#fff',borderTopLeftRadius:28,borderTopRightRadius:28,padding:23,paddingBottom:Platform.OS==='ios'?38:24},modalHandle:{width:42,height:5,borderRadius:3,backgroundColor:'#DCE5E2',alignSelf:'center',marginBottom:21},modalTitle:{fontSize:24,fontWeight:'800',color:COLORS.ink},modalCancel:{alignItems:'center',padding:16},modalCancelText:{fontSize:13,fontWeight:'700',color:COLORS.muted},scanPage:{alignItems:'stretch'},scannerFrame:{height:310,borderRadius:25,backgroundColor:'#fff',alignItems:'center',justifyContent:'center',overflow:'hidden',marginTop:4},scannedImage:{width:'100%',height:'100%',resizeMode:'cover'},scanGlyph:{fontSize:55,color:COLORS.brand},scanHint:{fontSize:13,fontWeight:'700',color:COLORS.muted,marginTop:12},corner:{position:'absolute',width:48,height:48,borderColor:COLORS.brand},cornerTL:{top:18,left:18,borderTopWidth:3,borderLeftWidth:3},cornerTR:{top:18,right:18,borderTopWidth:3,borderRightWidth:3},cornerBL:{bottom:18,left:18,borderBottomWidth:3,borderLeftWidth:3},cornerBR:{bottom:18,right:18,borderBottomWidth:3,borderRightWidth:3},scanCopy:{fontSize:13,lineHeight:20,color:COLORS.muted,textAlign:'center',marginHorizontal:30,marginTop:20},timeBadge:{minWidth:72,height:42,borderRadius:12,alignItems:'center',justifyContent:'center',backgroundColor:COLORS.mintSoft},timeText:{fontSize:11,fontWeight:'800',color:COLORS.brand},supportCard:{borderRadius:23,padding:24,backgroundColor:'#fff',borderWidth:1,borderColor:COLORS.line,marginBottom:13},supportIcon:{width:52,height:52,borderRadius:16,alignItems:'center',justifyContent:'center',backgroundColor:COLORS.mint,marginBottom:18},supportIconText:{fontSize:27,color:COLORS.brand},supportTitle:{fontSize:20,fontWeight:'800',color:COLORS.ink},supportCopy:{fontSize:13,lineHeight:21,color:COLORS.muted,marginTop:8},emergencyCard:{backgroundColor:COLORS.cream},
  roleScreen:{flex:1,backgroundColor:COLORS.bg},roleDashboardHeader:{minHeight:76,paddingHorizontal:20,paddingVertical:12,flexDirection:'row',alignItems:'center',justifyContent:'space-between'},roleDashboardTitle:{fontSize:18,fontWeight:'800',color:COLORS.ink,marginTop:2},roleBadge:{width:40,height:40,borderRadius:20,alignItems:'center',justifyContent:'center',backgroundColor:COLORS.mint,borderWidth:2,borderColor:COLORS.brand},roleBadgeText:{fontSize:9,fontWeight:'800',color:COLORS.brandDark},rolePage:{paddingTop:8,paddingBottom:98},staffStatsGrid:{flexDirection:'row',flexWrap:'wrap',justifyContent:'space-between',rowGap:12,paddingHorizontal:18},staffStatCard:{width:'48%',minHeight:112,borderRadius:20,borderWidth:1,borderColor:COLORS.line,padding:14,backgroundColor:'#fff'},staffStatLabel:{fontSize:8,fontWeight:'700',letterSpacing:.5,color:'#8AADA6',textTransform:'uppercase'},staffStatValue:{fontSize:25,fontWeight:'800',color:COLORS.ink,marginTop:5},staffStatSub:{fontSize:9,color:'#8AADA6',marginTop:2},staffAlert:{marginHorizontal:18,marginTop:16,minHeight:70,borderRadius:16,borderWidth:1,borderColor:'#F4CECE',padding:13,flexDirection:'row',alignItems:'center',gap:11,backgroundColor:'#FDEAEA'},staffAlertIcon:{width:38,height:38,borderRadius:12,alignItems:'center',justifyContent:'center',backgroundColor:'#F9DADA'},staffAlertTitle:{fontSize:11,fontWeight:'800',color:COLORS.ink},staffAlertSub:{fontSize:9,color:'#8AADA6',marginTop:2},roleSectionRow:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',paddingHorizontal:18,marginTop:18,marginBottom:11},roleSectionTitle:{fontSize:14,fontWeight:'800',color:COLORS.ink},patientList:{marginHorizontal:18,borderRadius:20,borderWidth:1,borderColor:COLORS.line,backgroundColor:'#fff',overflow:'hidden'},patientRow:{minHeight:72,paddingHorizontal:14,paddingVertical:12,flexDirection:'row',alignItems:'center',gap:10,borderBottomWidth:1,borderBottomColor:COLORS.line},patientAvatar:{width:42,height:42,borderRadius:14,alignItems:'center',justifyContent:'center'},patientInitials:{fontSize:11,fontWeight:'800'},patientName:{fontSize:11,fontWeight:'800',color:COLORS.ink},patientMeds:{fontSize:9,color:'#8AADA6',marginTop:3},adherenceColumn:{width:52},adherenceTrack:{height:5,borderRadius:3,backgroundColor:'#E2F5F0',overflow:'hidden'},adherenceFill:{height:5,borderRadius:3},adherencePercent:{fontSize:9,fontWeight:'800',textAlign:'right',marginTop:3},flagPill:{paddingHorizontal:8,paddingVertical:4,borderRadius:12,backgroundColor:'#FDEAEA'},flagText:{fontSize:8,fontWeight:'800',color:COLORS.danger},staffPrimaryButton:{minHeight:49,marginHorizontal:18,marginTop:16,borderRadius:24,alignItems:'center',justifyContent:'center',backgroundColor:COLORS.brand},simpleRoleHeader:{paddingHorizontal:20,paddingTop:18,paddingBottom:14},searchField:{height:48,marginHorizontal:18,marginBottom:12,borderRadius:14,borderWidth:1,borderColor:COLORS.line,paddingHorizontal:14,flexDirection:'row',alignItems:'center',gap:9,backgroundColor:'#fff'},searchInput:{flex:1,height:46,fontSize:12,color:COLORS.ink},prescriptionPage:{paddingHorizontal:18,paddingBottom:30},formSectionLabel:{fontSize:9,fontWeight:'800',letterSpacing:.8,color:COLORS.muted,marginTop:15,marginBottom:8},rxInput:{height:49,borderRadius:14,borderWidth:1,borderColor:COLORS.line,paddingHorizontal:14,fontSize:12,color:COLORS.ink,backgroundColor:'#fff',marginBottom:10},formTwoColumns:{flexDirection:'row',justifyContent:'space-between'},halfInput:{width:'48%'},languagePills:{flexDirection:'row',gap:8,marginBottom:8},languagePill:{paddingHorizontal:16,paddingVertical:9,borderRadius:20,borderWidth:1,borderColor:COLORS.line},languagePillActive:{paddingHorizontal:16,paddingVertical:9,borderRadius:20,backgroundColor:COLORS.mint},languagePillText:{fontSize:10,fontWeight:'600',color:COLORS.muted},languagePillActiveText:{fontSize:10,fontWeight:'800',color:COLORS.brandDark},adminHero:{marginHorizontal:18,marginBottom:14,minHeight:128,borderRadius:22,padding:20,backgroundColor:COLORS.brand,overflow:'hidden'},adminHeroLabel:{fontSize:8,fontWeight:'800',letterSpacing:1,color:'rgba(255,255,255,.75)'},adminHeroTitle:{fontSize:18,lineHeight:24,fontWeight:'800',color:'#fff',marginTop:7,maxWidth:250},systemStatus:{alignSelf:'flex-start',flexDirection:'row',alignItems:'center',gap:6,paddingHorizontal:10,paddingVertical:6,borderRadius:15,backgroundColor:'rgba(255,255,255,.16)',marginTop:12},statusDot:{width:7,height:7,borderRadius:4,backgroundColor:'#B9F3D5'},systemStatusText:{fontSize:9,fontWeight:'600',color:'#fff'},adminActions:{marginHorizontal:18,borderRadius:20,borderWidth:1,borderColor:COLORS.line,backgroundColor:'#fff',overflow:'hidden'},adminAction:{minHeight:65,flexDirection:'row',alignItems:'center',gap:11,paddingHorizontal:14,borderBottomWidth:1,borderBottomColor:COLORS.line},directoryRow:{minHeight:68,flexDirection:'row',alignItems:'center',gap:11,paddingHorizontal:14,borderBottomWidth:1,borderBottomColor:COLORS.line},directoryIcon:{width:40,height:40,borderRadius:13,alignItems:'center',justifyContent:'center',backgroundColor:COLORS.mint},reportCard:{marginHorizontal:18,marginBottom:16,minHeight:230,borderRadius:22,borderWidth:1,borderColor:COLORS.line,padding:18,backgroundColor:'#fff'},reportValue:{fontSize:34,fontWeight:'800',color:COLORS.brand,marginTop:5},reportBars:{height:98,flexDirection:'row',alignItems:'flex-end',justifyContent:'space-between',gap:7,marginVertical:14},reportBar:{flex:1,maxWidth:30,borderTopLeftRadius:5,borderTopRightRadius:5,backgroundColor:COLORS.brand},
  legacyHomePage:{paddingBottom:96},legacyScanBanner:{marginHorizontal:18,marginTop:4,minHeight:157,borderRadius:24,paddingHorizontal:20,paddingVertical:20,backgroundColor:COLORS.brand,overflow:'hidden'},homeBubbleBottom:{position:'absolute',width:90,height:90,borderRadius:45,right:28,bottom:-38,backgroundColor:'rgba(255,255,255,.07)'},legacyBannerLabel:{fontSize:10,color:'rgba(255,255,255,.78)',fontWeight:'600'},legacyBannerTitle:{fontSize:17,lineHeight:23,fontWeight:'800',color:'#fff',marginTop:4},legacyBannerButton:{alignSelf:'flex-start',minHeight:36,flexDirection:'row',alignItems:'center',gap:6,paddingHorizontal:16,borderRadius:20,backgroundColor:'#fff',marginTop:14},legacyBannerButtonText:{fontSize:11,fontWeight:'800',color:COLORS.brand},legacyReminder:{marginHorizontal:18,marginTop:18,minHeight:104,borderRadius:20,borderWidth:1,borderColor:'#F9DDAA',padding:16,flexDirection:'row',alignItems:'center',gap:12,backgroundColor:'#FFF8ED'},reminderIcon:{width:46,height:46,borderRadius:15,alignItems:'center',justifyContent:'center',backgroundColor:'#F6A623'},reminderTitle:{fontSize:12,fontWeight:'800',lineHeight:17,color:COLORS.ink},reminderSub:{fontSize:9,lineHeight:14,color:'#9A7020',marginTop:3},reminderButton:{minHeight:36,justifyContent:'center',paddingHorizontal:12,borderRadius:20,backgroundColor:'#F6A623'},reminderButtonText:{fontSize:9,fontWeight:'800',color:'#fff'},legacySectionRow:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',marginTop:18,marginBottom:11,paddingHorizontal:18},legacySectionTitle:{fontSize:14,fontWeight:'800',color:COLORS.ink},categoryGrid:{flexDirection:'row',flexWrap:'wrap',justifyContent:'space-between',rowGap:12,paddingHorizontal:18},categoryCard:{width:'48%',minHeight:132,borderRadius:20,borderWidth:1,borderColor:COLORS.line,padding:15,backgroundColor:'#fff'},categoryIcon:{width:46,height:46,borderRadius:15,alignItems:'center',justifyContent:'center'},categoryName:{fontSize:12,fontWeight:'800',color:COLORS.ink,marginTop:11},categoryCount:{fontSize:9,color:'#8AADA6',marginTop:3},homeMedicineList:{paddingHorizontal:18},
  liveCamera:{width:'100%',height:'100%'},cameraFlipButton:{position:'absolute',top:18,right:18,width:42,height:42,borderRadius:21,alignItems:'center',justifyContent:'center',backgroundColor:'rgba(13,43,36,.72)',borderWidth:1,borderColor:'rgba(255,255,255,.45)'},
  scanError:{flexDirection:'row',alignItems:'flex-start',gap:9,padding:13,borderRadius:14,backgroundColor:'#FFF0F0',marginTop:12},scanErrorText:{flex:1,fontSize:10,lineHeight:16,color:'#9D3D3D'},
  scanResult:{padding:18,borderRadius:21,borderWidth:1,borderColor:COLORS.line,backgroundColor:'#fff',marginTop:14},scanResultTop:{flexDirection:'row',alignItems:'center',gap:12},scanResultIcon:{width:48,height:48,borderRadius:15,alignItems:'center',justifyContent:'center',backgroundColor:COLORS.mint},scanResultName:{fontSize:20,fontWeight:'800',color:COLORS.ink},visibleText:{fontSize:10,lineHeight:16,color:COLORS.muted,backgroundColor:COLORS.mintSoft,padding:10,borderRadius:11,marginTop:14},scanResultGuidance:{fontSize:11,lineHeight:18,color:COLORS.ink,marginTop:12},resultButton:{minHeight:46,borderRadius:13,alignItems:'center',justifyContent:'center',backgroundColor:COLORS.brand,marginTop:15},scanSafety:{fontSize:9,lineHeight:14,color:COLORS.muted,textAlign:'center',marginTop:10},
  profileScreen:{flex:1,backgroundColor:COLORS.bg},profileTopbar:{minHeight:66,flexDirection:'row',alignItems:'center',gap:12,paddingHorizontal:18},profileBack:{width:38,height:38,borderRadius:19,alignItems:'center',justifyContent:'center',backgroundColor:'#fff',borderWidth:1,borderColor:COLORS.line},profilePageTitle:{fontSize:17,fontWeight:'800',color:COLORS.ink},profileContent:{paddingBottom:28},legacyProfileHero:{marginHorizontal:18,marginBottom:18,minHeight:112,borderRadius:24,paddingHorizontal:20,paddingVertical:22,flexDirection:'row',alignItems:'center',gap:16,backgroundColor:COLORS.brand,overflow:'hidden'},profileHeroBubble:{position:'absolute',width:110,height:110,borderRadius:55,right:-30,top:-30,backgroundColor:'rgba(255,255,255,.09)'},legacyProfileAvatar:{width:64,height:64,borderRadius:22,alignItems:'center',justifyContent:'center',backgroundColor:'rgba(255,255,255,.2)',borderWidth:2.5,borderColor:'rgba(255,255,255,.45)'},legacyProfileInitial:{fontSize:20,fontWeight:'800',color:'#fff'},legacyProfileName:{fontSize:18,fontWeight:'800',color:'#fff'},legacyProfileRole:{fontSize:10,color:'rgba(255,255,255,.78)',marginTop:3},legacyProfileId:{fontSize:9,fontWeight:'600',letterSpacing:.4,color:'rgba(255,255,255,.62)',marginTop:3},legacyProfileSection:{marginHorizontal:18,marginBottom:16},legacyProfileSectionTitle:{fontSize:9,fontWeight:'700',letterSpacing:.8,color:'#8AADA6',textTransform:'uppercase',marginBottom:9},legacyProfileCard:{borderRadius:18,borderWidth:1,borderColor:COLORS.line,backgroundColor:'#fff',overflow:'hidden'},legacyProfileRow:{minHeight:65,flexDirection:'row',alignItems:'center',gap:13,paddingHorizontal:15,paddingVertical:12,borderBottomWidth:1,borderBottomColor:COLORS.line},legacyProfileRowIcon:{width:36,height:36,borderRadius:12,alignItems:'center',justifyContent:'center',backgroundColor:COLORS.mint},legacyProfileLabel:{fontSize:9,color:'#8AADA6',fontWeight:'600'},legacyProfileValue:{fontSize:11,lineHeight:17,color:COLORS.ink,fontWeight:'600',marginTop:2},profileDanger:{color:COLORS.danger},profileAccent:{color:COLORS.brand},profileMedicineChips:{flexDirection:'row',flexWrap:'wrap',gap:6,marginTop:7},profileMedicineChip:{paddingHorizontal:9,paddingVertical:5,borderRadius:11,borderWidth:1,borderColor:COLORS.line,backgroundColor:'#E2F5F0'},profileMedicineText:{fontSize:9,fontWeight:'600',color:COLORS.muted},legacyLogoutButton:{minHeight:48,marginHorizontal:18,borderRadius:24,flexDirection:'row',alignItems:'center',justifyContent:'center',gap:8,borderWidth:1,borderColor:'#F3CFCF',backgroundColor:'#FDEAEA'},legacyLogoutText:{fontSize:12,fontWeight:'800',color:COLORS.danger},
});
