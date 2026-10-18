import { useContext } from "react";
import { UserContext } from "../contexts/context";

function Profile() {
  const user = useContext(UserContext);

  return <div>{user.id}</div>;
}

export default Profile;
