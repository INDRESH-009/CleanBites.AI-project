"use client";

import { MessageSquare } from "lucide-react";
import ChatModal from "../components/ChatModal";

/**
 * @param {boolean} hideChat - If true, the chat icon is not rendered at all.
 * @param {boolean} showChat - Existing prop controlling whether chat modal is open
 * @param {(boolean) => void} setShowChat - Existing state setter for showChat
 */
export default function ChatFeatures({ hideChat, showChat, setShowChat }) {
  // If told to hide chat entirely, just skip rendering the icon
  if (hideChat) {
    return null;
  }

  return (
    <>
      {!showChat && (
        <div className="fixed bottom-6 right-6 ">
          <button
            onClick={() => setShowChat(true)}
            className="bg-blue-600 text-white z-50 w-12 h-12 mr-2 mb-24 md:mb-18 rounded-full flex items-center justify-center shadow-lg hover:bg-blue-700"
          >
            <MessageSquare className="w-6 h-6" />
          </button>
        </div>
      )}
      {showChat && <ChatModal onClose={() => setShowChat(false)} />}
    </>
  );
}
