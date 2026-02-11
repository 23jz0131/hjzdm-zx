package com.wray.hjzdm.test;

import com.alibaba.fastjson2.JSON;
import com.alibaba.fastjson2.JSONObject;
import com.wray.hjzdm.entity.Goods;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.net.ssl.HttpsURLConnection;
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;

/**
 * 独立的Yahoo API测试类
 */
public class StandaloneYahooApiTest {
    
    private static final Logger logger = LoggerFactory.getLogger(StandaloneYahooApiTest.class);
    
    private static final String CLIENT_ID = "dmVyPTIwMjUwNyZpZD1LUlpMQm80aVNUJmhhc2g9TVdJME1ERTRNVFJrTkdJMk1ESmpaQQ";
    private static final String YAHOO_API_URL = "https://shopping.yahooapis.jp/ShoppingWebService/V3/itemSearch";
    
    public static void main(String[] args) {
        StandaloneYahooApiTest test = new StandaloneYahooApiTest();
        test.runTest();
    }
    
    public void runTest() {
        logger.info("🚀 开始独立Yahoo API测试...");
        
        String testKeyword = "ノートパソコン";
        int maxResults = 5;
        
        logger.info("🔍 搜索关键词: {}", testKeyword);
        logger.info("📊 最大结果数: {}", maxResults);
        
        try {
            List<Goods> results = searchGoods(testKeyword, maxResults);
            
            logger.info("✅ Yahoo API测试完成!");
            logger.info("📈 返回商品数量: {}", results.size());
            
            if (!results.isEmpty()) {
                logger.info("📦 商品详情:");
                for (int i = 0; i < Math.min(results.size(), 3); i++) {
                    Goods goods = results.get(i);
                    logger.info("{}. {} - ¥{} - {}", 
                        i + 1, 
                        goods.getGoodsName(),
                        goods.getGoodsPrice(),
                        goods.getGoodsLink()
                    );
                }
                
                // 检查编码质量
                String firstName = results.get(0).getGoodsName();
                logger.info("🔤 编码质量检查:");
                logger.info("   原始名称: {}", firstName);
                logger.info("   字符长度: {}", firstName.length());
                logger.info("   包含日文: {}", firstName.matches(".*[\\u3040-\\u309F\\u30A0-\\u30FF\\u4E00-\\u9FFF].*"));
                
            } else {
                logger.warn("⚠️  未获取到任何商品数据");
            }
            
        } catch (Exception e) {
            logger.error("❌ Yahoo API测试失败: ", e);
        }
        
        logger.info("🏁 Yahoo API独立测试结束");
    }
    
    public List<Goods> searchGoods(String keyword, int maxResults) throws Exception {
        List<Goods> goodsList = new ArrayList<>();
        
        if (CLIENT_ID == null || CLIENT_ID.isEmpty()) {
            logger.warn("Yahoo API Client ID not configured");
            return goodsList;
        }
        
        String encodedKeyword = URLEncoder.encode(keyword, StandardCharsets.UTF_8.toString());
        String url = String.format("%s?appid=%s&query=%s&start=1&results=%d&format=json",
                YAHOO_API_URL, CLIENT_ID, encodedKeyword, maxResults);
        
        logger.info("Yahoo API 请求URL: {}", url);
        
        HttpsURLConnection connection = (HttpsURLConnection) new java.net.URL(url).openConnection();
        connection.setRequestMethod("GET");
        connection.setRequestProperty("User-Agent", "Mozilla/5.0");
        connection.setConnectTimeout(10000);
        connection.setReadTimeout(15000);
        
        int responseCode = connection.getResponseCode();
        logger.info("Yahoo API 响应状态码: {}", responseCode);
        
        if (responseCode == 200) {
            // 尝试检测实际编码
            String contentType = connection.getContentType();
            String charset = "UTF-8"; // 默认UTF-8
            
            // 从Content-Type头中提取字符集
            if (contentType != null && contentType.contains("charset=")) {
                String[] parts = contentType.split("charset=");
                if (parts.length > 1) {
                    charset = parts[1].split(";")[0].trim();
                }
            }
            
            logger.info("检测到响应编码: {}", charset);
            BufferedReader reader = new BufferedReader(new InputStreamReader(connection.getInputStream(), charset));
            StringBuilder response = new StringBuilder();
            String line;
            while ((line = reader.readLine()) != null) {
                response.append(line);
            }
            reader.close();
            
            String jsonResponse = response.toString();
            logger.info("Yahoo API 响应长度: {} 字符", jsonResponse.length());
            
            // 解析JSON响应
            JSONObject jsonObject = JSON.parseObject(jsonResponse);
            
            if (jsonObject.containsKey("Error")) {
                logger.error("Yahoo API 错误: {}", jsonObject.getJSONObject("Error").getString("Message"));
                return goodsList;
            }
            
            if (jsonObject.containsKey("hits")) {
                com.alibaba.fastjson2.JSONArray hitsArray = jsonObject.getJSONArray("hits");
                logger.info("Yahoo API 返回商品数: {}", hitsArray.size());
                
                for (int i = 0; i < hitsArray.size() && goodsList.size() < maxResults; i++) {
                    try {
                        JSONObject hit = hitsArray.getJSONObject(i);
                        if (hit.containsKey("Item")) {
                            JSONObject item = hit.getJSONObject("Item");
                            
                            // 检查必要字段
                            if (item.getString("Name") != null && 
                                item.getString("Url") != null && 
                                item.getString("Price") != null) {
                                
                                Goods goods = new Goods();
                                goods.setGoodsName(item.getString("Name"));
                                goods.setGoodsPrice(Double.parseDouble(item.getString("Price")));
                                goods.setGoodsLink(item.getString("Url"));
                                goods.setImgUrl(item.getString("Image") != null ? 
                                    item.getString("Image") : "");
                                goods.setMallType(20); // Yahoo平台标识
                                
                                // 设置其他字段
                                goods.setGoodsId(System.currentTimeMillis() + i);
                                goods.setCreateTime(new java.util.Date());
                                
                                goodsList.add(goods);
                                logger.debug("添加Yahoo商品: {} - ¥{}", 
                                    goods.getGoodsName(), goods.getGoodsPrice());
                            }
                        }
                    } catch (Exception e) {
                        logger.warn("解析Yahoo商品数据时出错: {}", e.getMessage());
                    }
                }
            }
        } else {
            logger.error("Yahoo API 请求失败，状态码: {}", responseCode);
        }
        
        logger.info("Yahoo搜索完成，找到 {} 个商品", goodsList.size());
        return goodsList;
    }
}