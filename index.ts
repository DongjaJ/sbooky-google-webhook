import { google } from "googleapis";
import { JWT } from "google-auth-library";
import dotenv from "dotenv";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

import { Webhook, MessageBuilder } from "discord-webhook-node";

dotenv.config();

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault("Asia/Seoul");

const hook = new Webhook(process.env.DISCORD_WEBHOOK_URL);

export const schema = {
  serviceName: "스부키",
  clientEmail: process.env.GOOGLE_CLIENT_EMAIL!,
  privateKey: process.env.GOOGLE_PRIVATE_KEY!.replace(/\\n/g, "\n"),
  siteUrl: "sc-domain:sbooky.net",
  searchConsoleUrl:
    "https://search.google.com/search-console?resource_id=sc-domain%3Asbooky.net",
  projectName: "sbooky",
};

interface FetchSearchData {
  clientEmail: string;
  privateKey: string;
  siteUrl: string;
  startDate: dayjs.Dayjs;
  endDate: dayjs.Dayjs;
}

async function fetchSearchData({
  clientEmail,
  privateKey,
  siteUrl,
  startDate,
  endDate,
}: FetchSearchData) {
  const auth = new JWT({
    email: clientEmail,
    key: privateKey,
    scopes: ["https://www.googleapis.com/auth/webmasters.readonly"],
  });

  const searchconsole = google.searchconsole({ version: "v1", auth });

  const searchAnalytics = await searchconsole.searchanalytics.query({
    siteUrl,
    requestBody: {
      startDate: startDate.format("YYYY-MM-DD"),
      endDate: endDate.format("YYYY-MM-DD"),
      dimensions: ["date"],
      type: "web",
    },
  });

  return searchAnalytics.data.rows || [];
}

type TestSearchConsole = {
  clientEmail: string;
  privateKey: string;
  siteUrl: string;
  searchConsoleUrl: string;
  projectName: string;
  serviceName: string;
};

export async function testSearchConsole({
  clientEmail,
  privateKey,
  siteUrl,
  searchConsoleUrl,
  projectName,
  serviceName,
}: TestSearchConsole) {
  // 이번 주 데이터 (3일 전부터 9일 전까지)
  const currentEndDate = dayjs().tz().subtract(3, "day");
  const currentStartDate = currentEndDate.subtract(6, "day");

  // 지난 주 데이터 (10일 전부터 16일 전까지)
  const previousEndDate = currentStartDate.subtract(1, "day");
  const previousStartDate = previousEndDate.subtract(6, "day");

  const [currentWeekData, previousWeekData] = await Promise.all([
    fetchSearchData({
      clientEmail,
      privateKey,
      siteUrl,
      startDate: currentStartDate,
      endDate: currentEndDate,
    }),
    fetchSearchData({
      clientEmail,
      privateKey,
      siteUrl,
      startDate: previousStartDate,
      endDate: previousEndDate,
    }),
  ]);

  const currentWeekSummary = currentWeekData.reduce(
    (acc, row) => {
      acc.clicks += row.clicks || 0;
      acc.impressions += row.impressions || 0;
      acc.ctr += row.ctr || 0;
      acc.position += row.position || 0;
      return acc;
    },
    { clicks: 0, impressions: 0, ctr: 0, position: 0 }
  );

  const previousWeekSummary = previousWeekData.reduce(
    (acc, row) => {
      acc.clicks += row.clicks || 0;
      acc.impressions += row.impressions || 0;
      acc.ctr += row.ctr || 0;
      acc.position += row.position || 0;
      return acc;
    },
    { clicks: 0, impressions: 0, ctr: 0, position: 0 }
  );

  return {
    currentStartDate,
    currentEndDate,
    previousEndDate,
    previousStartDate,
    currentWeekSummary,
    previousWeekSummary,
    searchConsoleUrl,
    projectName,
    serviceName,
  };
}

async function main() {
  const {
    currentWeekSummary,
    previousWeekSummary,
    searchConsoleUrl,
    currentStartDate,
    currentEndDate,
    previousStartDate,
    previousEndDate,
  } = await testSearchConsole({
    ...schema,
  });

  const embed = new MessageBuilder()
    .setTitle("📊 Search Console 주간 리포트")
    .addField(
      "🔍 Search Console",
      `[Search Console에서 보기](${searchConsoleUrl})`
    )
    .addField(
      "📅 측정 기간",
      `이번 주: ${currentStartDate.format(
        "YYYY-MM-DD"
      )} ~ ${currentEndDate.format("YYYY-MM-DD")}`
    )
    .addField(
      "📅 측정 기간",
      `지난 주: ${previousStartDate.format(
        "YYYY-MM-DD"
      )} ~ ${previousEndDate.format("YYYY-MM-DD")}`
    )
    .addField(
      "총 클릭 수",
      `이번 주: ${currentWeekSummary.clicks}회\n지난 주: ${previousWeekSummary.clicks}회`
    )
    .addField(
      "총 노출 수",
      `이번 주: ${currentWeekSummary.impressions}회\n지난 주: ${previousWeekSummary.impressions}회`
    )
    .addField(
      "평균 CTR(클릭률)",
      `이번 주: ${(currentWeekSummary.ctr * 100).toFixed(2)}%\n지난 주: ${(
        previousWeekSummary.ctr * 100
      ).toFixed(2)}%`
    )
    .addField(
      "평균 검색 순위",
      `이번 주: ${currentWeekSummary.position.toFixed(
        1
      )}위\n지난 주: ${previousWeekSummary.position.toFixed(1)}위`
    )
    .setFooter("🕒 생성: " + dayjs().format("YYYY-MM-DD HH:mm:ss"));

  hook.send(embed);
}

main();
