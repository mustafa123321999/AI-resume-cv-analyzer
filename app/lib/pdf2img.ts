export interface PdfConversionResult {
  imageUrl: string;
  file: File | null;
  error?: string;
}

let pdfjsLib: any = null;
let isLoading = false;
let loadPromise: Promise<any> | null = null;

async function loadPdfJs(): Promise<any> {
  if (pdfjsLib) return pdfjsLib;
  if (loadPromise) return loadPromise;

  isLoading = true;
  // @ts-expect-error - pdfjs-dist/build/pdf.mjs is not a module
  loadPromise = import("pdfjs-dist/build/pdf.mjs").then((lib) => {
    // Set the worker source to use local file
    lib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
    pdfjsLib = lib;
    isLoading = false;
    return lib;
  });

  return loadPromise;
}




// let pdfjsLib: any = null;
// let isLoading = false;
// let loadPromise: Promise<any> | null = null;

// async function loadPdfJs(): Promise<any> {
//   if (pdfjsLib) return pdfjsLib;
//   if (loadPromise) return loadPromise;

//   isLoading = true;

//   loadPromise = (async () => {
//     // Import PDF.js library
//     const lib = await import("pdfjs-dist/build/pdf");
//     // Import the bundled worker
//     const worker = await import("pdfjs-dist/build/pdf.worker.entry");

//     // Use the bundled worker (matches library version automatically)
//     lib.GlobalWorkerOptions.workerSrc = worker.default;

//     pdfjsLib = lib;
//     isLoading = false;
//     return lib;
//   })();

//   return loadPromise;
// }


// export async function convertPdfToImage(
//     file: File
//     ): Promise<PdfConversionResult> {
//     try {
//     const lib = await loadPdfJs();
//     console.log("PDF.js loaded");

//     const arrayBuffer = await file.arrayBuffer();
//     console.log("ArrayBuffer size:", arrayBuffer.byteLength, file.name);

//     const pdf = await lib.getDocument({ data: arrayBuffer }).promise;
//     console.log("PDF loaded, pages:", pdf.numPages);

//     const page = await pdf.getPage(1);
//     console.log("Page 1 loaded:", page);

//     const viewport = page.getViewport({ scale: 2 });
//     console.log("Viewport:", viewport.width, viewport.height);

//     const canvas = document.createElement("canvas");
//     const context = canvas.getContext("2d");
//     if (!context) throw new Error("Failed to get 2D context");

//     canvas.width = viewport.width;
//     canvas.height = viewport.height;

//     await page.render({ canvasContext: context, viewport }).promise;
//     console.log("Page rendered to canvas");

//     return new Promise((resolve) => {
//         canvas.toBlob((blob) => {
//             if (blob) {
//                 const imageFile = new File([blob], file.name.replace(/\.pdf$/i, ".png"), { type: "image/png" });
//                 resolve({ imageUrl: URL.createObjectURL(blob), file: imageFile });
//             } else {
//                 resolve({ imageUrl: "", file: null, error: "Failed to create image blob" });
//             }
//         }, "image/png");
//     });
//     } catch (err) {
//         console.error("Conversion error:", err);
//         return { imageUrl: "", file: null, error: `Failed to convert PDF: ${err}` };
//     }

// }

export async function convertPdfToImage(
    file: File
): Promise<PdfConversionResult> {

  try {
    const lib = await loadPdfJs();

    const arrayBuffer = await file.arrayBuffer();

    const pdf = await lib.getDocument({ data: arrayBuffer }).promise;
    console.log("PDF pages:", pdf.numPages);


    const page = await pdf.getPage(1);

    const viewport = page.getViewport({ scale: 2 });
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");

    canvas.width = viewport.width;
    canvas.height = viewport.height;

    if (context) {
      context.imageSmoothingEnabled = true;
      context.imageSmoothingQuality = "high";
    }

    await page.render({ canvasContext: context!, viewport }).promise;

    return new Promise((resolve) => {
      canvas.toBlob(
        (blob) => {
          if (blob) {
            // Create a File from the blob with the same name as the pdf
            const originalName = file.name.replace(/\.pdf$/i, "");
            const imageFile = new File([blob], `${originalName}.png`, {
              type: "image/png",
            });

            resolve({
              imageUrl: URL.createObjectURL(blob),
              file: imageFile,
            });
          } else {
            resolve({
              imageUrl: "",
              file: null,
              error: "Failed to create image blob",
            });
          }
        },
        "image/png",
        1.0
      ); // Set quality to maximum (1.0)
    });
  } catch (err) {
    return {
      imageUrl: "",
      file: null,
      error: `Failed to convert PDF: ${err}`,
    };
  }
}




// console.log("File received:", file.name, file.size, file.type);
