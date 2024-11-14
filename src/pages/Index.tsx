import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="container mx-auto px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-3xl mx-auto"
      >
        <span className="px-3 py-1 text-sm bg-primary/10 text-primary rounded-full">
          Cambiando vidas
        </span>
        <h1 className="mt-6 text-5xl font-bold tracking-tight">
          Juntos podemos hacer la diferencia
        </h1>
        <p className="mt-6 text-xl text-gray-600">
          PROCODELI conecta padrinos comprometidos con niños que necesitan apoyo para alcanzar sus sueños.
        </p>
        <div className="mt-10 flex justify-center gap-4">
          <Link
            to="/children"
            className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors inline-flex items-center gap-2"
          >
            Conoce a los niños
            <ArrowRight size={20} />
          </Link>
          <Link
            to="/sponsors"
            className="px-6 py-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Conviértete en padrino
          </Link>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8"
      >
        <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-xl font-semibold mb-2">Apadrinamiento</h3>
          <p className="text-gray-600">
            Tu apoyo mensual proporciona educación, salud y oportunidades para un futuro mejor.
          </p>
        </div>
        <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-xl font-semibold mb-2">Transparencia</h3>
          <p className="text-gray-600">
            Seguimiento detallado de cómo tu ayuda impacta directamente en la vida de los niños.
          </p>
        </div>
        <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-xl font-semibold mb-2">Compromiso</h3>
          <p className="text-gray-600">
            Construimos relaciones duraderas entre padrinos y niños para un impacto sostenible.
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Index;