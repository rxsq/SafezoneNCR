export const metadata = { title: "Privacy Policy" };

const SITE_NAME = "Acme Demo";
const CONTACT_EMAIL = "support@example.com";

export default function PrivacyPage() {
  const updated = new Date().toISOString().slice(0, 10);
  return (
    <main className="mx-auto max-w-3xl px-6 py-10 space-y-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold">Privacy Policy</h1>
        <p className="text-sm text-gray-600">Last updated: {updated}</p>
      </header>

      <p className="text-sm text-gray-600">
        This is a demo site for illustrative purposes only. It’s not intended
        for production use and does not process real personal data. If you
        provide any information, you do so voluntarily and understanding this is
        a sandbox.
      </p>

      <section className="space-y-3">
        <h2 className="text-lg font-medium">Information We Collect</h2>
        <p className="text-sm text-gray-800">
          We may collect minimal information you submit (e.g., names, emails, or
          form inputs) solely to demonstrate app functionality. We may also log
          basic technical data (e.g., IP, device, browser) typical for debugging
          and analytics in a demo environment.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-medium">How We Use Information</h2>
        <ul className="list-disc pl-5 text-sm text-gray-800 space-y-1">
          <li>To render demo features and sample workflows.</li>
          <li>To diagnose issues and improve the demo experience.</li>
          <li>To prevent abuse and ensure stability of the demo.</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-medium">Cookies & Local Storage</h2>
        <p className="text-sm text-gray-800">
          We may use cookies or local storage for session state or basic
          preferences. In this demo, they are not used for advertising or
          cross-site tracking.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-medium">Data Retention</h2>
        <p className="text-sm text-gray-800">
          Demo data may be reset at any time. We don’t guarantee persistence.
          Don’t store sensitive or confidential information here.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-medium">Security</h2>
        <p className="text-sm text-gray-800">
          This is a non-production environment. While we take reasonable steps
          for a demo, it is not hardened for real-world sensitive data.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-medium">Third-Party Services</h2>
        <p className="text-sm text-gray-800">
          We may rely on third-party libraries or services for infrastructure,
          analytics, or UI. Their handling of data is governed by their own
          policies.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-medium">Your Choices</h2>
        <p className="text-sm text-gray-800">
          You can stop using {SITE_NAME} at any time. If you want us to remove
          demo data you submitted, email us and we’ll delete what we reasonably
          can within this environment.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-medium">Changes</h2>
        <p className="text-sm text-gray-800">
          We may update this page to reflect changes in the demo. We’ll adjust
          the “Last updated” date above.
        </p>
      </section>

      <section className="space-y-1">
        <h2 className="text-lg font-medium">Contact</h2>
        <p className="text-sm text-gray-800">
          Questions? Email{" "}
          <a className="underline" href={`mailto:${CONTACT_EMAIL}`}>
            {CONTACT_EMAIL}
          </a>
          .
        </p>
      </section>
    </main>
  );
}
