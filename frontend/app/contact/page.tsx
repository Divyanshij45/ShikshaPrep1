import Head from "next/head";

export default function Contact() {
  return (
    <>
      <Head>
        <title>Contact | MockTestAI</title>
        <meta
          name="description"
          content="Contact MockTestAI for support, feedback, or collaboration."
        />
      </Head>

      <section className="min-h-screen bg-[#f8faff] px-6 py-20">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl font-extrabold text-gray-800 mb-4">
            Get in Touch
          </h1>
          <p className="text-gray-600 text-lg mb-12">
            Have questions, suggestions, or partnership ideas? We’d love to hear
            from you.
          </p>

          <div className="bg-white shadow-lg rounded-2xl p-8 text-left space-y-8">
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-1">
                📧 Email
              </h2>
              <p className="text-blue-600">joshidivyanshi065@gmail.com</p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-1">
                📍 Address
              </h2>
              <p className="text-gray-600">Mumbai, Maharashtra</p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-1">
                🔗 Socials
              </h2>
              <ul className="space-y-1 text-blue-600">
                <li>
                  <p className="flex items-center space-x-2">
                    <a
                      href="https://linkedin.com/company/mocktestai"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      LinkedIn
                    </a>
                  </p>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
