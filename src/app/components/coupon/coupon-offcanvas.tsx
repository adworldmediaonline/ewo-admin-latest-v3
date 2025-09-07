import { CloseTwo } from '@/svg';
import React from 'react';
import {
  Control,
  FieldErrors,
  UseFormHandleSubmit,
  UseFormRegister,
} from 'react-hook-form';
import EnhancedCouponForm from './enhanced-coupon-form';

// prop type
type IPropType = {
  propsItems: {
    openSidebar: boolean;
    setOpenSidebar: React.Dispatch<React.SetStateAction<boolean>>;
    setIsSubmitted: React.Dispatch<React.SetStateAction<boolean>>;
    setLogo: React.Dispatch<React.SetStateAction<string>>;
    handleCouponSubmit: (data: any) => void;
    isSubmitted: boolean;
    register: UseFormRegister<any>;
    errors: FieldErrors<any>;
    logo: string;
    handleSubmit: UseFormHandleSubmit<any, undefined>;
    control: Control;
  };
};

const CouponOffcanvas = ({ propsItems }: IPropType) => {
  const {
    openSidebar,
    setOpenSidebar,
    isSubmitted,
    setIsSubmitted,
    setLogo,
    errors,
    handleCouponSubmit,
    handleSubmit,
    logo,
    register,
    control,
  } = propsItems;

  return (
    <>
      <div
        className={`offcanvas-area fixed top-0 right-0 h-full bg-white w-[90vw] max-w-4xl z-[999] overflow-y-scroll overscroll-y-contain scrollbar-hide shadow-xl translate-x-[calc(100%+80px)] transition duration-300 ${
          openSidebar ? 'offcanvas-opened' : ''
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between py-4 px-6 border-b border-gray-200 bg-white sticky top-0 z-[99]">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setOpenSidebar(false)}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <CloseTwo />
              </button>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Create New Coupon
                </h2>
                <p className="text-sm text-gray-500">
                  Configure your coupon settings and restrictions
                </p>
              </div>
            </div>
            <div className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">
              Enhanced Form
            </div>
          </div>

          {/* Enhanced Form Content */}
          <div className="flex-1 p-6 bg-gray-50">
            <EnhancedCouponForm
              onSubmit={handleCouponSubmit}
              isSubmitted={isSubmitted}
              setIsSubmitted={setIsSubmitted}
              logo={logo}
              setLogo={setLogo}
            />
          </div>
        </div>
      </div>

      {/* Backdrop */}
      <div
        onClick={() => setOpenSidebar(false)}
        className={`fixed inset-0 bg-black bg-opacity-50 z-[998] transition-opacity duration-300 ${
          openSidebar ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}
      />
    </>
  );
};

export default CouponOffcanvas;
