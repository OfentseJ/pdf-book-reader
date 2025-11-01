import * as pdfjsLib from "pdfjs-dist";
import { updateBookThumbnail } from "../utils/db";

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export async function generateThumbnailForBook(book) {
  try {
    let fileToUse = book.file;

    if (!fileToUse && book.fileUrl) {
      const response = await fetch(book.fileUrl);
      const blob = await response.blob();
      fileToUse = new File([blob], `${book.name || "book"}.pdf`, {
        type: "application/pdf",
      });
    }

    if (!fileToUse) {
      console.warn(`No file available for ${book.name}`);
      return book;
    }

    // Generate thumbnail from PDF
    const arrayBuffer = await fileToUse.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const page = await pdf.getPage(1);

    const viewport = page.getViewport({ scale: 0.5 });
    const canvas = document.createElement("canvas");
    canvas.width = viewport.width;
    canvas.height = viewport.height;

    const context = canvas.getContext("2d");
    await page.render({ canvasContext: context, viewport }).promise;

    const thumbnail = canvas.toDataURL("image/png");

    await updateBookThumbnail(book.id, thumbnail);

    return { ...book, thumbnail };
  } catch (err) {
    console.error(`Failed to generate thumbnail for ${book.name}`, err);
    return book;
  }
}
