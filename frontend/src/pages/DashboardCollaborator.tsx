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
  // Estados relacionados ao feedback do colaborador
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [editingFeedback, setEditingFeedback] = useState(false);
  const [creatingFeedback, setCreatingFeedback] = useState(false);
  const [ratings, setRatings] = useState(Array(10).fill(3)); // Notas padrão 3
  const [leaderRatings, setLeaderRatings] = useState(Array(10).fill(null)); // Notas do líder
  const [leaderFeedbackExists, setLeaderFeedbackExists] = useState(true);
  const [comments, setComments] = useState(Array(10).fill(""));
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Estados relacionados à mensagem da IA
  const [iaMessage, setIAMessage] = useState(null); // Mensagem vinda da IA (IAMessageStore)
  const [loadingIAMessage, setLoadingIAMessage] = useState(false);

  const navigate = useNavigate();
  const { user } = useAuth();

  // Ao montar o componente ou quando 'user' muda, buscamos se o colaborador já preencheu feedback.
  useEffect(() => {
    if (user) {
      checkIfFeedbackSubmitted();
    }
  }, [user]);

  // Verifica se o colaborador já fez autoavaliação e se o líder já avaliou
  const checkIfFeedbackSubmitted = async () => {
    try {
      const token = localStorage.getItem("token");
      // Autoavaliação do colaborador
      const responseAuto = await axios.get(
        "http://localhost:8000/feedback/collaborator/auto",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (responseAuto.data) {
        setFeedbackSubmitted(true);
        setRatings(responseAuto.data.answers.map((a) => a.answer));
        setComments(responseAuto.data.answers.map((a) => a.explanation || ""));
      }
    } catch (error) {
      console.log(
        "Nenhum feedback encontrado, colaborador pode enviar um novo."
      );
      setFeedbackSubmitted(false);
    }

    // Feedback do gestor
    try {
      const token = localStorage.getItem("token");
      const responseLeader = await axios.get(
        "http://localhost:8000/feedback/collaborator/leader",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (responseLeader.data) {
        setLeaderRatings(responseLeader.data.answers.map((a) => a.answer));
      }
    } catch (error) {
      console.log("Nenhum feedback do líder encontrado.");
      setLeaderFeedbackExists(false);
    }
  };

  // Se estiver criando ou editando feedback, rola a página para cima
  useEffect(() => {
    if (editingFeedback || creatingFeedback) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [editingFeedback, creatingFeedback]);

  // ---------------------------
  //  Busca de mensagem da IA
  // ---------------------------
  // Tenta buscar a mensagem existente no IAMessageStore (endpoint GET /iago/message)
  // Caso não exista, o servidor vai retornar erro e ficamos sem mensagem armazenada
  const fetchIAMessage = async () => {
    setLoadingIAMessage(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:8000/iago/message", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setIAMessage(response.data.message);
    } catch (error) {
      console.log("Nenhuma mensagem IA armazenada ainda.");
      setIAMessage(null);
    }
    setLoadingIAMessage(false);
  };

  // Se o usuário já submeteu feedback, tentamos buscar automaticamente a mensagem existente.
  useEffect(() => {
    if (feedbackSubmitted) {
      fetchIAMessage();
    }
  }, [feedbackSubmitted]);

  // ---------------------------
  //  Gera (ou regenera) nova mensagem IA
  // ---------------------------
  const handleGetInsight = async () => {
    setLoadingIAMessage(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:8000/iago/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setIAMessage(response.data.message);
    } catch (error) {
      console.error(
        "Erro ao buscar insights da IA",
        error.response?.data || error.message
      );
      alert("Erro ao obter insights da IA.");
    }
    setLoadingIAMessage(false);
  };

  // ---------------------------
  //  Deletar mensagem IA (e gerar novamente se quiser)
  // ---------------------------
  const deleteAssistantFeedback = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete("http://localhost:8000/iago/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      // remove do estado
      setIAMessage(null);
    } catch (error) {
      console.error("Erro ao deletar a mensagem da IA:", error);
      alert("Erro ao deletar mensagem da IA.");
    }
  };

  // "Gerar novamente" => deleta e em seguida gera uma nova
  const handleRegenerateIA = async () => {
    await deleteAssistantFeedback();
    await handleGetInsight();
  };

  // ---------------------------
  //  Feedback de "Legal" ou "Não gostei" para a IA
  // ---------------------------
  const handleScore = async (like) => {
    try {
      const token = localStorage.getItem("token");
      // like é boolean, mas a API espera 1 ou 0
      await axios.put(
        `http://localhost:8000/iago/score?score=${like ? 1 : 0}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      alert("Feedback sobre a IA enviado com sucesso!");
    } catch (error) {
      console.error("Erro ao enviar feedback da IA:", error);
      alert("Erro ao enviar feedback da IA.");
    }
  };

  // ---------------------------
  //  Lógica de criar/editar feedback
  // ---------------------------
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
            question_number: index + 1,
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
            question_number: index + 1,
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

  // Renderiza formulário de criação ou edição de autoavaliação
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
    <div className="min-h-screen bg-[#EFEF98] p-6 pt-20 flex justify-center overflow-x-hidden">
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
            <h2 className="text-xl font-semibold text-[#0047AB] mt-6 mb-2">
              Insights do IA.go
            </h2>

            {/* Se NÃO temos mensagem da IA, mostra botão para gerar.
                Se JÁ temos, mostra a mensagem + botões de feedback e regenerar. */}
            {!iaMessage ? (
              <button
                onClick={handleGetInsight}
                className={`w-full px-4 py-2 rounded-md text-white font-semibold transition-all ${
                  loadingIAMessage
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-[#FF3FAE]"
                }`}
                disabled={loadingIAMessage}
              >
                {loadingIAMessage
                  ? "Processando..."
                  : "Obter Insights do IA.go"}
              </button>
            ) : (
              <div
                id="insight-section"
                className="mt-4 p-4 border border-[#0047AB] rounded-md bg-white max-h-64 overflow-y-auto break-words"
              >
                <h3 className="text-lg font-semibold text-[#0047AB] mb-2">
                  Insights do IA.go:
                </h3>
                <div className="text-black whitespace-pre-line break-words">
                  <ReactMarkdown>{iaMessage}</ReactMarkdown>
                </div>

                {/* Botões de feedback (Legal / Não gostei) */}
                <div className="mt-4 flex justify-between">
                  <button
                    onClick={() => handleScore(true)}
                    className="px-4 py-2 rounded-md bg-green-500 text-white font-semibold hover:bg-green-600 transition-all mr-2"
                  >
                    Legal
                  </button>
                  <button
                    onClick={() => handleScore(false)}
                    className="px-4 py-2 rounded-md bg-red-500 text-white font-semibold hover:bg-red-600 transition-all mr-2"
                  >
                    Não gostei
                  </button>

                  {/* Botão para gerar novamente */}
                  <button
                    onClick={handleRegenerateIA}
                    className="px-4 py-2 rounded-md bg-[#FF3FAE] text-white font-semibold hover:bg-pink-600 transition-all"
                  >
                    Gerar novamente
                  </button>
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
