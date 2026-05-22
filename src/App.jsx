import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import SiteJsonLd from './components/SiteJsonLd';
import ToolChrome from './components/ToolChrome';
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import Tools from './pages/Tools';
import WordToPdf from './pages/WordToPdf';
import PdfToPpt from './pages/PdfToPpt';
import PdfToImage from './pages/PdfToImage';
import PdfToExcel from './pages/PdfToExcel';
import PdfToWord from './pages/PdfToWord';
import PdfMerge from './pages/PdfMerge';
import PdfSplit from './pages/PdfSplit';
import PdfCompress from './pages/PdfCompress';
import ImageToPdf from './pages/ImageToPdf';
import ImageToBase64 from './pages/ImageToBase64';
import PdfVault from './pages/PdfVault';
import PdfRotate from './pages/PdfRotate';
import PdfWatermark from './pages/PdfWatermark';
import PdfEditor from './pages/PdfEditor';
import HtmlToPdf from './pages/HtmlToPdf';
import GmapsScraper from './pages/GmapsScraper';
import AiSummarizer from './pages/AiSummarizer';
import Translator from './pages/Translator';
import ResumePage from './pages/ResumePage';
import QrStudio from './pages/QrStudio';
import OcrTool from './pages/OcrTool';
import WordToExcel from './pages/WordToExcel';
import './App.css'

function App() {
  return (
    <Router>
      <SiteJsonLd />
      <ScrollToTop />
      <div className="app-wrapper">
        <Header />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/tools" element={<Tools />} />
            <Route element={<ToolChrome />}>
              <Route path="/tools/word-to-pdf" element={<WordToPdf />} />
              <Route path="/tools/pdf-to-ppt" element={<PdfToPpt />} />
              <Route path="/tools/pdf-to-image" element={<PdfToImage />} />
              <Route path="/tools/pdf-to-excel" element={<PdfToExcel />} />
              <Route path="/tools/pdf-to-word" element={<PdfToWord />} />
              <Route path="/tools/pdf-merge" element={<PdfMerge />} />
              <Route path="/tools/pdf-split" element={<PdfSplit />} />
              <Route path="/tools/pdf-compress" element={<PdfCompress />} />
              <Route path="/tools/image-to-pdf" element={<ImageToPdf />} />
              <Route path="/tools/image-to-base64" element={<ImageToBase64 />} />
              <Route path="/tools/pdf-vault" element={<PdfVault />} />
              <Route path="/tools/pdf-rotate" element={<PdfRotate />} />
              <Route path="/tools/pdf-watermark" element={<PdfWatermark />} />
              <Route path="/tools/pdf-editor" element={<PdfEditor />} />
              <Route path="/tools/html-to-pdf" element={<HtmlToPdf />} />
              <Route path="/tools/automation/gmaps-scraper" element={<GmapsScraper />} />
              <Route path="/tools/intelligence/summarizer" element={<AiSummarizer />} />
              <Route path="/tools/intelligence/translator" element={<Translator />} />
              <Route path="/tools/resume-builder" element={<ResumePage />} />
              <Route path="/tools/qr-studio" element={<QrStudio />} />
              <Route path="/tools/ocr" element={<OcrTool />} />
              <Route path="/tools/word-to-excel" element={<WordToExcel />} />
            </Route>
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  )
}

export default App
