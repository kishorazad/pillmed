const AppPromotion = () => {
  return (
    <section className="py-8 bg-[#14bef0]/5">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 mb-6 md:mb-0">
            <h2 className="text-2xl font-bold mb-4">Download the PillNow App</h2>
            <p className="text-gray-600 mb-6">Get medicines, book lab tests, and consult with doctors - all from your phone!</p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a href="#" className="flex items-center justify-center bg-black text-white py-2 px-4 rounded-md hover:bg-gray-800 transition">
                <i className="fab fa-apple text-2xl mr-2"></i>
                <div>
                  <div className="text-xs">Download on the</div>
                  <div className="font-medium">App Store</div>
                </div>
              </a>
              <a href="#" className="flex items-center justify-center bg-black text-white py-2 px-4 rounded-md hover:bg-gray-800 transition">
                <i className="fab fa-google-play text-2xl mr-2"></i>
                <div>
                  <div className="text-xs">Get it on</div>
                  <div className="font-medium">Google Play</div>
                </div>
              </a>
            </div>
          </div>
          <div className="md:w-1/2 flex justify-center">
            <img 
              src="https://images.unsplash.com/photo-1601972599720-36938d4ecd31?w=300&h=500&fit=crop" 
              alt="PillNow Mobile App" 
              className="h-80 object-cover rounded-xl shadow-lg"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default AppPromotion;
