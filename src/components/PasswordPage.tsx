import { useForm } from "react-hook-form";
import Eggplant from "./Eggplant";
import { getPasswordStrength } from "./utils/passordStrength";
import "./PasswordPage.css";

type FormValues = {
  password: string;
};

const MIN_LENGTH = 130; // body length in px at score 0
const MAX_LENGTH = 340; // body length in px at score 100

export default function PasswordPage() {
  const { register, watch, handleSubmit, reset } = useForm<FormValues>({
    defaultValues: { password: "" },
  });

  const password = watch("password");
  const { score, level, label } = getPasswordStrength(password);

  const length = MIN_LENGTH + ((MAX_LENGTH - MIN_LENGTH) * score) / 100;

  const onSubmit = () => {
    // Nothing to submit. This page is for fun.
  };

  return (
    <main className="pp-page">
      <form className="pp-card" onSubmit={handleSubmit(onSubmit)}>
        <h1 className="pp-title">Reset password</h1>
        <p className="pp-subtitle">Make me hard, baby</p>

        <div className="pp-stage">
          <Eggplant length={length} />
        </div>

        <input
          id="password"
          type="password"
          autoComplete="new-password"
          className="pp-input"
          aria-describedby="pp-strength"
          {...register("password")}
          placeholder="Enter password"
        />

        <p
          id="pp-strength"
          className={`pp-strength pp-strength--${level}`}
          aria-live="polite"
        >
          {label}
        </p>

        <button onClick={() => reset()} type="submit" className="pp-reset">
          Reset
        </button>
        <button type="button" className="pp-cancel" onClick={() => reset()}>
          Cancel
        </button>
      </form>
    </main>
  );
}
