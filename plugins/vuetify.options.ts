import 'material-design-icons-iconfont/dist/material-design-icons.css' // Ensure you are using css-loader
import 'roboto-fontface/css/roboto/roboto-fontface.css' // Ensure you are using css-loader
import '@mdi/font/css/materialdesignicons.css' // Ensure you are using css-loader
import colors from 'vuetify/lib/util/colors'
import de from 'vuetify/src/locale/de'

export default {
  icons: {
    iconfont: 'mdi'
  },
  lang: {
    locales: { de },
    current: 'de'
  },
  theme: {
    themes: {
      light: {
        primary: '#c90000', // colors.red.darken1,
        secondary: colors.red.darken3,
        accent: colors.grey.darken1,
        error: colors.red.accent2
      },
      dark: {
        primary: colors.red.darken1
      }
    }
  }
}
