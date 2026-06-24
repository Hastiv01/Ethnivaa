import React from 'react';

export const Terms: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16 font-sans text-obsidian-800">
      <h1 className="font-serif text-3xl font-bold text-crimson-950 mb-6">Ethnivaa Terms & Conditions</h1>
      <p className="mb-4"><strong>Effective Date:</strong> 24 June, 2026</p>
      <p className="mb-8">Welcome to Ethnivaa. By using our website and purchasing our products, you agree to the following terms and conditions.</p>

      <div className="space-y-6">
        <section>
          <h2 className="font-serif text-xl font-bold text-crimson-950 mb-2">1. About Ethnivaa</h2>
          <p>Ethnivaa offers handcrafted traditional and contemporary fashion jewellery, including necklaces, earrings, Navratri jewellery, and wedding jewellery sets.</p>
        </section>

        <section>
          <h2 className="font-serif text-xl font-bold text-crimson-950 mb-2">2. Product Information</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>We strive to display product images and descriptions accurately.</li>
            <li>Due to lighting, photography, and screen settings, actual colors may vary slightly.</li>
            <li>Handmade products may have minor variations, which are part of their uniqueness.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-serif text-xl font-bold text-crimson-950 mb-2">3. Pricing</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>All prices are displayed in Indian Rupees (INR).</li>
            <li>Prices may change without prior notice.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-serif text-xl font-bold text-crimson-950 mb-2">4. Orders</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>Orders are confirmed only after successful payment.</li>
            <li>Ethnivaa reserves the right to cancel any order due to stock issues, pricing errors, or suspected fraudulent activity.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-serif text-xl font-bold text-crimson-950 mb-2">5. Payments</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>We accept online payments through approved payment gateways.</li>
            <li>No Cash on Delivery (COD) is available.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-serif text-xl font-bold text-crimson-950 mb-2">6. Shipping</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>Orders are generally dispatched within 5–10 business days.</li>
            <li>Delivery timelines may vary depending on location and courier services.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-serif text-xl font-bold text-crimson-950 mb-2">7. Returns & Refunds</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>Returns are accepted only for damaged, defective, or incorrect products.</li>
            <li>Customers must notify us within 48 hours of delivery with photos on ethnivaa.help@gmail.com</li>
            <li>Refunds, if approved, will be processed to the original payment method.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-serif text-xl font-bold text-crimson-950 mb-2">8. Intellectual Property</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>All website content, logos, images, and product designs belong to Ethnivaa.</li>
            <li>Unauthorized use or reproduction is prohibited.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-serif text-xl font-bold text-crimson-950 mb-2">9. Limitation of Liability</h2>
          <p>Ethnivaa shall not be liable for indirect or consequential losses arising from product use.</p>
        </section>

        <section>
          <h2 className="font-serif text-xl font-bold text-crimson-950 mb-2">10. Changes to Terms</h2>
          <p>We may update these terms at any time without prior notice.</p>
        </section>
      </div>
    </div>
  );
};
