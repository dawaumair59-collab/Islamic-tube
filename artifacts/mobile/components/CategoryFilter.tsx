import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
} from "react-native";

import { useColors } from "@/hooks/useColors";

interface CategoryFilterProps {
  categories: string[];
  selected: string;
  onSelect: (cat: string) => void;
}

export function CategoryFilter({ categories, selected, onSelect }: CategoryFilterProps) {
  const colors = useColors();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {categories.map((cat) => {
        const isSelected = cat === selected;
        return (
          <TouchableOpacity
            key={cat}
            style={[
              styles.chip,
              {
                backgroundColor: isSelected ? colors.primary : colors.secondary,
                borderColor: isSelected ? colors.primary : colors.border,
              },
            ]}
            activeOpacity={0.8}
            onPress={() => onSelect(cat)}
          >
            <Text
              style={[
                styles.chipText,
                {
                  color: isSelected ? colors.primaryForeground : colors.foreground,
                  fontWeight: isSelected ? "600" : "400",
                },
              ]}
            >
              {cat}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    gap: 8,
    paddingVertical: 4,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 13,
  },
});
