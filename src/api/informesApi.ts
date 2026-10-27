import { API_BASE_URL } from "../config";

export interface InformeSolicitado {
  informeId: string;
  status: string;
}

// El BFF publica la solicitud en SNS y responde 202 de inmediato.
// El solicitante (requester) lo decide el servidor a partir del JWT, no se envía aquí.
export async function generarInforme(
  token: string,
  body: { reportType?: string; params?: Record<string, unknown> } = {},
): Promise<InformeSolicitado> {
  const response = await fetch(`${API_BASE_URL}/api/informes/generar`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(
      `Error ${response.status} ${response.statusText}${text ? ` — ${text}` : ""}`,
    );
  }

  return (await response.json()) as InformeSolicitado;
}
