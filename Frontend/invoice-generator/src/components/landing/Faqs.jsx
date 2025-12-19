// import React, { useState } from "react";
// import { ChevronDown } from "lucide-react";
// import { FAQS } from "../../utils/data";

// const Fags = () => {
//   const [openIndex, setOpenIndex] = useState(null);

//   const handleClick = (index) => {
//     setOpenIndex(openIndex === index ? null : index);
//   };

//   return (
//     <section id="faq" className="py-20 lg:py-28 bg-white">
//       <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
//         <div className="text-center mb-16">
//           <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">
//             Frequently Asked Questions
//           </h2>
//           <p className="text-xl text-gray-600 max-w-3xl mx-auto">
//             Everything you need to know about our invoice generator platform.
//           </p>
//         </div>
//         <div className="space-y-4">
//           {FAQS.map((faq, index) => (
//             <div key={index} className="border border-gray-200 rounded-lg">
//               <button
//                 className="flex justify-between items-center w-full p-6 text-left"
//                 onClick={() => handleClick(index)}
//               >
//                 <span className="text-lg font-medium text-gray-900">
//                   {faq.question}
//                 </span>
//                 <ChevronDown
//                   className={`w-5 h-5 text-gray-500 transition-transform ${
//                     openIndex === index ? "transform rotate-180" : ""
//                   }`}
//                 />
//               </button>
//               {openIndex === index && (
//                 <div className="p-6 pt-0 border-t border-gray-200">
//                   <p className="text-gray-600">{faq.answer}</p>
//                 </div>
//               )}
//             </div>
//           ))}
//         </div>
//       </div>
//     </section>
//   );
// };

// export default Fags;



import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import { FAQS } from "../../utils/data";

const FaqItem = ({ faq, isOpen, onClick }) => (
  <div className="border border-gray-200 rounded-xl overflow-hidden">
    <button 
      onClick={onClick} 
      className="w-full flex items-center justify-between p-6 bg-white hover:bg-gray-50 cursor-pointer transition-colors duration-200"
    >
      <span className="text-lg font-medium text-gray-900 pr-4 text-left">
        {faq.question}
      </span>
      <ChevronDown 
        className={`w-5 h-5 text-gray-500 transition-transform ${
          isOpen ? 'transform rotate-180' : ''
        }`}
      />
    </button>
    {isOpen && (
      <div className="px-6 pt-6 pb-6 text-gray-600 leading-relaxed border-t border-gray-200">
        {faq.answer}
      </div>
    )}
  </div>
);

const Faqs = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const handleClick = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="FAQ" className="py-20 lg:py-28 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Everything you need to know about our invoice generator platform.
          </p>
        </div>
        <div className="space-y-4">
          {FAQS.map((faq, index) => (
            <FaqItem
              key={index}
              faq={faq}
              isOpen={openIndex === index}
              onClick={() => handleClick(index)}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Faqs;