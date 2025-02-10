"use client";

import { Button } from "@/components/ui/button";
import ChatModal from "../components/ChatModal.js";

export default function ChatFeatures({ showChat, setShowChat }) {
  return (
    <>
      <div className="mt-6 text-center">
        <Button onClick={() => setShowChat(true)} className="bg-blue-600 text-white py-2 px-4 rounded">
          Ask any query to your personal assistant
        </Button>
      </div>
      {showChat && <ChatModal onClose={() => setShowChat(false)} />}
    </>
  );
}
