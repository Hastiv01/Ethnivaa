import React from 'react';

export const Returns: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16 font-sans text-obsidian-800">
      <h1 className="font-serif text-3xl font-bold text-crimson-950 mb-6">Return & Refund Policy – Ethnivaa</h1>
      <p className="mb-4"><strong>Effective Date:</strong> 24 June, 2026</p>
      <p className="mb-8">At Ethnivaa, we take great care in crafting and packaging our jewellery. Customer satisfaction is important to us, and we strive to ensure every order reaches you in perfect condition.</p>

      <div className="space-y-6">
        <section>
          <h2 className="font-serif text-xl font-bold text-crimson-950 mb-2">1. Eligibility for Returns</h2>
          <p className="mb-2">Returns are accepted only under the following circumstances:</p>
          <ul className="list-disc pl-5 space-y-1 mb-2">
            <li>You received a damaged product.</li>
            <li>You received an incorrect product.</li>
            <li>The product has a manufacturing defect.</li>
          </ul>
          <p>To be eligible, you must notify us within 48 hours of delivery and provide clear photos/videos of the issue.</p>
        </section>

        <section>
          <h2 className="font-serif text-xl font-bold text-crimson-950 mb-2">2. Non-Returnable Items</h2>
          <p className="mb-2">The following items are not eligible for return or refund:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Customized or personalized jewellery.</li>
            <li>Products damaged due to misuse, improper handling, or normal wear and tear.</li>
            <li>Minor variations in color, texture, or design due to photography, lighting, or handcrafted nature of the product.</li>
            <li>Change of mind after purchase.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-serif text-xl font-bold text-crimson-950 mb-2">3. Return Request Process</h2>
          <p className="mb-2">To request a return:</p>
          <ul className="list-disc pl-5 space-y-1 mb-2">
            <li>Email us at ethnivaa.help@gmail.com or contact us via WhatsApp.</li>
            <li>Share: Order ID, Product images, Description of the issue.</li>
          </ul>
          <p>Our team will review the request within 2–3 business days. If approved, return instructions will be provided.</p>
        </section>

        <section>
          <h2 className="font-serif text-xl font-bold text-crimson-950 mb-2">4. Replacement Policy</h2>
          <p>We do not offer replacements for any items under any circumstances. If you receive a damaged, defective, or incorrect product, you may apply for a return and refund.</p>
        </section>

        <section>
          <h2 className="font-serif text-xl font-bold text-crimson-950 mb-2">5. Refund Policy</h2>
          <p className="mb-2">Refunds are applicable only when:</p>
          <ul className="list-disc pl-5 space-y-1 mb-2">
            <li>The order is cancelled by Ethnivaa.</li>
            <li>The product received is damaged, defective, or incorrect and the return is approved.</li>
          </ul>
          <p>Refunds will be processed to the original payment method within 5–10 business days after approval.</p>
        </section>

        <section>
          <h2 className="font-serif text-xl font-bold text-crimson-950 mb-2">6. Return Shipping</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>If the return is due to our error (wrong item, damaged item, manufacturing defect), Ethnivaa will bear the return shipping cost.</li>
            <li>For any other approved exceptional cases, return shipping charges may be borne by the customer.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-serif text-xl font-bold text-crimson-950 mb-2">7. Order Cancellation</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>Orders may be cancelled before dispatch.</li>
            <li>Once an order has been shipped, cancellation requests cannot be accepted.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-serif text-xl font-bold text-crimson-950 mb-2">8. Contact Us</h2>
          <p className="mb-2">For any return or refund requests:</p>
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
