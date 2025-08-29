import React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LogoUploadProps } from "../types";

export const LogoUpload: React.FC<LogoUploadProps> = ({
  logoUri,
  onUpload,
  onRemove,
  colors,
  styles,
}) => {
  return (
    <View style={styles.fieldContainer}>
      <Text style={[styles.fieldLabel, { color: colors.text }]}>
        Card Logo (Optional)
      </Text>

      {logoUri ? (
        <View style={styles.logoContainer}>
          <Image source={{ uri: logoUri }} style={styles.logoPreview} />
          <View style={styles.logoActions}>
            <TouchableOpacity
              onPress={onUpload}
              style={[styles.logoButton, { backgroundColor: colors.primary }]}
            >
              <Ionicons name="camera" size={16} color="white" />
              <Text style={styles.logoButtonText}>Change</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={onRemove}
              style={[styles.logoButton, { backgroundColor: colors.danger }]}
            >
              <Ionicons name="trash" size={16} color="white" />
              <Text style={styles.logoButtonText}>Remove</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <TouchableOpacity
          style={[
            styles.logoUploadButton,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
            },
          ]}
          onPress={onUpload}
        >
          <Ionicons
            name="image-outline"
            size={32}
            color={colors.primary}
            style={{ marginBottom: 8 }}
          />
          <Text style={[styles.logoUploadText, { color: colors.text }]}>
            Upload Card Logo
          </Text>
          <Text
            style={[styles.logoUploadSubtext, { color: colors.textSecondary }]}
          >
            JPG, PNG, WEBP (Max 5MB)
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};
