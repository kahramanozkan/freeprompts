import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About',
  description: 'Learn about FreePrompts, our mission, and what we offer to the AI prompt community.',
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-semibold text-black mb-8">About FreePrompts</h1>

        <div className="prose prose-lg max-w-none">
          <p className="text-gray-600 mb-6">
            FreePrompts is a community-driven platform dedicated to sharing high-quality AI prompts
            for various AI tools including ChatGPT, Google Gemini, Claude, and other AI assistants.
          </p>

          <h2 className="text-2xl font-semibold text-black mt-8 mb-4">Our Mission</h2>
          <p className="text-gray-600 mb-6">
            Our mission is to democratize access to effective AI prompts and foster a collaborative
            community where users can discover, share, and improve AI interactions. We believe that
            the right prompt can unlock the full potential of AI tools, and everyone should have
            access to these resources.
          </p>

          <h2 className="text-2xl font-semibold text-black mt-8 mb-4">What We Offer</h2>
          <ul className="text-gray-600 mb-6 space-y-2">
            <li>• Curated collection of high-quality AI prompts</li>
            <li>• Community-driven content creation and improvement</li>
            <li>• Organized prompt collections and categories</li>
            <li>• User-friendly interface for discovering and sharing prompts</li>
            <li>• Regular updates with new prompts and techniques</li>
          </ul>

          <h2 className="text-2xl font-semibold text-black mt-8 mb-4">Community Guidelines</h2>
          <p className="text-gray-600 mb-6">
            We encourage respectful and constructive contributions to our community. All prompts
            should be original or properly attributed, and we ask that users contribute positively
            to the platform by sharing effective, well-crafted prompts that benefit other users.
          </p>

          <h2 className="text-2xl font-semibold text-black mt-8 mb-4">Contact Us</h2>
          <p className="text-gray-600 mb-6">
            Have questions, suggestions, or feedback? We'd love to hear from you. You can reach
            us through our community forums or <a href="mailto:hello@freeprompts.store" className="text-black underline">contact form</a>.
          </p>

          <p className="text-gray-600">
            Thank you for being part of the FreePrompts community!
          </p>
        </div>
      </div>
    </div>
  );
}