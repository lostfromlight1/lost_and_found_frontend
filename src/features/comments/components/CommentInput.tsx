"use client";

import { useEffect, useRef, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Smile } from "lucide-react";
import EmojiPicker, { Theme } from "emoji-picker-react";

type User = {
  id: string | number;
  name: string;
  avatarUrl?: string;
};

type Props = {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  isLoading?: boolean;
  
  avatarUrl?: string | null;
  hideAvatar?: boolean;
  placeholder?: string;
  buttonText?: string;

  mentionPrefix?: string; 
  users?: User[]; 

  isEditing?: boolean;
  onCancelEdit?: () => void;
};

export default function CommentInput({
  value,
  onChange,
  onSubmit,
  isLoading,
  avatarUrl,
  hideAvatar = false,
  placeholder,
  buttonText,
  mentionPrefix,
  users = [],
  isEditing,
  onCancelEdit,
}: Props) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const [showEmoji, setShowEmoji] = useState(false);
  const [showMentions, setShowMentions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState("");

  const finalButtonText = buttonText || (mentionPrefix ? "Reply" : "Comment");
  const finalPlaceholder = placeholder || (mentionPrefix ? "Post your reply" : "Post your comment");

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "0px";
    el.style.height = el.scrollHeight + "px";
  }, [value]);

  const handleChange = (v: string) => {
    onChange(v);

    const match = v.slice(0).match(/@(\w*)$/);
    if (match) {
      setShowMentions(true);
      setMentionQuery(match[1]);
    } else {
      setShowMentions(false);
    }
  };

  const selectUser = (user: User) => {
    const newText = value.replace(/@\w*$/, `@${user.name} `);
    onChange(newText);
    setShowMentions(false);
    textareaRef.current?.focus();
  };

  const handleSubmit = () => {
    if (!value.trim() || isLoading) return;
    onSubmit();
  };

  return (
    <div className={`flex items-start gap-2 relative px-3 py-2 ${isEditing ? "bg-muted/50 rounded-xl" : "bg-transparent"}`}>
      {/* Avatar */}
      {!hideAvatar && (
        <Avatar className="w-8 h-8 rounded-full shrink-0 mt-0.5 cursor-pointer hover:opacity-90 transition-opacity">
          <AvatarImage src={avatarUrl || undefined} className="object-cover" />
          <AvatarFallback className="text-[10px] font-bold bg-muted text-muted-foreground">ME</AvatarFallback>
        </Avatar>
      )}

      <div className="flex-1 min-w-0">
        <div className="flex flex-col relative w-full">

          {/* Mention prefix */}
          {mentionPrefix && (
            <div className="mb-1">
              <span className="text-muted-foreground text-[13px]">Replying to </span>
              <span className="text-[#1d9bf0] text-[13px] cursor-pointer hover:underline">
                @{mentionPrefix}
              </span>
            </div>
          )}

          {/* Textarea */}
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={finalPlaceholder}
            rows={1}
            disabled={isLoading}
            className="w-full min-h-5 text-[14px] leading-5 placeholder:text-muted-foreground text-foreground resize-none outline-none bg-transparent max-h-[70vh]"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
          />

          {/* Actions & Submit */}
          <div className="flex items-center justify-between mt-2 pt-1">
            <div className="flex items-center gap-1 relative -ml-2">
              
              <Popover open={showEmoji} onOpenChange={setShowEmoji}>
                <PopoverTrigger 
                  className="p-1.5 rounded-full transition-colors text-[#1d9bf0] hover:bg-[#1d9bf0]/10 flex items-center justify-center cursor-pointer outline-none"
                >
                  <Smile size={18} strokeWidth={2.5} />
                </PopoverTrigger>
                <PopoverContent 
                  side="bottom" 
                  align="start" 
                  sideOffset={8}
                  className="w-auto p-0 border-none shadow-2xl rounded-xl z-99999"
                >
                  <EmojiPicker 
                    onEmojiClick={(emojiData) => {
                      onChange(value + emojiData.emoji);
                      textareaRef.current?.focus();
                    }}
                    theme={Theme.AUTO}
                    previewConfig={{ showPreview: false }}
                  />
                </PopoverContent>
              </Popover>

            </div>

            <div className="flex items-center gap-2">
              {isEditing && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={onCancelEdit}
                  disabled={isLoading}
                  className="rounded-full h-auto px-3 py-1.5 text-[13px]"
                >
                  Cancel
                </Button>
              )}

              <Button
                type="button"
                onClick={handleSubmit}
                disabled={!value.trim() || isLoading}
                className="px-4 py-1.5 h-auto text-[13px] font-bold rounded-full bg-[#1d9bf0] text-white hover:bg-[#1a8cd8] shadow-none disabled:opacity-50"
              >
                {finalButtonText}
              </Button>
            </div>
          </div>
        </div>

        {/* Mention dropdown */}
        {showMentions && users.length > 0 && (
          <div className="mt-2 bg-background border rounded-xl shadow-lg p-0 max-h-60 overflow-y-auto absolute z-9998 w-full left-0">
            {users
              .filter((u) =>
                u.name.toLowerCase().includes(mentionQuery.toLowerCase())
              )
              .slice(0, 5)
              .map((user) => (
                <button
                  key={user.id}
                  onClick={() => selectUser(user)}
                  className="flex items-center gap-3 w-full px-3 py-2 text-left hover:bg-muted transition-colors border-b border-border/50 last:border-0"
                >
                  <Avatar className="w-8 h-8 shrink-0">
                    <AvatarImage src={user.avatarUrl} />
                    <AvatarFallback className="bg-muted text-[11px]">{user.name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="font-bold text-foreground text-[13px]">{user.name}</span>
                    <span className="text-muted-foreground text-[12px]">@{user.name.toLowerCase().replace(/\s/g, '')}</span>
                  </div>
                </button>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
