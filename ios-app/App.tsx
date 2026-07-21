import { StatusBar } from 'expo-status-bar';
import * as ImagePicker from 'expo-image-picker';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useFonts } from 'expo-font';
import { Poppins_400Regular } from '@expo-google-fonts/poppins/400Regular';
import { Poppins_500Medium } from '@expo-google-fonts/poppins/500Medium';
import { Poppins_600SemiBold } from '@expo-google-fonts/poppins/600SemiBold';
import { Poppins_700Bold } from '@expo-google-fonts/poppins/700Bold';
import { Poppins_800ExtraBold } from '@expo-google-fonts/poppins/800ExtraBold';
import { useMemo, useState } from 'react';
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

type Screen = 'home' | 'medicines' | 'scan' | 'reminders' | 'assistant' | 'support' | 'account';
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
  { id: 'home', label: 'Ngayon', icon: 'home-outline', activeIcon: 'home' },
  { id: 'medicines', label: 'Gamot', icon: 'medical-outline', activeIcon: 'medical' },
  { id: 'scan', label: 'I-scan', icon: 'scan-outline', activeIcon: 'scan' },
  { id: 'assistant', label: 'AI Gabay', icon: 'sparkles-outline', activeIcon: 'sparkles' },
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

  const content = !fontsLoaded ? (
    <View style={styles.loadingScreen}><ActivityIndicator size="large" color={COLORS.brand} /></View>
  ) : !signedIn ? (
    <LoginScreen role={role} setRole={setRole} onLogin={setSignedIn} onName={setName} />
  ) : (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <View style={styles.appShell}>
        <AppHeader name={name} onAccount={() => setScreen('account')} />
        <View style={styles.screenArea}>
          {screen === 'home' && <HomeScreen medicines={medicines} setMedicines={setMedicines} onNavigate={setScreen} />}
          {screen === 'medicines' && <MedicinesScreen medicines={medicines} setMedicines={setMedicines} />}
          {screen === 'scan' && <ScannerScreen onAddMedicine={(medicine) => setMedicines(items => [...items, medicine])} />}
          {screen === 'reminders' && <RemindersScreen reminders={reminders} setReminders={setReminders} medicines={medicines} />}
          {screen === 'assistant' && <AssistantScreen medicines={medicines} onSupport={() => setScreen('support')} />}
          {screen === 'support' && <SupportScreen />}
          {screen === 'account' && <AccountScreen name={name} setName={setName} role={role} setRole={setRole} reminders={reminders} onNavigate={setScreen} onLogout={() => setSignedIn(false)} />}
        </View>
        <BottomNav active={screen} onChange={setScreen} />
      </View>
    </SafeAreaView>
  );

  if (Platform.OS === 'web' && width > 600) {
    const previewScale = Math.min(1, (width - 48) / 390, (height - 32) / 844);
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
  const previewWidth = Platform.OS === 'web' && width > 600 ? 390 : width;
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
            <Pressable onPress={() => { onName(role === 'Pasyente' ? 'Maria Angeles' : 'Juan Santos'); onLogin(true); }} style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}><Text style={styles.secondaryButtonText}>Tingnan muna ang demo</Text></Pressable>
            <Text style={styles.loginFooter}>Suporta sa Filipino at English · v1.0.0</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function AppHeader({ name, onAccount }: { name: string; onAccount: () => void }) {
  const firstName = name.trim().split(' ')[0] || 'Maria';
  return <View style={styles.header}><View><Text style={styles.headerDate}>{new Intl.DateTimeFormat('fil-PH', { weekday: 'long', month: 'long', day: 'numeric' }).format(new Date()).toUpperCase()}</Text><Text style={styles.headerTitle}>Kumusta, {firstName}!</Text></View><Pressable onPress={onAccount} accessibilityLabel="Buksan ang account settings" style={styles.avatar}><Text style={styles.avatarText}>{firstName[0].toUpperCase()}</Text></Pressable></View>;
}

function HomeScreen({ medicines, setMedicines, onNavigate }: { medicines: Medicine[]; setMedicines: React.Dispatch<React.SetStateAction<Medicine[]>>; onNavigate: (screen: Screen) => void }) {
  const next = medicines.find(item => !item.taken) || medicines[0];
  const completed = medicines.filter(item => item.taken).length;
  const percent = medicines.length ? Math.round(completed / medicines.length * 100) : 0;
  function takeDose() { if (!next) return; setMedicines(items => items.map(item => item.id === next.id ? { ...item, taken: true } : item)); Alert.alert('Naitala na', 'Magaling! Naitala ang pag-inom ng gamot.'); }
  return <ScrollView contentContainerStyle={styles.page} showsVerticalScrollIndicator={false}>
    <View style={styles.heroCard}><Text style={styles.heroEyebrow}>SUSUNOD · {next?.time || 'WALANG ISKEDYUL'}</Text><Text style={styles.heroTitle}>{next ? `Oras na para sa iyong ${next.name}.` : 'Kumpleto ang iyong gamot ngayon.'}</Text>{next && <><Text style={styles.heroSubtitle}>{next.dose} · {next.note}</Text><Pressable onPress={takeDose} style={styles.heroButton}><Text style={styles.heroButtonText}>Nainom ko na</Text></Pressable></>}</View>
    <View style={styles.adherenceCard}><View><Text style={styles.smallEyebrow}>LINGGONG ITO</Text><Text style={styles.sectionTitle}>Pagsunod sa gamot</Text><Text style={styles.mutedCopy}>{completed} sa {medicines.length} ang nakumpleto</Text></View><View style={styles.scoreCircle}><Text style={styles.score}>{percent}%</Text></View></View>
    <SectionHeading eyebrow="ARAW-ARAW NA GABAY" title="Iskedyul ngayon" action="Lahat →" onAction={() => onNavigate('medicines')} />
    {medicines.map(item => <MedicineRow key={item.id} medicine={item} />)}
    <SectionHeading eyebrow="SHORTCUTS" title="Mabilis na gawain" />
    <View style={styles.quickGrid}>{[
      ['scan', 'scan-outline', 'Kilalanin ang gamot'], ['medicines', 'medical-outline', 'Mga gamot ko'], ['assistant', 'sparkles-outline', 'Tanungin ang AI Gabay'], ['support', 'heart-outline', 'BHU support'],
    ].map(([id, icon, label]) => <Pressable key={id} onPress={() => onNavigate(id as Screen)} style={styles.quickCard}><View style={styles.quickIcon}><Ionicons name={icon as IconName} size={21} color={COLORS.brand} /></View><Text style={styles.quickLabel}>{label}</Text><Ionicons name="chevron-forward" size={18} color="#91A39D" /></Pressable>)}</View>
  </ScrollView>;
}

function MedicinesScreen({ medicines, setMedicines }: { medicines: Medicine[]; setMedicines: React.Dispatch<React.SetStateAction<Medicine[]>> }) {
  const [modalVisible, setModalVisible] = useState(false);
  const [name, setName] = useState(''); const [dose, setDose] = useState(''); const [time, setTime] = useState('');
  function addMedicine() { if (!name || !dose || !time) return Alert.alert('Kulang ang detalye'); setMedicines(items => [...items, { id: Date.now(), name, dose, time, note: 'Ayon sa reseta', taken: false }]); setModalVisible(false); setName(''); setDose(''); setTime(''); }
  return <><ScrollView contentContainerStyle={styles.page}><PageTitle eyebrow="MEDICATION LIST" title="Mga gamot ko" copy="Lahat ng aktibong gamot at iskedyul." action onAction={() => setModalVisible(true)} />{medicines.map(item => <View key={item.id} style={styles.listRow}><View style={styles.medIcon}><Ionicons name="medical-outline" size={21} color={COLORS.brand} /></View><View style={styles.listCopy}><Text style={styles.listTitle}>{item.name}  <Text style={styles.listDose}>{item.dose}</Text></Text><Text style={styles.listSubtitle}>{item.note} · {item.time}</Text></View><Pressable onPress={() => setMedicines(items => items.filter(med => med.id !== item.id))} style={styles.iconButton}><Ionicons name="close" size={20} color="#9AACA6" /></Pressable></View>)}</ScrollView><Modal transparent visible={modalVisible} animationType="slide" onRequestClose={() => setModalVisible(false)}><View style={styles.modalBackdrop}><View style={styles.modalSheet}><View style={styles.modalHandle} /><Text style={styles.modalTitle}>Magdagdag ng gamot</Text><Text style={styles.label}>Pangalan</Text><TextInput value={name} onChangeText={setName} placeholder="hal. Losartan" style={styles.input} /><Text style={styles.label}>Dosage</Text><TextInput value={dose} onChangeText={setDose} placeholder="hal. 50mg" style={styles.input} /><Text style={styles.label}>Oras</Text><TextInput value={time} onChangeText={setTime} placeholder="hal. 8:00 AM" style={styles.input} /><Pressable onPress={addMedicine} style={styles.primaryButton}><Text style={styles.primaryButtonText}>Idagdag ang gamot</Text></Pressable><Pressable onPress={() => setModalVisible(false)} style={styles.modalCancel}><Text style={styles.modalCancelText}>Kanselahin</Text></Pressable></View></View></Modal></>;
}

function ScannerScreen({ onAddMedicine }: { onAddMedicine: (medicine: Medicine) => void }) {
  const [photo, setPhoto] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState('image/jpeg');
  const [finding, setFinding] = useState<ScanFinding | null>(null);
  const [scanError, setScanError] = useState('');
  const [analyzing, setAnalyzing] = useState(false);

  async function openCamera() {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) return Alert.alert('Camera permission', 'Payagan ang camera sa Settings para makapag-scan ng gamot.');
    const result = await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: .65, allowsEditing: true, base64: true });
    if (!result.canceled) {
      const asset = result.assets[0];
      setPhoto(asset.uri); setImageBase64(asset.base64 || null); setMimeType(asset.mimeType || 'image/jpeg');
      setFinding(null); setScanError('');
    }
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
    <View style={styles.scannerFrame}>{photo ? <Image source={{ uri: photo }} style={styles.scannedImage} /> : <><Ionicons name="camera-outline" size={58} color={COLORS.brand} /><Text style={styles.scanHint}>Ilagay ang medicine label sa frame</Text></>}<View style={[styles.corner, styles.cornerTL]} /><View style={[styles.corner, styles.cornerTR]} /><View style={[styles.corner, styles.cornerBL]} /><View style={[styles.corner, styles.cornerBR]} /></View>
    <Text style={styles.scanCopy}>{photo ? 'I-tap ang “Kilalanin ang gamot” para basahin ng AI ang label.' : 'Hindi sapat ang itsura o kulay ng tableta—dapat kita ang printed label.'}</Text>
    <Pressable onPress={openCamera} style={styles.primaryButton}><View style={styles.buttonContent}><Ionicons name="camera" size={18} color="#fff" /><Text style={styles.primaryButtonText}>{photo ? 'Kunan ulit' : 'Buksan ang camera'}</Text></View></Pressable>
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

function AccountScreen({ name, setName, role, setRole, reminders, onNavigate, onLogout }: { name: string; setName: (name: string) => void; role: Role; setRole: (role: Role) => void; reminders: Reminder[]; onNavigate: (screen: Screen) => void; onLogout: () => void }) {
  const [draftName, setDraftName] = useState(name);
  const enabledReminders = reminders.filter(item => item.enabled).length;
  function saveProfile() { const cleanName = draftName.trim(); if (!cleanName) return Alert.alert('Ilagay ang pangalan'); setName(cleanName); Alert.alert('Naka-save', 'Na-update na ang iyong account.'); }
  return <ScrollView contentContainerStyle={styles.page} showsVerticalScrollIndicator={false}>
    <PageTitle eyebrow="ACCOUNT SETTINGS" title="Iyong account" copy="Profile, access, reminders, at support." />
    <View style={styles.profileCard}><View style={styles.profileAvatar}><Text style={styles.profileInitial}>{(draftName.trim()[0] || 'M').toUpperCase()}</Text></View><Text style={styles.profileName}>{name}</Text><Text style={styles.profileRole}>{role}</Text></View>
    <Text style={styles.settingsHeading}>PERSONAL INFORMATION</Text>
    <View style={styles.settingsCard}><Text style={styles.label}>PANGALAN</Text><View style={styles.fieldWrap}><Ionicons name="person-outline" size={19} color="#86A69E" /><TextInput value={draftName} onChangeText={setDraftName} placeholder="Buong pangalan" style={styles.fieldInput} /></View><Text style={styles.label}>ACCOUNT TYPE</Text><View style={styles.roleTabs}>{(['Pasyente', 'BHU Staff', 'Admin'] as Role[]).map(item => <Pressable key={item} onPress={() => setRole(item)} style={[styles.roleTab, role === item && styles.roleTabActive]}><Text style={[styles.roleText, role === item && styles.roleTextActive]}>{item}</Text></Pressable>)}</View><Pressable onPress={saveProfile} style={styles.primaryButton}><Text style={styles.primaryButtonText}>I-save ang pagbabago</Text></Pressable></View>
    <Text style={styles.settingsHeading}>APP SETTINGS</Text>
    <View style={styles.settingsCard}><SettingsRow icon="notifications-outline" label="Mga paalaala" value={`${enabledReminders} naka-on`} onPress={() => onNavigate('reminders')} /><SettingsRow icon="heart-outline" label="BHU support" value="Contact at emergency" onPress={() => onNavigate('support')} /><SettingsRow icon="shield-checkmark-outline" label="Privacy at kaligtasan" value="Health data controls" onPress={() => Alert.alert('Privacy', 'Ang scanned image ay ginagamit lamang para sa requested analysis. Kumpirmahin pa rin ang gamot sa original packaging o pharmacist.')} /></View>
    <Pressable onPress={onLogout} style={styles.logoutButton}><Ionicons name="log-out-outline" size={19} color={COLORS.danger} /><Text style={styles.logoutText}>Mag-log out</Text></Pressable>
  </ScrollView>;
}

function SettingsRow({ icon, label, value, onPress }: { icon: IconName; label: string; value: string; onPress: () => void }) { return <Pressable onPress={onPress} style={styles.settingsRow}><View style={styles.settingsIcon}><Ionicons name={icon} size={20} color={COLORS.brand} /></View><View style={styles.listCopy}><Text style={styles.listTitle}>{label}</Text><Text style={styles.listSubtitle}>{value}</Text></View><Ionicons name="chevron-forward" size={18} color="#91A39D" /></Pressable>; }

function AppHeaderPlaceholder() { return null; }
void AppHeaderPlaceholder;

function BottomNav({ active, onChange }: { active: Screen; onChange: (screen: Screen) => void }) { return <View style={styles.bottomNav}>{navItems.map(item => <Pressable key={item.id} onPress={() => onChange(item.id)} style={styles.navItem}><Ionicons name={active === item.id ? item.activeIcon : item.icon} size={21} color={active === item.id ? '#fff' : '#A9C4BC'} /><Text style={[styles.navLabel, active === item.id && styles.navLabelActive]}>{item.label}</Text></Pressable>)}</View>; }
function SectionHeading({ eyebrow, title, action, onAction }: { eyebrow: string; title: string; action?: string; onAction?: () => void }) { return <View style={styles.sectionHeading}><View><Text style={styles.smallEyebrow}>{eyebrow}</Text><Text style={styles.sectionTitle}>{title}</Text></View>{action && <Pressable onPress={onAction}><Text style={styles.textAction}>{action}</Text></Pressable>}</View>; }
function PageTitle({ eyebrow, title, copy, action, onAction }: { eyebrow: string; title: string; copy: string; action?: boolean; onAction?: () => void }) { return <View style={styles.pageTitleRow}><View style={styles.pageTitleCopy}><Text style={styles.smallEyebrow}>{eyebrow}</Text><Text style={styles.pageTitle}>{title}</Text><Text style={styles.mutedCopy}>{copy}</Text></View>{action && <Pressable onPress={onAction} style={styles.addButton}><Ionicons name="add" size={24} color="#fff" /></Pressable>}</View>; }
function MedicineRow({ medicine }: { medicine: Medicine }) { return <View style={styles.listRow}><View style={[styles.medIcon, medicine.taken && styles.medIconDone]}><Ionicons name={medicine.taken ? 'checkmark' : 'medical-outline'} size={21} color={medicine.taken ? '#fff' : COLORS.brand} /></View><View style={styles.listCopy}><Text style={styles.listTitle}>{medicine.name}  <Text style={styles.listDose}>{medicine.dose}</Text></Text><Text style={styles.listSubtitle}>{medicine.note}</Text></View><View style={styles.rowMeta}><Text style={styles.rowTime}>{medicine.time}</Text><Text style={styles.rowStatus}>{medicine.taken ? 'Nainom' : 'Naka-iskedyul'}</Text></View></View>; }

const styles = StyleSheet.create({
  webStage:{flex:1,alignItems:'center',justifyContent:'center',overflow:'hidden',backgroundColor:'#EAF7F3'},
  webDevice:{width:390,height:844,borderRadius:38,overflow:'hidden',backgroundColor:COLORS.bg,shadowColor:'#163A31',shadowOpacity:.16,shadowRadius:30,shadowOffset:{width:0,height:14},elevation:12},
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
  safeArea:{flex:1,backgroundColor:COLORS.bg},appShell:{flex:1},screenArea:{flex:1},loginSafe:{flex:1,backgroundColor:COLORS.mintSoft,overflow:'hidden'},loginKeyboard:{flex:1},loginScroll:{flexGrow:1,width:'100%',maxWidth:'100%',padding:22,paddingTop:18,paddingBottom:40},brandRow:{flexDirection:'row',alignItems:'center',gap:10},logo:{width:42,height:42,borderRadius:14,alignItems:'center',justifyContent:'center',backgroundColor:COLORS.brand},logoGlyph:{fontSize:25,color:'#fff',fontWeight:'700'},brand:{fontSize:23,fontWeight:'800',color:COLORS.ink,letterSpacing:-1},loginHero:{width:'100%',paddingVertical:34},eyebrow:{fontSize:11,fontWeight:'800',color:COLORS.brand,letterSpacing:2},loginTitle:{fontSize:34,lineHeight:39,fontWeight:'800',letterSpacing:-1.5,color:COLORS.ink,marginTop:12},loginIntro:{fontSize:15,lineHeight:23,color:COLORS.muted,marginTop:14},loginCard:{width:'100%',backgroundColor:'#fff',borderRadius:26,padding:22,shadowColor:'#17342D',shadowOpacity:.08,shadowRadius:24,shadowOffset:{width:0,height:10},elevation:4},cardEyebrow:{fontSize:10,fontWeight:'800',color:COLORS.brand,letterSpacing:1.6},formTitle:{fontSize:27,fontWeight:'800',color:COLORS.ink,marginTop:7},formSubtitle:{fontSize:14,color:COLORS.muted,marginTop:5},roleTabs:{width:'100%',flexDirection:'row',backgroundColor:'#EEF4F1',padding:4,borderRadius:14,marginTop:22,marginBottom:5},roleTab:{flex:1,minWidth:0,minHeight:42,alignItems:'center',justifyContent:'center',borderRadius:11},roleTabActive:{backgroundColor:'#fff',shadowColor:'#17342D',shadowOpacity:.08,shadowRadius:7,shadowOffset:{width:0,height:3}},roleText:{fontSize:11,fontWeight:'700',color:COLORS.muted},roleTextActive:{color:COLORS.brand},label:{fontSize:12,fontWeight:'700',color:COLORS.ink,marginBottom:8,marginTop:17},input:{width:'100%',height:52,borderWidth:1,borderColor:COLORS.line,borderRadius:14,paddingHorizontal:15,fontSize:14,color:COLORS.ink,backgroundColor:'#fff'},passwordWrap:{width:'100%',height:52,borderWidth:1,borderColor:COLORS.line,borderRadius:14,paddingLeft:15,paddingRight:13,flexDirection:'row',alignItems:'center'},passwordInput:{flex:1,minWidth:0,height:50,color:COLORS.ink},showPassword:{fontSize:11,fontWeight:'800',color:COLORS.brand},primaryButton:{minHeight:52,borderRadius:14,alignItems:'center',justifyContent:'center',backgroundColor:COLORS.brand,marginTop:22,paddingHorizontal:18},primaryButtonText:{fontSize:14,fontWeight:'800',color:'#fff'},secondaryButton:{minHeight:50,borderRadius:14,alignItems:'center',justifyContent:'center',borderWidth:1,borderColor:COLORS.line,backgroundColor:'#fff',marginTop:10},secondaryButtonText:{fontSize:14,fontWeight:'700',color:COLORS.ink},pressed:{opacity:.75,transform:[{scale:.99}]},disabled:{opacity:.55},header:{paddingHorizontal:20,paddingTop:14,paddingBottom:14,flexDirection:'row',alignItems:'center',justifyContent:'space-between',backgroundColor:COLORS.bg},headerDate:{fontSize:9,fontWeight:'800',letterSpacing:1.2,color:COLORS.brand},headerTitle:{fontSize:24,fontWeight:'800',letterSpacing:-.8,color:COLORS.ink,marginTop:4},avatar:{width:43,height:43,borderRadius:14,alignItems:'center',justifyContent:'center',backgroundColor:COLORS.mint},avatarText:{fontSize:16,fontWeight:'800',color:COLORS.brandDark},page:{paddingHorizontal:18,paddingTop:7,paddingBottom:120},heroCard:{minHeight:230,borderRadius:26,padding:25,backgroundColor:COLORS.brand,overflow:'hidden'},heroEyebrow:{fontSize:10,fontWeight:'800',letterSpacing:1.4,color:'#BDEADD'},heroTitle:{maxWidth:310,fontSize:29,lineHeight:34,fontWeight:'800',letterSpacing:-1,color:'#fff',marginTop:12},heroSubtitle:{fontSize:13,color:'#D2EEE7',marginTop:8},heroButton:{alignSelf:'flex-start',minHeight:45,justifyContent:'center',paddingHorizontal:18,borderRadius:13,backgroundColor:'#fff',marginTop:24},heroButtonText:{fontSize:13,fontWeight:'800',color:COLORS.brand},adherenceCard:{minHeight:126,borderRadius:21,padding:20,backgroundColor:'#fff',borderWidth:1,borderColor:COLORS.line,marginTop:13,flexDirection:'row',alignItems:'center',justifyContent:'space-between'},smallEyebrow:{fontSize:9,fontWeight:'800',letterSpacing:1.3,color:COLORS.brand,marginBottom:6},sectionTitle:{fontSize:19,fontWeight:'800',letterSpacing:-.4,color:COLORS.ink},mutedCopy:{fontSize:12,lineHeight:18,color:COLORS.muted,marginTop:5},scoreCircle:{width:72,height:72,borderRadius:36,borderWidth:8,borderColor:COLORS.brand,alignItems:'center',justifyContent:'center'},score:{fontSize:16,fontWeight:'800',color:COLORS.ink},sectionHeading:{flexDirection:'row',justifyContent:'space-between',alignItems:'flex-end',marginTop:28,marginBottom:12,paddingHorizontal:2},textAction:{fontSize:12,fontWeight:'800',color:COLORS.brand},listRow:{minHeight:76,borderRadius:18,padding:14,backgroundColor:'#fff',borderWidth:1,borderColor:COLORS.line,flexDirection:'row',alignItems:'center',gap:12,marginBottom:10},medIcon:{width:45,height:45,borderRadius:14,backgroundColor:COLORS.mint,alignItems:'center',justifyContent:'center'},medIconDone:{backgroundColor:COLORS.brand},medIconText:{fontSize:20,fontWeight:'700',color:COLORS.brand},medIconTextDone:{color:'#fff'},listCopy:{flex:1},listTitle:{fontSize:14,fontWeight:'800',color:COLORS.ink},listDose:{fontSize:11,fontWeight:'600',color:COLORS.muted},listSubtitle:{fontSize:11,color:COLORS.muted,marginTop:4},rowMeta:{alignItems:'flex-end'},rowTime:{fontSize:11,fontWeight:'800',color:COLORS.ink},rowStatus:{fontSize:9,fontWeight:'700',color:COLORS.brand,marginTop:5},quickGrid:{gap:9},quickCard:{minHeight:72,borderRadius:18,padding:13,backgroundColor:'#fff',borderWidth:1,borderColor:COLORS.line,flexDirection:'row',alignItems:'center',gap:12},quickIcon:{width:43,height:43,borderRadius:13,alignItems:'center',justifyContent:'center',backgroundColor:COLORS.mint},quickIconText:{fontSize:21,color:COLORS.brand},quickLabel:{flex:1,fontSize:13,fontWeight:'800',color:COLORS.ink},quickArrow:{fontSize:25,color:'#91A39D'},bottomNav:{position:'absolute',left:12,right:12,bottom:Platform.OS==='ios'?8:12,minHeight:69,borderRadius:22,backgroundColor:'#123B33',flexDirection:'row',alignItems:'center',justifyContent:'space-around',paddingHorizontal:5,paddingVertical:7,shadowColor:'#123B33',shadowOpacity:.25,shadowRadius:18,shadowOffset:{width:0,height:9},elevation:10},navItem:{flex:1,alignItems:'center',justifyContent:'center',gap:3},navIcon:{fontSize:21,color:'#A9C4BC'},navIconActive:{color:'#fff'},navLabel:{fontSize:8,fontWeight:'700',color:'#91AEA5'},navLabelActive:{color:'#fff'},pageTitleRow:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',marginBottom:22,paddingHorizontal:2},pageTitleCopy:{flex:1,paddingRight:12},pageTitle:{fontSize:29,fontWeight:'800',letterSpacing:-1,color:COLORS.ink},addButton:{width:45,height:45,borderRadius:14,alignItems:'center',justifyContent:'center',backgroundColor:COLORS.brand},addButtonText:{fontSize:24,color:'#fff'},remove:{fontSize:24,color:'#9AAC A6'.replace(' ',''),padding:7},modalBackdrop:{flex:1,justifyContent:'flex-end',backgroundColor:'rgba(15,38,32,.5)'},modalSheet:{backgroundColor:'#fff',borderTopLeftRadius:28,borderTopRightRadius:28,padding:23,paddingBottom:Platform.OS==='ios'?38:24},modalHandle:{width:42,height:5,borderRadius:3,backgroundColor:'#DCE5E2',alignSelf:'center',marginBottom:21},modalTitle:{fontSize:24,fontWeight:'800',color:COLORS.ink},modalCancel:{alignItems:'center',padding:16},modalCancelText:{fontSize:13,fontWeight:'700',color:COLORS.muted},scanPage:{alignItems:'stretch'},scannerFrame:{height:310,borderRadius:25,backgroundColor:'#fff',alignItems:'center',justifyContent:'center',overflow:'hidden',marginTop:4},scannedImage:{width:'100%',height:'100%',resizeMode:'cover'},scanGlyph:{fontSize:55,color:COLORS.brand},scanHint:{fontSize:13,fontWeight:'700',color:COLORS.muted,marginTop:12},corner:{position:'absolute',width:48,height:48,borderColor:COLORS.brand},cornerTL:{top:18,left:18,borderTopWidth:3,borderLeftWidth:3},cornerTR:{top:18,right:18,borderTopWidth:3,borderRightWidth:3},cornerBL:{bottom:18,left:18,borderBottomWidth:3,borderLeftWidth:3},cornerBR:{bottom:18,right:18,borderBottomWidth:3,borderRightWidth:3},scanCopy:{fontSize:13,lineHeight:20,color:COLORS.muted,textAlign:'center',marginHorizontal:30,marginTop:20},timeBadge:{minWidth:72,height:42,borderRadius:12,alignItems:'center',justifyContent:'center',backgroundColor:COLORS.mintSoft},timeText:{fontSize:11,fontWeight:'800',color:COLORS.brand},supportCard:{borderRadius:23,padding:24,backgroundColor:'#fff',borderWidth:1,borderColor:COLORS.line,marginBottom:13},supportIcon:{width:52,height:52,borderRadius:16,alignItems:'center',justifyContent:'center',backgroundColor:COLORS.mint,marginBottom:18},supportIconText:{fontSize:27,color:COLORS.brand},supportTitle:{fontSize:20,fontWeight:'800',color:COLORS.ink},supportCopy:{fontSize:13,lineHeight:21,color:COLORS.muted,marginTop:8},emergencyCard:{backgroundColor:COLORS.cream},
  scanError:{flexDirection:'row',alignItems:'flex-start',gap:9,padding:13,borderRadius:14,backgroundColor:'#FFF0F0',marginTop:12},scanErrorText:{flex:1,fontSize:10,lineHeight:16,color:'#9D3D3D'},
  scanResult:{padding:18,borderRadius:21,borderWidth:1,borderColor:COLORS.line,backgroundColor:'#fff',marginTop:14},scanResultTop:{flexDirection:'row',alignItems:'center',gap:12},scanResultIcon:{width:48,height:48,borderRadius:15,alignItems:'center',justifyContent:'center',backgroundColor:COLORS.mint},scanResultName:{fontSize:20,fontWeight:'800',color:COLORS.ink},visibleText:{fontSize:10,lineHeight:16,color:COLORS.muted,backgroundColor:COLORS.mintSoft,padding:10,borderRadius:11,marginTop:14},scanResultGuidance:{fontSize:11,lineHeight:18,color:COLORS.ink,marginTop:12},resultButton:{minHeight:46,borderRadius:13,alignItems:'center',justifyContent:'center',backgroundColor:COLORS.brand,marginTop:15},scanSafety:{fontSize:9,lineHeight:14,color:COLORS.muted,textAlign:'center',marginTop:10},
  profileCard:{alignItems:'center',padding:22,borderRadius:22,backgroundColor:COLORS.brand},profileAvatar:{width:68,height:68,borderRadius:22,alignItems:'center',justifyContent:'center',backgroundColor:'rgba(255,255,255,.18)',borderWidth:2,borderColor:'rgba(255,255,255,.45)'},profileInitial:{fontSize:27,fontWeight:'800',color:'#fff'},profileName:{fontSize:20,fontWeight:'800',color:'#fff',marginTop:11},profileRole:{fontSize:10,color:'rgba(255,255,255,.82)',marginTop:2},settingsHeading:{fontSize:9,fontWeight:'800',letterSpacing:1.4,color:COLORS.brand,marginTop:22,marginBottom:8,paddingHorizontal:2},settingsCard:{padding:15,borderRadius:20,borderWidth:1,borderColor:COLORS.line,backgroundColor:'#fff'},settingsRow:{minHeight:62,flexDirection:'row',alignItems:'center',gap:11,borderBottomWidth:1,borderBottomColor:'#E8F3F0'},settingsIcon:{width:39,height:39,borderRadius:12,alignItems:'center',justifyContent:'center',backgroundColor:COLORS.mintSoft},logoutButton:{minHeight:50,borderRadius:14,flexDirection:'row',alignItems:'center',justifyContent:'center',gap:8,borderWidth:1,borderColor:'#F1CACA',backgroundColor:'#FFF7F7',marginTop:15},logoutText:{fontSize:12,fontWeight:'700',color:COLORS.danger},
});
