'use client';

import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Checkbox } from '../ui/checkbox';
import { Slider } from '../ui/slider';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  generatePassword, 
  generatePassphrase, 
  generatePinCode, 
  getPasswordStrength
} from '../../lib/passwordGenerator';
import { PasswordGeneratorOptions } from '../../lib/types';

interface PasswordGeneratorProps {
  onPasswordGenerated?: (password: string) => void;
}

export default function PasswordGenerator({ onPasswordGenerated }: PasswordGeneratorProps) {
  const [generatedPassword, setGeneratedPassword] = useState('');
  const [copiedPassword, setCopiedPassword] = useState(false);
  
  // Password options
  const [options, setOptions] = useState<PasswordGeneratorOptions>({
    length: 16,
    includeUppercase: true,
    includeLowercase: true,
    includeNumbers: true,
    includeSymbols: true
  });

  // Passphrase options
  const [passphraseLength, setPassphraseLength] = useState(4);
  
  // PIN options
  const [pinLength, setPinLength] = useState(6);

  const handleGeneratePassword = () => {
    try {
      const password = generatePassword(options);
      setGeneratedPassword(password);
      setCopiedPassword(false);
      if (onPasswordGenerated) {
        onPasswordGenerated(password);
      }
    } catch (error) {
      console.error('Failed to generate password:', error);
    }
  };

  const handleGeneratePassphrase = () => {
    const passphrase = generatePassphrase(passphraseLength);
    setGeneratedPassword(passphrase);
    setCopiedPassword(false);
    if (onPasswordGenerated) {
      onPasswordGenerated(passphrase);
    }
  };

  const handleGeneratePin = () => {
    const pin = generatePinCode(pinLength);
    setGeneratedPassword(pin);
    setCopiedPassword(false);
    if (onPasswordGenerated) {
      onPasswordGenerated(pin);
    }
  };

  const copyToClipboard = async () => {
    if (generatedPassword) {
      try {
        await navigator.clipboard.writeText(generatedPassword);
        setCopiedPassword(true);
        setTimeout(() => setCopiedPassword(false), 2000);
      } catch (error) {
        console.error('Failed to copy to clipboard:', error);
      }
    }
  };

  const passwordStrength = generatedPassword ? getPasswordStrength(generatedPassword) : null;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Password Generator</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Generated Password Display */}
        {generatedPassword && (
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Input
                value={generatedPassword}
                readOnly
                className="font-mono text-sm"
              />
              <Button
                onClick={copyToClipboard}
                variant="outline"
                className="whitespace-nowrap"
              >
                {copiedPassword ? 'Copied!' : 'Copy'}
              </Button>
            </div>
            
            {passwordStrength && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Strength:</span>
                  <span className={passwordStrength.color}>{passwordStrength.label}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${
                      passwordStrength.score <= 2 ? 'bg-red-500' :
                      passwordStrength.score <= 4 ? 'bg-orange-500' :
                      passwordStrength.score <= 6 ? 'bg-yellow-500' :
                      passwordStrength.score <= 7 ? 'bg-blue-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${(passwordStrength.score / 8) * 100}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Generator Tabs */}
        <Tabs defaultValue="password" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="password">Password</TabsTrigger>
            <TabsTrigger value="passphrase">Passphrase</TabsTrigger>
            <TabsTrigger value="pin">PIN Code</TabsTrigger>
          </TabsList>

          {/* Password Tab */}
          <TabsContent value="password" className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Length: {options.length}</Label>
                <Slider
                  value={[options.length]}
                  onValueChange={(value) => setOptions({ ...options, length: value[0] })}
                  max={50}
                  min={4}
                  step={1}
                  className="w-full"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="uppercase"
                    checked={options.includeUppercase}
                    onCheckedChange={(checked) => 
                      setOptions({ ...options, includeUppercase: !!checked })
                    }
                  />
                  <Label htmlFor="uppercase" className="text-sm">
                    Uppercase (A-Z)
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="lowercase"
                    checked={options.includeLowercase}
                    onCheckedChange={(checked) => 
                      setOptions({ ...options, includeLowercase: !!checked })
                    }
                  />
                  <Label htmlFor="lowercase" className="text-sm">
                    Lowercase (a-z)
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="numbers"
                    checked={options.includeNumbers}
                    onCheckedChange={(checked) => 
                      setOptions({ ...options, includeNumbers: !!checked })
                    }
                  />
                  <Label htmlFor="numbers" className="text-sm">
                    Numbers (0-9)
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="symbols"
                    checked={options.includeSymbols}
                    onCheckedChange={(checked) => 
                      setOptions({ ...options, includeSymbols: !!checked })
                    }
                  />
                  <Label htmlFor="symbols" className="text-sm">
                    Symbols (!@#$...)
                  </Label>
                </div>
              </div>

              <Button
                onClick={handleGeneratePassword}
                className="w-full bg-gray-900 hover:bg-gray-800"
                disabled={!options.includeUppercase && !options.includeLowercase && !options.includeNumbers && !options.includeSymbols}
              >
                Generate Password
              </Button>
            </div>
          </TabsContent>

          {/* Passphrase Tab */}
          <TabsContent value="passphrase" className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Number of Words: {passphraseLength}</Label>
                <Slider
                  value={[passphraseLength]}
                  onValueChange={(value) => setPassphraseLength(value[0])}
                  max={8}
                  min={3}
                  step={1}
                  className="w-full"
                />
              </div>

              <div className="text-sm text-gray-600">
                <p>Generates memorable passphrases like: <em>Apple-Brave-Chair-Dance</em></p>
              </div>

              <Button
                onClick={handleGeneratePassphrase}
                className="w-full bg-gray-900 hover:bg-gray-800"
              >
                Generate Passphrase
              </Button>
            </div>
          </TabsContent>

          {/* PIN Tab */}
          <TabsContent value="pin" className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>PIN Length: {pinLength}</Label>
                <Slider
                  value={[pinLength]}
                  onValueChange={(value) => setPinLength(value[0])}
                  max={12}
                  min={4}
                  step={1}
                  className="w-full"
                />
              </div>

              <div className="text-sm text-gray-600">
                <p>Generates numeric PIN codes for devices and accounts.</p>
              </div>

              <Button
                onClick={handleGeneratePin}
                className="w-full bg-gray-900 hover:bg-gray-800"
              >
                Generate PIN
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
