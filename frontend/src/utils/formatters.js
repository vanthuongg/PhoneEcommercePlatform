export const formatCurrency = (value, locale = 'vi-VN', currency = 'VND') => {
  if (isNaN(value) || value === null) return '';
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
  }).format(value);
};

export const formatDate = (dateString, options = {}) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const defaultOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  };
  return new Intl.DateTimeFormat('vi-VN', { ...defaultOptions, ...options }).format(date);
};
