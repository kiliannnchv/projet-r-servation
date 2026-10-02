import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";
import clsx from "clsx";

/** Classes communes aux champs de saisie. */
const controlClasses = (invalid: boolean) =>
  clsx(
    "block w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-stone-900 shadow-xs transition",
    "placeholder:text-stone-400 focus:outline-none focus:ring-4",
    invalid
      ? "border-red-400 focus:border-red-500 focus:ring-red-100"
      : "border-stone-300 focus:border-forest-500 focus:ring-forest-100",
  );

type FieldWrapperProps = {
  id: string;
  label: string;
  errors?: string[];
  hint?: ReactNode;
  children: ReactNode;
};

/** Libellé + champ + aide + erreurs, avec les attributs ARIA appropriés. */
function FieldWrapper({ id, label, errors, hint, children }: FieldWrapperProps) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-medium text-stone-800">
        {label}
      </label>
      {children}
      {hint && !errors?.length && <p className="text-xs text-stone-500">{hint}</p>}
      {errors?.length ? (
        <ul id={`${id}-error`} className="space-y-0.5 text-xs font-medium text-red-600" aria-live="polite">
          {errors.map((error) => (
            <li key={error}>{error}</li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

type CommonProps = { name: string; label: string; errors?: string[]; hint?: ReactNode };

/** Champ `<input>` avec libellé et erreurs. */
export function InputField({ name, label, errors, hint, id = name, ...props }: CommonProps & InputHTMLAttributes<HTMLInputElement>) {
  const invalid = Boolean(errors?.length);
  return (
    <FieldWrapper id={id} label={label} errors={errors} hint={hint}>
      <input
        id={id}
        name={name}
        aria-invalid={invalid}
        aria-describedby={invalid ? `${id}-error` : undefined}
        className={controlClasses(invalid)}
        {...props}
      />
    </FieldWrapper>
  );
}

/** Champ `<textarea>` avec libellé et erreurs. */
export function TextareaField({ name, label, errors, hint, id = name, ...props }: CommonProps & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const invalid = Boolean(errors?.length);
  return (
    <FieldWrapper id={id} label={label} errors={errors} hint={hint}>
      <textarea
        id={id}
        name={name}
        aria-invalid={invalid}
        aria-describedby={invalid ? `${id}-error` : undefined}
        className={clsx(controlClasses(invalid), "min-h-32 resize-y")}
        {...props}
      />
    </FieldWrapper>
  );
}

/** Liste déroulante `<select>` avec libellé et erreurs. */
export function SelectField({
  name,
  label,
  errors,
  hint,
  id = name,
  children,
  ...props
}: CommonProps & SelectHTMLAttributes<HTMLSelectElement>) {
  const invalid = Boolean(errors?.length);
  return (
    <FieldWrapper id={id} label={label} errors={errors} hint={hint}>
      <select
        id={id}
        name={name}
        aria-invalid={invalid}
        aria-describedby={invalid ? `${id}-error` : undefined}
        className={clsx(controlClasses(invalid), "appearance-none bg-[url(/chevron.svg)] bg-[length:1rem] bg-[right_0.75rem_center] bg-no-repeat pr-10")}
        {...props}
      >
        {children}
      </select>
    </FieldWrapper>
  );
}
