import type { WallMessage } from "@/src/lib/message-wall/types";
import { useTranslations } from "next-intl";
import { MessageCard } from "./MessageCard";

interface MasonryGridProps {
  messages: WallMessage[];
  locale: string;
  authUserId?: string | null;
  onDeleteMessage?: (messageId: number) => void;
}

export function MasonryGrid({
  messages,
  locale,
  authUserId,
  onDeleteMessage,
}: MasonryGridProps) {
  const t = useTranslations("demo");
  if (messages.length === 0) {
    return (
      <div className="rounded-xl border border-white/10 bg-white/[0.03] p-8 text-center text-sm text-white/50">
        {t("empty")}
      </div>
    );
  }

  return (
    <div className="mx-auto columns-1 gap-4 sm:columns-2 xl:columns-3">
      {messages.map((message) => (
        <div key={message.id} className="mb-4 break-inside-avoid">
          <MessageCard
            message={message}
            locale={locale}
            canDelete={
              false
              //Boolean(authUserId && message.userId === authUserId)
            }
            onDelete={
              onDeleteMessage ? () => onDeleteMessage(message.id) : undefined
            }
          />
        </div>
      ))}
    </div>
  );
}
