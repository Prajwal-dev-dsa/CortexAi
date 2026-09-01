import { useEffect } from "react";
import Home from "./pages/Home";
import { getCurrentUser } from "./features/getCurrentUser";
import { useDispatch } from "react-redux";
import { setUserData } from "./redux/slices/userSlice";

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
      <Home />
    </>
  );
}

export default App;
