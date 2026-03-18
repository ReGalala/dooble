import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";

export interface Ticket {
  ticketId: string;
  userId: string;
  activityId: string;
  activityTitle: string;
  companyName: string;
  purchasedAt: string;
  quantity: number;
  totalPaid: number;
  qrCodeData: string;
  status: "Valid" | "Used" | "Expired";
}

function generateQR(): string {
  return `QR-${Math.random().toString(36).substring(2, 14).toUpperCase()}`;
}

interface TicketStoreContextType {
  tickets: Ticket[];
  getUserTickets: () => Ticket[];
  getTicketById: (ticketId: string) => Ticket | undefined;
  createTicket: (data: {
    activityId: string;
    activityTitle: string;
    companyName: string;
    quantity: number;
    totalPaid: number;
  }) => Promise<Ticket | null>;
}

const TicketStoreContext = createContext<TicketStoreContextType | null>(null);

export const TicketStoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const { user } = useAuth(); // User from AuthContext

  const fetchTickets = useCallback(async () => {
    if (!user) {
      setTickets([]);
      return;
    }
    try {
      const data = await api.get('/tickets');
      setTickets(data as any);
    } catch (error) {
      console.error("Failed to fetch tickets", error);
    }
  }, [user]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const getUserTickets = useCallback(() => {
    return tickets;
  }, [tickets]);

  const getTicketById = useCallback(
    (ticketId: string) => tickets.find((t) => t.ticketId === ticketId),
    [tickets]
  );

  const createTicket = useCallback(
    async (data: { activityId: string; activityTitle: string; companyName: string; quantity: number; totalPaid: number }): Promise<Ticket | null> => {
      if (!user) return null;
      try {
        const ticketData = {
          ...data,
          qrCodeData: generateQR(),
          status: "Valid"
        };
        const newTicket = await api.post('/tickets', ticketData);
        setTickets((prev) => [newTicket, ...prev]);
        return newTicket;
      } catch (error) {
        console.error("Failed to create ticket", error);
        return null;
      }
    },
    [user]
  );

  return (
    <TicketStoreContext.Provider value={{ tickets, getUserTickets, getTicketById, createTicket }}>
      {children}
    </TicketStoreContext.Provider>
  );
};

export function useTicketStore() {
  const ctx = useContext(TicketStoreContext);
  if (!ctx) throw new Error("useTicketStore must be used within TicketStoreProvider");
  return ctx;
}
