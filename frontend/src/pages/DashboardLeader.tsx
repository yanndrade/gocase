import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import LogoutButton from "../components/LogoutButton";

const criteria = [
  "Atitude & Senso de urgência",
  "Adaptabilidade",
  "Simplicidade & Pulo do gato & Eficiência",
  "Curiosidade (Vontade de aprender)",
  "Sonho Grande & Senso de dono",
  "Capacidade para receber e dar feedbacks com humildade",
  "Melhoria contínua",
  "Execução & Autonomia",
  "Empenho nos OKRs & Inconformismo",
  "Qualidade das entregas & Não aceita o 'OK'",
];

function DashboardLeader() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [ratings, setRatings] = useState(Array(10).fill(3)); // Notas padrão como 3
  const [comments, setComments] = useState(Array(10).fill(""));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("http://localhost:8000/users", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsers(response.data.users);
      } catch (error) {
        console.error("Erro ao buscar usuários", error);
        navigate("/");
      }
    };

    fetchUsers();
  }, [navigate]);

  const handleRatingChange = (index, value) => {
    const newRatings = [...ratings];
    newRatings[index] = value;
    setRatings(newRatings);
  };

  const handleCommentChange = (index, value) => {
    const newComments = [...comments];
    newComments[index] = value;
    setComments(newComments);
  };

  const handleSubmit = async () => {
    if (selectedUser === null) {
      alert("Selecione um colaborador antes de enviar a avaliação.");
      return;
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      const feedbackData = {
        answers: criteria.map((_, index) => ({
          question_number: index + 1,
          answer: ratings[index],
          explanation: comments[index],
        })),
      };

      await axios.post(
        `http://localhost:8000/feedback/leader?user_to_evaluate_id=${selectedUser}`,
        feedbackData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      alert("Avaliação enviada com sucesso!");
    } catch (error) {
      console.error(
        "Erro ao enviar feedback",
        error.response?.data || error.message
      );
      alert("Erro ao enviar feedback.");
    }
    setIsSubmitting(false);
  };

  return (
    // Container principal com fundo "Light pink" e altura fixa para a tela inteira
    <div className="min-h-screen bg-[#EFEF98] flex flex-col">
      {/* Conteúdo com scrolling próprio */}
      <div className="bg-white p-4 md:p-6 rounded-md shadow-md max-w-4xl w-full mx-auto my-6 flex-grow">
        {/* Cabeçalho com título e botão de logout */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
          <h1 className="text-xl md:text-2xl font-bold text-[#0047AB]">
            Dashboard - Líder
          </h1>
          <LogoutButton />
        </div>

        <h2 className="text-lg md:text-xl font-semibold text-[#0047AB] mb-4">
          Avaliação de Colaboradores
        </h2>

        {/* Dropdown de seleção de colaborador */}
        <div className="mb-4">
          <label className="block font-medium text-black">
            Selecione um colaborador:
          </label>
          <select
            className="w-full p-2 border border-[#0047AB] rounded-md mt-2 bg-white text-black"
            onChange={(e) => setSelectedUser(Number(e.target.value))}
            value={selectedUser || ""}
          >
            <option value="" disabled>
              Escolha um colaborador...
            </option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name} - {user.email}
              </option>
            ))}
          </select>
        </div>

        {/* Formulário de avaliação com scroll próprio */}
        {selectedUser && (
          <>
            {/* Container de critérios com scroll */}
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pb-4 pr-2">
              {criteria.map((criterion, index) => (
                <div
                  key={index}
                  className={`border p-3 rounded-md transition-all ${
                    ratings[index] !== null
                      ? "border-[#0047AB] bg-[#F8ED62]/30"
                      : "border-gray-300"
                  }`}
                >
                  <h3 className="font-medium text-[#0047AB] text-sm md:text-base">
                    {criterion}
                  </h3>
                  <div className="grid grid-cols-5 gap-2 mt-2">
                    {[1, 2, 3, 4, 5].map((num) => (
                      <button
                        key={num}
                        className={`w-full py-2 rounded-md transition-all font-semibold text-sm border ${
                          ratings[index] === num
                            ? "bg-[#0047AB] text-white border-[#0047AB]"
                            : "bg-[#FFD1DC] text-black border-gray-300 hover:bg-[#FF4EB8]/20"
                        }`}
                        onClick={() => handleRatingChange(index, num)}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                  <textarea
                    className="w-full mt-2 p-2 rounded-md border border-[#0047AB] bg-white focus:ring focus:ring-[#4DEEEA] text-sm md:text-base text-black"
                    placeholder="Comentário opcional..."
                    value={comments[index]}
                    onChange={(e) => handleCommentChange(index, e.target.value)}
                    rows={2}
                  />
                </div>
              ))}
            </div>

            {/* Botão de envio - fora do container de scroll */}
            <button
              onClick={handleSubmit}
              className={`mt-4 w-full px-4 py-2 rounded-md text-white font-semibold transition-all ${
                isSubmitting
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-[#FF6F61] hover:bg-[#FF4EB8]"
              }`}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Enviando..." : "Enviar Avaliação"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default DashboardLeader;
