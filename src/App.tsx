// import { useContext } from "react";
// import { UserContext } from "./contexts/context";
// import Profile from "./components/profile";

// function App() {
//   const user = useContext(UserContext);

//   return (
//     <div>
//       hello: {user.name}
//       <Profile />
//     </div>
//   );
// }

// export default App;

import PasswordPage from "./components/PasswordPage";

export default function App() {
  return <PasswordPage />;
}
