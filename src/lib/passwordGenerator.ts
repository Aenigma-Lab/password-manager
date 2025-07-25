import { PasswordGeneratorOptions } from './types';

const UPPERCASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const LOWERCASE = 'abcdefghijklmnopqrstuvwxyz';
const NUMBERS = '0123456789';
const SYMBOLS = '!@#$%^&*()_+-=[]{}|;:,.<>?';

export function generatePassword(options: PasswordGeneratorOptions): string {
  let charset = '';
  
  if (options.includeUppercase) charset += UPPERCASE;
  if (options.includeLowercase) charset += LOWERCASE;
  if (options.includeNumbers) charset += NUMBERS;
  if (options.includeSymbols) charset += SYMBOLS;
  
  if (charset === '') {
    throw new Error('At least one character type must be selected');
  }
  
  let password = '';
  const array = new Uint8Array(options.length);
  crypto.getRandomValues(array);
  
  for (let i = 0; i < options.length; i++) {
    password += charset[array[i] % charset.length];
  }
  
  return password;
}

export function getPasswordStrength(password: string): {
  score: number;
  label: string;
  color: string;
  feedback: string[];
} {
  let score = 0;
  const feedback: string[] = [];
  
  // Length check
  if (password.length >= 8) score += 1;
  else feedback.push('Use at least 8 characters');
  
  if (password.length >= 12) score += 1;
  else if (password.length >= 8) feedback.push('Consider using 12+ characters for better security');
  
  // Character variety checks
  if (/[a-z]/.test(password)) score += 1;
  else feedback.push('Include lowercase letters');
  
  if (/[A-Z]/.test(password)) score += 1;
  else feedback.push('Include uppercase letters');
  
  if (/[0-9]/.test(password)) score += 1;
  else feedback.push('Include numbers');
  
  if (/[^a-zA-Z0-9]/.test(password)) score += 1;
  else feedback.push('Include special characters');
  
  // Common patterns check
  if (!/(.)\1{2,}/.test(password)) score += 1;
  else feedback.push('Avoid repeating characters');
  
  if (!/123|abc|qwe|password|admin/i.test(password)) score += 1;
  else feedback.push('Avoid common patterns');
  
  let label: string;
  let color: string;
  
  if (score <= 2) {
    label = 'Very Weak';
    color = 'text-red-600';
  } else if (score <= 4) {
    label = 'Weak';
    color = 'text-orange-600';
  } else if (score <= 6) {
    label = 'Fair';
    color = 'text-yellow-600';
  } else if (score <= 7) {
    label = 'Good';
    color = 'text-blue-600';
  } else {
    label = 'Strong';
    color = 'text-green-600';
  }
  
  return { score, label, color, feedback };
}

export function generateSecurePassword(): string {
  return generatePassword({
    length: 16,
    includeUppercase: true,
    includeLowercase: true,
    includeNumbers: true,
    includeSymbols: true
  });
}

export function generatePinCode(length: number = 6): string {
  return generatePassword({
    length,
    includeUppercase: false,
    includeLowercase: false,
    includeNumbers: true,
    includeSymbols: false
  });
}

export function generatePassphrase(wordCount: number = 4): string {
  const words = [
    'apple', 'brave', 'chair', 'dance', 'eagle', 'flame', 'grace', 'house',
    'image', 'juice', 'knife', 'light', 'music', 'night', 'ocean', 'peace',
    'quiet', 'river', 'stone', 'table', 'unity', 'voice', 'water', 'youth',
    'zebra', 'angel', 'beach', 'cloud', 'dream', 'earth', 'field', 'green',
    'happy', 'island', 'jewel', 'magic', 'noble', 'power', 'royal', 'smile',
    'trust', 'value', 'world', 'young', 'bright', 'clear', 'fresh', 'grand'
  ];
  
  const selectedWords: string[] = [];
  const usedIndices = new Set<number>();
  
  while (selectedWords.length < wordCount) {
    const randomIndex = Math.floor(Math.random() * words.length);
    if (!usedIndices.has(randomIndex)) {
      usedIndices.add(randomIndex);
      selectedWords.push(words[randomIndex]);
    }
  }
  
  return selectedWords.map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join('-');
}
