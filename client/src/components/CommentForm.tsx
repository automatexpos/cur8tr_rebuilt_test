import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send } from "lucide-react";

interface CommentFormProps {
  onSubmit: (text: string) => void;
  isSubmitting: boolean;
  placeholder?: string;
  buttonText?: string;
}

export default function CommentForm({ 
  onSubmit, 
  isSubmitting, 
  placeholder = "Write a comment...",
  buttonText = "Comment",
}: CommentFormProps) {
  const [text, setText] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) {
      onSubmit(text);
      setText("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3" data-testid="form-comment">
      <Textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={placeholder}
        className="border-2 border-foreground resize-none min-h-[100px]"
        disabled={isSubmitting}
        data-testid="input-comment-text"
      />
      <Button
        type="submit"
        disabled={!text.trim() || isSubmitting}
        className="border-2"
        data-testid="button-submit-comment"
      >
        <Send className="w-4 h-4 mr-2" />
        {isSubmitting ? "Posting..." : buttonText}
      </Button>
    </form>
  );
}
