import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { GradientLayout } from "../../../components/layout/GradientLayout";
import { InfoRow } from "../../../components/ui/InfoRow";
import { RequestState } from "../../../components/ui/RequestState";
import { SectionCard } from "../../../components/ui/SectionCard";
import { colors, radius, spacing, typography } from "../../../theme";
import { getErrorMessage } from "../../../utils/errors";
import { formatDateTime } from "../../../utils/format";
import { useAuth } from "../../auth/AuthProvider";

interface ConversationParticipant {
  user: {
    firstName: string;
    lastName: string;
  };
}

interface ConversationItem {
  id: string;
  title?: string | null;
  otherParticipants: ConversationParticipant[];
  lastReadAt?: string | null;
  lastMessage: {
    content: string;
    createdAt: string;
    senderId: string;
  } | null;
}

interface ConversationMessage {
  id: string;
  content: string;
  createdAt: string;
  senderId: string;
  sender?: {
    firstName: string;
    lastName: string;
  } | null;
}

type LoadMode = "replace" | "append";

const MESSAGE_PAGE_SIZE = 20;

function conversationTitle(item: ConversationItem): string {
  if (item.title && item.title.trim().length > 0) return item.title;
  if (item.otherParticipants.length === 0) return "Conversation";
  return item.otherParticipants
    .map((participant) => `${participant.user.firstName} ${participant.user.lastName}`)
    .join(", ");
}

export function TeacherMessagesScreen() {
  const { authorizedRequest, user } = useAuth();
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [messagesPage, setMessagesPage] = useState(1);
  const [hasMoreMessages, setHasMoreMessages] = useState(false);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [sending, setSending] = useState(false);
  const [messageText, setMessageText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [messageError, setMessageError] = useState<string | null>(null);

  const refreshing =
    loadingConversations || (loadingMessages && messages.length > 0);

  const loadConversations = useCallback(async () => {
    setLoadingConversations(true);
    setError(null);

    try {
      const list = await authorizedRequest<ConversationItem[]>("/messages/conversations");
      setConversations(list);
      setSelectedConversationId((previous) => {
        if (previous && list.some((item) => item.id === previous)) {
          return previous;
        }
        return list[0]?.id ?? null;
      });
    } catch (requestError) {
      setError(getErrorMessage(requestError, "Conversation list could not be loaded."));
    } finally {
      setLoadingConversations(false);
    }
  }, [authorizedRequest]);

  const loadMessages = useCallback(
    async (
      conversationId: string,
      page = 1,
      mode: LoadMode = "replace"
    ) => {
      if (mode === "replace") {
        setLoadingMessages(true);
      } else {
        setLoadingOlder(true);
      }
      setMessageError(null);

      try {
        const list = await authorizedRequest<ConversationMessage[]>(
          `/messages/conversations/${conversationId}/messages?page=${page}&pageSize=${MESSAGE_PAGE_SIZE}`
        );

        setMessages((previous) =>
          mode === "append" ? [...previous, ...list] : list
        );
        setMessagesPage(page);
        setHasMoreMessages(list.length === MESSAGE_PAGE_SIZE);
      } catch (requestError) {
        setMessageError(getErrorMessage(requestError, "Messages could not be loaded."));
      } finally {
        if (mode === "replace") {
          setLoadingMessages(false);
        } else {
          setLoadingOlder(false);
        }
      }
    },
    [authorizedRequest]
  );

  useEffect(() => {
    void loadConversations();
  }, [loadConversations]);

  useEffect(() => {
    if (!selectedConversationId) {
      setMessages([]);
      setMessagesPage(1);
      setHasMoreMessages(false);
      return;
    }
    void loadMessages(selectedConversationId, 1, "replace");
  }, [loadMessages, selectedConversationId]);

  const sendMessage = useCallback(async () => {
    if (!selectedConversationId) return;
    const content = messageText.trim();
    if (!content) return;

    setSending(true);
    setMessageError(null);

    try {
      const created = await authorizedRequest<ConversationMessage>(
        `/messages/conversations/${selectedConversationId}/messages`,
        {
          method: "POST",
          body: JSON.stringify({
            content,
            type: "TEXT",
          }),
        }
      );

      setMessages((previous) => [created, ...previous]);
      setMessageText("");
      await loadConversations();
    } catch (requestError) {
      setMessageError(getErrorMessage(requestError, "Message could not be sent."));
    } finally {
      setSending(false);
    }
  }, [authorizedRequest, loadConversations, messageText, selectedConversationId]);

  const loadOlderMessages = useCallback(async () => {
    if (!selectedConversationId || loadingMessages || loadingOlder || !hasMoreMessages) {
      return;
    }
    await loadMessages(selectedConversationId, messagesPage + 1, "append");
  }, [
    hasMoreMessages,
    loadMessages,
    loadingMessages,
    loadingOlder,
    messagesPage,
    selectedConversationId,
  ]);

  return (
    <GradientLayout
      title="Messages"
      subtitle={`${user?.firstName || "Teacher"} - Classroom inbox`}
      refreshing={refreshing}
      onRefresh={() => {
        void loadConversations();
        if (selectedConversationId) {
          void loadMessages(selectedConversationId, 1, "replace");
        }
      }}
    >
      {loadingConversations && conversations.length === 0 ? (
        <RequestState title="Messages" mode="loading" />
      ) : null}

      {error && conversations.length === 0 ? (
        <RequestState
          title="Messages"
          mode="error"
          message={error}
          onRetry={() => {
            void loadConversations();
          }}
        />
      ) : null}

      {!loadingConversations && !error && conversations.length === 0 ? (
        <RequestState
          title="Messages"
          mode="empty"
          message="No conversations yet."
          onRetry={() => {
            void loadConversations();
          }}
        />
      ) : null}

      {conversations.length > 0 ? (
        <SectionCard title="Conversations" subtitle="Tap to open thread">
          {conversations.map((item) => {
            const selected = item.id === selectedConversationId;
            const lastMessage = item.lastMessage;
            let hasUnread = false;

            if (lastMessage && lastMessage.senderId !== user?.id) {
              hasUnread =
                !item.lastReadAt ||
                new Date(lastMessage.createdAt).getTime() >
                  new Date(item.lastReadAt).getTime();
            }

            return (
              <Pressable
                key={item.id}
                style={[
                  styles.conversationPressable,
                  selected ? styles.conversationSelected : null,
                ]}
                onPress={() => {
                  setSelectedConversationId(item.id);
                }}
              >
                <InfoRow
                  title={conversationTitle(item)}
                  detail={
                    lastMessage
                      ? `${lastMessage.content} - ${formatDateTime(lastMessage.createdAt)}`
                      : "No messages yet"
                  }
                  badgeText={hasUnread ? "New" : selected ? "Open" : undefined}
                  badgeTone={hasUnread ? "ok" : "info"}
                />
              </Pressable>
            );
          })}
        </SectionCard>
      ) : null}

      {selectedConversationId ? (
        <SectionCard title="Thread" subtitle="Latest messages">
          {loadingMessages ? <ActivityIndicator size="small" color={colors.accentBlue} /> : null}

          {messageError ? <Text style={styles.errorText}>{messageError}</Text> : null}

          {!loadingMessages && messages.length === 0 ? (
            <Text style={styles.emptyText}>No messages in this thread.</Text>
          ) : null}

          {messages.map((item) => (
            <InfoRow
              key={item.id}
              title={
                item.sender
                  ? `${item.sender.firstName} ${item.sender.lastName}`
                  : item.senderId === user?.id
                    ? "You"
                    : "User"
              }
              detail={`${item.content} - ${formatDateTime(item.createdAt)}`}
            />
          ))}

          {loadingOlder ? <ActivityIndicator size="small" color={colors.accentBlue} /> : null}

          {!loadingOlder && hasMoreMessages ? (
            <Pressable
              style={styles.loadOlderButton}
              onPress={() => {
                void loadOlderMessages();
              }}
            >
              <Text style={styles.loadOlderText}>Load older messages</Text>
            </Pressable>
          ) : null}

          {!loadingOlder && !hasMoreMessages && messages.length > 0 ? (
            <Text style={styles.helperText}>No older messages.</Text>
          ) : null}

          <View style={styles.composerWrap}>
            <TextInput
              value={messageText}
              onChangeText={setMessageText}
              placeholder="Write a message..."
              placeholderTextColor={colors.textMuted}
              multiline
              style={styles.composerInput}
            />
            <Pressable
              style={[styles.sendButton, sending ? styles.sendButtonDisabled : null]}
              disabled={sending}
              onPress={() => {
                void sendMessage();
              }}
            >
              {sending ? (
                <ActivityIndicator size="small" color={colors.textWhite} />
              ) : (
                <Text style={styles.sendButtonText}>Send</Text>
              )}
            </Pressable>
          </View>
        </SectionCard>
      ) : null}
    </GradientLayout>
  );
}

const styles = StyleSheet.create({
  conversationPressable: {
    borderRadius: radius.md,
  },
  conversationSelected: {
    borderWidth: 1,
    borderColor: "rgba(16,185,129,0.3)",
    backgroundColor: "rgba(16,185,129,0.04)",
    padding: 3,
  },
  loadOlderButton: {
    alignSelf: "center",
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    backgroundColor: colors.surfaceSoft,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
  },
  loadOlderText: {
    color: colors.textPrimary,
    fontSize: typography.bodySM,
    fontFamily: typography.fontBodyStrong,
  },
  helperText: {
    color: colors.textMuted,
    fontSize: typography.bodySM,
    fontFamily: typography.fontBodyRegular,
    textAlign: "center",
  },
  composerWrap: {
    marginTop: spacing.sm,
    gap: spacing.sm,
  },
  composerInput: {
    minHeight: 84,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    backgroundColor: colors.surfaceSoft,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    color: colors.textPrimary,
    fontSize: typography.bodyMD,
    fontFamily: typography.fontBody,
    textAlignVertical: "top",
  },
  sendButton: {
    alignSelf: "flex-end",
    minWidth: 94,
    minHeight: 38,
    borderRadius: radius.pill,
    backgroundColor: colors.accentBlue,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.md,
  },
  sendButtonDisabled: {
    opacity: 0.72,
  },
  sendButtonText: {
    color: colors.textWhite,
    fontSize: typography.bodySM,
    fontFamily: typography.fontBodyStrong,
  },
  errorText: {
    color: colors.accentCoral,
    fontSize: typography.bodySM,
    fontFamily: typography.fontBodyRegular,
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: typography.bodySM,
    fontFamily: typography.fontBodyRegular,
  },
});
