import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import LogoutButton from "../components/LogoutButton";
import { useAuth } from "../context/AuthContext";

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

function DashboardCollaborator() {
  //const [user, setUser] = useState(null);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [editingFeedback, setEditingFeedback] = useState(false);
  const [creatingFeedback, setCreatingFeedback] = useState(false);
  const [insight, setInsight] = useState(null);
  const [loadingInsight, setLoadingInsight] = useState(false);
  const [ratings, setRatings] = useState(Array(10).fill(3)); // Notas padrão 3
  const [leaderRatings, setLeaderRatings] = useState(Array(10).fill(null)); // Notas do líder
  const [leaderFeedbackExists, setLeaderFeedbackExists] = useState(true);
  const [comments, setComments] = useState(Array(10).fill(""));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      checkIfFeedbackSubmitted();
    }
  }, [user]);

  const checkIfFeedbackSubmitted = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        "http://localhost:8000/feedback/collaborator/auto",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response.data) {
        setFeedbackSubmitted(true);
        setRatings(response.data.answers.map((a) => a.answer));
        setComments(response.data.answers.map((a) => a.explanation || ""));
      }
    } catch (error) {
      console.log(
        "Nenhum feedback encontrado, colaborador pode enviar um novo."
      );
      setFeedbackSubmitted(false);
    }

    // Agora buscamos o feedback do gestor
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        "http://localhost:8000/feedback/collaborator/leader",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response.data) {
        setLeaderRatings(response.data.answers.map((a) => a.answer));
      }
    } catch (error) {
      console.log("Nenhum feedback do líder encontrado.");
      setLeaderFeedbackExists(false);
    }
  };

  useEffect(() => {
    if (editingFeedback || creatingFeedback) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [editingFeedback, creatingFeedback]);

  const handleGetInsight = async () => {
    setLoadingInsight(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:8000/iago/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setInsight(response.data.message);
    } catch (error) {
      console.error(
        "Erro ao buscar insights da IA",
        error.response?.data || error.message
      );
      alert("Erro ao obter insights da IA.");
    }
    setLoadingInsight(false);
  };

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

  const handleCreateFeedback = async () => {
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("token");

      await axios.post(
        "http://localhost:8000/feedback/collaborator",
        {
          answers: criteria.map((_, index) => ({
            question_number: index + 1, // Adiciona o número da pergunta (1-10)
            answer: ratings[index],
            explanation: comments[index] || "",
          })),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setCreatingFeedback(false);
      setFeedbackSubmitted(true);
      alert("Autoavaliação criada com sucesso!");
    } catch (error) {
      console.error(error);
      alert("Erro ao criar autoavaliação.");
    }
    setIsSubmitting(false);
  };

  const handleSaveFeedback = async () => {
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("token");

      await axios.put(
        "http://localhost:8000/feedback/collaborator",
        {
          answers: criteria.map((_, index) => ({
            question_number: index + 1, // Adiciona o número da pergunta (1-10)
            answer: ratings[index],
            explanation: comments[index] || "",
          })),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setEditingFeedback(false);
      alert("Autoavaliação atualizada com sucesso!");
    } catch (error) {
      console.error(error);
      alert("Erro ao atualizar autoavaliação.");
    }
    setIsSubmitting(false);
  };

  const renderFeedbackForm = (isCreating) => {
    return (
      <div className="mt-6 bg-white p-4 rounded-md border border-[#0047AB]">
        <h2 className="text-xl font-bold text-[#0047AB] mb-4">
          {isCreating ? "Criar Autoavaliação" : "Editar Autoavaliação"}
        </h2>

        {/* Container de critérios com scroll */}
        <div className="space-y-4 max-h-[60vh] overflow-y-auto pb-4 pr-2">
          {criteria.map((criterion, index) => (
            <div
              key={index}
              className={`border p-3 rounded-md transition-all ${
                ratings[index] !== null
                  ? "border-[#0047AB] bg-[#EFEF98]"
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
                        : "bg-[#FFD1DB] text-black border-gray-300 "
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
          onClick={isCreating ? handleCreateFeedback : handleSaveFeedback}
          className={`mt-4 w-full px-4 py-2 rounded-md text-white font-semibold transition-all ${
            isSubmitting ? "bg-gray-400 cursor-not-allowed" : "bg-[#0060B1]"
          }`}
          disabled={isSubmitting}
        >
          {isSubmitting
            ? "Enviando..."
            : isCreating
            ? "Enviar Autoavaliação"
            : "Atualizar Autoavaliação"}
        </button>

        <button
          onClick={() =>
            isCreating ? setCreatingFeedback(false) : setEditingFeedback(false)
          }
          className="mt-2 w-full px-4 py-2 rounded-md text-[#0047AB] font-semibold bg-gray-200 hover:bg-gray-300 transition-all"
        >
          Cancelar
        </button>
      </div>
    );
  };

  return (
    // Container principal com fundo rosa claro (Light pink)
    <div className="min-h-screen bg-[#EFEF98] p-6 pt-20 flex justify-center overflow-x-hidden">
      {/* "Cartão" central para agrupar conteúdo - corrigido para largura fixa e overflow controlado */}
      <div className="bg-white p-6 rounded-md shadow-md w-full max-w-4xl overflow-hidden">
        {/* Header com nome do usuário e botão de logout */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center">
            <img src={"src/assets/robo.png"} alt="IA.go" width={50} />
            <h1 className="text-2xl font-bold text-[#0047AB]">
              {user ? `Olá, ${user.name}!` : "Carregando..."}
            </h1>
          </div>

          <LogoutButton />
        </div>

        {/* Caso ainda não tenha enviado feedback e não está criando */}
        {!feedbackSubmitted && !creatingFeedback && (
          <div className="mt-4 p-4 bg-[#F8ED62] rounded-md border border-[#0047AB] max-w-2xl mx-auto">
            <h2 className="text-xl font-semibold text-[#0047AB] mb-2">
              Autoavaliação pendente
            </h2>
            <p className="text-[#0047AB] mb-4">
              Você ainda não fez sua auto avaliação. Faça agora para que o IA.go
              possa lhe sugerir ações e planos de desenvolvimento
              personalizados.
            </p>
            <button
              onClick={() => setCreatingFeedback(true)}
              className="w-full px-4 py-2 bg-[#FF6F61] text-white rounded-md font-semibold hover:bg-[#FF4EB8] transition-all"
            >
              Iniciar Autoavaliação
            </button>
          </div>
        )}

        {/* Formulário de criação de auto-avaliação */}
        {!feedbackSubmitted && creatingFeedback && renderFeedbackForm(true)}

        {/* Se já enviou feedback e não está editando */}
        {feedbackSubmitted && !editingFeedback && (
          <div>
            <h2 className="text-xl font-semibold text-[#0047AB] mb-4">
              Insights do IA.go
            </h2>

            <button
              onClick={handleGetInsight}
              className={`w-full px-4 py-2 rounded-md text-white font-semibold transition-all ${
                loadingInsight
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-[#FF3FAE]"
              }`}
              disabled={loadingInsight}
            >
              {loadingInsight ? "Processando..." : "Obter Insights do IA.go"}
            </button>

            {insight && (
              <div
                id="insight-section"
                className="mt-4 p-4 border border-[#0047AB] rounded-md bg-white max-h-64 overflow-y-auto break-words"
              >
                <h3 className="text-lg font-semibold text-[#0047AB] mb-2">
                  Insights d IA.go:
                </h3>
                <div className="text-black whitespace-pre-line break-words">
                  <ReactMarkdown>{insight}</ReactMarkdown>
                </div>
              </div>
            )}

            <h2 className="text-xl font-semibold text-[#0047AB] mt-6">
              Comparação de Avaliações
            </h2>
            {!leaderFeedbackExists && (
              <p className="text-red-600 mb-2">
                O seu gestor ainda não avaliou você.
              </p>
            )}

            {/* Tabela com scroll horizontal */}
            <div className="overflow-x-auto mt-2">
              <table className="w-full border-collapse border border-[#0047AB]">
                <thead>
                  <tr className="bg-[#EFEF98]">
                    <th className="border border-[#0047AB] p-2 text-left text-[#0047AB] min-w-48">
                      Critério
                    </th>
                    <th className="border border-[#0047AB] p-2 text-center text-[#0047AB] w-24">
                      Autoavaliação
                    </th>
                    <th className="border border-[#0047AB] p-2 text-center text-[#0047AB] w-24">
                      Avaliação do Líder
                    </th>
                    <th className="border border-[#0047AB] p-2 text-center text-[#0047AB] w-24">
                      Média Final
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {criteria.map((criterion, index) => {
                    const auto = ratings[index];
                    const leader = leaderRatings[index];
                    const finalScore =
                      leader !== null
                        ? (
                            ((auto + leader) / 2) * 0.15 +
                            auto * 0.15 +
                            leader * 0.7
                          ).toFixed(2)
                        : "NaN";

                    return (
                      <tr
                        key={index}
                        className="hover:bg-[#FFD1DC]/70 transition-colors"
                      >
                        <td className="border border-[#0047AB] p-2 text-black">
                          {criterion}
                        </td>
                        <td className="border border-[#0047AB] p-2 text-center text-black">
                          {auto}
                        </td>
                        <td className="border border-[#0047AB] p-2 text-center text-black">
                          {leader !== null ? leader : "-"}
                        </td>
                        <td className="border border-[#0047AB] p-2 text-center text-black">
                          {finalScore}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <button
              onClick={() => setEditingFeedback(true)}
              className="mt-4 w-full px-4 py-2 rounded-md text-white font-semibold bg-[#0060B1] transition-all"
            >
              Atualizar Autoavaliação
            </button>
            <div className="flex justify-center mt-6">
              <img
                src={"src/assets/gocase.png"}
                alt="GoCase Logo"
                width={200}
              />
            </div>
          </div>
        )}

        {/* Se já enviou feedback e está editando */}
        {feedbackSubmitted && editingFeedback && renderFeedbackForm(false)}
      </div>
    </div>
  );
}

export default DashboardCollaborator;
