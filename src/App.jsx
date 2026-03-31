import { ConfigProvider, App as AntdApp } from "antd";
import { SWRConfig } from "swr";
import AppRouter from "./router";

const App = () => (
  <ConfigProvider
    theme={{
      token: {
        colorPrimary: "#1677ff",
        colorBgLayout: "#f5f7fa",
        borderRadius: 6,
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
      },
      components: {
        Menu: {
          itemSelectedBg: "#e6f4ff",
          itemSelectedColor: "#1677ff",
          itemHoverBg: "#f5f7fa",
        },
        Layout: {
          siderBg: "#ffffff",
          triggerBg: "#f5f7fa",
        },
      },
    }}
  >
    <SWRConfig
      value={{
        // revalidateOnFocus: false,
        shouldRetryOnError: false,
        dedupingInterval: 2000,
      }}
    >
      <AntdApp>
        <AppRouter />
      </AntdApp>
    </SWRConfig>
  </ConfigProvider>
);

export default App;
