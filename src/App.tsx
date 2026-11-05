import useSmoothScroll from './hooks/useSmoothScroll';
import Header from './components/Header';
import Hero from './sections/Hero';
import Projects from './sections/Projects';
import Stage from './sections/Stage';
import Loisirs from './sections/Loisirs';
import Voyages from './sections/Voyages';
import BackToTop from './components/BackToTop';
import Skills from './sections/Skills';
import Parcours from './sections/Parcours';
import HongKong from './sections/HongKong';
import Contact from './sections/Contact';
import Footer from './sections/Footer';

export default function App() {
  useSmoothScroll();
  return (
    <>
      <a
        href="#contenu"
        className="fixed top-3 left-3 z-[100] -translate-y-24 bg-ink px-4 py-3 text-bg focus-visible:translate-y-0"
      >
        Aller au contenu
      </a>
      <Header />
      <main id="contenu" tabIndex={-1} className="outline-none">
        <Hero />
        <Skills />
        <Projects />
        <Parcours />
        <Stage />
        <Loisirs />
        <Voyages />
        <HongKong />
        <Contact />
      </main>
      <Footer />
      <BackToTop />
    </>
  );
}
