import React from 'react';
import {StyleSheet, Text, TextInput, TextInputProps, View} from 'react-native';
import {colors} from '../theme/colors';

type Props = TextInputProps & {
  label: string;
  error?: string;
};

export default function AppTextInput({label, error, style, ...props}: Props) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        placeholderTextColor={colors.textMuted}
        style={[styles.input, error ? styles.inputError : null, style]}
        {...props}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {gap: 8},
  label: {color: colors.textSecondary, fontSize: 13, fontWeight: '700'},
  input: {
    minHeight: 48,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.panel,
    color: colors.textPrimary,
    paddingHorizontal: 14,
  },
  inputError: {borderColor: colors.error},
  error: {color: colors.error, fontSize: 12},
});
