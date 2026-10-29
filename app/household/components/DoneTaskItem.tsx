import { Stack, Typography } from "@mui/material";
import { getAppUserByUserId } from "@/app/common/userProfiles";
import { formatDateWithMonthName, parseUtcIsoDate } from "@/app/common/utils/dateHelpers";
import { useI18n } from "@/app/i18n/I18nProvider";
import type { HouseholdTask } from "@/lib/aws/schemas/householdTaskSchema";
import * as Sx from "../styles";

type DoneTaskItemProps = {
  task: HouseholdTask;
};

export function DoneTaskItem({ task }: DoneTaskItemProps) {
  const { t } = useI18n();
  const doneByLabel = task.doneBy
    ? (getAppUserByUserId(task.doneBy)?.label ?? task.doneBy)
    : "";
  const updateDateLabel = formatDateWithMonthName(parseUtcIsoDate(task.updateDate));

  return (
    <Stack sx={Sx.doneItemRowSx} spacing={0.5}>
      <Stack spacing={0.25} sx={Sx.descriptionStackSx}>
        <Typography sx={Sx.descriptionSx}>{task.description}</Typography>
        {task.visibility === "personal" ? (
          <Typography sx={Sx.personalBadgeSx}>{t.household.personalBadge}</Typography>
        ) : null}
      </Stack>
      <Typography sx={Sx.doneMetaSx}>
        {t.household.doneBy}: {doneByLabel}
      </Typography>
      <Typography sx={Sx.doneMetaSx}>
        {t.household.updateDate}: {updateDateLabel}
      </Typography>
    </Stack>
  );
}
