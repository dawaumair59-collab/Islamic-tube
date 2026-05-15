import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { HERO_BANNERS } from "@/data/mockData";
import { useColors } from "@/hooks/useColors";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export function HeroBanner() {
  const colors = useColors();
  const [current, setCurrent] = useState(0);
  const listRef = useRef<FlatList>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => {
        const next = (prev + 1) % HERO_BANNERS.length;
        listRef.current?.scrollToIndex({ index: next, animated: true });
        return next;
      });
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <View style={styles.container}>
      <FlatList
        ref={listRef}
        data={HERO_BANNERS}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEnabled={false}
        keyExtractor={(item) => item.id}
        onMomentumScrollEnd={(e) => {
          const idx = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
          setCurrent(idx);
        }}
        renderItem={({ item }) => (
          <TouchableOpacity activeOpacity={0.95} style={styles.slide}>
            <Image source={item.image} style={styles.image} contentFit="cover" />
            <LinearGradient
              colors={["transparent", "rgba(0,0,0,0.85)"]}
              style={styles.gradient}
            />
            <View style={styles.textContent}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.subtitle}>{item.subtitle}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
      <View style={styles.dots}>
        {HERO_BANNERS.map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              {
                backgroundColor: i === current ? "#fff" : "rgba(255,255,255,0.4)",
                width: i === current ? 20 : 6,
              },
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 210,
    position: "relative",
  },
  slide: {
    width: SCREEN_WIDTH,
    height: 210,
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  gradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 130,
  },
  textContent: {
    position: "absolute",
    bottom: 30,
    left: 16,
    right: 16,
  },
  title: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 4,
  },
  subtitle: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 13,
  },
  dots: {
    position: "absolute",
    bottom: 10,
    alignSelf: "center",
    flexDirection: "row",
    gap: 5,
    alignItems: "center",
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
});
