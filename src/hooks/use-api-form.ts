"use client";

import { useState, type FormEvent } from "react";
import { callApi, type ApiResult, type HttpMethod } from "@/lib/api";

type UseApiFormOptions<T> = {
  /** Route de l'API à appeler, ex. « /api/login ». */
  url: string;
  method: HttpMethod;
  /** Appelé après une réponse réussie (redirection, notification…). */
  onSuccess?: (result: Extract<ApiResult<T>, { ok: true }>, form: HTMLFormElement) => void | Promise<void>;
};

/**
 * Gère l'envoi d'un formulaire vers une route de l'API :
 *  1. empêche l'envoi classique du navigateur (`e.preventDefault()`) ;
 *  2. lit les champs du formulaire et les envoie en JSON avec `fetch` ;
 *  3. mémorise l'état (envoi en cours, erreurs) avec `useState`.
 *
 * Le formulaire n'est pas réinitialisé en cas d'erreur : la saisie est conservée.
 */
export function useApiForm<T = unknown>({ url, method, onSuccess }: UseApiFormOptions<T>) {
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // Empêche le rechargement de la page
    const form = e.currentTarget;
    const values = Object.fromEntries(new FormData(form)); // { nomDuChamp: valeur }

    setPending(true);
    setMessage(null);
    setFieldErrors({});

    const result = await callApi<T>(url, method, values);

    if (!result.ok) {
      setFieldErrors(result.fieldErrors ?? {});
      // Le message global n'est affiché que s'il n'y a pas déjà des erreurs par champ.
      setMessage(result.fieldErrors ? null : result.message);
      setPending(false);
      return;
    }

    await onSuccess?.(result, form);
    setPending(false);
  };

  return { handleSubmit, pending, message, fieldErrors };
}
