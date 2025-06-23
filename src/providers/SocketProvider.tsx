
"use client";

import { useSession } from "next-auth/react";
import React, { createContext, useState, useEffect, useContext } from "react";
import { io, Socket } from "socket.io-client";

interface NotificationData {
  _id: string;
  symbol: string;
  currentPrice: string;
  change: string;
  percent: string;
  name: string;
  logo: string
}

interface SocketContextType {
  socket: Socket | null;
  notifications: NotificationData[];
  setNotifications: React.Dispatch<React.SetStateAction<NotificationData[]>>;
  notificationCount: NotificationData | null;
  setNotificationCount: React.Dispatch<
    React.SetStateAction<NotificationData | null>
  >;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const session = useSession();
  const token = session?.data?.user?.accessToken;
  const userID = session?.data?.user?.id;
  const [listenerSet, setListenerSet] = useState(false);
  const [notificationCount, setNotificationCount] = useState(() => {
    // Read from localStorage during first render
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("notificationCount");
      return stored ? JSON.parse(stored) : { notificationCount: 0 };
    }
    return { notificationCount: 0 };
  });

  useEffect(() => {
    if (notificationCount !== null) {
      localStorage.setItem(
        "notificationCount",
        JSON.stringify(notificationCount)
      );
    }
  }, [notificationCount]);

  useEffect(() => {
    if (token && !socket) {
      const socket = io(`${process.env.NEXT_PUBLIC_SOCKET_URL}`, {
        extraHeaders: {
          Authorization: `Bearer ${token}`,
        },
      });
      setSocket(socket);
    }

    if (socket) {
      socket.on("stockUpdate", (data) => {
        setNotifications((prev) => {
          const exists = prev.some((s) => s.symbol === data.symbol);
          return exists
            ? prev.map((s) =>
              s.symbol === data.symbol ? { ...s, ...data } : s
            )
            : [...prev, data]; // <-- push if new
        });
      });
      setListenerSet(true);
      return () => {
        socket.disconnect();
        setSocket(null);
      };
    }
  }, [token, socket, listenerSet, userID]);

  return (
    <SocketContext.Provider
      value={{
        socket,
        notifications,
        setNotifications,
        notificationCount,
        setNotificationCount,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocketContext = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocketContext must be used within a SocketProvider");
  }
  return context;
};
