"use client";

import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import EditIcon from "@mui/icons-material/Edit";
import {
    Alert,
    Button,
    Chip,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    Stack,
    TextField,
    Typography,
} from "@mui/material";
import { useState } from "react";
import { useCategories } from "@/app/common/categoriesSession";
import { useUserSession } from "@/app/common/userSession";
import { useI18n } from "@/app/i18n/I18nProvider";
import { getCategoryLabel } from "@/app/i18n/translations";
import type { UserCategory } from "@/lib/aws/schemas/categorySchema";
import {
    createCategory,
    deleteCategory,
    renameCategory,
} from "../services/categoriesApi";
import * as Sx from "../styles";

interface ManageCategoriesModalProps {
    open: boolean;
    onClose: () => void;
}

/** Compara nombres de categoría ignorando mayúsculas y espacios extremos. */
export const normalizeCategoryName = (name: string) => name.trim().toLowerCase();

const ManageCategoriesModal = ({ open, onClose }: ManageCategoriesModalProps) => {
    const { t } = useI18n();
    const { activeUser } = useUserSession();
    const { categories, isLoading, reload } = useCategories();

    const [newName, setNewName] = useState("");
    const [createError, setCreateError] = useState<string | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editingName, setEditingName] = useState("");
    const [confirmingDeleteId, setConfirmingDeleteId] = useState<string | null>(null);
    const [actionError, setActionError] = useState<string | null>(null);
    const [pendingActionId, setPendingActionId] = useState<string | null>(null);

    const userId = activeUser?.userId ?? "";

    const isDuplicate = (name: string, excludedId?: string) =>
        categories.some(
            (category) =>
                category.id !== excludedId &&
                normalizeCategoryName(category.name) === normalizeCategoryName(name)
        );

    const handleCreate = async () => {
        const name = newName.trim();
        if (!name) {
            setCreateError(t.categoriesManager.requiredCategoryNameError);
            return;
        }
        if (isDuplicate(name)) {
            setCreateError(t.categoriesManager.duplicateCategoryError);
            return;
        }
        if (!userId) {
            return;
        }

        setIsCreating(true);
        setCreateError(null);
        try {
            await createCategory(name, userId);
            setNewName("");
            await reload();
        } catch (error) {
            setCreateError(error instanceof Error ? error.message : t.categoriesManager.addCategory);
        } finally {
            setIsCreating(false);
        }
    };

    const handleStartRename = (category: UserCategory) => {
        setEditingId(category.id);
        setEditingName(category.name);
        setActionError(null);
    };

    const handleCancelRename = () => {
        setEditingId(null);
        setEditingName("");
    };

    const handleSaveRename = async (category: UserCategory) => {
        const name = editingName.trim();
        if (!name) {
            setActionError(t.categoriesManager.requiredCategoryNameError);
            return;
        }
        if (isDuplicate(name, category.id)) {
            setActionError(t.categoriesManager.duplicateCategoryError);
            return;
        }
        if (!userId) {
            return;
        }

        setPendingActionId(category.id);
        setActionError(null);
        try {
            await renameCategory(category.id, name, userId);
            handleCancelRename();
            await reload();
        } catch (error) {
            setActionError(error instanceof Error ? error.message : t.categoriesManager.renameCategory);
        } finally {
            setPendingActionId(null);
        }
    };

    const handleConfirmDelete = async (category: UserCategory) => {
        if (!userId) {
            return;
        }

        setPendingActionId(category.id);
        setActionError(null);
        try {
            await deleteCategory(category.id, userId);
            setConfirmingDeleteId(null);
            await reload();
        } catch (error) {
            setActionError(error instanceof Error ? error.message : t.categoriesManager.deleteCategory);
        } finally {
            setPendingActionId(null);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" sx={Sx.dialogSx}>
            <DialogTitle>{t.categoriesManager.manageCategories}</DialogTitle>
            <DialogContent>
                <Stack spacing={2} sx={Sx.categoriesManagerContentStackSx}>
                    <Stack direction="row" spacing={1} sx={Sx.categoriesManagerCreateRowSx}>
                        <TextField
                            label={t.categoriesManager.newCategoryNameLabel}
                            value={newName}
                            onChange={(event) => setNewName(event.target.value)}
                            fullWidth
                            sx={Sx.textFieldSx}
                        />
                        <Button
                            variant="contained"
                            onClick={handleCreate}
                            disabled={isCreating || !userId}
                            sx={Sx.categoriesManagerCreateButtonSx}
                        >
                            {isCreating ? t.categoriesManager.creatingCategory : t.categoriesManager.addCategory}
                        </Button>
                    </Stack>
                    {createError ? <Alert severity="error">{createError}</Alert> : null}
                    {actionError ? <Alert severity="error">{actionError}</Alert> : null}
                    {isLoading ? (
                        <CircularProgress sx={Sx.categoriesManagerLoadingProgressSx} />
                    ) : categories.length === 0 ? (
                        <Typography sx={Sx.categoriesManagerEmptySx}>
                            {t.categoriesManager.noCategories}
                        </Typography>
                    ) : (
                        categories.map((category) => (
                            <Stack
                                key={category.id}
                                direction="row"
                                spacing={1}
                                sx={Sx.categoriesManagerCategoryRowSx}
                            >
                                {editingId === category.id ? (
                                    <>
                                        <TextField
                                            value={editingName}
                                            onChange={(event) => setEditingName(event.target.value)}
                                            fullWidth
                                            size="small"
                                            autoFocus
                                            sx={Sx.textFieldSx}
                                        />
                                        <IconButton
                                            onClick={() => handleSaveRename(category)}
                                            disabled={pendingActionId === category.id}
                                            aria-label={t.categoriesManager.renameCategory}
                                            sx={Sx.categoriesManagerSaveButtonSx}
                                        >
                                            <CheckIcon fontSize="small" />
                                        </IconButton>
                                        <IconButton
                                            onClick={handleCancelRename}
                                            disabled={pendingActionId === category.id}
                                            aria-label={t.management.cancel}
                                            sx={Sx.categoriesManagerCancelButtonSx}
                                        >
                                            <CloseIcon fontSize="small" />
                                        </IconButton>
                                    </>
                                ) : confirmingDeleteId === category.id ? (
                                    <>
                                        <Typography sx={Sx.categoriesManagerDeleteConfirmTextSx}>
                                            {t.categoriesManager.deleteCategoryConfirmMessage}
                                        </Typography>
                                        <Button
                                            onClick={() => handleConfirmDelete(category)}
                                            disabled={pendingActionId === category.id}
                                            size="small"
                                            sx={Sx.confirmDeleteButtonSx}
                                        >
                                            {t.categoriesManager.deleteCategory}
                                        </Button>
                                        <Button
                                            onClick={() => setConfirmingDeleteId(null)}
                                            disabled={pendingActionId === category.id}
                                            size="small"
                                            sx={Sx.outlinedButtonSx}
                                        >
                                            {t.management.cancel}
                                        </Button>
                                    </>
                                ) : (
                                    <>
                                        <Typography sx={Sx.categoriesManagerCategoryNameSx}>
                                            {getCategoryLabel(category, t)}
                                        </Typography>
                                        {category.isLocked ? (
                                            <Chip
                                                label={t.categoriesManager.lockedCategory}
                                                size="small"
                                                sx={Sx.categoriesManagerLockedChipSx}
                                            />
                                        ) : null}
                                        {!category.isLocked ? (
                                            <Stack direction="row" spacing={0.5} sx={Sx.categoriesManagerRowActionsSx}>
                                                <IconButton
                                                    onClick={() => handleStartRename(category)}
                                                    aria-label={t.categoriesManager.renameCategoryAria}
                                                    size="small"
                                                    sx={Sx.categoriesManagerIconButtonSx}
                                                >
                                                    <EditIcon fontSize="small" />
                                                </IconButton>
                                                <IconButton
                                                    onClick={() => {
                                                        setConfirmingDeleteId(category.id);
                                                        setActionError(null);
                                                    }}
                                                    aria-label={t.categoriesManager.deleteCategoryAria}
                                                    size="small"
                                                    sx={Sx.categoriesManagerDeleteButtonSx}
                                                >
                                                    <DeleteOutlinedIcon fontSize="small" />
                                                </IconButton>
                                            </Stack>
                                        ) : null}
                                    </>
                                )}
                            </Stack>
                        ))
                    )}
                </Stack>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} sx={Sx.outlinedButtonSx}>
                    {t.management.close}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ManageCategoriesModal;
