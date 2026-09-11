import { useEffect } from "react";
import Home from "./pages/Home";
import { getCurrentUser } from "./features/getCurrentUser";
import { useDispatch } from "react-redux";
import { setUserData } from "./redux/slices/userSlice";
import Billing from "./pages/Billing";
import { Routes, Route } from "react-router-dom";

function App() {
  const dispatch = useDispatch();
  useEffect(() => {
    const getUser = async () => {
      try {
        const user = await getCurrentUser();
        dispatch(setUserData(user));
      } catch (error) {
        dispatch(setUserData(null));
        console.error(error);
      }
    };
    getUser();
  }, []);

  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/billing" element={<Billing />} />
      </Routes>
    </>
  );
}

export default App;
