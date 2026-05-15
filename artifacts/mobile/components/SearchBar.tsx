import { Mic, Search, XCircle } from "lucide-react-native";
import React from "react";
import {
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { useColors } from "@/hooks/useColors";

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onSubmit?: () => void;
  onVoice?: () => void;
  autoFocus?: boolean;
}

export function SearchBar({
  value,
  onChangeText,
  placeholder = "Search Islamic content...",
  onSubmit,
  onVoice,
  autoFocus = false,
}: SearchBarProps) {
  const colors = useColors();

  return (
    <View style={styles.container}>
      <Search size={18} color={colors.mutedForeground} strokeWidth={1.8} />
      <TextInput
        style={[styles.input, { color: colors.foreground }]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.mutedForeground}
        onSubmitEditing={onSubmit}
        returnKeyType="search"
        autoFocus={autoFocus}
        autoCorrect={false}
        autoCapitalize="none"
      />
      {value.length > 0 ? (
        <TouchableOpacity onPress={() => onChangeText("")}>
          <XCircle size={18} color={colors.mutedForeground} strokeWidth={1.8} />
        </TouchableOpacity>
      ) : (
        onVoice && (
          <TouchableOpacity onPress={onVoice}>
            <Mic size={18} color={colors.mutedForeground} strokeWidth={1.8} />
          </TouchableOpacity>
        )
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderRadius: 24,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    backgroundColor: "#F5F5F5",
    borderColor: "#E5E5E5",
  },
  input: {
    flex: 1,
    fontSize: 14,
    padding: 0,
  },
});
