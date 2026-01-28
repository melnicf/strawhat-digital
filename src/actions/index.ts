import { defineAction, ActionError } from "astro:actions";
import { z } from "astro:schema";
import { Resend } from "resend";

// =============================================================================
// Rate Limiting (in-memory store - resets on server restart)
// =============================================================================
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour
const RATE_LIMIT_MAX_REQUESTS = 5; // 5 submissions per hour per IP

function checkRateLimit(identifier: string): boolean {
  const now = Date.now();
  const record = rateLimitStore.get(identifier);

  if (!record || now > record.resetTime) {
    rateLimitStore.set(identifier, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW,
    });
    return true;
  }

  if (record.count >= RATE_LIMIT_MAX_REQUESTS) {
    return false;
  }

  record.count++;
  return true;
}

// Clean up old entries periodically
setInterval(
  () => {
    const now = Date.now();
    for (const [key, value] of rateLimitStore.entries()) {
      if (now > value.resetTime) {
        rateLimitStore.delete(key);
      }
    }
  },
  5 * 60 * 1000
); // Clean up every 5 minutes

// =============================================================================
// Input Sanitization
// =============================================================================
function sanitizeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// =============================================================================
// Resend Client (lazy-loaded)
// =============================================================================
let resend: Resend | null = null;
function getResendClient(): Resend {
  if (!resend) {
    const apiKey = import.meta.env.RESEND_API_KEY;
    if (!apiKey) {
      throw new Error("RESEND_API_KEY environment variable is not set");
    }
    resend = new Resend(apiKey);
  }
  return resend;
}

// =============================================================================
// Contact Form Action
// =============================================================================
export const server = {
  sendContactEmail: defineAction({
    accept: "form",
    input: z.object({
      name: z
        .string()
        .min(2, "Name must be at least 2 characters")
        .max(100, "Name must be less than 100 characters")
        .transform((val) => val.trim()),
      email: z
        .string()
        .email("Please enter a valid email address")
        .max(254, "Email must be less than 254 characters")
        .transform((val) => val.trim().toLowerCase()),
      projectType: z.enum([
        "web-app",
        "mobile-app",
        "api-backend",
        "ui-ux-design",
        "consulting",
        "other",
      ]),
      budget: z
        .string()
        .optional()
        .nullable()
        .transform((val) => {
          // Handle null, undefined, empty string, or invalid values
          if (!val || val === "" || val === "null") return undefined;
          const validBudgets = [
            "under-10k",
            "10k-25k",
            "25k-50k",
            "50k-100k",
            "over-100k",
            "not-sure",
          ];
          return validBudgets.includes(val) ? val : undefined;
        }),
      message: z
        .string()
        .min(10, "Message must be at least 10 characters")
        .max(5000, "Message must be less than 5000 characters")
        .transform((val) => val.trim()),
      // Honeypot field - should be empty (bots fill this in)
      website: z.string().max(0, "Invalid submission").optional(),
    }),
    handler: async (input, context) => {
      // 1. Honeypot check - if filled, silently reject (but return success to fool bots)
      if (input.website && input.website.length > 0) {
        console.log("Honeypot triggered - likely spam submission");
        // Return success to not tip off the bot
        return { success: true };
      }

      // 2. Rate limiting by IP
      const clientIP =
        context.request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
        context.request.headers.get("x-real-ip") ||
        "unknown";

      if (!checkRateLimit(clientIP)) {
        throw new ActionError({
          code: "TOO_MANY_REQUESTS",
          message: "Too many submissions. Please try again later.",
        });
      }

      // 3. Additional spam checks
      const { name, email, projectType, budget, message } = input;

      // Check for common spam patterns
      const spamPatterns = [
        /\b(viagra|cialis|casino|lottery|winner|congratulations|claim your prize)\b/i,
        /\[url=/i,
        /<a\s+href/i,
        /https?:\/\/[^\s]+\.(ru|cn|tk|ml|ga|cf)\b/i,
      ];

      const fullText = `${name} ${message}`;
      for (const pattern of spamPatterns) {
        if (pattern.test(fullText)) {
          console.log("Spam pattern detected:", pattern);
          // Return success to not tip off spammers
          return { success: true };
        }
      }

      // 4. Sanitize inputs for HTML email
      const safeName = sanitizeHtml(name);
      const safeEmail = sanitizeHtml(email);
      const safeMessage = sanitizeHtml(message);

      const projectTypeLabels: Record<string, string> = {
        "web-app": "Web Application",
        "mobile-app": "Mobile App",
        "api-backend": "API / Backend",
        "ui-ux-design": "UI/UX Design",
        consulting: "Consulting",
        other: "Other",
      };

      const budgetLabels: Record<string, string> = {
        "under-10k": "Under $10,000",
        "10k-25k": "$10,000 - $25,000",
        "25k-50k": "$25,000 - $50,000",
        "50k-100k": "$50,000 - $100,000",
        "over-100k": "Over $100,000",
        "not-sure": "Not sure yet",
      };

      const contactEmail =
        import.meta.env.CONTACT_EMAIL || "hello@strawhat.digital";

      try {
        const resendClient = getResendClient();
        const { error } = await resendClient.emails.send({
          from: "Strawhat <noreply@hello.strawhat.digital>",
          to: [contactEmail],
          replyTo: email,
          subject: `New Project Inquiry: ${projectTypeLabels[projectType]} from ${safeName}`,
          html: `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h1 style="color: #e11d48; font-size: 24px; margin-bottom: 24px;">New Project Inquiry</h1>
              
              <div style="background: #fafafa; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
                <h2 style="font-size: 16px; color: #52525b; margin: 0 0 16px 0; text-transform: uppercase; letter-spacing: 0.05em;">Contact Details</h2>
                <p style="margin: 0 0 8px 0;"><strong>Name:</strong> ${safeName}</p>
                <p style="margin: 0 0 8px 0;"><strong>Email:</strong> <a href="mailto:${safeEmail}" style="color: #e11d48;">${safeEmail}</a></p>
                <p style="margin: 0; font-size: 12px; color: #a1a1aa;">IP: ${clientIP}</p>
              </div>
              
              <div style="background: #fafafa; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
                <h2 style="font-size: 16px; color: #52525b; margin: 0 0 16px 0; text-transform: uppercase; letter-spacing: 0.05em;">Project Details</h2>
                <p style="margin: 0 0 8px 0;"><strong>Project Type:</strong> ${projectTypeLabels[projectType]}</p>
                <p style="margin: 0;"><strong>Budget Range:</strong> ${budget ? budgetLabels[budget] : "Not specified"}</p>
              </div>
              
              <div style="background: #fafafa; border-radius: 8px; padding: 20px;">
                <h2 style="font-size: 16px; color: #52525b; margin: 0 0 16px 0; text-transform: uppercase; letter-spacing: 0.05em;">Message</h2>
                <p style="margin: 0; white-space: pre-wrap; line-height: 1.6;">${safeMessage}</p>
              </div>
              
              <hr style="border: none; border-top: 1px solid #e4e4e7; margin: 32px 0;" />
              
              <p style="color: #a1a1aa; font-size: 14px; margin: 0;">
                This message was sent from the contact form at strawhat.digital
              </p>
            </div>
          `,
        });

        if (error) {
          console.error("Resend error:", error);
          throw new ActionError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to send email. Please try again later.",
          });
        }

        return { success: true };
      } catch (err) {
        // Don't expose internal errors
        if (err instanceof ActionError) {
          throw err;
        }
        console.error("Email send error:", err);
        throw new ActionError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to send email. Please try again later.",
        });
      }
    },
  }),
};
