interface Props {
  switchMode: () => void;
}

export default function LoginForm({ switchMode }: Props) {
  return (
    <div>
      <h2>Login</h2>

      <button onClick={switchMode}>Go Register</button>
    </div>
  );
}
