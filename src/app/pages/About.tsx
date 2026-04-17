import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export function About() {
  return (
    <div className="pt-20">
      {/* Hero */}
      <section className="relative h-[60vh] min-h-100">
        <div className="absolute inset-0">
          <img
            src="/about.png"
            alt="About Hero"
            className="w-full h-full object-cover object-[center_top]"
          />
          <div className="absolute inset-0 bg-black/40" />
        </div>
        <div className="relative z-10 h-full flex items-center justify-center px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center text-white max-w-2xl"
          >
            <h1 className="text-4xl md:text-6xl tracking-wider mb-6">
              OUR STORY
            </h1>
            <p className="text-lg text-gray-200">
              Crafting timeless fashion for the modern individual
            </p>
          </motion.div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <h2 className="text-3xl md:text-4xl tracking-wider">OUR MISSION</h2>
            <p className="text-lg text-gray-600 leading-relaxed">
              At CLO, we build a modern fashion label rooted in precision, minimalism, and longevity. Our goal is to create elevated essentials that feel premium, look timeless, and perform across everyday life.
            </p>
            <p className="text-lg text-gray-600 leading-relaxed">
              Every piece is designed with intent—clean silhouettes, strong materials, and consistent quality. We prioritize durability, fit, and versatility so each item earns its place in your wardrobe.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Values */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl tracking-wider">
              WHAT WE STAND FOR
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-center space-y-4"
            >
              <div className="w-16 h-16 mx-auto bg-black rounded-full flex items-center justify-center text-white text-2xl">
                01
              </div>
              <h3 className="text-xl tracking-wide">Quality First</h3>
              <p className="text-gray-600">
                We source only the finest materials and work with skilled
                artisans to ensure every piece meets our exacting standards.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-center space-y-4"
            >
              <div className="w-16 h-16 mx-auto bg-black rounded-full flex items-center justify-center text-white text-2xl">
                02
              </div>
              <h3 className="text-xl tracking-wide">Timeless Design</h3>
              <p className="text-gray-600">
                Our designs are made to last, both in construction and style.
                We reject fast fashion in favor of pieces you'll treasure for
                years.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="text-center space-y-4"
            >
              <div className="w-16 h-16 mx-auto bg-black rounded-full flex items-center justify-center text-white text-2xl">
                03
              </div>
              <h3 className="text-xl tracking-wide">Ethical Production</h3>
              <p className="text-gray-600">
                We're committed to fair labor practices and sustainable
                manufacturing. Fashion should never come at the expense of
                people or planet.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Image Grid */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative aspect-4/5"
            >
              <img
                src="/about1.png"
                alt="Lifestyle 1"
                className="w-full h-full object-cover"
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative aspect-4/5"
            >
              <img
                src="/about2.png"
                alt="Lifestyle 2"
                className="w-full h-full object-cover"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Journey */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-black text-white">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-12"
          >
            <h2 className="text-3xl md:text-4xl tracking-wider text-center">
              THE JOURNEY
            </h2>

            <div className="space-y-8">
              {/* 2026 - Founding */}
              <div className="border-l-2 border-white pl-8 py-4">
                <span className="text-sm text-gray-400">2026</span>
                <h3 className="text-xl mt-2 mb-3">The Beginning</h3>
                <p className="text-gray-400">
                  CLO was founded with a clear focus: build a premium, modern clothing brand that balances simplicity, quality, and strong identity.
                </p>
              </div>

              {/* Future Slot 1 */}
              <div className="border-l-2 border-white/20 pl-8 py-4">
                <span className="text-sm text-gray-400">Coming Soon</span>
                <h3 className="text-xl mt-2 mb-3">Next Milestone</h3>
                <p className="text-gray-400">
                  {/* Add next major achievement here */}
                  Expansion, collaborations, or new collections will be documented here.
                </p>
              </div>

              {/* Future Slot 2 */}
              <div className="border-l-2 border-white/20 pl-8 py-4">
                <span className="text-sm text-gray-400">Coming Soon</span>
                <h3 className="text-xl mt-2 mb-3">Growth Phase</h3>
                <p className="text-gray-400">
                  {/* Add scaling phase details */}
                  Retail presence, global reach, or product expansion.
                </p>
              </div>

              {/* Future Slot 3 */}
              <div className="border-l-2 border-white/20 pl-8 py-4">
                <span className="text-sm text-gray-400">Coming Soon</span>
                <h3 className="text-xl mt-2 mb-3">Long-Term Vision</h3>
                <p className="text-gray-400">
                  {/* Add long-term brand vision */}
                  Sustainability milestones, innovation, and category leadership.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <h2 className="text-3xl md:text-4xl tracking-wider">
              JOIN OUR JOURNEY
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Become part of a community that values quality, sustainability, and
              timeless style. Explore our collection and discover pieces that
              will become wardrobe staples for years to come.
            </p>
            <Link
              to="/collections"
              className="inline-flex items-center gap-2 bg-black text-white px-8 py-4 hover:bg-gray-800 transition-colors"
            >
              Explore Collections
              <ArrowRight size={18} />
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
