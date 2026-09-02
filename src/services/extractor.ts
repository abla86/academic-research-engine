import fs from "node:fs/promises";
import path from "node:path";
import mammoth from "mammoth";
import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";

export async function extractText(
  filePath: string
) {

  const extension =
    path.extname(filePath)
      .toLowerCase();

  if (
    extension === ".txt" ||
    extension === ".md"
  ) {

    return {
      sourceType:
        extension === ".md"
          ? "markdown"
          : "txt",
      text:
        await fs.readFile(
          filePath,
          "utf8"
        )
    };
  }

  if (extension === ".docx") {

    const buffer =
      await fs.readFile(
        filePath
      );

    const result =
      await mammoth.extractRawText({
        buffer
      });

    return {
      sourceType: "docx",
      text: result.value
    };
  }

  if (extension === ".pdf") {

    const data =
      new Uint8Array(
        await fs.readFile(
          filePath
        )
      );

    const pdf =
      await getDocument({
        data
      }).promise;

    const pages: string[] = [];

    for (
      let pageNumber = 1;
      pageNumber <= pdf.numPages;
      pageNumber++
    ) {

      const page =
        await pdf.getPage(
          pageNumber
        );

      const content =
        await page.getTextContent();

      const text =
        content.items
          .map(
            (item: any) =>
              "str" in item
                ? item.str
                : ""
          )
          .join(" ");

      pages.push(
        `\n[Page ${pageNumber}]\n${text}`
      );
    }

    return {
      sourceType: "pdf",
      text: pages.join("\n")
    };
  }

  throw new Error(
    `Unsupported document type: ${extension}`
  );
}
