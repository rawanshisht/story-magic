"use client";

import { useCallback, useState } from "react";
import { StoryPreview } from "@/components/story/StoryPreview";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/context/AuthContext";
import { StoryPage } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Mail } from "lucide-react";

interface StoryViewClientProps {
  storyId: string;
  title: string;
  pages: StoryPage[];
}

export function StoryViewClient({ storyId, title, pages }: StoryViewClientProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false);
  const [emailInput, setEmailInput] = useState("");
  const [isSendingEmail, setIsSendingEmail] = useState(false);

  const handleSave = useCallback(async (updatedPages: StoryPage[]) => {
    const lightPages = updatedPages.map(({ imageBase64, ...rest }) => rest);

    const response = await fetch(`/api/stories/${storyId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: lightPages }),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      toast({
        title: "Failed to save",
        description: data.error || "Could not save your changes. Please try again.",
        variant: "destructive",
      });
      throw new Error(data.error || "Failed to save");
    }

    toast({
      title: "Saved!",
      description: "Your story text has been updated.",
    });
  }, [storyId, toast]);

  const handleOpenEmailDialog = useCallback(() => {
    setEmailInput(user?.email || "");
    setIsEmailDialogOpen(true);
  }, [user?.email]);

  const handleSendEmail = async () => {
    if (!emailInput.trim()) {
      toast({
        title: "Email required",
        description: "Please enter an email address.",
        variant: "destructive",
      });
      return;
    }

    setIsSendingEmail(true);
    try {
      const response = await fetch(`/api/stories/${storyId}/email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailInput.trim() }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Failed to send email");
      }

      toast({
        title: "Email sent!",
        description: `Story sent to ${emailInput.trim()}`,
      });
      setIsEmailDialogOpen(false);
    } catch (error) {
      toast({
        title: "Failed to send",
        description: error instanceof Error ? error.message : "Could not send email. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSendingEmail(false);
    }
  };

  return (
    <>
      <StoryPreview
        title={title}
        pages={pages}
        storyId={storyId}
        onSave={handleSave}
        onEmailClick={handleOpenEmailDialog}
      />

      <Dialog open={isEmailDialogOpen} onOpenChange={setIsEmailDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Send Story by Email
            </DialogTitle>
            <DialogDescription>
              Send "{title}" as a PDF attachment to any email address.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter email address"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                disabled={isSendingEmail}
              />
            </div>
            {user?.email && emailInput !== user.email && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setEmailInput(user.email || "")}
                disabled={isSendingEmail}
              >
                Use my email ({user.email})
              </Button>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEmailDialogOpen(false)}
              disabled={isSendingEmail}
            >
              Cancel
            </Button>
            <Button onClick={handleSendEmail} disabled={isSendingEmail}>
              {isSendingEmail ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Mail className="mr-2 h-4 w-4" />
                  Send Email
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
