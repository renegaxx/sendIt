import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View, Alert, Platform, Image, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useFonts } from 'expo-font';
import { auth, firestore } from './firebaseConfig';
import { signInWithEmailAndPassword, onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, addDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';

export default function App() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [usuario, setUsuario] = useState(null);
  const [entrada, setEntrada] = useState('');
  const [mensagens, setMensagens] = useState([]);
  const [carregando, setCarregando] = useState(false);

  const [fontsLoaded] = useFonts({
    'Poppins-Regular': require('./assets/fonts/Poppins-Regular.ttf'),
    'Poppins-SemiBold': require('./assets/fonts/Poppins-SemiBold.ttf'),
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUsuario(user);
      if (user) {
        buscarMensagens(user.uid);
      } else {
        setMensagens([]);
      }
    });

    return () => unsubscribe();
  }, []);

  const buscarMensagens = async (uid) => {
    setCarregando(true);
    try {
      const q = query(collection(firestore, 'messages'), where('uid', '==', uid));
      const querySnapshot = await getDocs(q);
      const mensagensBuscadas = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMensagens(mensagensBuscadas);
    } catch (error) {
      console.error("Erro ao buscar mensagens: ", error);
    } finally {
      setCarregando(false);
    }
  };

  const entrar = async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, senha);
      setUsuario(userCredential.user);
      setEmail('');
      setSenha('');
      buscarMensagens(userCredential.user.uid);
    } catch (error) {
      Alert.alert("Erro", error.message);
    }
  };

  const sair = async () => {
    try {
      await signOut(auth);
      setUsuario(null);
      setMensagens([]);
    } catch (error) {
      Alert.alert("Erro", error.message);
    }
  };

  const enviarMensagem = async () => {
    try {
      if (entrada.trim() !== '') {
        await addDoc(collection(firestore, 'messages'), {
          text: entrada,
          createdAt: serverTimestamp(),
          uid: usuario.uid
        });
        Alert.alert("Mensagem enviada");
        setEntrada('');
        buscarMensagens(usuario.uid);
      } else {
        Alert.alert("Erro", "Digite uma mensagem antes de enviar");
      }
    } catch (error) {
      console.error("Erro ao adicionar mensagem: ", error);
      Alert.alert("Erro", "Não foi possível enviar a mensagem");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.texto1}>Send<Text style={styles.texto2}>It</Text></Text>
      <Image source={require('./assets/MESSAGE.png')} style={styles.backgroundImage} />
      <StatusBar style="auto" />
      {usuario ? (
        <>
          
          <TextInput
            style={styles.input}
            placeholder="Digite uma mensagem"
            value={entrada}
            onChangeText={setEntrada}
          />
<View style={styles.ENSAIR}>
          <TouchableOpacity style={styles.botao} onPress={enviarMensagem}>
            <MaterialIcons name="send" size={24} color="white" />
            <Text style={styles.botaoTexto}>Enviar</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.botaoSair} onPress={sair}>
            <MaterialIcons name="logout" size={24} color="white" />
            <Text style={styles.botaoTexto}>Sair</Text>
          </TouchableOpacity>
</View>
          {carregando ? (
            <Text>Carregando...</Text>
          ) : (
            <ScrollView style={styles.scrollView}>
              {mensagens.map((msg) => (
                <View key={msg.id} style={styles.mensagem}>
                  <Text>{msg.text}</Text>
                </View>
              ))}
            </ScrollView>
          )}
        </>
      ) : (
        <>
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
          />
          <TextInput
            style={styles.input}
            placeholder="Senha"
            value={senha}
            onChangeText={setSenha}
            secureTextEntry
          />
          <TouchableOpacity style={styles.botao} onPress={entrar}>
            <MaterialIcons name="login" size={24} color="white" />
            <Text style={styles.botaoTexto}>Entrar</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  texto1: {
    fontFamily: 'Poppins-Regular',
  },
  texto2: {
    fontFamily: 'Poppins-SemiBold',
    color: '#2D59B0',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 2,
    marginBottom: 10,
    paddingHorizontal: 10,
    width: '80%',
    borderRadius: 14,
  },
  ENSAIR : {
    flexDirection: 'row'
  },
  botao: {
    flexDirection: 'row',
    backgroundColor: '#007BFF',
    width: 90,
    height: 40,
    paddingLeft: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginVertical: 5,
  },
  botaoSair: {
    flexDirection: 'row',
    backgroundColor: '#FF5733',
    padding: 10,
    height: 40,
    width: 90,
    borderRadius: 5,
    alignItems: 'center',
    marginVertical: 5,
  },
  botaoTexto: {
    color: 'white',
    marginLeft: 5,
  },
  scrollView: {
    width: '100%',
    paddingHorizontal: 20,
    marginTop: 20,
  },
  mensagem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    fontFamily: 'Poppins-Regular',
  },
});
