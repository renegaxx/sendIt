import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
  Platform,
  Image,
  ScrollView,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useFonts } from 'expo-font';
import { auth, firestore } from './firebaseConfig';
import {
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
} from 'firebase/auth';
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
  deleteDoc,
} from 'firebase/firestore';
import Feather from '@expo/vector-icons/Feather';
import Entypo from '@expo/vector-icons/Entypo';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';

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
      const mensagensBuscadas = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMensagens(mensagensBuscadas);
    } catch (error) {
      console.error('Erro ao buscar mensagens: ', error);
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
      Alert.alert('Erro', error.message);
    }
  };

  const sair = async () => {
    try {
      await signOut(auth);
      setUsuario(null);
      setMensagens([]);
    } catch (error) {
      Alert.alert('Erro', error.message);
    }
  };

  const enviarMensagem = async () => {
    try {
      if (entrada.trim() !== '') {
        await addDoc(collection(firestore, 'messages'), {
          text: entrada,
          createdAt: serverTimestamp(),
          uid: usuario.uid,
          viewed: false, // Nova propriedade para indicar se a mensagem foi visualizada
        });
        Alert.alert('Mensagem enviada');
        setEntrada('');
        buscarMensagens(usuario.uid);
      } else {
        Alert.alert('Erro', 'Digite uma mensagem antes de enviar');
      }
    } catch (error) {
      console.error('Erro ao adicionar mensagem: ', error);
      Alert.alert('Erro', 'Não foi possível enviar a mensagem');
    }
  };

  const marcarComoVisualizada = async (id) => {
    try {
      const mensagemRef = doc(firestore, 'messages', id);
      await updateDoc(mensagemRef, {
        viewed: true,
      });
      buscarMensagens(usuario.uid);
    } catch (error) {
      console.error('Erro ao marcar mensagem como visualizada: ', error);
      Alert.alert('Erro', 'Não foi possível marcar a mensagem como visualizada');
    }
  };

  const excluirMensagem = async (id) => {
    try {
      const mensagemRef = doc(firestore, 'messages', id);
      await deleteDoc(mensagemRef);
      buscarMensagens(usuario.uid);
    } catch (error) {
      console.error('Erro ao excluir mensagem: ', error);
      Alert.alert('Erro', 'Não foi possível excluir a mensagem');
    }
  };

  return (
    <View style={styles.container}>

      <Text style={styles.texto1}>
        <Feather name="send" size={24} color="black" />
        Send<Text style={styles.texto2}>It</Text>
      </Text>
      <Image source={require('./assets/MESSAGE.png')} style={styles.backgroundImage} />
      <StatusBar style="auto" />
      {usuario ? (
        <>

          <TextInput
            style={styles.inputAdicone}
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
                  <View style={styles.botoes}>
                    <View style={styles.acaoMensagem}>
                      <TouchableOpacity
                        onPress={() => marcarComoVisualizada(msg.id)}
                      >
                        <MaterialIcons
                          name="visibility"
                          size={24}
                          color={msg.viewed ? 'green' : 'gray'}
                        />
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => excluirMensagem(msg.id)}>
                        <MaterialIcons name="delete" size={24} color="red" />
                      </TouchableOpacity>
                      </View>
                  </View>
                </View>
              ))}
            </ScrollView>
          )}
        </>
      ) : (
        <>
          <View style={styles.boxInput}>
            <Entypo name="mail" size={24} color="#2D59B0" />
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
            /></View>
          <View style={styles.boxInput}>
            <FontAwesome6 name="eye" size={22} color="#2D59B0" />
            <TextInput
              style={styles.input}
              placeholder="Senha"
              value={senha}
              onChangeText={setSenha}
              secureTextEntry
            /></View>
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
    alignItems: 'center',
    textAlign: 'center'
  },
  botoes : {
    marginTop : 30
  },
  inputAdicone: {
    textAlign: 'center',
    height: 40,
    width: 180,
    borderColor: 'black'
  },
  texto2: {
    fontFamily: 'Poppins-SemiBold',
    color: '#2D59B0',
  },
  boxInput: {
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: 14,
    paddingTop: 5,
    paddingBottom: 5,
    paddingLeft: 15,
    width: '80%',
    alignItems: 'center',
    marginBottom: 15,
    height: 40,
  },
  input: {
    paddingLeft: 10,
    width: '80%',
    borderRadius: 14,
    fontFamily: 'Poppins-Regular',
  },
  ENSAIR: {
    flexDirection: 'row',
  },
  botao: {
    flexDirection: 'row',
    backgroundColor: '#2D59B0',
    width: 100,
    height: 40,
    paddingLeft: 10,
    borderRadius: 13,
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
    fontFamily: 'Poppins-Regular',
  },
  scrollView: {
    width: '100%',
    paddingHorizontal: 20,
    marginTop: 20,
  },
  mensagem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    fontFamily: 'Poppins-Regular',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  acaoMensagem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 60,
  },
});
