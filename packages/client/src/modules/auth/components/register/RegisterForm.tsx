interface Props {
  switchMode: () => void;
}

export default function RegisterForm({ switchMode }: Props) {
  return (
    <div>
      <h2>Register</h2>

      <button onClick={switchMode}>Go Login</button>
    </div>
  );
}
