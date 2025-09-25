export const metadata = { title: "Terms of Use" };

const SITE_NAME = "Acme Demo";
const COMPANY_NAME = "Acme, Inc.";
const CONTACT_EMAIL = "support@example.com";

export default function TermsPage() {
  const updated = new Date().toISOString().slice(0, 10);
  return (
    <main className="mx-auto max-w-3xl px-6 py-10 space-y-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold">Terms of Use</h1>
        <p className="text-sm text-gray-600">Last updated: {updated}</p>
      </header>

      <p className="text-sm text-gray-600">
        These Terms govern your use of this demo application. By accessing or
        using {SITE_NAME}, you agree to these Terms. This is a non-production
        environment provided “as is” for demonstration purposes only.
      </p>

      <section>
        <h2 className="text-lg font-medium">1. Demo Only</h2>
        <p className="text-sm text-gray-800">
          {SITE_NAME} is a sandbox. Do not rely on it for real business, legal,
          medical, safety, or financial decisions. Do not upload confidential,
          sensitive, or proprietary information.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-medium">2. Acceptable Use</h2>
        <ul className="list-disc pl-5 text-sm text-gray-800 space-y-1">
          <li>No unlawful, harmful, or abusive behavior.</li>
          <li>No attempts to breach, scan, or disrupt the service.</li>
          <li>No infringement of others’ rights or privacy.</li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-medium">3. Content & Ownership</h2>
        <p className="text-sm text-gray-800">
          You retain any rights to content you submit. You grant {COMPANY_NAME}{" "}
          a limited license to process it solely to operate and improve the
          demo. Do not submit content you don’t have rights to share in a demo
          context.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-medium">4. No Warranty</h2>
        <p className="text-sm text-gray-800">
          {SITE_NAME} is provided “as is” and “as available.” We disclaim all
          warranties to the maximum extent permitted by law, including fitness
          for a particular purpose and non-infringement.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-medium">5. Limitation of Liability</h2>
        <p className="text-sm text-gray-800">
          To the fullest extent permitted by law, {COMPANY_NAME} will not be
          liable for any indirect, incidental, consequential, special, or
          exemplary damages arising from or relating to your use of this demo.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-medium">6. Termination</h2>
        <p className="text-sm text-gray-800">
          We may suspend or end access at any time for any reason, including to
          maintain, update, or remove the demo.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-medium">7. Changes to Terms</h2>
        <p className="text-sm text-gray-800">
          We may modify these Terms at any time. Continued use after changes
          means you accept the updated Terms.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-medium">8. Contact</h2>
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
