import { useState } from "react";
import { actions } from "astro:actions";

type FormStatus = "idle" | "submitting" | "success" | "error";

export interface FormTranslations {
  name: string;
  namePlaceholder: string;
  email: string;
  emailPlaceholder: string;
  projectType: string;
  budgetRange: string;
  budgetPlaceholder: string;
  budgetUnder10k: string;
  budget10k25k: string;
  budget25k50k: string;
  budget50k100k: string;
  budgetOver100k: string;
  budgetNotSure: string;
  projectTypeWeb: string;
  projectTypeMobile: string;
  projectTypeApi: string;
  projectTypeDesign: string;
  projectTypeConsulting: string;
  projectTypeOther: string;
  tellMeAbout: string;
  messagePlaceholder: string;
  sendMessage: string;
  messageSent: string;
  thanksReachOut: string;
  sendAnother: string;
  privacyNote: string;
  errorName: string;
  errorNameMin: string;
  errorEmail: string;
  errorMessage: string;
  errorMessageMin: string;
  errorProjectType: string;
  errorFillRequired: string;
  errorTooMany: string;
  errorServer: string;
  errorGeneric: string;
}

interface FormData {
  name: string;
  email: string;
  projectType: string;
  budget: string;
  message: string;
  website: string; // Honeypot field
}

interface FieldErrors {
  name?: string;
  email?: string;
  message?: string;
}

const defaultTranslations: FormTranslations = {
  name: "Name",
  namePlaceholder: "Your name",
  email: "Email",
  emailPlaceholder: "you@example.com",
  projectType: "Project Type",
  budgetRange: "Budget Range",
  budgetPlaceholder: "Select budget range (optional)",
  budgetUnder10k: "Under $10,000",
  budget10k25k: "$10,000 - $25,000",
  budget25k50k: "$25,000 - $50,000",
  budget50k100k: "$50,000 - $100,000",
  budgetOver100k: "Over $100,000",
  budgetNotSure: "Not sure yet",
  projectTypeWeb: "Web Application",
  projectTypeMobile: "Mobile App",
  projectTypeApi: "API / Backend",
  projectTypeDesign: "UI/UX Design",
  projectTypeConsulting: "Consulting",
  projectTypeOther: "Other",
  tellMeAbout: "Tell me about your project",
  messagePlaceholder:
    "What are you looking to build? What challenges are you facing?",
  sendMessage: "Send message",
  messageSent: "Message sent!",
  thanksReachOut:
    "Thanks for reaching out. I'll get back to you within 24 hours.",
  sendAnother: "Send another message",
  privacyNote: "Your information will never be shared with third parties.",
  errorName: "Please enter your name",
  errorNameMin: "Please enter your name (at least 2 characters).",
  errorEmail: "Please enter a valid email address",
  errorMessage:
    "Please provide more details about your project (at least 10 characters)",
  errorMessageMin:
    "Please provide more details about your project (at least 10 characters).",
  errorProjectType: "Please select a project type.",
  errorFillRequired: "Please fill in all required fields correctly.",
  errorTooMany: "Too many submissions. Please try again in an hour.",
  errorServer: "Unable to send message right now. Please try again later.",
  errorGeneric: "Something went wrong. Please try again.",
};

interface ContactFormProps {
  translations?: FormTranslations;
}

export default function ContactForm({
  translations: t = defaultTranslations,
}: ContactFormProps) {
  const projectTypes = [
    { value: "web-app", label: t.projectTypeWeb },
    { value: "mobile-app", label: t.projectTypeMobile },
    { value: "api-backend", label: t.projectTypeApi },
    { value: "ui-ux-design", label: t.projectTypeDesign },
    { value: "consulting", label: t.projectTypeConsulting },
    { value: "other", label: t.projectTypeOther },
  ];

  const budgetRanges = [
    { value: "", label: t.budgetPlaceholder },
    { value: "under-10k", label: t.budgetUnder10k },
    { value: "10k-25k", label: t.budget10k25k },
    { value: "25k-50k", label: t.budget25k50k },
    { value: "50k-100k", label: t.budget50k100k },
    { value: "over-100k", label: t.budgetOver100k },
    { value: "not-sure", label: t.budgetNotSure },
  ];
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    projectType: "web-app",
    budget: "",
    message: "",
    website: "", // Honeypot - should stay empty
  });
  const [status, setStatus] = useState<FormStatus>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear field error when user starts typing
    if (fieldErrors[name as keyof FieldErrors]) {
      setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  // Client-side validation
  const validateForm = (): boolean => {
    const errors: FieldErrors = {};

    if (formData.name.trim().length < 2) {
      errors.name = t.errorName;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      errors.email = t.errorEmail;
    }

    if (formData.message.trim().length < 10) {
      errors.message = t.errorMessage;
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Parse server validation errors into user-friendly messages
  const parseServerError = (error: unknown): string => {
    // Type guard for error object
    const err = error as {
      message?: string;
      code?: string;
      issues?: Array<{ path?: string[]; message?: string }>;
    };

    // Handle rate limiting
    if (err.code === "TOO_MANY_REQUESTS") {
      return t.errorTooMany;
    }

    // Handle Zod validation errors - extract field-specific messages
    if (
      err.message &&
      (err.message.includes("Failed to validate") ||
        err.message.includes("too_small") ||
        err.message.includes("invalid"))
    ) {
      const messageStr = err.message;

      if (
        messageStr.includes('"path":["name"]') ||
        messageStr.includes('"path": [ "name" ]')
      ) {
        return t.errorNameMin;
      }
      if (
        messageStr.includes('"path":["email"]') ||
        messageStr.includes('"path": [ "email" ]')
      ) {
        return t.errorEmail;
      }
      if (
        messageStr.includes('"path":["message"]') ||
        messageStr.includes('"path": [ "message" ]')
      ) {
        return t.errorMessageMin;
      }
      if (
        messageStr.includes('"path":["projectType"]') ||
        messageStr.includes('"path": [ "projectType" ]')
      ) {
        return t.errorProjectType;
      }

      return t.errorFillRequired;
    }

    if (err.code === "INTERNAL_SERVER_ERROR") {
      return t.errorServer;
    }

    return t.errorGeneric;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage("");

    // Client-side validation first
    if (!validateForm()) {
      return;
    }

    setStatus("submitting");

    try {
      const formDataObj = new FormData();
      formDataObj.append("name", formData.name.trim());
      formDataObj.append("email", formData.email.trim());
      formDataObj.append("projectType", formData.projectType);
      formDataObj.append("budget", formData.budget); // Always send, even if empty
      formDataObj.append("message", formData.message.trim());
      formDataObj.append("website", formData.website); // Honeypot

      const result = await actions.sendContactEmail(formDataObj);

      if (result.error) {
        setStatus("error");
        setErrorMessage(parseServerError(result.error));
        return;
      }

      setStatus("success");
      setFormData({
        name: "",
        email: "",
        projectType: "web-app",
        budget: "",
        message: "",
        website: "",
      });
      setFieldErrors({});
    } catch {
      setStatus("error");
      setErrorMessage(t.errorGeneric);
    }
  };

  const inputClasses = (hasError: boolean) =>
    `w-full rounded-lg border px-4 py-3 text-sm transition-colors duration-200 focus:outline-none focus:ring-2 ${
      hasError
        ? "border-red-300 bg-red-50 text-zinc-900 placeholder-zinc-400 focus:border-red-500 focus:ring-red-200 dark:border-red-800 dark:bg-red-900/20 dark:text-zinc-100"
        : "border-zinc-200 bg-white text-zinc-900 placeholder-zinc-400 focus:border-strawhat-yellow focus:ring-strawhat-yellow/20 dark:border-zinc-700 dark:bg-zinc-800/80 dark:text-zinc-100 dark:placeholder-zinc-500"
    }`;

  const labelClasses =
    "mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300";

  if (status === "success") {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center rounded-2xl border border-zinc-200 bg-white p-8 text-center dark:border-zinc-800 dark:bg-zinc-900">
        <div className="bg-strawhat-yellow/10 mb-6 flex size-16 items-center justify-center rounded-full">
          <svg
            className="text-strawhat-yellow size-8"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h3 className="mb-2 text-2xl font-light tracking-tight text-zinc-900 dark:text-zinc-100">
          {t.messageSent}
        </h3>
        <p className="mb-6 text-zinc-600 dark:text-zinc-400">
          {t.thanksReachOut}
        </p>
        <button
          onClick={() => setStatus("idle")}
          className="text-strawhat-yellow hover:text-strawhat-amber text-sm font-medium transition-colors"
        >
          {t.sendAnother}
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6 sm:p-8 dark:border-zinc-800 dark:bg-zinc-900">
      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        {/* Honeypot field - hidden from real users, bots will fill it */}
        <div className="absolute -left-[9999px] opacity-0" aria-hidden="true">
          <label htmlFor="website">Website</label>
          <input
            type="text"
            id="website"
            name="website"
            value={formData.website}
            onChange={handleChange}
            tabIndex={-1}
            autoComplete="off"
          />
        </div>

        {/* Name & Email row */}
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="name" className={labelClasses}>
              {t.name}
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder={t.namePlaceholder}
              className={inputClasses(!!fieldErrors.name)}
            />
            {fieldErrors.name && (
              <p className="mt-1 text-xs text-red-500">{fieldErrors.name}</p>
            )}
          </div>
          <div>
            <label htmlFor="email" className={labelClasses}>
              {t.email}
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder={t.emailPlaceholder}
              className={inputClasses(!!fieldErrors.email)}
            />
            {fieldErrors.email && (
              <p className="mt-1 text-xs text-red-500">{fieldErrors.email}</p>
            )}
          </div>
        </div>

        {/* Project Type & Budget row */}
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="projectType" className={labelClasses}>
              {t.projectType}
            </label>
            <select
              id="projectType"
              name="projectType"
              value={formData.projectType}
              onChange={handleChange}
              className={inputClasses(false)}
            >
              <option value="web-app">{t.projectTypeWeb}</option>
              <option value="mobile-app">{t.projectTypeMobile}</option>
              <option value="api-backend">{t.projectTypeApi}</option>
              <option value="ui-ux-design">{t.projectTypeDesign}</option>
              <option value="consulting">{t.projectTypeConsulting}</option>
              <option value="other">{t.projectTypeOther}</option>
            </select>
          </div>
          <div>
            <label htmlFor="budget" className={labelClasses}>
              {t.budgetRange}
            </label>
            <select
              id="budget"
              name="budget"
              value={formData.budget}
              onChange={handleChange}
              className={inputClasses(false)}
            >
              <option value="">{t.budgetPlaceholder}</option>
              <option value="under-10k">{t.budgetUnder10k}</option>
              <option value="10k-25k">{t.budget10k25k}</option>
              <option value="25k-50k">{t.budget25k50k}</option>
              <option value="50k-100k">{t.budget50k100k}</option>
              <option value="over-100k">{t.budgetOver100k}</option>
              <option value="not-sure">{t.budgetNotSure}</option>
            </select>
          </div>
        </div>

        {/* Message */}
        <div>
          <label htmlFor="message" className={labelClasses}>
            {t.tellMeAbout}
          </label>
          <textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleChange}
            rows={4}
            placeholder={t.messagePlaceholder}
            className={`${inputClasses(!!fieldErrors.message)} resize-none`}
          />
          {fieldErrors.message && (
            <p className="mt-1 text-xs text-red-500">{fieldErrors.message}</p>
          )}
        </div>

        {/* Error message */}
        {status === "error" && errorMessage && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-400">
            {errorMessage}
          </div>
        )}

        {/* Submit button */}
        <button
          type="submit"
          disabled={status === "submitting"}
          className="group bg-strawhat-yellow hover:bg-strawhat-amber focus:ring-strawhat-yellow relative w-full overflow-hidden rounded-lg px-6 py-3.5 text-sm font-medium text-white transition-all duration-300 focus:ring-2 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
        >
          <span className={status === "submitting" ? "invisible" : ""}>
            {t.sendMessage}
          </span>
          {status === "submitting" && (
            <span className="absolute inset-0 flex items-center justify-center">
              <svg
                className="size-5 animate-spin text-white"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            </span>
          )}
        </button>

        {/* Privacy note */}
        <p className="text-center text-xs text-zinc-500">{t.privacyNote}</p>
      </form>
    </div>
  );
}
