import { ArrowRight } from "lucide-react"
import { FEATURES } from "../../utils/data"

const Features = () => {
  return (
    <section id="features" className="py-20 lg:py-28 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">
            Powerful Features
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Everything you need to succeed
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {FEATURES.map((feature, index) => (
            <div 
              key={index} 
              className="group bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-500 ease-out hover:-translate-y-2 cursor-pointer"
            >
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-50 group-hover:scale-110 transition-all duration-500 ease-out">
                <feature.icon className="w-8 h-8 text-blue-900 group-hover:text-blue-700 group-hover:scale-105 transition-all duration-500 ease-out"/>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-blue-900 transition-colors duration-500">
                {feature.title}
              </h3>
              <p className="text-gray-600 leading-relaxed mb-6 group-hover:text-gray-700 transition-colors duration-500">
                {feature.description}
              </p>
              <a 
                href="#" 
                className="inline-flex items-center text-blue-900 font-medium group-hover:text-blue-700 transition-all duration-500 ease-out hover:gap-2"
              >
                Learn More 
                <ArrowRight className="w-4 h-4 ml-2 group-hover:ml-3 group-hover:scale-110 transition-all duration-500 ease-out"/>
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Features