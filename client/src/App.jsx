import { useEffect, useState } from "react";
import Home from "./pages/Home";
import { getCurrentUser } from "./features/getCurrentUser";
import { useDispatch } from "react-redux";
import { setUserData } from "./redux/slices/userSlice";
import Billing from "./pages/Billing";
import { Routes, Route } from "react-router-dom";
import ServerWakeupAlert from "./components/ServerWakeupAlert";

function App() {
  const dispatch = useDispatch();
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const getUser = async () => {
      try {
        setIsInitializing(true);
        const user = await getCurrentUser();
        dispatch(setUserData(user));
      } catch (error) {
        dispatch(setUserData(null));
        console.error("Auth check failed:", error);
      } finally {
        setIsInitializing(false);
      }
    };

    getUser();
  }, [dispatch]);

  return (
    <>
      <ServerWakeupAlert isInitializing={isInitializing} />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/billing" element={<Billing />} />
      </Routes>
    </>
  );
}

export default App;
