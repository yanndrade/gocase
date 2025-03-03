import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Login() {
  const [isRegistering, setIsRegistering] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userType, setUserType] = useState("collaborator");
  const navigate = useNavigate();
  const { login } = useAuth();

  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      console.log("Usuário logado", user);
      user.is_leader
        ? navigate("/dashboard-leader")
        : navigate("/dashboard-collaborator");
    }
  }, [user, navigate]);

  const handleLogin = async () => {
    try {
      const formData = new URLSearchParams();
      formData.append("username", email);
      formData.append("password", password);

      const response = await axios.post(
        "http://localhost:8000/auth/token",
        formData,
        {
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
        }
      );

      const token = response.data.access_token;

      const userResponse = await axios.get("http://localhost:8000/users/me", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const userData = userResponse.data;
      login(token, userData);
    } catch (error) {
      console.error(
        "Erro ao fazer login",
        error.response?.data || error.message
      );
    }
  };

  const handleRegister = async () => {
    try {
      const payload = { name, email, password };
      const endpoint = userType === "leader" ? "leaders" : "users";
      await axios.post(`http://localhost:8000/${endpoint}/`, payload);

      alert("Conta criada com sucesso! Faça login.");
      setIsRegistering(false);
    } catch (error) {
      console.error(
        "Erro ao criar conta",
        error.response?.data || error.message
      );
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-screen bg-[#EFEF98] p-6">
      <div className="flex items-center justify-center mb-8">
        <img src={"src/assets/gocase.png"} alt="GoCase Logo" className="mb-6" />
        <img src={"src/assets/robo.png"} alt="IA.go" width={200} />
      </div>
      <div className="p-8 rounded-lg shadow-lg w-96 text-center border-2 border-[#0047AB] bg-[#0060B1]">
        <h1 className="text-3xl font-bold mb-4 text-[#EFEF98]">
          {isRegistering ? "Criar Conta" : "Login"}
        </h1>

        {isRegistering && (
          <>
            <input
              type="text"
              placeholder="Nome"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-gray-300 p-2 mb-2 rounded-md focus:ring-2 focus:ring-[#FF4EB8] bg-white text-black"
            />
            <select
              value={userType}
              onChange={(e) => setUserType(e.target.value)}
              className="w-full border border-gray-300 p-2 mb-2 rounded-md focus:ring-2 focus:ring-[#FF4EB8] bg-white text-black"
            >
              <option className="text-black" value="collaborator">
                Colaborador
              </option>
              <option className="text-black" value="leader">
                Líder
              </option>
            </select>
          </>
        )}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border border-gray-300 p-2 mb-2 rounded-md focus:ring-2 focus:ring-[#FF4EB8] bg-white text-black"
        />
        <input
          type="password"
          placeholder="Senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border border-gray-300 p-2 mb-4 rounded-md focus:ring-2 focus:ring-[#FF4EB8] bg-white text-black"
        />

        {isRegistering ? (
          <button
            onClick={handleRegister}
            className="bg-[#EF3EAA] text-white px-4 py-2 w-full rounded-md font-bold  transition-colors"
          >
            Criar Conta
          </button>
        ) : (
          <button
            onClick={handleLogin}
            className="bg-[#EF3EAA] text-white px-4 py-2 w-full rounded-md font-bold  transition-colors"
          >
            Entrar
          </button>
        )}

        <button
          onClick={() => setIsRegistering(!isRegistering)}
          className="mt-4 text-sm text-[#FF4EB8] hover:underline bg-[#6DD7DB] text-white"
        >
          {isRegistering
            ? "Já tem uma conta? Faça login"
            : "Não tem uma conta? Cadastre-se"}
        </button>
      </div>
    </div>
  );
}

export default Login;
