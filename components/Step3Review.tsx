import React, { useState } from "react";

interface Step3ConfirmationProps {
  formData: any;
  onBack: () => void;
  onSubmit: () => void;
}

const Step3Confirmation: React.FC<Step3ConfirmationProps> = ({
  formData,
  onBack,
  onSubmit,
}) => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async () => {
    setLoading(true);
    setMessage(null);

    try {
      console.log("Enviando dados para API:", formData);

      const response = await fetch("http://localhost:5000/api/submit-appointment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      console.log("Resposta da API:", result);

      if (result.success) {
        let resumo = "✅ Agendamento realizado com sucesso!\n\n";
        result.created.forEach((c: any) => {
          resumo += `• ${c.agency} → ID: ${c.id}\n`;
        });
        setMessage(resumo);
        onSubmit();
      } else {
        setMessage("❌ Erro ao confirmar agendamento: " + (result.error || "Erro desconhecido"));
      }
    } catch (error) {
      console.error("Erro no fetch:", error);
      setMessage("❌ Erro de conexão com o servidor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-3">Confirmação</h2>
      <p className="mb-2">Confira os dados antes de confirmar o agendamento:</p>

      <div className="mb-3">
        <strong>Nome:</strong> {formData.fullName} <br />
        <strong>Email:</strong> {formData.email} <br />
        <strong>Telefone:</strong> {formData.phone} <br />
        <strong>Endereço do imóvel:</strong> {formData.propertyAddress} <br />
        <strong>Perfil:</strong> {formData.profile.join(", ")} <br />
        {formData.query && (
          <>
            <strong>Dúvida:</strong> {formData.query} <br />
          </>
        )}
        {formData.companyName && (
          <>
            <strong>Empresa:</strong> {formData.companyName} <br />
            <strong>Cargo:</strong> {formData.role} <br />
            <strong>Endereço da empresa:</strong> {formData.companyAddress} <br />
          </>
        )}
        <strong>Consentimento LGPD:</strong>{" "}
        {formData.lgpdConsent ? "Sim" : "Não"} <br />
        <strong>Data escolhida:</strong> {formData.date} <br />
      </div>

      <div className="mb-3">
        <h3 className="font-semibold">Órgãos selecionados e horários:</h3>
        <ul className="list-disc ml-6">
          {Object.entries(formData.selectedTimes).map(([agency, time]) => (
            <li key={agency}>
              <strong>{agency}:</strong> {time}
            </li>
          ))}
        </ul>
      </div>

      {message && (
        <div
          className={`p-3 mb-3 rounded ${
            message.startsWith("✅")
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          <pre>{message}</pre>
        </div>
      )}

      <div className="flex justify-between">
        <button
          onClick={onBack}
          disabled={loading}
          className="px-4 py-2 rounded bg-gray-400 text-white hover:bg-gray-500"
        >
          Voltar
        </button>
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
        >
          {loading ? "Confirmando..." : "Confirmar"}
        </button>
      </div>
    </div>
  );
};

export default Step3Confirmation;
