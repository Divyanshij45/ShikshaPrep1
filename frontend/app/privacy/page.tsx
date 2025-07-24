import Head from "next/head";

export default function PrivacyPolicy() {
  return (
    <>
      <Head>
        <title>Privacy Policy | MockTestAI</title>
        <meta
          name="description"
          content="Privacy policy for MockTestAI users and data protection."
        />
      </Head>

      <section className="min-h-screen bg-[#f8faff] px-6 py-20">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-800 text-center mb-6">
            Privacy Policy
          </h1>
          <p className="text-center text-gray-600 text-base mb-10">
            We respect your privacy. Below is a brief overview of how we handle
            your data.
          </p>

          <div className="bg-white p-8 rounded-2xl shadow-lg space-y-6 text-gray-700 leading-relaxed text-sm sm:text-base">
            <div>
              <h2 className="font-semibold text-gray-800">
                Information Collection
              </h2>
              <p>
                We collect uploaded PDFs, basic user info (email), and usage
                data to improve our service.
              </p>
            </div>

            <div>
              <h2 className="font-semibold text-gray-800">Usage</h2>
              <p>
                Your content is processed to generate mock tests. We do not
                share your files or data with third parties.
              </p>
            </div>

            <div>
              <h2 className="font-semibold text-gray-800">Security</h2>
              <p>
                All data is encrypted and stored securely. Uploaded files are
                deleted after processing unless saved by the user.
              </p>
            </div>

            <div>
              <h2 className="font-semibold text-gray-800">Contact</h2>
              <p>
                For questions or data requests, email us at{" "}
                <a
                  href="mailto:support@mocktestai.com"
                  className="text-blue-600 underline"
                >
                  support@mocktestai.com
                </a>
                .
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
