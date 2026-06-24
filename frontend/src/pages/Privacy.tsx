import React from 'react';

export const Privacy: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16 font-sans text-obsidian-800">
      <h1 className="font-serif text-3xl font-bold text-crimson-950 mb-6">Ethnivaa Privacy Policy</h1>
      <p className="mb-4"><strong>Effective Date:</strong> 24 June, 2026</p>
      <p className="mb-8">At Ethnivaa, we value your privacy and are committed to protecting your personal information.</p>

      <div className="space-y-6">
        <section>
          <h2 className="font-serif text-xl font-bold text-crimson-950 mb-2">Information We Collect</h2>
          <p className="mb-2">When you place an order or contact us, we may collect:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Name</li>
            <li>Email address</li>
            <li>Phone number</li>
            <li>Shipping address</li>
            <li>Payment transaction details</li>
          </ul>
          <p className="mt-2 text-sm text-obsidian-500">Privacy policies typically disclose what personal information is collected, how it is used, stored, and shared.</p>
        </section>

        <section>
          <h2 className="font-serif text-xl font-bold text-crimson-950 mb-2">How We Use Your Information</h2>
          <p className="mb-2">We use your information to:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Process orders</li>
            <li>Deliver products</li>
            <li>Provide customer support</li>
            <li>Send order updates</li>
            <li>Improve our services</li>
          </ul>
        </section>

        <section>
          <h2 className="font-serif text-xl font-bold text-crimson-950 mb-2">Payment Security</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>Payment information is processed securely through trusted payment gateways.</li>
            <li>Ethnivaa does not store complete card details.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-serif text-xl font-bold text-crimson-950 mb-2">Information Sharing</h2>
          <p className="mb-2">We do not sell or rent customer information. Information may be shared only with:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Delivery partners</li>
            <li>Payment processors</li>
            <li>Legal authorities when required by law</li>
          </ul>
        </section>

        <section>
          <h2 className="font-serif text-xl font-bold text-crimson-950 mb-2">Cookies</h2>
          <p>We may use cookies to improve website performance and user experience.</p>
        </section>

        <section>
          <h2 className="font-serif text-xl font-bold text-crimson-950 mb-2">Data Protection</h2>
          <p>We take reasonable security measures to protect customer data from unauthorized access.</p>
        </section>

        <section>
          <h2 className="font-serif text-xl font-bold text-crimson-950 mb-2">Your Rights</h2>
          <p className="mb-2">You may request:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Access to your information</li>
            <li>Correction of inaccurate data</li>
            <li>Deletion of your account information where applicable</li>
          </ul>
        </section>

        <section>
          <h2 className="font-serif text-xl font-bold text-crimson-950 mb-2">Contact</h2>
          <p className="mb-2">For privacy-related questions:</p>
          <p>
            <strong>Ethnivaa</strong><br/>
            Email: ethnivaa.help@gmail.com<br/>
            WhatsApp: +91 78748 60077
          </p>
        </section>
      </div>
    </div>
  );
};
