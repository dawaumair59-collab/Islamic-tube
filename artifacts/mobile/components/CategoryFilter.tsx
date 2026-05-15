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
                backgroundColor: isSelected ? colors.chipActive : colors.chipInactive,
              },
            ]}
            activeOpacity={0.8}
            onPress={() => onSelect(cat)}
          >
            <Text
              style={[
                styles.chipText,
                {
                  color: isSelected ? colors.chipActiveText : colors.chipInactiveText,
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
    paddingHorizontal: 12,
    gap: 8,
    paddingVertical: 6,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  chipText: {
    fontSize: 13,
  },
});
