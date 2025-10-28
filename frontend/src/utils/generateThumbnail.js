import * as pdfjsLib from "pdfjs-dist";
import pdfjsWorker from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import { updateBookThumbnail } from "../utils/db";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

export async function generateThumbnailForBook(book) {
  if (!book.file) return book;

  try {
    const arrayBuffer = await book.file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const page = await pdf.getPage(1);

    const viewport = page.getViewport({ scale: 0.5 });
    const canvas = document.createElement("canvas");
    canvas.width = viewport.width;
    canvas.height = viewport.height;

    const context = canvas.getContext("2d");
    await page.render({ canvasContext: context, viewport }).promise;

    const thumbnail = canvas.toDataURL("image/png");

    // Update IndexedDB
    await updateBookThumbnail(book.id, thumbnail);

    return { ...book, thumbnail };
  } catch (err) {
    console.error(`Failed to generate thumbnail for ${book.name}`, err);
    return book;
  }
}
