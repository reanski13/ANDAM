import { scrapePagasaVisayas } from "@/lib/pagasa-scraper";
import { resourceOk, resourceUnavailable } from "@/lib/api/resource";
import type { PagasaResource } from "@/lib/dashboard/types";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const pagasa = await scrapePagasaVisayas();

    const data: PagasaResource = {
      synopsis: pagasa.synopsis,
      issuedAt: pagasa.issuedAt ?? null,
      forecast: pagasa.forecast,
      windConditions: pagasa.windConditions,
    };

    return resourceOk(data);
  } catch (error) {
    return resourceUnavailable(
      "The PAGASA regional advisory is temporarily unavailable.",
      "PAGASA_FAILED",
      error
    );
  }
}
