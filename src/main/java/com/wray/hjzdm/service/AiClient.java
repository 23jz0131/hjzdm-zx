package com.wray.hjzdm.service;

import com.alibaba.fastjson2.JSON;
import com.alibaba.fastjson2.JSONArray;
import com.alibaba.fastjson2.JSONObject;
import com.wray.hjzdm.common.HttpClientUtil;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

@Service
@Slf4j
public class AiClient {

    private String resolveApiKey() {
        String key = System.getProperty("gemini.api.key");
        if (key == null || key.isEmpty()) {
            key = System.getenv("GEMINI_API_KEY");
        }
        return key;
    }

    public JSONObject generateRawResponse(String prompt) {
        String apiKey = resolveApiKey();
        if (apiKey == null || apiKey.isEmpty()) {
            log.warn("Gemini API key not configured, skip AI call");
            return null;
        }
        String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + apiKey;

        Map<String, Object> body = new HashMap<>();
        Map<String, Object> part = new HashMap<>();
        part.put("text", prompt);
        Map<String, Object> content = new HashMap<>();
        content.put("parts", Collections.singletonList(part));
        body.put("contents", Collections.singletonList(content));

        try {
            String json = HttpClientUtil.doPost4Json(url, Collections.singletonMap("body", JSON.toJSONString(body)));
            if (json == null || json.trim().isEmpty()) {
                log.warn("Gemini API empty response");
                return null;
            }
            return JSON.parseObject(json);
        } catch (Exception e) {
            log.error("Gemini API call failed", e);
            return null;
        }
    }

    public String rewriteKeyword(String originalKeyword) {
        if (originalKeyword == null) {
            return null;
        }
        String trimmed = originalKeyword.trim();
        if (trimmed.isEmpty()) {
            return null;
        }
        String prompt = "あなたは日本のECサイトの商品検索アシスタントです。次の検索キーワードから、ユーザーが探しているメインの電子機器本体だけを1フレーズで抽出してください。ケース、フィルム、ケーブル、ストラップなどのアクセサリーは含めないでください。出力は製品名だけにしてください。\n\n検索キーワード: " + trimmed;
        JSONObject root = generateRawResponse(prompt);
        if (root == null) {
            return null;
        }
        try {
            JSONArray candidates = root.getJSONArray("candidates");
            if (candidates == null || candidates.isEmpty()) {
                return null;
            }
            JSONObject c0 = candidates.getJSONObject(0);
            if (c0 == null) {
                return null;
            }
            JSONObject content = c0.getJSONObject("content");
            if (content == null) {
                return null;
            }
            JSONArray parts = content.getJSONArray("parts");
            if (parts == null || parts.isEmpty()) {
                return null;
            }
            JSONObject p0 = parts.getJSONObject(0);
            if (p0 == null) {
                return null;
            }
            String text = p0.getString("text");
            if (text == null) {
                return null;
            }
            String out = text.trim();
            if (out.isEmpty()) {
                return null;
            }
            return out;
        } catch (Exception e) {
            log.error("Gemini rewriteKeyword parse error", e);
            return null;
        }
    }
}
