"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useI18n } from "@/app/i18n/I18nProvider";
import { useUserSession } from "@/app/common/userSession";
import type { HouseholdTask } from "@/lib/aws/schemas/householdTaskSchema";
import { DoneTaskItem } from "./components/DoneTaskItem";
import { PendingTaskItem } from "./components/PendingTaskItem";
import {
  createHouseholdTask,
  deleteHouseholdTask,
  listHouseholdTasks,
  markHouseholdTaskDone,
  updateHouseholdTaskDescription,
} from "./services/householdTasksApi";
import * as Sx from "./styles";

export default function HouseholdPage() {
  const { t } = useI18n();
  const { activeUser } = useUserSession();
  const [tasks, setTasks] = useState<HouseholdTask[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newDescription, setNewDescription] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [busyTaskId, setBusyTaskId] = useState<string | null>(null);
  const [taskToEdit, setTaskToEdit] = useState<HouseholdTask | null>(null);
  const [editDescription, setEditDescription] = useState("");
  const [taskToDelete, setTaskToDelete] = useState<HouseholdTask | null>(null);

  const loadTasks = useCallback(async () => {
    if (!activeUser) {
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const nextTasks = await listHouseholdTasks(activeUser.userId);
      setTasks(nextTasks);
    } catch {
      setError(t.household.loadError);
    } finally {
      setIsLoading(false);
    }
  }, [activeUser, t.household.loadError]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadTasks();
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [loadTasks]);

  const pendingTasks = useMemo(
    () => tasks.filter((task) => task.status === "pending"),
    [tasks],
  );
  const doneTasks = useMemo(
    () => tasks.filter((task) => task.status === "done"),
    [tasks],
  );

  const handleCreate = async () => {
    if (!activeUser) {
      return;
    }
    const description = newDescription.trim();
    if (!description) {
      setError(t.household.descriptionRequired);
      return;
    }
    setIsSaving(true);
    setError(null);
    try {
      const created = await createHouseholdTask(description, activeUser.userId);
      setTasks((current) =>
        [...current, created].sort((left, right) => left.creationDate.localeCompare(right.creationDate)),
      );
      setNewDescription("");
    } catch {
      setError(t.household.createError);
    } finally {
      setIsSaving(false);
    }
  };

  const handleMarkDone = async (task: HouseholdTask) => {
    if (!activeUser) {
      return;
    }
    setBusyTaskId(task.id);
    setError(null);
    try {
      const updated = await markHouseholdTaskDone(task.id, activeUser.userId);
      setTasks((current) =>
        current
          .map((item) => (item.id === updated.id ? updated : item))
          .sort((left, right) => left.creationDate.localeCompare(right.creationDate)),
      );
    } catch {
      setError(t.household.markDoneError);
    } finally {
      setBusyTaskId(null);
    }
  };

  const handleSaveEdit = async () => {
    if (!activeUser || !taskToEdit) {
      return;
    }
    const description = editDescription.trim();
    if (!description) {
      setError(t.household.descriptionRequired);
      return;
    }
    setBusyTaskId(taskToEdit.id);
    setError(null);
    try {
      const updated = await updateHouseholdTaskDescription(
        taskToEdit.id,
        description,
        activeUser.userId,
      );
      setTasks((current) => current.map((item) => (item.id === updated.id ? updated : item)));
      setTaskToEdit(null);
    } catch {
      setError(t.household.updateError);
    } finally {
      setBusyTaskId(null);
    }
  };

  const handleConfirmDelete = async () => {
    if (!activeUser || !taskToDelete) {
      return;
    }
    setBusyTaskId(taskToDelete.id);
    setError(null);
    try {
      await deleteHouseholdTask(taskToDelete.id, activeUser.userId);
      setTasks((current) => current.filter((item) => item.id !== taskToDelete.id));
      setTaskToDelete(null);
    } catch {
      setError(t.household.deleteError);
    } finally {
      setBusyTaskId(null);
    }
  };

  return (
    <Stack sx={Sx.pageStackSx}>
      <Stack sx={Sx.topBarContainerSx}>
        <Link href="/" style={{ textDecoration: "none" }}>
          <Button variant="contained" size="large" sx={Sx.backButtonSx}>
            {t.common.backToHome}
          </Button>
        </Link>
      </Stack>
      <Stack sx={Sx.contentStackSx}>
        <Typography variant="h4" sx={Sx.titleSx}>
          {t.household.title}
        </Typography>
        {!activeUser ? (
          <Alert severity="info">{t.household.selectUser}</Alert>
        ) : (
          <>
            {error ? <Alert severity="error">{error}</Alert> : null}
            <Stack
              component="form"
              onSubmit={(event) => {
                event.preventDefault();
                void handleCreate();
              }}
              sx={Sx.createRowSx}
            >
              <TextField
                label={t.household.descriptionLabel}
                value={newDescription}
                onChange={(event) => setNewDescription(event.target.value)}
                fullWidth
                sx={Sx.textFieldSx}
              />
              <Button
                type="submit"
                variant="contained"
                disabled={isSaving}
                sx={Sx.addButtonSx}
              >
                {t.household.addTask}
              </Button>
            </Stack>
            {isLoading ? (
              <Stack sx={Sx.loadingStackSx}>
                <CircularProgress sx={Sx.loadingProgressSx} />
              </Stack>
            ) : (
              <>
                <Typography variant="h6" sx={Sx.sectionTitleSx}>
                  {t.household.pendingSection}
                </Typography>
                <Stack sx={Sx.sectionStackSx}>
                  {pendingTasks.length === 0 ? (
                    <Typography sx={Sx.emptyStateSx}>{t.household.emptyPending}</Typography>
                  ) : (
                    pendingTasks.map((task) => (
                      <PendingTaskItem
                        key={task.id}
                        task={task}
                        busy={busyTaskId === task.id}
                        onMarkDone={(item) => void handleMarkDone(item)}
                        onEdit={(item) => {
                          setTaskToEdit(item);
                          setEditDescription(item.description);
                        }}
                        onDelete={setTaskToDelete}
                      />
                    ))
                  )}
                </Stack>
                <Typography variant="h6" sx={Sx.doneSectionTitleSx}>
                  {t.household.doneSection}
                </Typography>
                <Stack sx={Sx.sectionStackSx}>
                  {doneTasks.length === 0 ? (
                    <Typography sx={Sx.emptyStateSx}>{t.household.emptyDone}</Typography>
                  ) : (
                    doneTasks.map((task) => <DoneTaskItem key={task.id} task={task} />)
                  )}
                </Stack>
              </>
            )}
          </>
        )}
      </Stack>
      <Dialog open={Boolean(taskToEdit)} onClose={() => setTaskToEdit(null)} sx={Sx.dialogSx}>
        <DialogTitle>{t.household.edit}</DialogTitle>
        <DialogContent>
          <TextField
            label={t.household.descriptionLabel}
            value={editDescription}
            onChange={(event) => setEditDescription(event.target.value)}
            fullWidth
            sx={Sx.textFieldSx}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTaskToEdit(null)}>{t.household.cancel}</Button>
          <Button onClick={() => void handleSaveEdit()}>{t.household.save}</Button>
        </DialogActions>
      </Dialog>
      <Dialog open={Boolean(taskToDelete)} onClose={() => setTaskToDelete(null)} sx={Sx.dialogSx}>
        <DialogTitle>{t.household.delete}</DialogTitle>
        <DialogContent>
          <Typography>{t.household.deleteConfirm}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTaskToDelete(null)}>{t.household.cancel}</Button>
          <Button onClick={() => void handleConfirmDelete()}>{t.household.delete}</Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
