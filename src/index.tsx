import ReactDOM from "react-dom/client";
import { createTheme, ThemeProvider } from "@mui/material";
import { Provider } from "react-redux";
import { ToastContainer } from "react-toastify";

import "./styles/App.css";
import App from "./App";

import { getTheme } from "./lib/theme/theme";
import { mutateFontSizeResponsiveness } from "./lib/theme/responsiveTypography";
import store from "./redux/store";

const rootElement = ReactDOM.createRoot(document.getElementById("root") as HTMLElement);

const Root = () => {
  // eslint-disable-next-line
  // @ts-ignore
  let theme = createTheme(getTheme());
  theme = mutateFontSizeResponsiveness(theme);

  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <App />
        <ToastContainer />
      </ThemeProvider>
    </Provider>
  );
};

rootElement.render(<Root />);
