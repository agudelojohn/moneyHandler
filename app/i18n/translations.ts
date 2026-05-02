import type { ExpenseCategory } from "@/lib/aws/schemas/common";

export type Locale = "es" | "en";

export type CategoryKey = ExpenseCategory;

type TranslationSchema = {
  common: {
    language: string;
    spanish: string;
    english: string;
    switchLanguage: string;
    backToHome: string;
  };
  home: {
    title: string;
    subtitle: string;
    managementButton: string;
    expensesButton: string;
  };
  management: {
    title: string;
    subtitle: string;
    available: string;
    initialAmount: string;
    deductions: string;
    rangeDays: string;
    elapsedDays: string;
    dailyAvailable: string;
    expectedPocket: string;
    addDeduction: string;
    viewDeductions: string;
    deductionModalTitle: string;
    deductionDescription: string;
    deductionAmount: string;
    deductionIsCredit: string;
    close: string;
    saving: string;
    listDeductionsTitle: string;
    noDeductions: string;
    amount: string;
    credit: string;
    totalCredits: string;
    edit: string;
    save: string;
    updateRecord: string;
    updatingRecord: string;
    deleteDeductionAria: string;
    deleteConfirmTitle: string;
    deleteConfirmMessage: string;
    cancel: string;
    delete: string;
    updateRecordNotFoundError: string;
    invalidDeductionCollectionError: string;
    updateDeductionsError: string;
    invalidEditedDeductionError: string;
    createManagementTitle: string;
    suggestedRangeDate: string;
    useSuggestedRange: string;
    rangeStartDate: string;
    rangeEndDate: string;
    creatingRecord: string;
    initialAmountValidationError: string;
    invalidRangeDatesError: string;
    invalidRangeOrderError: string;
    createRecordError: string;
    selectCategoryTitle: string;
    selectCategorySubtitle: string;
  };
  expenses: {
    pageTitle: string;
    pageSubtitle: string;
    chartEmpty: string;
    invalidChartRange: string;
    loadError: string;
    amountValidation: string;
    descriptionValidation: string;
    updateError: string;
    updateSuccess: string;
    createError: string;
    createSuccess: string;
    unexpectedError: string;
    deleteConfirm: string;
    deleteError: string;
    deleteSuccess: string;
    category: string;
    description: string;
    selectDescription: string;
    fromChart: string;
    toChart: string;
    yearlyTotal: string;
    editExpense: string;
    newExpense: string;
    amount: string;
    date: string;
    saveChanges: string;
    createRecord: string;
    clear: string;
    searchAndManage: string;
    searchPlaceholder: string;
    edit: string;
    delete: string;
    noResultsCurrentYear: string;
    value: string;
    actions: string;
    selectCategoryTitle: string;
    selectCategorySubtitle: string;
    changeCategory: string;
  };
  dataViewer: {
    title: string;
    totalValue: string;
    today: string;
    lastBusinessDay: string;
    diffDays: string;
    plusOneDay: string;
    minusOneDay: string;
  };
  categories: Record<CategoryKey, string>;
};

export const translations: Record<Locale, TranslationSchema> = {
  es: {
    common: {
      language: "Idioma",
      spanish: "Espanol",
      english: "Ingles",
      switchLanguage: "Cambiar idioma",
      backToHome: "Volver al inicio",
    },
    home: {
      title: "Bienvenido!",
      subtitle: "Selecciona el modulo que quieres abrir.",
      managementButton: "Gestion de dinero",
      expensesButton: "Historial de precios",
    },
    management: {
      title: "Management",
      subtitle: "Esta seccion usa la misma paleta del dashboard.",
      available: "Disponible",
      initialAmount: "Monto inicial",
      deductions: "Deducciones",
      rangeDays: "Dias del rango",
      elapsedDays: "Dias transcurridos",
      dailyAvailable: "Disponible diariamente",
      expectedPocket: "Bolsillo esperado",
      addDeduction: "Agregar deduccion",
      viewDeductions: "Ver deducciones",
      deductionModalTitle: "Agregar deduccion",
      deductionDescription: "Descripcion",
      deductionAmount: "Monto de deduccion",
      deductionIsCredit: "Es credito",
      close: "Cerrar",
      saving: "Guardando...",
      listDeductionsTitle: "Deducciones del registro",
      noDeductions: "Este registro no tiene deducciones.",
      amount: "Monto",
      credit: "Credito",
      totalCredits: "Total creditos",
      edit: "Editar",
      save: "Guardar",
      updateRecord: "Actualizar registro",
      updatingRecord: "Actualizando...",
      deleteDeductionAria: "Eliminar deduccion",
      deleteConfirmTitle: "Confirmar eliminacion",
      deleteConfirmMessage:
        "Esta accion quitara la deduccion de la lista. ¿Deseas continuar?",
      cancel: "Cancelar",
      delete: "Eliminar",
      updateRecordNotFoundError:
        "No se encontro el registro para actualizar deducciones.",
      invalidDeductionCollectionError:
        "Cada deduccion debe tener descripcion de 3 a 50 caracteres y monto entero.",
      updateDeductionsError: "No se pudo actualizar las deducciones.",
      invalidEditedDeductionError:
        "La deduccion editada no es valida. Revisa descripcion y monto.",
      createManagementTitle: "Crear registro de management",
      suggestedRangeDate: "Rango sugerido",
      useSuggestedRange: "¿Usar?",
      rangeStartDate: "Fecha inicial del rango",
      rangeEndDate: "Fecha final del rango",
      creatingRecord: "Creando...",
      initialAmountValidationError: "El monto debe ser un numero entero positivo.",
      invalidRangeDatesError: "Las fechas del rango son invalidas.",
      invalidRangeOrderError:
        "La fecha inicial del rango no puede ser mayor a la fecha final.",
      createRecordError: "No se pudo crear el registro.",
      selectCategoryTitle: "Elige una categoria",
      selectCategorySubtitle:
        "Debes elegir una categoria para continuar con la gestion de dinero.",
    },
    expenses: {
      pageTitle: "Historial de precios",
      pageSubtitle:
        "Visualiza la evolucion anual por categoria, crea nuevos registros y gestiona los existentes desde una sola vista.",
      chartEmpty: "Sin datos para mostrar en el grafico.",
      invalidChartRange: "El rango de fechas de la grafica es invalido.",
      loadError: "No se pudieron cargar los gastos",
      amountValidation: "El monto debe ser un numero entero positivo.",
      descriptionValidation: "La descripcion debe tener minimo 3 caracteres.",
      updateError: "No se pudo actualizar el gasto.",
      updateSuccess: "Gasto actualizado correctamente.",
      createError: "No se pudo crear el gasto.",
      createSuccess: "Gasto creado correctamente.",
      unexpectedError: "Error inesperado",
      deleteConfirm:
        "Esta accion eliminara el registro seleccionado. Deseas continuar?",
      deleteError: "No se pudo eliminar el gasto.",
      deleteSuccess: "Gasto eliminado correctamente.",
      category: "Categoria",
      description: "Descripcion",
      selectDescription: "Seleccione una descripcion",
      fromChart: "Desde (grafica)",
      toChart: "Hasta (grafica)",
      yearlyTotal: "Total anual",
      editExpense: "Editar gasto",
      newExpense: "Nuevo gasto",
      amount: "Monto",
      date: "Fecha",
      saveChanges: "Guardar cambios",
      createRecord: "Crear registro",
      clear: "Limpiar",
      searchAndManage: "Busqueda y gestion",
      searchPlaceholder: "Buscar por descripcion, fecha o ID",
      edit: "Editar",
      delete: "Eliminar",
      noResultsCurrentYear: "No hay resultados para esta categoria en el anio actual.",
      value: "Valor",
      actions: "Acciones",
      selectCategoryTitle: "Elige una categoria",
      selectCategorySubtitle:
        "Veras el historial y registrar gastos segun la categoria que elijas.",
      changeCategory: "Cambiar categoria",
    },
    dataViewer: {
      title: "Visor de datos",
      totalValue: "Valor total",
      today: "Hoy",
      lastBusinessDay: "Ultimo dia habil",
      diffDays: "Dias de diferencia",
      plusOneDay: "+1 dia",
      minusOneDay: "-1 dia",
    },
    categories: {
      Gastos: "Gastos",
      Gatitos: "Gatitos",
      Mercado: "Mercado",
      Otros: "Otros",
      Servicios: "Servicios",
    },
  },
  en: {
    common: {
      language: "Language",
      spanish: "Spanish",
      english: "English",
      switchLanguage: "Switch language",
      backToHome: "Back to home",
    },
    home: {
      title: "Welcome!",
      subtitle: "Select the module you want to open.",
      managementButton: "Money management",
      expensesButton: "Price history",
    },
    management: {
      title: "Management",
      subtitle: "This section uses the same dashboard color palette.",
      available: "Available",
      initialAmount: "Initial amount",
      deductions: "Deductions",
      rangeDays: "Range days",
      elapsedDays: "Elapsed days",
      dailyAvailable: "Daily available",
      expectedPocket: "Expected pocket",
      addDeduction: "Add deduction",
      viewDeductions: "View deductions",
      deductionModalTitle: "Add deduction",
      deductionDescription: "Description",
      deductionAmount: "Deduction amount",
      deductionIsCredit: "Is credit",
      close: "Close",
      saving: "Saving...",
      listDeductionsTitle: "Record deductions",
      noDeductions: "This record has no deductions.",
      amount: "Amount",
      credit: "Credit",
      totalCredits: "Total credits",
      edit: "Edit",
      save: "Save",
      updateRecord: "Update record",
      updatingRecord: "Updating...",
      deleteDeductionAria: "Delete deduction",
      deleteConfirmTitle: "Confirm deletion",
      deleteConfirmMessage:
        "This action will remove the deduction from the list. Do you want to continue?",
      cancel: "Cancel",
      delete: "Delete",
      updateRecordNotFoundError:
        "The record to update deductions was not found.",
      invalidDeductionCollectionError:
        "Each deduction must have a description from 3 to 50 characters and a whole-number amount.",
      updateDeductionsError: "Deductions could not be updated.",
      invalidEditedDeductionError:
        "The edited deduction is invalid. Check description and amount.",
      createManagementTitle: "Create management record",
      suggestedRangeDate: "Suggested range",
      useSuggestedRange: "Use?",
      rangeStartDate: "Range start date",
      rangeEndDate: "Range end date",
      creatingRecord: "Creating...",
      initialAmountValidationError:
        "Initial amount must be a positive whole number.",
      invalidRangeDatesError: "Range dates are invalid.",
      invalidRangeOrderError:
        "The range start date cannot be later than the end date.",
      createRecordError: "The record could not be created.",
      selectCategoryTitle: "Choose a category",
      selectCategorySubtitle:
        "Pick a category to continue with money management.",
    },
    expenses: {
      pageTitle: "Price history",
      pageSubtitle:
        "Review yearly evolution by category, create new records, and manage existing ones from a single view.",
      chartEmpty: "No data available for this chart.",
      invalidChartRange: "The chart date range is invalid.",
      loadError: "Expenses could not be loaded.",
      amountValidation: "Amount must be a positive whole number.",
      descriptionValidation: "Description must have at least 3 characters.",
      updateError: "Expense could not be updated.",
      updateSuccess: "Expense updated successfully.",
      createError: "Expense could not be created.",
      createSuccess: "Expense created successfully.",
      unexpectedError: "Unexpected error",
      deleteConfirm:
        "This action will delete the selected record. Do you want to continue?",
      deleteError: "Expense could not be deleted.",
      deleteSuccess: "Expense deleted successfully.",
      category: "Category",
      description: "Description",
      selectDescription: "Select a description",
      fromChart: "From (chart)",
      toChart: "To (chart)",
      yearlyTotal: "Yearly total",
      editExpense: "Edit expense",
      newExpense: "New expense",
      amount: "Amount",
      date: "Date",
      saveChanges: "Save changes",
      createRecord: "Create record",
      clear: "Clear",
      searchAndManage: "Search and manage",
      searchPlaceholder: "Search by description, date or ID",
      edit: "Edit",
      delete: "Delete",
      noResultsCurrentYear: "No results for this category in the current year.",
      value: "Value",
      actions: "Actions",
      selectCategoryTitle: "Choose a category",
      selectCategorySubtitle:
        "You will view history and record expenses for the category you pick.",
      changeCategory: "Change category",
    },
    dataViewer: {
      title: "Data Viewer",
      totalValue: "Total Value",
      today: "Today",
      lastBusinessDay: "Last Business Day",
      diffDays: "Diff Days",
      plusOneDay: "+1 Day",
      minusOneDay: "-1 Day",
    },
    categories: {
      Gastos: "General expenses",
      Gatitos: "Cats",
      Mercado: "Groceries",
      Otros: "Other",
      Servicios: "Services",
    },
  },
};
