import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { COMMENTS, Comment } from "@/data/mockData";
import { useColors } from "@/hooks/useColors";

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
            <Ionicons
              name={liked ? "thumbs-up" : "thumbs-up-outline"}
              size={14}
              color={liked ? colors.primary : colors.mutedForeground}
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
          <TouchableOpacity style={styles.replyBtn}>
            <Text style={[styles.replyText, { color: colors.mutedForeground }]}>
              Reply
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

export function CommentSection() {
  const colors = useColors();
  const [input, setInput] = useState("");

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: colors.foreground }]}>
        Comments ({COMMENTS.length})
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
          style={[styles.sendBtn, { backgroundColor: colors.primary }]}
          activeOpacity={0.8}
          onPress={() => setInput("")}
        >
          <Ionicons name="send" size={16} color="#fff" />
        </TouchableOpacity>
      </View>

      {COMMENTS.map((comment) => (
        <CommentItem key={comment.id} comment={comment} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 12,
  },
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
  input: {
    flex: 1,
    fontSize: 14,
    maxHeight: 80,
  },
  sendBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  comment: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 14,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    flexShrink: 0,
  },
  commentBody: {
    flex: 1,
    gap: 3,
  },
  commentHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  commentAuthor: {
    fontSize: 13,
    fontWeight: "600",
  },
  commentTime: {
    fontSize: 11,
  },
  commentText: {
    fontSize: 13,
    lineHeight: 18,
  },
  commentActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginTop: 4,
  },
  likeBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  likeCount: {
    fontSize: 12,
  },
  replyBtn: {},
  replyText: {
    fontSize: 12,
    fontWeight: "500",
  },
});
