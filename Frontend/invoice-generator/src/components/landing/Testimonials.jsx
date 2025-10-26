import { Quote } from "lucide-react";
import { useState } from "react";
import { TESTIMONIALS } from "../../utils/data";

const Testimonials = () => {
  return (
    <section id="testimonials" className="py-20 lg:py-28 bg-white">
      <div className=" max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">
            What Our Users Say
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We are trusted by thousands of freelancers and businesses worldwide
          </p>
        </div>

        {/* Testimonials */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {TESTIMONIALS.map((testimonial, index) => (
            <TestimonialCard key={index} testimonial={testimonial} />
          ))}
        </div>
      </div>
    </section>
  );
};

// ✅ Separate card component with working avatar logic
const TestimonialCard = ({ testimonial }) => {
  const [imgError, setImgError] = useState(false);

  const initials = testimonial.author
    .split(" ")
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();

  return (
    <div className="group relative bg-gray-50 rounded-2xl p-8 sm:p-10 shadow-sm hover:shadow-md transition-all duration-300 group mt-8">
      {/* Quote Icon */}
      <div className="absolute -top-4 left-8 w-8 h-8 bg-gradient-to-r from-blue-950 to-blue-900  group-hover:bg-gradient-to-r group-hover:from-gray-50 group-hover:to-gray-400 text-white rounded-full flex items-center justify-center ">
        <Quote className="w-4 h-4 text-white group-hover:text-blue-950 " />
      </div>
    
      {/* Quote Text */}
      <p className="text-gray-700 mb-6 leading-relaxed italic text-lg">
        "{testimonial.quote}"
      </p>

      {/* Author */}
      <div className="flex items-center space-x-4">
        {testimonial.avatar && !imgError ? (
          <img
            src={testimonial.avatar}
            alt={testimonial.author}
            className="w-12 h-12 rounded-full object-cover"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-blue-900 text-white flex items-center justify-center font-semibold text-lg">
            {initials}
          </div>
        )}
        <div className="">
          <p className="font-semibold text-gray-900">{testimonial.author}</p>
          <p className="text-gray-500 text-sm">{testimonial.title}</p>
        </div>
      </div>
    </div>
  );
};

export default Testimonials;
