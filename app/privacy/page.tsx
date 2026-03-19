export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-semibold text-black mb-8">Privacy Policy</h1>

        <div className="prose prose-lg max-w-none">
          <p className="text-gray-600 mb-6">
            Last updated: {new Date().toLocaleDateString()}
          </p>

          <h2 className="text-2xl font-semibold text-black mt-8 mb-4">Introduction</h2>
          <p className="text-gray-600 mb-6">
            Welcome to FreePrompts.Store. We are committed to protecting your personal data and respecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform to discover, create, and share AI prompts and lists.
          </p>

          <h2 className="text-2xl font-semibold text-black mt-8 mb-4">Information We Collect</h2>
          <p className="text-gray-600 mb-6">
            We collect information that you voluntarily provide when you interact with our platform:
          </p>
          <ul className="text-gray-600 mb-6 space-y-2">
            <li>• <strong>Account Information:</strong> When you sign up, we collect your email address, username, and profile picture (if provided).</li>
            <li>• <strong>User‑Generated Content:</strong> This includes prompts, lists, comments, likes, and any other content you submit.</li>
            <li>• <strong>Usage Data:</strong> We automatically collect information about how you interact with the platform, such as pages visited, prompts viewed, searches performed, and time spent.</li>
            <li>• <strong>Technical Data:</strong> Your IP address, browser type, device information, and cookies.</li>
            <li>• <strong>Communication Data:</strong> If you contact us, we keep records of those communications.</li>
          </ul>

          <h2 className="text-2xl font-semibold text-black mt-8 mb-4">How We Use Your Information</h2>
          <p className="text-gray-600 mb-6">
            We use the collected information for the following purposes:
          </p>
          <ul className="text-gray-600 mb-6 space-y-2">
            <li>• To provide, operate, and improve our platform and its features.</li>
            <li>• To display your prompts, lists, and profile to other users.</li>
            <li>• To send you notifications about new prompts, likes, comments, and system updates (you can opt‑out anytime).</li>
            <li>• To personalize your experience, such as recommending prompts and lists based on your interests.</li>
            <li>• To communicate with you about your account, security updates, and customer support.</li>
            <li>• To analyze usage trends and optimize our platform’s performance.</li>
            <li>• To enforce our Terms of Service and protect the integrity of our community.</li>
          </ul>

          <h2 className="text-2xl font-semibold text-black mt-8 mb-4">Information Sharing</h2>
          <p className="text-gray-600 mb-6">
            We do not sell, rent, or trade your personal information to third parties. However, we may share your information in the following limited circumstances:
          </p>
          <ul className="text-gray-600 mb-6 space-y-2">
            <li>• <strong>Service Providers:</strong> We may share data with trusted third‑party vendors who assist us in hosting, analytics, email delivery, and other essential services.</li>
            <li>• <strong>Legal Compliance:</strong> We may disclose information if required by law, court order, or governmental regulation.</li>
            <li>• <strong>Business Transfers:</strong> In the event of a merger, acquisition, or sale of assets, your information may be transferred as part of the transaction.</li>
            <li>• <strong>Public Content:</strong> Your prompts, lists, and public profile information are visible to all users of the platform.</li>
          </ul>

          <h2 className="text-2xl font-semibold text-black mt-8 mb-4">Data Security</h2>
          <p className="text-gray-600 mb-6">
            We implement industry‑standard security measures to protect your personal data from unauthorized access, alteration, disclosure, or destruction. These include encryption, secure server infrastructure, and regular security assessments. However, no method of transmission over the Internet or electronic storage is 100% secure, and we cannot guarantee absolute security.
          </p>

          <h2 className="text-2xl font-semibold text-black mt-8 mb-4">Your Rights</h2>
          <p className="text-gray-600 mb-6">
            Depending on your location, you may have certain rights regarding your personal data:
          </p>
          <ul className="text-gray-600 mb-6 space-y-2">
            <li>• <strong>Access:</strong> You can request a copy of the personal data we hold about you.</li>
            <li>• <strong>Correction:</strong> You may update or correct your account information at any time via your profile settings.</li>
            <li>• <strong>Deletion:</strong> You can delete your account and associated data, except where we are required to retain it for legal or legitimate business purposes.</li>
            <li>• <strong>Opt‑out:</strong> You can unsubscribe from marketing emails and adjust notification preferences in your account settings.</li>
          </ul>
          <p className="text-gray-600 mb-6">
            To exercise any of these rights, please contact us at <a href="mailto:hello@freeprompts.store" className="text-black underline">hello@freeprompts.store</a>.
          </p>

          <h2 className="text-2xl font-semibold text-black mt-8 mb-4">Cookies and Tracking Technologies</h2>
          <p className="text-gray-600 mb-6">
            We use cookies and similar tracking technologies to enhance your browsing experience, analyze traffic, and personalize content. You can manage your cookie preferences through your browser settings. Please note that disabling cookies may affect certain features of the platform.
          </p>

          <h2 className="text-2xl font-semibold text-black mt-8 mb-4">Third‑Party Links</h2>
          <p className="text-gray-600 mb-6">
            Our platform may contain links to external websites or services that are not operated by us. We are not responsible for the privacy practices or content of those third‑party sites. We encourage you to review their privacy policies before providing any personal information.
          </p>

          <h2 className="text-2xl font-semibold text-black mt-8 mb-4">Children’s Privacy</h2>
          <p className="text-gray-600 mb-6">
            Our platform is not intended for individuals under the age of 13. We do not knowingly collect personal information from children under 13. If we become aware that we have inadvertently collected such data, we will take steps to delete it promptly.
          </p>

          <h2 className="text-2xl font-semibold text-black mt-8 mb-4">Changes to This Policy</h2>
          <p className="text-gray-600 mb-6">
            We may update this Privacy Policy from time to time to reflect changes in our practices or legal requirements. The updated version will be posted on this page with a revised “Last updated” date. We encourage you to review this page periodically for any changes.
          </p>

          <h2 className="text-2xl font-semibold text-black mt-8 mb-4">Contact Us</h2>
          <p className="text-gray-600 mb-6">
            If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us at:
          </p>
          <p className="text-gray-600 mb-6">
            <strong>Email:</strong> <a href="mailto:hello@freeprompts.store" className="text-black underline">hello@freeprompts.store</a>
          </p>
        </div>
      </div>
    </div>
  );
}