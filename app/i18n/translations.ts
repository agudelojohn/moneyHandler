export type Locale = "es" | "en";

export const CATEGORY_KEYS = [
  "Comida",
  "Transporte",
  "Vivienda",
  "Ocio",
  "Otros",
] as const;

export type CategoryKey = (typeof CATEGORY_KEYS)[number];

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
      title: "Landing Page",
      subtitle: "Selecciona el modulo que quieres abrir.",
      managementButton: "Management",
      expensesButton: "Control de gastos",
    },
    management: {
      title: "Management",
      subtitle: "Esta seccion usa la misma paleta del dashboard.",
    },
    expenses: {
      pageTitle: "Control de gastos",
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
      Comida: "Comida",
      Transporte: "Transporte",
      Vivienda: "Vivienda",
      Ocio: "Ocio",
      Otros: "Otros",
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
      title: "Landing Page",
      subtitle: "Select the module you want to open.",
      managementButton: "Management",
      expensesButton: "Expense control",
    },
    management: {
      title: "Management",
      subtitle: "This section uses the same dashboard color palette.",
    },
    expenses: {
      pageTitle: "Expenses Control",
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
      Comida: "Food",
      Transporte: "Transport",
      Vivienda: "Housing",
      Ocio: "Leisure",
      Otros: "Other",
    },
  },
};
