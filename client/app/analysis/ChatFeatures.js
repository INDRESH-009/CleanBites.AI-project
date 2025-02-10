"use client";

import { MessageSquare } from "lucide-react";
import ChatModal from "../components/ChatModal";

export default function ChatFeatures({ showChat, setShowChat }) {
  return (
    <>
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setShowChat(true)}
          className="bg-blue-600 text-white w-12 h-12 mr-4 rounded-full flex items-center justify-center shadow-lg hover:bg-blue-700"
        >
          <MessageSquare className="w-6 h-6" />
        </button>
      </div>
      {showChat && <ChatModal onClose={() => setShowChat(false)} />}
    </>
  );
}
