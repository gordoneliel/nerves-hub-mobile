import React, { useCallback, useLayoutEffect, useState } from "react";
import { Alert, FlatList, StyleSheet, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import ContextMenu from "react-native-context-menu-view";
import { useQueryClient } from "@tanstack/react-query";

import { spacing } from "../../components/tokens";
import { useTheme } from "../../theme/ThemeProvider";
import { Typography } from "../../components/typography";
import { Card } from "../../components/card";
import { TextInput } from "../../components/text-input";
import { Button } from "../../components/button";
import { EmptyView, ErrorView, LoadingView } from "../../components/ui";
import { Tag } from "../../components/tag";
import { useOrgProduct } from "../../context/OrgProductContext";
import {
  useListOrgUsers,
  getListOrgUsersQueryKey,
  useInviteOrgUser,
  useUpdateOrgUser,
  useRemoveOrgUser,
} from "../../api/generated/org-users/org-users";
import type {
  OrgUser,
  OrgUserUpdateRequestRole,
} from "../../api/generated/schemas";

import UserIcon from "../../../assets/icons/user-regular.svg";

const ROLES: OrgUserUpdateRequestRole[] = ["admin", "manage", "view"];

export default function OrgUsersScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const { orgId } = useOrgProduct();
  const queryClient = useQueryClient();

  useLayoutEffect(() => {
    navigation.setOptions({ title: `${orgId} Users` });
  }, [navigation, orgId]);

  const [inviteEmail, setInviteEmail] = useState("");
  const [inviting, setInviting] = useState(false);

  const usersQuery = useListOrgUsers(orgId ?? "", {
    query: { enabled: !!orgId, staleTime: 30_000 },
  });

  const inviteUser = useInviteOrgUser();
  const updateUser = useUpdateOrgUser();
  const removeUser = useRemoveOrgUser();

  const invalidate = useCallback(() => {
    if (orgId) {
      queryClient.invalidateQueries({
        queryKey: getListOrgUsersQueryKey(orgId),
      });
    }
  }, [orgId, queryClient]);

  const handleInvite = useCallback(async () => {
    const email = inviteEmail.trim();
    if (!email || !orgId) return;
    setInviting(true);
    inviteUser.mutate(
      { orgName: orgId, data: { email, role: "view" } },
      {
        onSuccess: () => {
          Alert.alert("Invited", `Invitation sent to ${email}.`);
          setInviteEmail("");
          invalidate();
        },
        onError: (err: any) => {
          const msg =
            err?.response?.data?.errors ||
            err?.message ||
            "Failed to invite user.";
          Alert.alert(
            "Error",
            typeof msg === "string" ? msg : JSON.stringify(msg),
          );
        },
        onSettled: () => setInviting(false),
      },
    );
  }, [inviteEmail, orgId, inviteUser, invalidate]);

  const handleChangeRole = useCallback(
    (user: OrgUser, newRole: OrgUserUpdateRequestRole) => {
      if (!orgId || !user.email || user.role === newRole) return;
      updateUser.mutate(
        { orgName: orgId, userEmail: user.email, data: { role: newRole } },
        {
          onSuccess: () => {
            invalidate();
          },
          onError: () => Alert.alert("Error", "Failed to update role."),
        },
      );
    },
    [orgId, updateUser, invalidate],
  );

  const handleRemove = useCallback(
    (user: OrgUser) => {
      if (!orgId || !user.email) return;
      Alert.alert(
        "Remove User",
        `Remove ${user.name || user.email} from this organization?`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Remove",
            style: "destructive",
            onPress: () => {
              removeUser.mutate(
                { orgName: orgId, userEmail: user.email! },
                {
                  onSuccess: invalidate,
                  onError: () => Alert.alert("Error", "Failed to remove user."),
                },
              );
            },
          },
        ],
      );
    },
    [orgId, removeUser, invalidate],
  );

  const users = usersQuery.data?.data ?? [];

  if (usersQuery.isLoading) return <LoadingView message="Loading users..." />;
  if (usersQuery.isError)
    return (
      <ErrorView
        message="Failed to load users"
        onRetry={() => usersQuery.refetch()}
      />
    );

  const renderUser = ({ item }: { item: OrgUser }) => {
    const roleActions = ROLES.filter((r) => r !== item.role).map((r) => ({
      title: `Change to ${r}`,
      systemIcon: "person.badge.key",
    }));
    const allActions = [
      ...roleActions,
      {
        title: "Remove from organization",
        systemIcon: "trash",
        destructive: true,
      },
    ];

    return (
      <ContextMenu
        actions={allActions}
        onPress={(e) => {
          const idx = e.nativeEvent.index;
          if (idx < roleActions.length) {
            const newRole = ROLES.filter((r) => r !== item.role)[idx];
            handleChangeRole(item, newRole);
          } else {
            handleRemove(item);
          }
        }}
        dropdownMenuMode
      >
        <Card>
          <View style={styles.userRow}>
            <View style={styles.userIcon}>
              <UserIcon width={18} height={18} color={colors.textSecondary} />
            </View>
            <View style={styles.userInfo}>
              <Typography
                type="subheader"
                fontSize={16}
                fontWeight="600"
                lineHeight={22}
              >
                {item.name || item.email}
              </Typography>
              {item.name ? (
                <Typography
                  type="body"
                  fontSize={12}
                  color={colors.textSecondary}
                >
                  {item.email}
                </Typography>
              ) : null}
            </View>
            <Tag
              label={item.role ?? "view"}
              size="sm"
              colorScheme="white"
              hasBorder
            />
          </View>
        </Card>
      </ContextMenu>
    );
  };

  return (
    <FlatList
      style={[styles.container, { backgroundColor: colors.background }]}
      data={users}
      keyExtractor={(item) => item.email ?? ""}
      renderItem={renderUser}
      contentContainerStyle={styles.list}
      contentInsetAdjustmentBehavior="automatic"
      ItemSeparatorComponent={() => <View style={{ height: 3 }} />}
      ListHeaderComponent={
        <View style={styles.header}>
          <Typography
            type="caption"
            fontSize={12}
            color={colors.textTertiary}
            paddingBottom={spacing.sm}
          >
            Invite User
          </Typography>
          <View style={styles.inviteRow}>
            <View style={{ flex: 1 }}>
              <TextInput
                value={inviteEmail}
                onChangeText={setInviteEmail}
                placeholder="user@example.com"
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                clearButtonMode="always"
              />
            </View>
            <Button
              label="Invite"
              type="primary"
              size="sm"
              onPress={handleInvite}
              isLoading={inviting}
              disabled={!inviteEmail.trim()}
            />
          </View>
        </View>
      }
      ListEmptyComponent={
        <EmptyView
          title="No Users"
          message="This organization has no users yet."
        />
      }
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  list: {
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  header: {
    paddingBottom: spacing.lg,
  },
  inviteRow: {
    flexDirection: "row",
    gap: spacing.sm,
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  userRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  userIcon: {
    padding: 8,
    borderRadius: 10,
    borderCurve: "continuous",
  },
  userInfo: {
    flex: 1,
  },
});
