import {
  TextractClient,
  AnalyzeExpenseCommand,
} from "@aws-sdk/client-textract";

interface OcrReceiptData {
  montant: number | null;
  date: Date | null;
  categorie: string | null;
  marchand: string | null;
  tva: number | null;
  raw: any;
}

class OcrService {
  private client: TextractClient;

  constructor() {
    this.client = new TextractClient({
      region: process.env.AWS_REGION || "eu-west-1",
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
    });
  }

  async extractReceiptData(imageBuffer: Buffer): Promise<OcrReceiptData> {
    try {
      const command = new AnalyzeExpenseCommand({
        Document: { Bytes: imageBuffer },
      });

      const response = await this.client.send(command);
      const expenseDocuments = response.ExpenseDocuments || [];

      if (expenseDocuments.length === 0) {
        return this.getEmptyResult();
      }

      const summaryFields = expenseDocuments[0].SummaryFields || [];
      const lineItems = expenseDocuments[0].LineItemGroups || [];

      let montant: number | null = null;
      let date: Date | null = null;
      let marchand: string | null = null;
      let tva: number | null = null;

      // Extraire les champs du résumé
      for (const field of summaryFields) {
        const type = field.Type?.Text?.toLowerCase();
        const value = field.ValueDetection?.Text;

        if (!value) continue;

        switch (type) {
          case "total":
          case "amount_paid":
            montant = this.parseAmount(value);
            break;
          case "invoice_receipt_date":
            date = this.parseDate(value);
            break;
          case "vendor_name":
          case "name":
            marchand = value;
            break;
          case "tax":
          case "vat":
            tva = this.parseAmount(value);
            break;
        }
      }

      // Catégorisation intelligente basée sur le marchand
      const categorie = this.categorizeExpense(marchand, lineItems);

      return {
        montant,
        date,
        categorie,
        marchand,
        tva,
        raw: response,
      };
    } catch (error) {
      console.error("Erreur OCR:", error);
      return this.getEmptyResult();
    }
  }

  private parseAmount(value: string): number | null {
    const cleaned = value.replace(/[^\d.,]/g, "").replace(",", ".");
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? null : parsed;
  }

  private parseDate(value: string): Date | null {
    // Formats supportés: DD/MM/YYYY, YYYY-MM-DD, DD-MM-YYYY
    const patterns = [
      /(\d{2})\/(\d{2})\/(\d{4})/,
      /(\d{4})-(\d{2})-(\d{2})/,
      /(\d{2})-(\d{2})-(\d{4})/,
    ];

    for (const pattern of patterns) {
      const match = value.match(pattern);
      if (match) {
        if (pattern === patterns[1]) {
          // YYYY-MM-DD
          return new Date(`${match[1]}-${match[2]}-${match[3]}`);
        } else {
          // DD/MM/YYYY ou DD-MM-YYYY
          return new Date(`${match[3]}-${match[2]}-${match[1]}`);
        }
      }
    }

    return null;
  }

  private categorizeExpense(
    marchand: string | null,
    lineItems: any[]
  ): string | null {
    if (!marchand) return "AUTRE";

    const marchandLower = marchand.toLowerCase();

    // Catégories basées sur des mots-clés
    const categories: Record<string, string[]> = {
      TRANSPORT: ["uber", "taxi", "sncf", "train", "avion", "parking"],
      RESTAURATION: ["restaurant", "café", "boulangerie", "mcdo", "burger"],
      HEBERGEMENT: ["hotel", "airbnb", "booking"],
      FOURNITURES: ["amazon", "bureau", "papeterie", "office"],
      CARBURANT: ["total", "shell", "esso", "carburant", "essence"],
      TELECOMMUNICATION: ["orange", "sfr", "bouygues", "free"],
    };

    for (const [categorie, keywords] of Object.entries(categories)) {
      if (keywords.some((kw) => marchandLower.includes(kw))) {
        return categorie;
      }
    }

    return "AUTRE";
  }

  private getEmptyResult(): OcrReceiptData {
    return {
      montant: null,
      date: null,
      categorie: null,
      marchand: null,
      tva: null,
      raw: null,
    };
  }
}

export const ocrService = new OcrService();
