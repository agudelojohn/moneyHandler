import CheckIcon from "@mui/icons-material/Check";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import EditIcon from "@mui/icons-material/Edit";
import { IconButton, Stack, Typography } from "@mui/material";
import { useI18n } from "@/app/i18n/I18nProvider";
import type { HouseholdTask } from "@/lib/aws/schemas/householdTaskSchema";
import * as Sx from "../styles";

type PendingTaskItemProps = {
  task: HouseholdTask;
  busy: boolean;
  onMarkDone: (task: HouseholdTask) => void;
  onEdit: (task: HouseholdTask) => void;
  onDelete: (task: HouseholdTask) => void;
};

export function PendingTaskItem({
  task,
  busy,
  onMarkDone,
  onEdit,
  onDelete,
}: PendingTaskItemProps) {
  const { t } = useI18n();

  return (
    <Stack sx={Sx.pendingItemRowSx}>
      <Stack spacing={0.25} sx={Sx.descriptionStackSx}>
        <Typography sx={Sx.descriptionSx}>{task.description}</Typography>
        {task.visibility === "personal" ? (
          <Typography sx={Sx.personalBadgeSx}>{t.household.personalBadge}</Typography>
        ) : null}
      </Stack>
      <Stack spacing={0.5} sx={Sx.pendingActionsRowSx}>
        <IconButton
          aria-label={t.household.markDoneAria}
          onClick={() => onMarkDone(task)}
          disabled={busy}
          sx={Sx.iconButtonSx}
        >
          <CheckIcon />
        </IconButton>
        <IconButton
          aria-label={t.household.editAria}
          onClick={() => onEdit(task)}
          disabled={busy}
          sx={Sx.iconButtonSx}
        >
          <EditIcon />
        </IconButton>
        <IconButton
          aria-label={t.household.deleteAria}
          onClick={() => onDelete(task)}
          disabled={busy}
          sx={Sx.deleteIconButtonSx}
        >
          <DeleteOutlinedIcon />
        </IconButton>
      </Stack>
    </Stack>
  );
}
