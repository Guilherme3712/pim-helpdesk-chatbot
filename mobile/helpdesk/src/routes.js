import { useContext } from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { AuthContext } from './context/AuthContext';
import Login from './pages/login';
import Cadastro from './pages/cadastro';
import Chatbot from './pages/chatbot';

const Stack = createNativeStackNavigator();

export default function Routes() {
  const { logged } = useContext(AuthContext);

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {logged ? (
        <>
          <Stack.Screen name="Chatbot" component={Chatbot} />
        </>
      ) : (
        <>
          <Stack.Screen name="Login" component={Login} />
          <Stack.Screen name="Cadastro" component={Cadastro} />
        </>
      )}
    </Stack.Navigator>
  );
}
