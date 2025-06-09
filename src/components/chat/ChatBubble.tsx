import React from "react";

type BubbleProps = {
  text: string;
  fromSelf: boolean;
};

export const ChatBubble: React.FC<BubbleProps> = ({ text, fromSelf }) => {
  return (
    <div className={`flex ${fromSelf ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-xs p-2 my-1 rounded-xl ${
          fromSelf ? "bg-blue-500 text-white" : "bg-gray-700"
        }`}
      >
        {text}
      </div>
    </div>
  );
};
