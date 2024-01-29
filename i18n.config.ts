export default {
  legacy: false,
  fallbackWarn: false,
  missingWarn: false,
  datetimeFormats: Object.fromEntries(
    ['de', 'en'].map((lang) => [
      lang,
      {
        long: {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        },
        short: {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        },
      },
    ])
  ),
};
