import "./App.css";
import AppRoutes from "./routes/AppRoutes";
import { Toaster } from "react-hot-toast";

function App() {
  return (
    <>
      <Toaster
        position="top-right"
        reverseOrder={false}
        toastOptions={{
          duration: 3500,
          style: {
            borderRadius: "10px",
            background: "#333",
            color: "#fff",
            fontSize: "13.5px",
          },
        }}
      />
      <AppRoutes />
    </>
  );
}

export default App;
