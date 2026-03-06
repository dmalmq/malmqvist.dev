import { jsxs, jsx, Fragment } from 'react/jsx-runtime';
import { useState } from 'react';

function ContactForm({ lang = "en" }) {
  const [status, setStatus] = useState("idle");
  const texts = {
    en: {
      name: "Name",
      email: "Email",
      subject: "Subject",
      subjects: {
        inquiry: "Job Inquiry",
        collab: "Collaboration",
        general: "General"
      },
      message: "Message",
      send: "Send Message",
      sending: "Sending...",
      success: "Message sent successfully. I'll get back to you soon.",
      error: "Something went wrong. Please try again or email me directly."
    },
    ja: {
      name: "お名前",
      email: "メールアドレス",
      subject: "件名",
      subjects: {
        inquiry: "仕事のご相談",
        collab: "コラボレーション",
        general: "その他のお問い合わせ"
      },
      message: "メッセージ",
      send: "送信する",
      sending: "送信中...",
      success: "メッセージを送信しました。折り返しご連絡いたします。",
      error: "エラーが発生しました。もう一度お試しいただくか、直接メールでご連絡ください。"
    }
  };
  const t = texts[lang];
  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("submitting");
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData);
    if (data.bot_field) {
      setStatus("success");
      return;
    }
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      if (res.ok) {
        setStatus("success");
      } else {
        setStatus("error");
      }
    } catch (err) {
      setStatus("error");
    }
  };
  if (status === "success") {
    return /* @__PURE__ */ jsxs("div", { className: "p-8 bg-[var(--color-bg-secondary)] border border-[var(--color-success)] rounded-[8px] text-center", children: [
      /* @__PURE__ */ jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", width: "48", height: "48", viewBox: "0 0 24 24", fill: "none", stroke: "var(--color-success)", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className: "mx-auto mb-4 lucide lucide-check-circle-2", children: [
        /* @__PURE__ */ jsx("circle", { cx: "12", cy: "12", r: "10" }),
        /* @__PURE__ */ jsx("path", { d: "m9 12 2 2 4-4" })
      ] }),
      /* @__PURE__ */ jsx("p", { className: "text-lg font-medium text-[var(--color-text-heading)]", children: t.success })
    ] });
  }
  return /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, className: "space-y-6", children: [
    /* @__PURE__ */ jsx("input", { type: "text", name: "bot_field", className: "hidden", "aria-hidden": "true", tabIndex: -1 }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsx("label", { htmlFor: "name", className: "text-sm font-bold tracking-wide text-[var(--color-text-heading)]", children: t.name }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "text",
            id: "name",
            name: "name",
            required: true,
            readOnly: status === "submitting",
            className: "w-full bg-[var(--color-bg-primary)] border border-[var(--color-border)] rounded-[6px] px-4 py-3 text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)] transition-colors"
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsx("label", { htmlFor: "email", className: "text-sm font-bold tracking-wide text-[var(--color-text-heading)]", children: t.email }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "email",
            id: "email",
            name: "email",
            required: true,
            readOnly: status === "submitting",
            className: "w-full bg-[var(--color-bg-primary)] border border-[var(--color-border)] rounded-[6px] px-4 py-3 text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)] transition-colors"
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
      /* @__PURE__ */ jsx("label", { htmlFor: "subject", className: "text-sm font-bold tracking-wide text-[var(--color-text-heading)]", children: t.subject }),
      /* @__PURE__ */ jsxs(
        "select",
        {
          id: "subject",
          name: "subject",
          required: true,
          disabled: status === "submitting",
          className: "w-full bg-[var(--color-bg-primary)] border border-[var(--color-border)] rounded-[6px] px-4 py-3 text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)] transition-colors appearance-none",
          children: [
            /* @__PURE__ */ jsx("option", { value: "inquiry", children: t.subjects.inquiry }),
            /* @__PURE__ */ jsx("option", { value: "collab", children: t.subjects.collab }),
            /* @__PURE__ */ jsx("option", { value: "general", children: t.subjects.general })
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
      /* @__PURE__ */ jsx("label", { htmlFor: "message", className: "text-sm font-bold tracking-wide text-[var(--color-text-heading)]", children: t.message }),
      /* @__PURE__ */ jsx(
        "textarea",
        {
          id: "message",
          name: "message",
          required: true,
          rows: 6,
          readOnly: status === "submitting",
          className: "w-full bg-[var(--color-bg-primary)] border border-[var(--color-border)] rounded-[6px] px-4 py-3 text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)] transition-colors resize-y"
        }
      )
    ] }),
    status === "error" && /* @__PURE__ */ jsx("div", { className: "p-4 bg-[var(--color-error)]/10 border border-[var(--color-error)] rounded-[6px] text-[var(--color-error)] text-sm font-medium", children: t.error }),
    /* @__PURE__ */ jsx(
      "button",
      {
        type: "submit",
        disabled: status === "submitting",
        className: "w-full md:w-auto inline-flex items-center justify-center px-8 py-4 bg-[var(--color-accent)] text-white font-bold rounded-[6px] hover:bg-[var(--color-accent-hover)] hover:-translate-y-0.5 hover:shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-accent)] dark:focus:ring-offset-[var(--color-bg-primary)] disabled:opacity-70 disabled:hover:transform-none disabled:hover:shadow-none",
        children: status === "submitting" ? /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsxs("svg", { className: "animate-spin -ml-1 mr-2 h-4 w-4 text-white", xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", children: [
            /* @__PURE__ */ jsx("circle", { className: "opacity-25", cx: "12", cy: "12", r: "10", stroke: "currentColor", strokeWidth: "4" }),
            /* @__PURE__ */ jsx("path", { className: "opacity-75", fill: "currentColor", d: "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" })
          ] }),
          t.sending
        ] }) : t.send
      }
    )
  ] });
}

export { ContactForm as C };
