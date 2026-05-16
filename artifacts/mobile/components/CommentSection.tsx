import { Send, ThumbsUp } from "lucide-react-native";
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
import { commentsApi } from "@/services/api";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/context/AuthContext";

function CommentItem({ comment }: { comment: Comment }) {
  const colors = useColors();
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(comment.likes);

  const handleLike = () => {
    setLiked((prev) => {
      setLikes((l) => (prev ? l - 1 : l + 1));
      return !prev;
    });
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
            <Text style={[styles.likeCount, { color: liked ? colors.primary : colors.mutedForeground }]}>
              {likes}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.replyBtn}>
            <Text style={[styles.replyText, { color: colors.mutedForeground }]}>Reply</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

interface Props {
  videoId: string;
}

export function CommentSection({ videoId }: Props) {
  const colors = useColors();
  const { user } = useAuth();
  const [input, setInput] = useState("");
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);

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
    setPosting(true);
    try {
      const newComment = await commentsApi.create(videoId, text);
      setComments((prev) => [newComment, ...prev]);
      setInput("");
    } catch {
      // silently fail — user must be authenticated
    } finally {
      setPosting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: colors.foreground }]}>
        Comments ({comments.length})
      </Text>
      <View style={[styles.inputRow, { borderColor: colors.border }]}>
        <TextInput
          style={[styles.input, { color: colors.foreground }]}
          placeholder="Add a comment..."
          placeholderTextColor={colors.mutedForeground}
          value={input}
          onChangeText={setInput}
          multiline
        />
        <TouchableOpacity
          style={[styles.sendBtn, { backgroundColor: colors.primary, opacity: posting ? 0.6 : 1 }]}
          activeOpacity={0.8}
          onPress={handleSend}
          disabled={posting}
        >
          <Send size={14} color="#fff" strokeWidth={2} />
        </TouchableOpacity>
      </View>
      {loading ? (
        <ActivityIndicator size="small" color="#2563EB" style={{ marginTop: 12 }} />
      ) : comments.length === 0 ? (
        <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
          No comments yet. Be the first!
        </Text>
      ) : (
        comments.map((comment) => (
          <CommentItem key={comment.id} comment={comment} />
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
  avatar: { width: 32, height: 32, borderRadius: 16, flexShrink: 0 },
  commentBody: { flex: 1, gap: 3 },
  commentHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  commentAuthor: { fontSize: 13, fontWeight: "600" },
  commentTime: { fontSize: 11 },
  commentText: { fontSize: 13, lineHeight: 18 },
  commentActions: { flexDirection: "row", alignItems: "center", gap: 16, marginTop: 4 },
  likeBtn: { flexDirection: "row", alignItems: "center", gap: 4 },
  likeCount: { fontSize: 12 },
  replyBtn: {},
  replyText: { fontSize: 12, fontWeight: "500" },
});
