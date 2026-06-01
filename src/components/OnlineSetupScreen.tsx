import { useEffect, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSocket } from '../context/SocketContext';
import { useTheme } from '../context/ThemeContext';
import { Button } from './ui/Button';

interface Props {
  onBack: () => void;
}

export function OnlineSetupScreen({ onBack }: Props) {
  const { colors } = useTheme();
  const {
    isConnected,
    serverUrl,
    connectToServer,
    disconnectFromServer,
    createRoom,
    joinRoom,
    connectionError,
    clearConnectionError,
  } = useSocket();
  const [playerName, setPlayerName] = useState('');
  const [serverInput, setServerInput] = useState(serverUrl);
  const [roomInput, setRoomInput] = useState('');
  const [mode, setMode] = useState<'connect' | 'choose' | 'create' | 'join'>(
    isConnected ? 'choose' : 'connect',
  );
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  useEffect(() => {
    if (isConnected && mode === 'connect') {
      setMode('choose');
    }
  }, [isConnected, mode]);

  async function handleTestConnection() {
    const url = serverInput.trim();
    if (!url) return;
    setTesting(true);
    setTestResult(null);
    try {
      const response = await fetch(url.replace(/\/$/, '') + '/socket.io/?EIO=4&transport=polling', {
        method: 'GET',
        headers: { 'Cache-Control': 'no-cache' },
      });
      if (response.ok) {
        const text = await response.text();
        if (text.includes('sid')) {
          setTestResult('Servidor alcanzable! Puedes conectar.');
        } else {
          setTestResult('Servidor respondio pero con formato inesperado.');
        }
      } else {
        setTestResult(`Error HTTP: ${response.status} ${response.statusText}`);
      }
    } catch (e: any) {
      setTestResult(`Error de conexion: ${e?.message ?? 'desconocido'}`);
    } finally {
      setTesting(false);
    }
  }

  function handleConnect() {
    const url = serverInput.trim();
    if (!url) return;
    connectToServer(url);
  }

  function handleDisconnect() {
    disconnectFromServer();
    setMode('connect');
  }

  function handleCreateRoom() {
    const name = playerName.trim();
    if (!name) return;
    createRoom(name);
  }

  function handleJoinRoom() {
    const name = playerName.trim();
    const code = roomInput.trim().toUpperCase();
    if (!name || !code) return;
    joinRoom(code, name);
  }

  function switchToCreate() {
    setMode('create');
    clearConnectionError();
  }

  function switchToJoin() {
    setMode('join');
    clearConnectionError();
  }

  function handleBack() {
    clearConnectionError();
    disconnectFromServer();
    onBack();
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'android' ? undefined : 'padding'}
    >
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={[styles.title, { color: colors.onSurface }]}>Jugar en linea</Text>

        {mode === 'connect' && (
          <View>
            <Text style={[styles.sectionLabel, { color: colors.onSurfaceVariant }]}>
              Direccion del servidor
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.surfaceContainer,
                  color: colors.onSurface,
                  borderColor: colors.outline,
                },
              ]}
              placeholder="ej: http://192.168.1.50:3000"
              placeholderTextColor={colors.onSurfaceVariant}
              value={serverInput}
              onChangeText={setServerInput}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="url"
            />
            <Button
              title="Probar conexion"
              onPress={handleTestConnection}
              variant="outline"
              disabled={!serverInput.trim() || testing}
            />
            {testing && <ActivityIndicator style={{ marginTop: 12 }} />}
            {testResult && (
              <Text
                style={[
                  styles.testResult,
                  {
                    color: testResult.startsWith('Servidor alcanzable')
                      ? '#4CAF50'
                      : '#F44336',
                  },
                ]}
              >
                {testResult}
              </Text>
            )}
            <View style={{ height: 12 }} />
            <Button
              title="Conectar"
              onPress={handleConnect}
              variant="primary"
              disabled={!serverInput.trim()}
            />
            <View style={{ height: 12 }} />
            <Button title="Volver" onPress={onBack} variant="outline" />
          </View>
        )}

        {mode !== 'connect' && (
          <View>
            <View style={[styles.statusRow, { backgroundColor: colors.surfaceContainer }]}>
              <View style={[styles.statusDot, { backgroundColor: isConnected ? '#4CAF50' : '#F44336' }]} />
              <Text style={[styles.statusText, { color: colors.onSurfaceVariant }]}>
                {isConnected ? 'Conectado' : 'Desconectado'}
              </Text>
              <Text style={[styles.serverLabel, { color: colors.onSurfaceVariant }]}>{serverUrl}</Text>
            </View>

            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.surfaceContainer,
                  color: colors.onSurface,
                  borderColor: colors.outline,
                },
              ]}
              placeholder="Tu nombre"
              placeholderTextColor={colors.onSurfaceVariant}
              value={playerName}
              onChangeText={setPlayerName}
              maxLength={20}
            />

            {mode === 'choose' && (
              <View style={styles.buttons}>
                <Button
                  title="Crear sala"
                  onPress={switchToCreate}
                  variant="primary"
                  disabled={!playerName.trim()}
                />
                <View style={{ height: 12 }} />
                <Button
                  title="Unirse a sala"
                  onPress={switchToJoin}
                  variant="secondary"
                  disabled={!playerName.trim()}
                />
                <View style={{ height: 24 }} />
                <Button title="Desconectar" onPress={handleDisconnect} variant="outline" />
                <View style={{ height: 8 }} />
                <Button title="Volver" onPress={handleBack} variant="outline" />
              </View>
            )}

            {mode === 'create' && (
              <View style={styles.buttons}>
                <Button
                  title="Crear sala"
                  onPress={handleCreateRoom}
                  variant="primary"
                  disabled={!playerName.trim() || !isConnected}
                />
                <View style={{ height: 12 }} />
                <Button title="Volver" onPress={() => setMode('choose')} variant="outline" />
              </View>
            )}

            {mode === 'join' && (
              <View>
                <TextInput
                  style={[
                    styles.input,
                    styles.codeInput,
                    {
                      backgroundColor: colors.surfaceContainer,
                      color: colors.onSurface,
                      borderColor: colors.outline,
                    },
                  ]}
                  placeholder="Codigo de sala"
                  placeholderTextColor={colors.onSurfaceVariant}
                  value={roomInput}
                  onChangeText={setRoomInput}
                  autoCapitalize="characters"
                  maxLength={6}
                />
                <View style={styles.buttons}>
                  <Button
                    title="Unirse"
                    onPress={handleJoinRoom}
                    variant="primary"
                    disabled={!playerName.trim() || !roomInput.trim() || !isConnected}
                  />
                  <View style={{ height: 12 }} />
                  <Button title="Volver" onPress={() => setMode('choose')} variant="outline" />
                </View>
              </View>
            )}
          </View>
        )}

        {connectionError && (
          <View style={[styles.errorBox, { backgroundColor: '#F4433618' }]}>
            <Text style={styles.errorText}>{connectionError}</Text>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    padding: 24,
    paddingTop: 48,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 24,
    gap: 8,
    flexWrap: 'wrap',
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  statusText: {
    fontSize: 14,
  },
  serverLabel: {
    fontSize: 12,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    opacity: 0.7,
  },
  testResult: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 12,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    marginBottom: 20,
  },
  codeInput: {
    fontSize: 22,
    textAlign: 'center',
    letterSpacing: 4,
  },
  buttons: {
    width: '100%',
  },
  errorBox: {
    padding: 12,
    borderRadius: 12,
    marginTop: 20,
  },
  errorText: {
    color: '#F44336',
    fontSize: 14,
    textAlign: 'center',
  },
});
