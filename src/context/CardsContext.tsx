
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useAuth } from "react-oidc-context";
import type { Card, CardInput } from "../types";
import {
  createCard,
  deleteCard,
  fetchCards,
  updateCard,
} from "../api/cardsApi";

interface CardsContextValue {
  cards: Card[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
  create: (data: CardInput) => Promise<Card>;
  update: (id: string, data: CardInput) => Promise<Card>;
  remove: (card: Card) => Promise<void>;
}

const CardsContext = createContext<CardsContextValue | null>(null);

export function CardsProvider({ children }: { children: ReactNode }) {
  const auth = useAuth();

  // Usar el access token para las peticiones protegidas de la API
  const token = auth.user?.access_token;

  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    if (!token) {
      setCards([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    fetchCards(token)
      .then(setCards)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  const create = useCallback(
    async (data: CardInput) => {
      if (!token) {
        throw new Error("No hay sesión activa");
      }

      const created = await createCard(token, data);
      setCards((prev) => [...prev, created]);
      return created;
    },
    [token],
  );

  const update = useCallback(
    async (id: string, data: CardInput) => {
      if (!token) {
        throw new Error("No hay sesión activa");
      }

      const updated = await updateCard(token, id, data);

      setCards((prev) =>
        prev.map((card) => (card.id === updated.id ? updated : card)),
      );

      return updated;
    },
    [token],
  );

  const remove = useCallback(
    async (card: Card) => {
      if (!token) {
        throw new Error("No hay sesión activa");
      }

      const previous = cards;
      setCards((prev) => prev.filter((item) => item.id !== card.id));

      try {
        await deleteCard(token, card.id);
      } catch (err) {
        setCards(previous);
        throw err;
      }
    },
    [token, cards],
  );

  const value = useMemo(
    () => ({
      cards,
      loading,
      error,
      refetch: load,
      create,
      update,
      remove,
    }),
    [cards, loading, error, load, create, update, remove],
  );

  return (
    <CardsContext.Provider value={value}>
      {children}
    </CardsContext.Provider>
  );
}

export function useCards(): CardsContextValue {
  const ctx = useContext(CardsContext);

  if (!ctx) {
    throw new Error("useCards debe usarse dentro de <CardsProvider>");
  }

  return ctx;
}
