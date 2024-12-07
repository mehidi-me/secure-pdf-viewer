"use client";
import { Document, Page, pdfjs } from "react-pdf";
import { useParams } from "next/navigation";
import { useState } from "react";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import Head from "next/head";

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export default function PDFViewer() {
  const params = useParams();
  const { id } = params;
  const [numPages, setNumPages] = useState(null);

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };

  if (!id) return <p>Loading...</p>;

  return (
    <div className="md:flex md:justify-center md:width-[400px] md:overflow-hidden">
      <Document
        file={`/uploads/${id}.pdf`}
        onLoadSuccess={onDocumentLoadSuccess}
      >
        {Array.from(new Array(numPages), (el, index) => (
          <Page
            key={`page_${index + 1}`}
            pageNumber={index + 1}
            renderAnnotationLayer={true}
            renderTextLayer={false}
          />
        ))}
      </Document>
    </div>
  );
}
