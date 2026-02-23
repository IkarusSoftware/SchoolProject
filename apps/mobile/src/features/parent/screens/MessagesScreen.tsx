import { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { useToast } from "../../../components/feedback/ToastProvider";
import { GradientLayout } from "../../../components/layout/GradientLayout";
import { InfoRow } from "../../../components/ui/InfoRow";
import { SectionCard } from "../../../components/ui/SectionCard";
import { colors, radius, spacing, typography } from "../../../theme";
import { formatDateTime } from "../../../utils/format";
import { useParentMock } from "../mock/ParentMockProvider";

export function MessagesScreen() {
  const { showToast } = useToast();
  const {
    profile,
    conversations,
    getThread,
    markConversationRead,
    markAllConversationsRead,
    toggleConversationPinned,
    sendMessage,
  } = useParentMock();
  const [selectedConversationId, setSelectedConversationId] = useState(
    conversations[0]?.id ?? ""
  );
  const [draftMessage, setDraftMessage] = useState("");

  const activeConversation = useMemo(
    () =>
      conversations.find((conversation) => conversation.id === selectedConversationId) ??
      conversations[0],
    [conversations, selectedConversationId]
  );

  const thread = useMemo(
    () => (activeConversation ? getThread(activeConversation.id) : []),
    [activeConversation, getThread]
  );

  return (
    <GradientLayout
      title="Messages"
      subtitle={`${profile.parentName} - Parent inbox`}
    >
      <SectionCard title="Conversation Controls" subtitle="Organize inbox">
        <View style={styles.controlRow}>
          <Pressable
            style={({ pressed }) => [
              styles.controlButton,
              pressed ? styles.controlButtonPressed : null,
            ]}
            onPress={() => {
              markAllConversationsRead();
              showToast({ message: "All conversations marked as read.", tone: "success" });
            }}
          >
            <Text style={styles.controlButtonText}>Mark all read</Text>
          </Pressable>
          {activeConversation ? (
            <Pressable
              style={({ pressed }) => [
                styles.controlButton,
                pressed ? styles.controlButtonPressed : null,
              ]}
              onPress={() => {
                toggleConversationPinned(activeConversation.id);
                showToast({
                  message: activeConversation.isPinned
                    ? "Thread removed from pinned."
                    : "Thread pinned at top.",
                  tone: "info",
                });
              }}
            >
              <Text style={styles.controlButtonText}>
                {activeConversation.isPinned ? "Unpin thread" : "Pin thread"}
              </Text>
            </Pressable>
          ) : null}
        </View>
      </SectionCard>

      <SectionCard title="Conversations" subtitle="Tap to open" animateDelayMs={80}>
        {conversations.length === 0 ? (
          <Text style={styles.emptyText}>No conversation available.</Text>
        ) : null}
        {conversations.map((conversation) => {
          const selected = conversation.id === activeConversation?.id;
          return (
            <Pressable
              key={conversation.id}
              onPress={() => {
                setSelectedConversationId(conversation.id);
                markConversationRead(conversation.id);
                showToast({
                  message: `${conversation.participant} thread opened.`,
                  tone: "info",
                  durationMs: 1200,
                });
              }}
              style={({ pressed }) => [
                styles.conversationCard,
                selected ? styles.conversationCardActive : null,
                pressed ? styles.conversationCardPressed : null,
              ]}
            >
              <InfoRow
                title={`${conversation.participant} - ${conversation.participantRole}`}
                detail={`${conversation.preview} - ${formatDateTime(conversation.lastMessageAt)}`}
                badgeText={
                  conversation.unreadCount > 0
                    ? `${conversation.unreadCount} new`
                    : conversation.isPinned
                      ? "Pinned"
                      : undefined
                }
                badgeTone={conversation.unreadCount > 0 ? "ok" : "info"}
              />
            </Pressable>
          );
        })}
      </SectionCard>

      {activeConversation ? (
        <SectionCard
          title={`${activeConversation.participant} Thread`}
          subtitle={`Online: ${activeConversation.isOnline ? "Yes" : "No"}`}
          animateDelayMs={160}
        >
          {thread.length === 0 ? (
            <Text style={styles.emptyText}>No message in this thread.</Text>
          ) : null}

          {thread.map((entry) => (
            <View
              key={entry.id}
              style={[
                styles.messageBubble,
                entry.sender === "PARENT"
                  ? styles.messageBubbleParent
                  : styles.messageBubbleSchool,
              ]}
            >
              <Text
                style={[
                  styles.messageSender,
                  entry.sender === "PARENT"
                    ? styles.messageSenderParent
                    : styles.messageSenderSchool,
                ]}
              >
                {entry.sender === "PARENT" ? "You" : activeConversation.participant}
              </Text>
              <Text
                style={[
                  styles.messageContent,
                  entry.sender === "PARENT"
                    ? styles.messageContentParent
                    : styles.messageContentSchool,
                ]}
              >
                {entry.content}
              </Text>
              <Text
                style={[
                  styles.messageTime,
                  entry.sender === "PARENT"
                    ? styles.messageTimeParent
                    : styles.messageTimeSchool,
                ]}
              >
                {formatDateTime(entry.createdAt)}
              </Text>
            </View>
          ))}

          <View style={styles.composerWrap}>
            <TextInput
              value={draftMessage}
              onChangeText={setDraftMessage}
              placeholder="Write a message..."
              placeholderTextColor="#67859a"
              multiline
              style={styles.composerInput}
            />
            <Pressable
              style={({ pressed }) => [
                styles.sendButton,
                pressed ? styles.sendButtonPressed : null,
              ]}
              onPress={() => {
                const content = draftMessage.trim();
                if (!content || !activeConversation) return;
                sendMessage(activeConversation.id, content);
                setDraftMessage("");
                showToast({ message: "Message sent.", tone: "success" });
              }}
            >
              <Text style={styles.sendButtonText}>Send</Text>
            </Pressable>
          </View>
        </SectionCard>
      ) : null}
    </GradientLayout>
  );
}

const styles = StyleSheet.create({
  controlRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  controlButton: {
    flex: 1,
    minHeight: 40,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: "#bcd3e4",
    backgroundColor: "#eff8ff",
    alignItems: "center",
    justifyContent: "center",
  },
  controlButtonPressed: {
    opacity: 0.92,
    transform: [{ scale: 0.98 }],
  },
  controlButtonText: {
    color: colors.textPrimary,
    fontSize: typography.bodySM,
    fontFamily: typography.fontBodyStrong,
  },
  conversationCard: {
    borderRadius: radius.md,
  },
  conversationCardActive: {
    borderWidth: 1,
    borderColor: colors.accentBlue,
    padding: 3,
    backgroundColor: "#eef8ff",
  },
  conversationCardPressed: {
    opacity: 0.92,
    transform: [{ scale: 0.99 }],
  },
  messageBubble: {
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: 4,
  },
  messageBubbleParent: {
    backgroundColor: "#e8f4ff",
    borderWidth: 1,
    borderColor: "#c8dff2",
    alignSelf: "flex-end",
    maxWidth: "85%",
  },
  messageBubbleSchool: {
    backgroundColor: "#f6fbff",
    borderWidth: 1,
    borderColor: "#d6e6f2",
    alignSelf: "flex-start",
    maxWidth: "85%",
  },
  messageSender: {
    fontSize: typography.bodyXS,
    fontFamily: typography.fontBodyStrong,
  },
  messageSenderParent: {
    color: colors.accentBlue,
  },
  messageSenderSchool: {
    color: colors.textMuted,
  },
  messageContent: {
    fontSize: typography.bodySM,
    fontFamily: typography.fontBodyRegular,
    lineHeight: 18,
  },
  messageContentParent: {
    color: colors.textPrimary,
  },
  messageContentSchool: {
    color: colors.textPrimary,
  },
  messageTime: {
    fontSize: typography.bodyXS,
    fontFamily: typography.fontBodyRegular,
  },
  messageTimeParent: {
    color: "#3b6d8f",
  },
  messageTimeSchool: {
    color: "#69859a",
  },
  composerWrap: {
    marginTop: spacing.sm,
    gap: spacing.sm,
  },
  composerInput: {
    minHeight: 82,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: "#c3d7e7",
    backgroundColor: "#f8fcff",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    color: colors.textPrimary,
    fontSize: typography.bodyMD,
    fontFamily: typography.fontBody,
    textAlignVertical: "top",
  },
  sendButton: {
    alignSelf: "flex-end",
    borderRadius: radius.pill,
    backgroundColor: colors.accentBlueStrong,
    paddingHorizontal: spacing.md + 4,
    paddingVertical: spacing.xs + 2,
  },
  sendButtonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  sendButtonText: {
    color: colors.textWhite,
    fontSize: typography.bodySM,
    fontFamily: typography.fontBodyStrong,
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: typography.bodySM,
    fontFamily: typography.fontBodyRegular,
  },
});
