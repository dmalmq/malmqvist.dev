import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import { CONTACT_FORM_LABELS } from "./contact-form-labels";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const formSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(120, "Name must be 120 characters or less"),
  email: z
    .string()
    .min(1, "Email is required")
    .max(320, "Email must be 320 characters or less")
    .refine((val) => EMAIL_PATTERN.test(val), {
      message: "Invalid email address",
    }),
  subject: z.enum(["consulting", "inquiry", "collab", "general"], {
    required_error: "Please select a subject",
  }),
  message: z
    .string()
    .min(10, "Message must be at least 10 characters")
    .max(5000, "Message must be 5000 characters or less"),
  bot_field: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function ContactForm({
  lang = "en",
}: {
  lang?: "en" | "ja" | "sv";
}) {
  const labels = CONTACT_FORM_LABELS[lang];

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      subject: undefined,
      message: "",
      bot_field: "",
    },
    mode: "onBlur",
  });

  const { isSubmitting } = form.formState;
  const submitForm = form.handleSubmit(onSubmit);

  async function onSubmit(values: FormValues) {
    // Honeypot: if bot_field has a value, silently "succeed"
    if (values.bot_field) {
      toast.success(labels.success);
      form.reset();
      return;
    }

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: values.name,
          email: values.email,
          subject: values.subject,
          message: values.message,
        }),
      });

      if (res.ok) {
        const data = (await res.json()) as { success: boolean };
        if (data.success) {
          toast.success(labels.success);
        }
      } else if (res.status === 400) {
        const data = (await res.json()) as { error?: string };
        const errorMsg =
          typeof data.error === "string"
            ? data.error
            : "Please check your input";

        if (errorMsg.toLowerCase().includes("email")) {
          form.setError("email", { message: errorMsg });
        } else if (errorMsg.toLowerCase().includes("name")) {
          form.setError("name", { message: errorMsg });
        } else if (
          errorMsg.toLowerCase().includes("message") ||
          errorMsg.toLowerCase().includes("short")
        ) {
          form.setError("message", { message: errorMsg });
        } else {
          form.setError("root", { message: errorMsg });
        }
      } else if (res.status === 429) {
        toast.error(
          { en: "Please wait a bit", ja: "少々お待ちください", sv: "Vänta en stund" }[lang]
        );
      } else {
        // 500, 503, or other server errors
        toast.error(labels.deliveryIssue);
      }
    } catch {
      toast.error(labels.deliveryIssue);
    }
  }

  return (
    <>
      <Form {...form}>
        <form
          onSubmit={submitForm}
          className="space-y-5"
          noValidate
        >
          {/* Honeypot — visually hidden, bots may still fill it */}
          <div className="absolute h-px w-px overflow-hidden opacity-0" aria-hidden="true">
            <input
              tabIndex={-1}
              autoComplete="off"
              {...form.register("bot_field")}
            />
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{labels.name}</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      value={field.value ?? ""}
                      placeholder={labels.namePlaceholder}
                      maxLength={120}
                      aria-invalid={!!form.formState.errors.name}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{labels.email}</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      value={field.value ?? ""}
                      type="email"
                      placeholder={labels.emailPlaceholder}
                      maxLength={320}
                      aria-invalid={!!form.formState.errors.email}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="subject"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{labels.subject}</FormLabel>
                <FormControl>
                  <select
                    {...field}
                    value={field.value ?? ""}
                    disabled={isSubmitting}
                    aria-invalid={!!form.formState.errors.subject}
                    className="flex h-11 w-full rounded-[var(--radius-control)] border border-[var(--line)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--text)] shadow-sm transition-colors placeholder:text-[var(--text-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="" disabled>
                      {labels.subjectPlaceholder}
                    </option>
                    <option value="consulting">{labels.subjectConsulting}</option>
                    <option value="inquiry">{labels.subjectInquiry}</option>
                    <option value="collab">{labels.subjectCollab}</option>
                    <option value="general">{labels.subjectGeneral}</option>
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="message"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{labels.message}</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    value={field.value ?? ""}
                    placeholder={labels.messagePlaceholder}
                    rows={6}
                    maxLength={5000}
                    aria-invalid={!!form.formState.errors.message}
                    disabled={isSubmitting}
                    className="min-h-[11rem] resize-y"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {form.formState.errors.root && (
            <p className="text-sm text-destructive">
              {form.formState.errors.root.message}
            </p>
          )}

          <Button
            type="submit"
            disabled={isSubmitting}
            onClick={(event) => {
              event.preventDefault();
              void submitForm();
            }}
            className="w-full"
            variant="primary"
            size="lg"
          >
            {isSubmitting ? labels.sending : labels.send}
          </Button>
        </form>
      </Form>
      <Toaster />
    </>
  );
}
