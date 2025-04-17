import { Link } from 'wouter';

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white pt-10 pb-6">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">
              <span className="text-[#10847e]">PillNow</span>
            </h3>
            <p className="text-gray-400 text-sm mb-4">India's leading online pharmacy & healthcare platform</p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white"><i className="fab fa-facebook-f"></i></a>
              <a href="#" className="text-gray-400 hover:text-white"><i className="fab fa-twitter"></i></a>
              <a href="#" className="text-gray-400 hover:text-white"><i className="fab fa-instagram"></i></a>
              <a href="#" className="text-gray-400 hover:text-white"><i className="fab fa-linkedin-in"></i></a>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium mb-4">Company</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link href="/about" className="hover:text-white">About Us</Link></li>
              <li><Link href="/careers" className="hover:text-white">Careers</Link></li>
              <li><Link href="/blog" className="hover:text-white">Blog</Link></li>
              <li><Link href="/partner" className="hover:text-white">Partner with PillNow</Link></li>
              <li><Link href="/terms" className="hover:text-white">Terms & Conditions</Link></li>
              <li><Link href="/privacy" className="hover:text-white">Privacy Policy</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium mb-4">Our Services</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link href="/products" className="hover:text-white">Order Medicines</Link></li>
              <li><Link href="/lab-tests" className="hover:text-white">Book Lab Tests</Link></li>
              <li><Link href="/consult" className="hover:text-white">Consult a Doctor</Link></li>
              <li><Link href="/products/category/5" className="hover:text-white">Ayurveda Products</Link></li>
              <li><Link href="/products/category/6" className="hover:text-white">Healthcare Devices</Link></li>
              <li><Link href="/health-blog" className="hover:text-white">Health Articles</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium mb-4">Contact Us</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li className="flex items-start">
                <i className="fas fa-envelope mt-1 mr-2"></i>
                <span>support@pillnow.com</span>
              </li>
              <li className="flex items-start">
                <i className="fas fa-phone-alt mt-1 mr-2"></i>
                <span>1800-1234-5678</span>
              </li>
              <li className="flex items-start">
                <i className="fas fa-map-marker-alt mt-1 mr-2"></i>
                <span>Plot No. 8, Sector 144, Noida, Uttar Pradesh 201304</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-10 pt-6 border-t border-gray-700 text-center text-gray-400 text-sm">
          <p>© 2023 Medadock. All Rights Reserved.</p>
          <p className="mt-2">The content is for informational purposes only and not intended to be a substitute for professional medical advice.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
