import {
  toPng,
} from "html-to-image"
import {
  jsPDF,
} from "jspdf"

interface GeneratePaymentReceiptPdfOptions {
  element: HTMLElement
  receiptNumber: string | null
}

function sanitizeFileName(
  value: string,
): string {
  return value
    .trim()
    .replace(/[^a-zA-Z0-9-_]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
}

export async function generatePaymentReceiptPdf({
  element,
  receiptNumber,
}: GeneratePaymentReceiptPdfOptions): Promise<void> {
  const dataUrl = await toPng(
    element,
    {
      backgroundColor: "#ffffff",
      cacheBust: true,
      pixelRatio: 2,
    },
  )

  const image = new Image()

  await new Promise<void>((resolve, reject) => {
    image.onload = () => resolve()
    image.onerror = () => {
      reject(
        new Error(
          "The receipt image could not be prepared for PDF export.",
        ),
      )
    }
    image.src = dataUrl
  })

  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "pt",
    format: "letter",
    compress: true,
  })

  const pageWidth = pdf.internal.pageSize.getWidth()
  const pageHeight = pdf.internal.pageSize.getHeight()
  const margin = 36
  const printableWidth = pageWidth - margin * 2
  const printableHeight = pageHeight - margin * 2

  const scaledHeight =
    (image.height * printableWidth) /
    image.width

  if (scaledHeight <= printableHeight) {
    pdf.addImage(
      dataUrl,
      "PNG",
      margin,
      margin,
      printableWidth,
      scaledHeight,
      undefined,
      "FAST",
    )
  } else {
    const canvas = document.createElement("canvas")
    const context = canvas.getContext("2d")

    if (!context) {
      throw new Error(
        "The browser could not prepare the receipt for PDF export.",
      )
    }

    const sourcePageHeight =
      (printableHeight * image.width) /
      printableWidth

    canvas.width = image.width

    let sourceY = 0
    let pageIndex = 0

    while (sourceY < image.height) {
      const sliceHeight = Math.min(
        sourcePageHeight,
        image.height - sourceY,
      )

      canvas.height = Math.ceil(sliceHeight)
      context.clearRect(
        0,
        0,
        canvas.width,
        canvas.height,
      )
      context.fillStyle = "#ffffff"
      context.fillRect(
        0,
        0,
        canvas.width,
        canvas.height,
      )
      context.drawImage(
        image,
        0,
        sourceY,
        image.width,
        sliceHeight,
        0,
        0,
        image.width,
        sliceHeight,
      )

      if (pageIndex > 0) {
        pdf.addPage()
      }

      const sliceDataUrl =
        canvas.toDataURL("image/png")

      const slicePdfHeight =
        (sliceHeight * printableWidth) /
        image.width

      pdf.addImage(
        sliceDataUrl,
        "PNG",
        margin,
        margin,
        printableWidth,
        slicePdfHeight,
        undefined,
        "FAST",
      )

      sourceY += sliceHeight
      pageIndex += 1
    }
  }

  const normalizedReceiptNumber =
    receiptNumber
      ? sanitizeFileName(receiptNumber)
      : "Pending"

  pdf.setProperties({
    title: `Smith Enterprises Receipt ${normalizedReceiptNumber}`,
    subject: "Payment receipt",
    author: "Smith Enterprises",
    creator: "Smith Enterprises Tax Management System",
  })

  pdf.save(
    `Smith-Receipt-${normalizedReceiptNumber}.pdf`,
  )
}
