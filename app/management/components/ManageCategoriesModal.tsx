import { Dialog, DialogTitle } from "@mui/material"
import { useI18n } from "@/app/i18n/I18nProvider";

const ManageCategoriesModal = ({ open, onClose }: { open: boolean, onClose: () => void }) => {
    const { t } = useI18n();
    return <Dialog open={open} onClose={onClose}>
        <DialogTitle>{t.categoriesManager.manageCategories}</DialogTitle>
    </Dialog>;
};

export default ManageCategoriesModal;