export const metadata = { title: "Support" };

const SITE_NAME = "Acme Demo";
const CONTACT_EMAIL = "support@example.com";

export default function SupportPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-10 space-y-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold">Support</h1>
        <p className="text-sm text-gray-600">
          Need a hand with the {SITE_NAME} demo? You’re in the right place.
        </p>
      </header>

      <section className="space-y-3">
        <h2 className="text-lg font-medium">Quick Help</h2>
        <ul className="list-disc pl-5 text-sm text-gray-800 space-y-1">
          <li>Refresh the page if you see stale or partial data.</li>
          <li>Clear your browser cache if UI looks out of date.</li>
          <li>Don’t use real secrets—this is a sandbox.</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-medium">Contact</h2>
        <p className="text-sm text-gray-800">
          For demo questions or bug reports, email{" "}
          <a href={`mailto:${CONTACT_EMAIL}`} className="underline">
            {CONTACT_EMAIL}
          </a>
          .
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-medium">FAQ</h2>
        <div className="divide-y rounded border">
          <Faq q="Is this production-ready?">
            No. It’s a demo for showcasing features and flows.
          </Faq>
          <Faq q="Why did my data disappear?">
            Demo data may reset during updates or maintenance.
          </Faq>
          <Faq q="Can I request a new feature?">
            Absolutely—send us a short description of what you’d like to see.
          </Faq>
        </div>
      </section>
    </main>
  );
}

function Faq({ q, children }: { q: string; children: React.ReactNode }) {
  return (
    <details className="p-3">
      <summary className="cursor-pointer text-sm font-medium">{q}</summary>
      <div className="mt-2 text-sm text-gray-800">{children}</div>
    </details>
  );
}
