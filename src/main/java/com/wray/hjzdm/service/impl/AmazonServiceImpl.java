package com.wray.hjzdm.service.impl;

import com.wray.hjzdm.config.AmazonConfig;
import com.wray.hjzdm.entity.Goods;
import com.wray.hjzdm.service.AmazonService;
import lombok.extern.slf4j.Slf4j;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Service
@Slf4j
public class AmazonServiceImpl implements AmazonService {

    @Autowired
    private AmazonConfig amazonConfig;

    @Override
    public List<Goods> searchGoods(String keyword) {
        log.info("Searching Amazon via Crawler for: {}", keyword);
        List<Goods> result = new ArrayList<>();

        if (keyword == null || keyword.trim().isEmpty()) {
            return result;
        }

        try {
            // 1. Random delay to behave politely (1-3 seconds)
            // Note: This helps reduce server load but does not guarantee avoiding blocks.
            Thread.sleep(1000 + (long)(Math.random() * 2000));

            String encodedKeyword = URLEncoder.encode(keyword.trim(), StandardCharsets.UTF_8.name());
            String url = "https://www.amazon.co.jp/s?k=" + encodedKeyword;
            
            log.info("Crawling URL: {}", url);

            // 2. Realistic User-Agent (Standard Browser Simulation)
            String userAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

            Document doc = Jsoup.connect(url)
                    .userAgent(userAgent)
                    .header("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8")
                    .header("Accept-Language", "ja,en-US;q=0.9,en;q=0.8")
                    .timeout(10000)
                    .get();

            // 3. Parse Results (Standard Selectors)
            Elements items = doc.select("div[data-component-type='s-search-result']");
            if (items.isEmpty()) {
                // Fallback selector
                items = doc.select(".s-result-item");
            }

            log.info("Found {} items", items.size());

            for (Element item : items) {
                if (result.size() >= 20) break;

                try {
                    // Title
                    Element titleEl = item.selectFirst("h2 a span");
                    if (titleEl == null) continue;
                    String title = titleEl.text();

                    // Link
                    Element linkEl = item.selectFirst("h2 a");
                    String link = linkEl != null ? "https://www.amazon.co.jp" + linkEl.attr("href") : "";

                    // Price
                    Element priceEl = item.selectFirst(".a-price .a-offscreen");
                    Double price = null;
                    if (priceEl != null) {
                        String priceText = priceEl.text().replace("￥", "").replace(",", "").trim();
                        try {
                            price = Double.parseDouble(priceText);
                        } catch (NumberFormatException ignored) {}
                    }

                    if (price == null) continue; // Skip items without price

                    // Image
                    Element imgEl = item.selectFirst("img.s-image");
                    String imgUrl = imgEl != null ? imgEl.attr("src") : "";

                    Goods g = new Goods();
                    g.setGoodsName(title);
                    g.setGoodsLink(link);
                    g.setGoodsPrice(price);
                    g.setImgUrl(imgUrl);
                    g.setMallType(40); // Amazon
                    g.setCreateTime(new Date());
                    g.setStatus(1);

                    result.add(g);

                } catch (Exception e) {
                    log.warn("Failed to parse item", e);
                }
            }

        } catch (Exception e) {
            log.error("Amazon Crawler Failed: {}", e.getMessage());
            // Optionally: Add a dummy item to inform user of failure?
            // For now, we return empty list so it just shows no results from Amazon.
        }

        return result;
    }
}
