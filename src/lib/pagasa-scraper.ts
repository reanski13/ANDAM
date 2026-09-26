import * as cheerio from "cheerio";

export interface PagasaWeatherData {
  region: string;
  synopsis: string;
  forecast: Array<{
    place: string;
    condition: string;
    causedBy: string;
    impacts: string;
  }>;
  windConditions: Array<{
    place: string;
    speed: string;
    direction: string;
    coastalWater: string;
  }>;
  temperatureHumidity: Record<string, { max: string; min: string }>;
  issuedAt: string | null;
  fetchedAt: string;
}

export async function scrapePagasaVisayas(): Promise<PagasaWeatherData> {
  const url = "https://bagong.pagasa.dost.gov.ph/index.php/weather";

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "CotcotFloodAlert/1.0 (Community Weather Monitoring)",
      },
      signal: AbortSignal.timeout(4000),
    });

    if (!response.ok) {
      throw new Error(`PAGASA fetch failed: ${response.status}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    const forecast: PagasaWeatherData["forecast"] = [];
    const windConditions: PagasaWeatherData["windConditions"] = [];
    const temperatureHumidity: Record<string, { max: string; min: string }> = {};

    const synopsis =
      $(".panel-heading:contains('Synopsis')").parent().find(".panel-body").text().trim() ||
      $(".synopsis .well").text().trim() ||
      $("p:has(strong:contains('Synopsis'))").text().trim() ||
      $(".synopsis").text().trim();

    const issuedAtMatch =
      $(".issue").text().trim().match(/^Issued at:\s*(.+)$/i) ||
      $(".issue b").text().trim().match(/^Issued at:\s*(.+)$/i) ||
      $("body").text().match(/Issued at:\s*(.+?)(?:\n|$)/i);
    const issuedAt = issuedAtMatch?.[1] ?.trim() ?? null;

    $("table").each((_tableIndex, table) => {
      const headers: string[] = [];
      $(table).find("thead th, thead td").each((_i, th) => {
        headers.push($(th).text().trim().toLowerCase());
      });

      $(table).find("tbody tr").each((_i, row) => {
        const cells: string[] = [];
        $(row).find("td").each((_j, td) => {
          cells.push($(td).text().trim());
        });

        if (cells.length === 0) return;

        const isWeatherTable = headers.some((h) =>
          h.includes("weather") || h.includes("condition")
        );
        const isWindTable = headers.some((h) =>
          h.includes("wind") || h.includes("coastal")
        );
        const isTempTable = headers.some((h) =>
          h.includes("temperature") || h.includes("humidity")
        );

        if (isWeatherTable && cells.length >= 3) {
          forecast.push({
            place: cells[0] || "",
            condition: cells[1] || "",
            causedBy: cells[2] || "",
            impacts: cells[3] || "",
          });
        }

        if (isWindTable && cells.length >= 3) {
          windConditions.push({
            place: cells[0] || "",
            speed: cells[1] || "",
            direction: cells[2] || "",
            coastalWater: cells[3] || "",
          });
        }

        if (isTempTable && cells.length >= 2) {
          temperatureHumidity[cells[0]] = {
            max: cells[1] || "",
            min: cells[2] || "",
          };
        }
      });
    });

    const visayasForecast = forecast.filter((f) =>
      f.place.toLowerCase().includes("visayas") ||
      f.place.toLowerCase().includes("cebu") ||
      f.place.toLowerCase().includes("southern leyte") ||
      f.place.toLowerCase().includes("bohol") ||
      f.place.toLowerCase().includes("leyte") ||
      f.place.toLowerCase().includes("samar")
    );

    return {
      region: "Visayas",
      synopsis,
      forecast: visayasForecast.length > 0 ? visayasForecast : forecast,
      windConditions,
      temperatureHumidity,
      issuedAt,
      fetchedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error("PAGASA scrape error:", error);
    throw error;
  }
}

export async function scrapePagasaWarnings(): Promise<string[]> {
  const url = "https://bagong.pagasa.dost.gov.ph/";

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "CotcotFloodAlert/1.0 (Community Weather Monitoring)",
      },
    });

    if (!response.ok) return [];

    const html = await response.text();
    const $ = cheerio.load(html);
    const warnings: string[] = [];

    $(
      ".alert, .warning, [class*='advisory'], [class*='warning']"
    ).each((_i, el) => {
      const text = $(el).text().trim();
      if (text.length > 5) {
        warnings.push(text);
      }
    });

    return warnings;
  } catch {
    return [];
  }
}
