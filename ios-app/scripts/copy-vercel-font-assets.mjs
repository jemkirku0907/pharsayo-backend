import { createHash } from 'node:crypto';
import { copyFile, mkdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const appDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const fontAssets = [
  ['@expo-google-fonts/poppins/400Regular/Poppins_400Regular.ttf', '@expo-google-fonts/poppins/400Regular/Poppins_400Regular'],
  ['@expo-google-fonts/poppins/500Medium/Poppins_500Medium.ttf', '@expo-google-fonts/poppins/500Medium/Poppins_500Medium'],
  ['@expo-google-fonts/poppins/600SemiBold/Poppins_600SemiBold.ttf', '@expo-google-fonts/poppins/600SemiBold/Poppins_600SemiBold'],
  ['@expo-google-fonts/poppins/700Bold/Poppins_700Bold.ttf', '@expo-google-fonts/poppins/700Bold/Poppins_700Bold'],
  ['@expo-google-fonts/poppins/800ExtraBold/Poppins_800ExtraBold.ttf', '@expo-google-fonts/poppins/800ExtraBold/Poppins_800ExtraBold'],
  ['@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/Ionicons.ttf', '@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/Ionicons'],
];

for (const [sourcePath, outputStem] of fontAssets) {
  const source = path.join(appDir, 'node_modules', sourcePath);
  const contents = await readFile(source);
  const hash = createHash('md5').update(contents).digest('hex');
  const destination = path.join(appDir, 'dist', 'font-assets', `${outputStem}.${hash}.ttf`);
  await mkdir(path.dirname(destination), { recursive: true });
  await copyFile(source, destination);
}

console.log(`Copied ${fontAssets.length} Vercel-safe web font assets.`);
