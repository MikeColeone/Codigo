import { useAuthMode } from "../hooks/useAuthMode";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";

export default function AuthContainer() {
  const { mode, toggle } = useAuthMode();
  return mode === "login" ? (
    <LoginForm switchMode={toogle} />
  ) : (
    <RegisterForm switchMode={toogle} />
  );
}
