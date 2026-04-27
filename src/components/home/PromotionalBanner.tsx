import { Link } from 'wouter';
import { Button } from '@/components/ui/button';

const PromotionalBanner = () => {
  return (
    <section className="bg-[#f8f8f8] py-6">
      <div className="container mx-auto px-4">
        <div className="bg-[#10847e]/10 rounded-lg p-6 flex flex-col md:flex-row items-center justify-between">
          <div className="mb-4 md:mb-0">
            <h2 className="text-xl font-bold text-[#10847e] mb-2">Save up to 20% on medicines</h2>
            <p className="text-[#666666]">Use code FIRSTORDER for an additional 10% off</p>
          </div>
          <Button asChild className="bg-[#ff6f61] text-white hover:bg-[#ff6f61]/90">
            <Link href="/products">
              Order Now
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default PromotionalBanner;
