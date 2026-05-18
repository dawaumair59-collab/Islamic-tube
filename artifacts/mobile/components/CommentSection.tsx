import { ChevronDown, ChevronUp, Send, ThumbsUp, Trash2 } from "lucide-react-native";
import { Image } from "expo-image";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import type { Comment } from "@/data/mockData";
import { commentRepliesApi, commentsApi } from "@/services/api";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/context/AuthContext";

interface ReplyData {
  id: string;
  text: string;
  author: string;
  avatar: string;
  time: string;
  userId?: string;
}

interface CommentItemProps {
  comment: Comment;
  currentUserId?: string;
  onDelete: (id: string) => void;
  onAuthRequired?: (msg: string) => void;
}

function ReplyItem({
  reply,
  currentUserId,
  commentId,
  onDelete,
}: {
  reply: ReplyData;
  currentUserId?: string;
  commentId: string;
  onDelete: (id: string) => void;
}) {
  const colors = useColors();
  const [deleting, setDeleting] = useState(false);
  const isOwner = Boolean(currentUserId && reply.userId && currentUserId === reply.userId);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await commentRepliesApi.delete(reply.id);
      onDelete(reply.id);
    } catch {
      setDeleting(false);
    }
  };

  return (
    <View style={styles.reply}>
      <Image source={reply.avatar} style={styles.replyAvatar} contentFit="cover" />
      <View style={styles.commentBody}>
        <View style={styles.commentHeader}>
          <Text style={[styles.commentAuthor, { color: colors.foreground }]}>
            {reply.author}
          </Text>
          <Text style={[styles.commentTime, { color: colors.mutedForeground }]}>
            {reply.time}
          </Text>
          {isOwner && (
            <TouchableOpacity
              onPress={handleDelete}
              disabled={deleting}
              style={styles.deleteBtn}
            >
              <Trash2
                size={12}
                color={deleting ? colors.mutedForeground : "#EF4444"}
                strokeWidth={1.8}
              />
            </TouchableOpacity>
          )}
        </View>
        <Text style={[styles.commentText, { color: colors.foreground }]}>
          {reply.text}
        </Text>
      </View>
    </View>
  );
}

function CommentItem({ comment, currentUserId, onDelete, onAuthRequired }: CommentItemProps) {
  const colors = useColors();
  const { user } = useAuth();
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(comment.likes);
  const [deleting, setDeleting] = useState(false);
  const [showReplies, setShowReplies] = useState(false);
  const [replies, setReplies] = useState<ReplyData[]>([]);
  const [loadingReplies, setLoadingReplies] = useState(false);
  const [replyInput, setReplyInput] = useState("");
  const [postingReply, setPostingReply] = useState(false);
  const [showReplyInput, setShowReplyInput] = useState(false);

  const isOwner = Boolean(currentUserId && comment.userId && currentUserId === comment.userId);

  const handleLike = () => {
    setLiked((prev) => {
      setLikes((l) => (prev ? l - 1 : l + 1));
      return !prev;
    });
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await commentsApi.delete(comment.id);
      onDelete(comment.id);
    } catch {
      setDeleting(false);
    }
  };

  const handleToggleReplies = () => {
    if (!showReplies && replies.length === 0) {
      setLoadingReplies(true);
      commentRepliesApi
        .list(comment.id)
        .then((r) => setReplies(r.map((c: any) => ({
          id: c.id,
          text: c.text,
          author: c.author,
          avatar: c.avatar || "https://picsum.photos/seed/av/100/100",
          time: c.time,
          userId: c.userId,
        }))))
        .catch(() => {})
        .finally(() => setLoadingReplies(false));
    }
    setShowReplies((prev) => !prev);
  };

  const handleSendReply = async () => {
    const text = replyInput.trim();
    if (!text || postingReply) return;
    if (!user) {
      onAuthRequired?.("Sign in to reply");
      return;
    }
    setPostingReply(true);
    try {
      const newReply = await commentRepliesApi.create(comment.id, text);
      const mapped: ReplyData = {
        id: newReply.id,
        text: newReply.text,
        author: newReply.author,
        avatar: newReply.avatar || "https://picsum.photos/seed/av/100/100",
        time: newReply.time,
        userId: newReply.userId,
      };
      setReplies((prev) => [...prev, mapped]);
      setReplyInput("");
      setShowReplies(true);
    } catch {
    } finally {
      setPostingReply(false);
    }
  };

  return (
    <View style={styles.comment}>
      <Image source={comment.avatar} style={styles.avatar} contentFit="cover" />
      <View style={styles.commentBody}>
        <View style={styles.commentHeader}>
          <Text style={[styles.commentAuthor, { color: colors.foreground }]}>
            {comment.author}
          </Text>
          <Text style={[styles.commentTime, { color: colors.mutedForeground }]}>
            {comment.time}
          </Text>
          {isOwner && (
            <TouchableOpacity
              onPress={handleDelete}
              disabled={deleting}
              style={styles.deleteBtn}
            >
              <Trash2
                size={13}
                color={deleting ? colors.mutedForeground : "#EF4444"}
                strokeWidth={1.8}
              />
            </TouchableOpacity>
          )}
        </View>
        <Text style={[styles.commentText, { color: colors.foreground }]}>
          {comment.text}
        </Text>
        <View style={styles.commentActions}>
          <TouchableOpacity onPress={handleLike} style={styles.likeBtn}>
            <ThumbsUp
              size={14}
              color={liked ? colors.primary : colors.mutedForeground}
              fill={liked ? colors.primary : "transparent"}
              strokeWidth={1.8}
            />
            <Text
              style={[
                styles.likeCount,
                { color: liked ? colors.primary : colors.mutedForeground },
              ]}
            >
              {likes}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.replyBtn}
            onPress={() => {
              if (!user) {
                onAuthRequired?.("Sign in to reply");
                return;
              }
              setShowReplyInput((prev) => !prev);
            }}
          >
            <Text style={[styles.replyText, { color: colors.mutedForeground }]}>
              Reply
            </Text>
          </TouchableOpacity>
          {replies.length > 0 || showReplies ? (
            <TouchableOpacity onPress={handleToggleReplies} style={styles.replyBtn}>
              {showReplies ? (
                <ChevronUp size={13} color={colors.primary} strokeWidth={2} />
              ) : (
                <ChevronDown size={13} color={colors.primary} strokeWidth={2} />
              )}
              <Text style={[styles.replyText, { color: colors.primary }]}>
                {replies.length > 0 ? `${replies.length} ${replies.length === 1 ? "reply" : "replies"}` : "replies"}
              </Text>
            </TouchableOpacity>
          ) : null}
        </View>

        {showReplyInput && (
          <View style={[styles.replyInputRow, { borderColor: colors.border }]}>
            <TextInput
              style={[styles.replyInputField, { color: colors.foreground }]}
              placeholder="Write a reply..."
              placeholderTextColor={colors.mutedForeground}
              value={replyInput}
              onChangeText={setReplyInput}
              autoFocus
            />
            <TouchableOpacity
              style={[
                styles.sendBtn,
                { backgroundColor: colors.primary, opacity: postingReply ? 0.6 : 1 },
              ]}
              onPress={handleSendReply}
              disabled={postingReply}
            >
              <Send size={12} color="#fff" strokeWidth={2} />
            </TouchableOpacity>
          </View>
        )}

        {showReplies && (
          <View style={styles.repliesContainer}>
            {loadingReplies ? (
              <ActivityIndicator size="small" color="#2563EB" />
            ) : replies.length === 0 ? (
              <Text style={[styles.commentTime, { color: colors.mutedForeground }]}>
                No replies yet
              </Text>
            ) : (
              replies.map((r) => (
                <ReplyItem
                  key={r.id}
                  reply={r}
                  currentUserId={currentUserId}
                  commentId={comment.id}
                  onDelete={(rid) => setReplies((prev) => prev.filter((x) => x.id !== rid))}
                />
              ))
            )}
          </View>
        )}
      </View>
    </View>
  );
}

interface Props {
  videoId: string;
  onAuthRequired?: (message: string) => void;
}

export function CommentSection({ videoId, onAuthRequired }: Props) {
  const colors = useColors();
  const { user } = useAuth();
  const [input, setInput] = useState("");
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);

  const currentUserId = user ? String((user as any).id ?? "") : undefined;

  useEffect(() => {
    if (!videoId) return;
    setLoading(true);
    commentsApi
      .list(videoId)
      .then(setComments)
      .catch(() => setComments([]))
      .finally(() => setLoading(false));
  }, [videoId]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || posting) return;

    if (!user) {
      onAuthRequired?.("Sign in to post a comment");
      return;
    }

    setPosting(true);
    try {
      const newComment = await commentsApi.create(videoId, text);
      setComments((prev) => [newComment, ...prev]);
      setInput("");
    } catch {
    } finally {
      setPosting(false);
    }
  };

  const handleDelete = (id: string) => {
    setComments((prev) => prev.filter((c) => c.id !== id));
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: colors.foreground }]}>
        Comments ({comments.length})
      </Text>
      <View style={[styles.inputRow, { borderColor: colors.border }]}>
        <TextInput
          style={[styles.input, { color: colors.foreground }]}
          placeholder={user ? "Add a comment..." : "Sign in to comment..."}
          placeholderTextColor={colors.mutedForeground}
          value={input}
          onChangeText={setInput}
          onFocus={() => {
            if (!user) {
              onAuthRequired?.("Sign in to post a comment");
            }
          }}
          multiline
          editable={Boolean(user)}
        />
        <TouchableOpacity
          style={[
            styles.sendBtn,
            {
              backgroundColor: user ? colors.primary : colors.secondary,
              opacity: posting ? 0.6 : 1,
            },
          ]}
          activeOpacity={0.8}
          onPress={handleSend}
          disabled={posting || !user}
        >
          <Send size={14} color={user ? "#fff" : colors.mutedForeground} strokeWidth={2} />
        </TouchableOpacity>
      </View>
      {loading ? (
        <ActivityIndicator
          size="small"
          color="#2563EB"
          style={{ marginTop: 12 }}
        />
      ) : comments.length === 0 ? (
        <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
          No comments yet. Be the first!
        </Text>
      ) : (
        comments.map((comment) => (
          <CommentItem
            key={comment.id}
            comment={comment}
            currentUserId={currentUserId}
            onDelete={handleDelete}
            onAuthRequired={onAuthRequired}
          />
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingTop: 16 },
  title: { fontSize: 16, fontWeight: "700", marginBottom: 12 },
  inputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 16,
    gap: 8,
  },
  input: { flex: 1, fontSize: 14, maxHeight: 80 },
  sendBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: { fontSize: 13, textAlign: "center", paddingVertical: 16 },
  comment: { flexDirection: "row", gap: 10, marginBottom: 14 },
  reply: { flexDirection: "row", gap: 8, marginBottom: 8 },
  avatar: { width: 32, height: 32, borderRadius: 16, flexShrink: 0 },
  replyAvatar: { width: 24, height: 24, borderRadius: 12, flexShrink: 0 },
  commentBody: { flex: 1, gap: 3 },
  commentHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  commentAuthor: { fontSize: 13, fontWeight: "600" },
  commentTime: { fontSize: 11 },
  deleteBtn: { marginLeft: "auto", padding: 2 },
  commentText: { fontSize: 13, lineHeight: 18 },
  commentActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginTop: 4,
  },
  likeBtn: { flexDirection: "row", alignItems: "center", gap: 4 },
  likeCount: { fontSize: 12 },
  replyBtn: { flexDirection: "row", alignItems: "center", gap: 3 },
  replyText: { fontSize: 12, fontWeight: "500" },
  repliesContainer: { marginTop: 8, paddingLeft: 4, gap: 6 },
  replyInputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginTop: 8,
    gap: 8,
  },
  replyInputField: { flex: 1, fontSize: 13 },
});
