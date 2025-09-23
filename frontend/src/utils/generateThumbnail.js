import { pdfjs } from "react-pdf";
import pdfjsWorker from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import { getBooks, updateBookThumbnail } from "../utils/db";

pdfjs.GlobalWorkerOptions.workerSrc = pdfjsWorker;

export async function generateThumbnailsForLibrary() {
  const books = await getBooks();
  for (const book of books) {
    if (!book.thumbnail && book.file) {
      const arrayBuffer = await book.file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const page = await pdf.getPage(1);
      const viewport = page.getViewport({ scale: 0.5 });
      const canvas = document.createElement("canvas");
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const context = canvas.getContext("2d");
      await page.render({ canvasContext: context, viewport }).promise;
      const thumbnail = canvas.toDataURL();
      await updateBookThumbnail(book.id, thumbnail);
    }
  }
}
